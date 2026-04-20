---
title: 'How We Handle Billion-Row ClickHouse Inserts With UUID Range Bucketing'
date: 2025-05-01
slug: 'how-we-handle-billion-row-clickhouse-inserts-with-uuid-range-bucketing'
description: 'How we solved memory explosion issues in ClickHouse when processing billions of rows of cloud configuration data using an Insert-Splitter with UUID-range bucketing technique.'
categories: ['Databases']
tags: ['ClickHouse', 'Engineering', 'Data Engineering', 'Performance']
heroImage: '/images/blog/how-we-handle-billion-row-clickhouse-inserts-with-uuid-range-bucketing/thumbnail.png'
heroAlt: 'How We Handle Billion Row ClickHouse Inserts With UUID Range Bucketing'
canonicalUrl: 'https://www.cloudquery.io/blog/how-we-handle-billion-row-clickhouse-inserts-with-uuid-range-bucketing'
tldr: "ClickHouse loads entire working sets into memory before spilling to disk, and when you're inserting billions of rows, that means OvercommitTracker starts killing queries. Our solution? An algorithm we call Insert-Splitter with UUID range bucketing. It breaks big inserts into smaller, evenly distributed chunks that play nicely with ClickHouse's memory model, reducing peak memory usage by ~75%."
---

_Co-authored with Mariano Gappa at CloudQuery._

![How We Handle Billion Row ClickHouse Inserts With UUID Range Bucketing Blog Thumbnail](/images/blog/how-we-handle-billion-row-clickhouse-inserts-with-uuid-range-bucketing/header.png)

At [CloudQuery](https://www.cloudquery.io/), we've been on a journey with [ClickHouse](https://clickhouse.com/) for a couple of months. [We recently wrote about our experience with our first 6 months of ClickHouse](/blog/six-months-with-clickhouse-at-cloudquery) as our database of choice for CloudQuery. While it's been transformative for our data processing capabilities, we're still learning how to use it effectively and discovering ways to work around some of its rough edges.

One of those rough edges involves handling extremely large data volumes, particularly during bulk insert operations. As we've scaled our platform to handle and analyze more and more cloud configuration data, we've had to develop creative solutions to the memory challenges that come with processing billions of rows of data.

To give you a sense of what we're dealing with, a single CloudQuery customer can generate:

- 6 billion rows synced per month
- Data from 2,500 cloud accounts (1,900 AWS accounts + 600 Azure subscriptions)
- Configuration from 800+ Kubernetes clusters managing around 400,000 pods
- 6-7 million rows of real-time data at any given moment
- 4 TB of new data ingested monthly

The culprit behind our memory issues? ClickHouse memory explosions during large `INSERT` operations. And [we're not alone](https://github.com/ClickHouse/ClickHouse/issues/5959) - this is a [widespread issue](https://github.com/ClickHouse/ClickHouse/issues/11546) that [many engineers](https://github.com/ClickHouse/ClickHouse/issues/17631) have [encountered](https://stackoverflow.com/questions/65316905/clickhouse-dbexception-memory-limit-for-query-exceeded). Our solution? A technique we call `Insert-Splitter with UUID-range bucketing` that reduced peak memory usage without schema surgery or external message queues.

## The ClickHouse Memory Problem

ClickHouse is an amazing columnar database for analytical workloads, but it has an Achilles' heel: memory management during large operations. When handling operations like `GROUP BY`, `ORDER BY`, or bulk inserts, ClickHouse materializes the entire working set in memory before spilling to disk - a design choice that can lead to significant memory pressure and query failures.

This behavior is well-documented across the ClickHouse community. According to [ClickHouse's official blog](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse), ClickHouse requires specific settings like `max_bytes_before_external_group_by` and `max_bytes_before_external_sort` to enable disk spilling for memory-intensive operations. Without these explicit configurations, ClickHouse tries to hold everything in RAM.

> **Important Note:** Even after tuning these memory settings, we still experienced difficulties preventing ClickHouse from killing queries under heavy memory pressure. Despite attempts to configure ClickHouse to spill operations to disk with settings like `max_bytes_before_external_group_by`, queries may still fail with memory errors. In our experience, tuning these parameters helped, but ultimately was less effective than implementing the `InsertSplitter` solution described below.

The [ChistaDATA knowledge base](https://chistadata.com/implementation-of-spill-to-disk-clickhouse-memory/) explains that while ClickHouse does have a spill-to-disk mechanism, it only activates once allocated memory is already exhausted, which is often too late for large operations. This explains why, by default, you'll often encounter memory limits before the spill mechanism kicks in.

A deeper issue, highlighted in [this GitHub issue](https://github.com/ClickHouse/ClickHouse/issues/41887), is that ClickHouse's thresholds for spilling data aren't dynamically adjusted based on current memory consumption. Even more concerning, [this GitHub issue](https://github.com/ClickHouse/ClickHouse/issues/32239) notes that when data is finally spilled to disk and generates many temporary files, ClickHouse still allocates significant memory before merging these files, potentially leading to secondary memory pressure.

The errors you'll see look something like:

```bash
Memory limit (for query) exceeded: would use 29.1 GiB
(attempt to allocate 4.00 MiB for AggregatingTransform),maximum: 9.31 GiB.
```

Or this beauty:

```bash
Memory limit (for query) exceeded: would use 10.2 GiB
(attempt to allocate 128.00 MiB for HashTable), maximum: 9.3 GiB.
```

After digging through GitHub issues, documentation, and our own painful experiences, we identified two root causes:

1. **Full materialization before spilling**: ClickHouse loads the entire working set into RAM before considering external processing or disk spilling. As confirmed by [a Stack Overflow discussion](https://stackoverflow.com/questions/67784231/why-does-clickhouse-need-so-much-memory-for-a-simple-query), some memory-saving optimizations "are not implemented yet" and require explicit configuration.

2. **Over sized insert blocks**: [ClickHouse client drivers batch rows into memory blocks before sending them to the server, with default settings handling ~1 million rows per block](<https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#:~:text=the%20server%20parses%20the%20insert%20query%E2%80%99s%20data%20and%20forms%20(at%20least)%20one%20in-memory%20block%20(per%20partitioning%20key)%20from%20it>). According to [ClickHouse's benchmarks](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part2#:~:text=for%20inserting%20our-,dataset.,-If%20we%20match), even modest workloads can consume 7+ GB of RAM per server, while poorly configured clients can create single blocks that require dozens of gigabytes, triggering memory limit exceptions that terminate your queries.

Real community examples show how widespread this problem is. In [this GitHub issue](https://github.com/ClickHouse/ClickHouse/issues/5959), users reported memory explosions with a single 29 GiB block during inserts on a 64 GB node. Another [issue](https://github.com/ClickHouse/ClickHouse/issues/24505) showed failures during ad-hoc GROUP BY operations on 9 billion rows, while [this issue](https://github.com/ClickHouse/ClickHouse/issues/16236) detailed problems with HDFS external table scans.

In our case, we were seeing memory explosions when users synced large cloud environments. One customer with 1,900+ AWS accounts would trigger a memory spike every time they synced their S3 buckets. Not ideal.

## Potential Solutions

We explored several approaches before landing on our final solution:

| Approach                                                                                                                                                                        | Memory Reduction | Pros                                   | Cons                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | -------------------------------------- | -------------------------------------- |
| [Tune `max_memory_usage` + external spill](https://www.linkedin.com/pulse/optimizing-memory-mastery-clickhouse-tuning-shiv-iyer-mba1c/)                                         | 20-60%           | Simple configuration change            | Ineffective, risk of disk thrashing    |
| [Time-window UNION ALL batching](https://clickhouse.uptrace.dev/clickhouse/low-memory.html)                                                                                     | 70-90%           | Works ad-hoc                           | Manual, error-prone                    |
| [Kafka-engine + Materialized Views](https://chistadata.com/streaming-clickhouse-data-to-kafka/)                                                                                 | 70-90%           | Streaming scale                        | Additional infrastructure              |
| [Schema/partition refactoring](https://www.highlight.io/blog/lw5-clickhouse-performance-optimization#:~:text=Optimization%20%2F%20Clearing%20Old-,parts,-It's%20important%20to) | Up to 95%        | Extremely effective                    | Requires schema changes and back fills |
| Insert-Splitter (our approach)                                                                                                                                                  | 75-93%           | Deterministic, integrates with retries | Needs routing logic                    |

The standard advice is to simply enable asynchronous inserts with `async_insert=1`, but this wasn't enough for our use case. Even with async inserts enabled, [data is still "immediately written into an in-memory buffer first"](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse) before being flushed to disk when certain thresholds are met, meaning the initial memory spike can still occur. As documented in [this GitHub issue](https://github.com/ClickHouse/ClickHouse/issues/76293), engineers have observed "memory usage continuously grows when handling frequent inserts... The memory doesn't get released even after data is successfully inserted" when using async_insert. The problem is that while `async_insert` helps with batching, it doesn't solve the fundamental issue of over sized blocks requiring substantial memory during the processing phase before they reach the background insertion queue.

We also considered using Kafka as a buffer, adding tens of thousands in infra costs, and would require us to maintain another piece of infrastructure just to solve a memory problem felt excessive. We couldn't change our schemas easily because we support hundreds of different cloud resources, each with different structures.

We needed a solution that:

1. Worked with existing schemas
2. Required minimal configuration changes
3. Could be implemented at the application level
4. Was deterministic and reliable

## The Insert-Splitter Algorithm

The basic algorithm is surprisingly simple:

```
function InsertSplitter(sourceTable, destinationTable, uuidField, rowsPerInsert):
    // Estimate total rows to process
    totalRows = COUNT(*) FROM sourceTable

    // Calculate number of buckets needed (power of 2)
    bucketsNeeded = nextPowerOfTwo(totalRows / rowsPerInsert)

    // Generate UUID range boundaries for even distribution
    uuidRanges = generateEvenUUIDRanges(bucketsNeeded)

    // Process each bucket with separate INSERT statements
    for each (startUUID, endUUID) in uuidRanges:
        INSERT INTO destinationTable
        SELECT * FROM sourceTable
        WHERE uuidField BETWEEN startUUID AND endUUID

```

Note: the above is an oversimplified `SELECT` query. This algorithm is meant to work with arbitrary queries.

> **Critical Implementation Detail:** To actually get the memory win, your `WHERE ... BETWEEN bucket_start AND bucket_end` filter must live in the _innermost_ SELECT that feeds each INSERT. If you push that predicate into an outer wrapper (for example, after a window function or in a parent query), ClickHouse will materialize the full result set _before_ splitting, and you'll lose all the memory savings.

The magic happens in the `generateEvenUUIDRanges` function. Since CloudQuery assigns a UUID to every row, we can use these UUIDs to split our data. But UUIDs aren't straightforward in ClickHouse. They have specific constraints in their format, and ClickHouse has quirky sorting behavior.

![Diagram showing the full UUID range (00000000-0000-0000-0000-000000000000 to ffffffff-ffff-ffff-ffff-ffffffffffff) fed into a black box labeled 'UUIDRanges(numOfBuckets)', which splits the range into multiple output buckets labeled Bucket 1, Bucket 2, Bucket 3, Bucket 4 ... Bucket n.](/images/blog/how-we-handle-billion-row-clickhouse-inserts-with-uuid-range-bucketing/image2.png)

The actual implementation of the algorithm is probably too boring to mention here (you can probably ask your favourite AI to do it for you), but before you autocomplete away you should know about these two quirks we found:

1. In ClickHouse UUIDs [are sorted by their second half](https://clickhouse.com/docs/sql-reference/data-types/uuid). This is important because the UUID ranges look unintuitive.
2. Random UUIDs (UUIDv4) have a ["version bit"](<https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_(random)>) that can only be one of `8`, `9`, `A` or `B`. This bit happens to be exactly at the beginning of the section that is used for sorting, which makes the ranging algorithm slightly trickier.

For example, with 4 buckets, our ranges would look like this:

```bash
Example with 4 buckets:

Bucket 1: '00000000-0000-0000-0000-000000000000' to 'ffffffff-ffff-ffff-8fff-ffffffffffff'
Bucket 2: '00000000-0000-0000-9000-000000000000' to 'ffffffff-ffff-ffff-9fff-ffffffffffff'
Bucket 3: '00000000-0000-0000-a000-000000000000' to 'ffffffff-ffff-ffff-afff-ffffffffffff'
Bucket 4: '00000000-0000-0000-b000-000000000000' to 'ffffffff-ffff-ffff-ffff-ffffffffffff'
```

How do we know our distribution is even? This is where our validation query comes in. We wrote a ClickHouse query that generates synthetic UUIDs and tests our bucketing strategy. For our solution to work, we needed even distribution of UUIDs across buckets, with a maximum deviation of 2% between the fullest and emptiest buckets. In our tests with 100,000 random UUIDs across up to 1,024 buckets, we consistently observed less than 0.5% deviation.

Our results? A deviation of 0.000886 (less than 0.01%), with a total of 1,000,000 UUIDs processed in 0.157 seconds using just 159.80 KiB of memory.

![ClickHouse SQL query that generates one million UUIDs, buckets them into eight ranges with multiIf, and calculates deviation and total counts.](/images/blog/how-we-handle-billion-row-clickhouse-inserts-with-uuid-range-bucketing/image1.png)

We processed 1 million rows in just 0.157 seconds, using just 159.80 KiB of memory. The system achieved a 6.37 million rows per second processing rate with 50.98 MB/s throughput.

## Putting it into Production

Theories are nice, but you're probably wondering: _Does this actually work in prod?_ We've deployed the Insert-Splitter in production, and the results speak for themselves.

Here's a representative example from one of our larger customer syncs:

**Before Implementation (Single Insert):**

```bash
Elapsed: 22.615s
Read: 26,023,275 rows (8.47 GB)
```

**After Implementation (Split into 4 Inserts):**

```bash
Elapsed: 5.850s
Read: 6,552,525 rows (2.13 GB)

Elapsed: 5.998s
Read: 6,585,311 rows (2.14 GB)

Elapsed: 5.813s
Read: 6,593,492 rows (2.15 GB)

Elapsed: 5.556s
Read: 6,548,458 rows (2.13 GB)
```

We reduced peak memory usage by approximately 75% (from 8.47 GB to ~2.15 GB per operation) without sacrificing overall performance. The total processing time remained virtually the same (22.6s vs 23.2s if run sequentially), while gaining the ability to process the chunks in parallel if needed.

Even more importantly, this approach eliminated the memory explosions and "OvercommitTracker killed query" errors that were previously impacting us during large syncs. The Insert-Splitter algorithm has proven to be both deterministic and reliable, with consistently even distribution across buckets just as our testing predicted.

## Wrap Up

The Insert-Splitter algorithm with UUID-range bucketing has transformed how we handle massive data volumes in CloudQuery. By breaking one giant operation into multiple deterministic chunks, we've tamed ClickHouse's memory explosions without resorting to schema changes or additional infrastructure.

### Final thoughts

1. Memory explosions stem from one giant pipeline. Split it.
2. Insert-Splitter with UUID bucketing gives deterministic, manageable chunks.
3. Always optimize your ClickHouse schema design first. Proper sort keys, partitioning strategies, and compression codecs can dramatically reduce memory requirements.
4. Monitor your parts count and merge processes. Too many small parts can degrade performance and increase memory pressure.
5. Consider resource allocation carefully. Memory-intensive operations like JOINs, GROUP BY's, and ORDERs may require specialized handling in ClickHouse.
6. Test thoroughly at scale - what works for small datasets can break catastrophically at cloud-scale data volumes.

We'd love to hear how others are solving similar problems. Have you encountered ClickHouse memory issues? Do you have other approaches we haven't considered?

Next time you face memory limits, remember: _You don't have to solve the whole problem at once. Just split it into smaller pieces._
