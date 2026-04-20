---
title: 'Six Months with ClickHouse at CloudQuery: The Good, The Bad, and the Unexpected'
date: 2025-04-08
slug: 'six-months-with-clickhouse-at-cloudquery'
description: "After six months using ClickHouse as CloudQuery's default backend, here's what we learned about performance, JOIN limits, sorting keys, materialized views, and benchmarking."
categories: ['Databases']
tags: ['ClickHouse', 'Engineering', 'Data Engineering']
heroImage: '/images/blog/six-months-with-clickhouse-at-cloudquery/thumbnail.png'
heroAlt: 'Six Months with ClickHouse at CloudQuery - engineering lessons learned'
canonicalUrl: 'https://www.cloudquery.io/blog/six-months-with-clickhouse-at-cloudquery'
tldr: 'ClickHouse delivered on speed and scale, but JOINs need careful handling (use dictionaries), sorting keys are critical and unchangeable after the fact, materialized views were too unpredictable for us, and it works surprisingly well for logging/observability beyond just analytics.'
---

_Co-authored with Herman Schaaf and Mariano Gappa at CloudQuery._

When we built [CloudQuery](https://www.cloudquery.io/), our initial goal was simple: pull data from users' cloud config data and let them send it basically anywhere - PostgreSQL, MongoDB, Neo4J, you name it. We designed it to play well with whatever database someone might have because, honestly, flexibility seemed like the best choice at the time.

However, it quickly became clear that supporting infinite options had a hidden cost: complexity. Each new database we supported meant that it was challenging to build new features, things like real-time dashboards, reporting, or interactive queries on top of our platform. And it became obvious that we needed a robust, default backend. Something scalable, reliable, and ideally one our team wouldn't resent maintaining six months (or six years) down the road.

We needed a database capable of streaming massive batches of cloud configuration data quickly, while also supporting fast ad-hoc SQL queries without constant index babysitting. The last thing our engineers (or our users) needed was to spend their valuable time tweaking indexes, especially when their infrastructure changed weekly, or sometimes hourly. Performance had to be consistent, even under heavy writes, because nobody wants stale, mixed-up results showing yesterday's cloud data alongside today's.

Enter [ClickHouse](https://clickhouse.com/). After considering and even stress-testing lots of different databases, ClickHouse seemed to hit the sweet spot of scalability, speed, and cost efficiency. But trust me, after six months of real-world use, we've learned it's not without its quirks.

Before diving into those lessons, let's first take a quick look at the challenges we needed ClickHouse to solve and why we picked it in the first place.

![High-level technical visual showing CloudQuery ingesting from cloud providers, then streaming into ClickHouse.](/images/blog/six-months-with-clickhouse-at-cloudquery/image2.png)

## What We Actually Needed From Our Database

When we started evaluating options for a default database on the backend, we narrowed things down to four clear requirements.

1. **Flexible Ad-hoc SQL Queries:** Our users run exploratory, unpredictable queries against massive datasets. We can't anticipate every question they'll ask on a random Friday afternoon.
2. **Query Efficiency:** Our database needed to deliver consistently fast responses, even for complex queries scanning billions of rows. Users depend on real-time dashboards and timely reports about the current state of their cloud infrastructure, so waiting minutes for query results was unacceptable.
3. **Smooth Streaming Data Ingestion:** CloudQuery streams cloud data in large batches, sometimes billions of rows per cluster, so we needed a backend that could keep pace without slowing down.
4. **Real-time Consistency:** Mixing stale data with fresh syncs isn't just messy, it's unacceptable for our customers who rely on us for an up-to-date view of their cloud data.

To give you an idea of the scale we aimed to support from day one, here's a quick snapshot from a single CloudQuery user:

- **6 billion** rows synced per month
- **2,500** cloud accounts (1,900 AWS accounts + 600 Azure subscriptions)
- **800+** Kubernetes clusters managing around **400,000** pods
- **6 to 7 million** rows of real-time data at any given moment
- **4 TB** of new data ingested monthly

Clearly, we needed a database that scaled gracefully, reduced the pain of manual index management, and easily handled heavy, continuous ingestion. After thorough testing, [ClickHouse](https://clickhouse.com/) emerged as the strongest contender. Was it perfect? Not quite. But it came closer than anything else we'd tried.

## Why ClickHouse?

When evaluating ClickHouse for our CloudQuery platform, we specifically focused on how it handled large-scale, real-world workloads. In practice, ClickHouse consistently ingested data at millions of rows per second, scaling linearly as we added nodes. For instance, [a single node ingested 65 billion rows (~14 TiB) at about 4 million rows per second](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part2#:~:text=ClickHouse%20Cloud%20allows%20you%20to,be%20improved%20with%20additional%20servers). For our needs, which involve streaming massive batches of cloud configuration data, this capability made ClickHouse ideal. We needed a solution that was cloud-agnostic and could be self-hosted, which ruled out managed services like BigQuery and Snowflake, despite their comparable ingestion capabilities.

Query latency was another significant area where ClickHouse excelled. [Benchmarks using realistic datasets demonstrated that ClickHouse](https://openbenchmarking.org/test/pts/clickhouse) provided rapid responses even on large datasets, often 5 to 10 times faster than [BigQuery](https://chistadata.com/clickhouse-chistadata-cloud-vs-google-bigquery/) or [Snowflake](https://www.youtube.com/watch?v=6IwLWEx_mg4) on similar queries. Aggregations scanning billions of rows completed in seconds rather than minutes, and single-row lookups that took BigQuery seconds executed in milliseconds on ClickHouse. Given CloudQuery's requirements for rapid exploratory queries against freshly synced data, this performance advantage was critical.

From a cost perspective, ClickHouse offered distinct advantages compared to other databases, notably PostgreSQL, the database we initially considered most strongly. Many CloudQuery users already rely heavily on PostgreSQL for storing cloud asset data, making it an attractive first choice due to how popular it is, and its flexibility. However, while PostgreSQL can handle high-throughput inserts reasonably well, it tends to become operationally complex and expensive when scaled to support intensive analytical workloads. Particularly those involving large scans and complex aggregations. [Real-world examples from teams like Prefect.io](https://clickhouse.com/blog/prefect-event-driven-workflow-orchestration-powered-by-clickhouse) further reinforced our decision, highlighting how migrating from PostgreSQL to ClickHouse resulted in cost savings of over 30%, even as workloads increased significantly.

However, most importantly, we want to stress that we feel that benchmarks aren't always meaningful indicators of what truly matters. As Jordan Tigani (a founding engineer of BigQuery) quipped, "[Vendor benchmarks tend to focus on things that the vendor does well.](https://motherduck.com/blog/perf-is-not-enough/#:~:text=Vendor%20benchmarks%20tend%20to%20focus,the%20typical%20vendor%20benchmark%20result)" And **user experience != benchmark performance**. [Tigani noted in a great example](https://motherduck.com/blog/perf-is-not-enough/#:~:text=Ended%2C%20the%20benchmark%20wars%20have): in a reputable 2019 [GigaOm's cloud data warehouse benchmark report](https://portal.gigaom.com/report/cloud-data-warehouse-performance-testing#Summary), Azure's SQL DW came out fastest, and BigQuery was far behind. Yet, in real customer evaluations, BigQuery was consistently chosen over Azure, and even over Redshift, which ranked second in that benchmark.

Our experience reinforced the widely accepted industry view that **the only reliable benchmarks are those conducted on your actual workloads and data**. After testing with real CloudQuery production scenarios involving massive continuous ingestion combined with unpredictable ad-hoc queries, we verified ClickHouse's performance, scalability, and cost-efficiency advantages for our use case (But more on that later).

## Four Lessons from Six Months of ClickHouse

### Lesson 1: Navigating JOIN Limitations

In our early months using ClickHouse, we encountered significant performance issues related to JOIN operations. Queries involving JOINs between large fact tables and moderately sized dimension tables often performed poorly - either running much slower than expected or being aggressively terminated by ClickHouse's OvercommitTracker due to memory constraints ([Memory Overcommit Documentation](https://clickhouse.com/docs/operations/settings/memory-overcommit)). This meant that queries intended to complete in seconds instead either timed out or were unexpectedly killed, causing noticeable frustration and disruptions for our team. After investigating, we discovered that our initial JOIN patterns and configurations weren't fully compatible with ClickHouse's memory management strategies and JOIN handling behavior.

Here's what we learned...

#### JOIN Order Matters

In one case highlighted in the [ClickHouse documentation](https://clickhouse.com/docs/en/sql-reference/statements/select/join/#join-algorithm), a naive query had the large table on the left and took 56 seconds. Simply flipping the JOIN sides (small table on the right) cut it to 1.5 seconds, a dramatic improvement.

The key lesson for us: **Always position smaller tables on the right side of JOIN operations and limit complex multi-JOIN queries** ([ClickHouse recommends no more than 3 to 4 JOINs per query](https://clickhouse.com/docs/guides/joining-tables#:~:text=Aim%20for%20a%20maximum%20of%203%20to%204%20joins%20in%20a%20query)). Proper JOIN ordering alone can transform slow-running queries into sub-second responses.

#### Pushing Joins to Dictionaries

Next, we explored [ClickHouse dictionaries](https://clickhouse.com/docs/sql-reference/dictionaries) to optimize JOIN operations further for our cloud asset data. Our specific use case required enriching every inserted row with its corresponding AWS, Azure, or GCP account name. Doing this with a traditional JOIN proved extremely slow and resource-intensive, often exhausting available memory and triggering out-of-memory (OOM) errors.

By implementing ClickHouse dictionaries in place of standard JOINs, we dramatically improved query performance. [ClickHouse dictionaries are stored in memory as key-value maps](https://aiven.io/docs/products/clickhouse/howto/create-dictionary#:~:text=A%20dictionary%20is%20a%20key,tables%20in%20your%20JOIN%20clauses), ideal for replacing joins on static or slow-changing reference data. In our benchmarking, this change reduced memory usage from over 50 GB, causing consistent OOM failures, to just around 3.5 GB, with queries completing successfully in approximately 8 seconds.

We also learned that the dictionary approach avoids building a join hash table on the fly for each query; instead, lookups become `O(1)` in-memory operations. We did notice, however, that if you perform a dictionary lookup per row (e.g., using `dictGet` in the SELECT for millions of rows), [it can bottleneck on many single-key fetches](<https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse#:~:text=drop%20the%20sub-query%20and%20utilise%20a%20dictget(stations_dict%2C%20'country_code'%2C%20station_id)%20%3D%20'po'%20filter.%20this%20isn't%20faster%20(around%200.5s)%20as%20a%20dictionary%20look-up%20needs%20to%20be%20made%20for%20each%20station.%20we%20look%20at%20a%20similar%20example%20to%20this%20below.>). The best results came from joining directly to the dictionary (treating it like a table) so that ClickHouse could vectorize the lookups. Overall, denormalizing some data or using dictionaries for dimension data helped us work around JOIN limitations and improve query speed.

#### Complexity and Quirks

Adopting dictionaries introduced some operational complexity. We had to define dictionary loading and refresh policies, and ensure the dictionary stayed in sync with source data. One quirk we encountered was related to ClickHouse dictionary syntax itself. When creating dictionaries, even from other tables within the same ClickHouse cluster, we found we [couldn't simply reference the source table without credentials, especially when using custom SQL queries for the dictionary definition](https://clickhouse.com/docs/sql-reference/statements/create/dictionary#source). Specifically, our approach involved custom queries to select specific fields (such as account ID and name mappings), which required explicitly specifying authentication credentials within the SOURCE clause. Omitting these credentials led to dictionary initialization failures. This requirement introduced additional configuration complexity and security considerations, particularly around credential management.

We're actively exploring ways to streamline this process across managed (ClickHouse Cloud), local, and self-hosted deployments to ensure consistent and secure dictionary definitions. [The introduction of named collections (a way to store connection secrets on the server) eventually mitigated this](https://clickhouse.com/docs/operations/named-collections#:~:text=functions%2C%20and%20object-,storage.,-Named%20collections%20can), but in the interim, we had to be careful with how we managed dictionary configs. Despite these headaches, the payoff was worth it: certain dimension join queries that previously strained our cluster were lightning-fast after moving those dimensions into dictionaries.

#### Reality Check

In retrospect, we learned to be cautious with large table JOINs in ClickHouse. We denormalized where possible and used dictionaries for lookup tables to circumvent JOIN limitations. The difference was tangible. One report went from timing out to running in under a second by eliminating an expensive join. However, using dictionaries is not a free lunch. It adds complexity in setup and maintenance (and gotcha's like having to supply credentials for external sources on each refresh).

My advice is to treat dictionaries as a powerful tool for specific scenarios: **Use them to optimize frequent joins on small reference tables, but be mindful of the operational overhead**. When used appropriately, they allowed us to achieve real-time performance in queries that would otherwise have been sluggish or outright impossible under ClickHouse's JOIN constraints.

### Lesson 2: Optimizing the Sorting Key for Better Performance

The importance of a well-chosen **sorting key** became evident almost immediately. [In ClickHouse, the sorting key determines the sort order on disk and the sparse index, directly impacting how much data is scanned for each query](https://clickhouse.com/blog/a-simple-guide-to-clickhouse-query-optimization-part-1#:~:text=Primary%20keys%20in,of%20each%20granule.). A suboptimal sort order can make even simple queries do heavy lifting. In our initial schema designs, we made a few mistakes with low/high cardinality order that hurt performance.

One early mistake was sorting our largest table purely by a high-cardinality timestamp as the primary sort key on our largest table. While sorting by timestamp initially seemed logical for time-series data, it led to inefficient query patterns, particularly when filtering data by customer IDs or specific resource attributes. Because data wasn't clustered logically according to our typical queries, queries intended to retrieve a single customer's data across a time range inadvertently triggered near-complete table scans.

When we revisited this, the performance improvement was striking. By adjusting the sorting key to better match our common query filters, specifically starting with `_cq_sync_group_id`, followed by `cloud`, `resource_category`, `resource_type`, and finally `_cq_id`, the number of rows scanned for typical queries dropped dramatically. For example, a query previously scanning roughly **392,000 rows (5.98 MB)** was reduced to around **14,900 rows (4.04 MB)**, which was approximately a 25x improvement in scan efficiency.

In production workloads, this optimization produced even more significant performance gains due to larger datasets. This experience reinforced the importance of aligning ClickHouse's sorting keys explicitly with frequent query patterns, prioritizing fields from lowest to highest cardinality, and ensuring the data layout on disk closely mirrors our query access patterns.

#### Reality Check

The lesson here is clear: **design your ClickHouse table order keys around your query patterns**. We treated this like an art and a science by analyzing our most frequent queries and tuning the sort order to minimize irrelevant data reads. When we got it wrong, ClickHouse's performance suffered (sometimes scanning 10x more data than needed). When we got it right, the database rewarded us with millisecond-range responses. A good sort key in ClickHouse is akin to a well-chosen index in an OLTP system. It can make or break your query efficiency.

**We recommend revisiting your sort keys as your understanding of your data access patterns evolves**. In just six months, we iterated on several schemas and saw huge performance dividends by correcting [cardinality mistakes in the sort order](https://clickhouse.com/blog/a-simple-guide-to-clickhouse-query-optimization-part-1#:~:text=process%20significantly%20less-,data.,-Conclusion). It's an ongoing process of tuning, but it's been one of the highest ROI optimizations we did with our ClickHouse clusters.

### Lesson 3: Navigating Materialized View Limitations by Using Snapshot Tables

Initially, we considered using [ClickHouse Materialized Views (MVs)](https://clickhouse.com/docs/materialized-views) to create aggregated views of our cloud data. On paper, MVs looked promising for maintaining real-time aggregated snapshots. However, as we experimented more, we discovered several critical limitations that made them unsuitable for our use case.

A ClickHouse MV attaches to a source table and, on every insert into the source, it runs a specified query to transform and write data into a target table.

![A diagram showing how a materialized view in CloudQuery aggregates and transforms data from a source table to a target table. The view uses SQL to calculate maximum and average values, mapping source columns to target columns.](/images/blog/six-months-with-clickhouse-at-cloudquery/image1.png)

First, **MVs operate asynchronously** relative to the statement that creates or inserts data into them. This meant two significant operational headaches:

- **Lack of visibility into failures:** Since MV processing happens independently, detecting failures reliably became challenging. If an MV insert failed silently, we wouldn't immediately know, causing potential inconsistencies.

- **Unpredictable completion timing:** Without synchronous completion guarantees, we had no reliable way of determining exactly when an MV finished updating. This prevented us from confidently swapping backing tables during migrations, a crucial requirement for safely evolving our schema and maintaining availability.

Second, **ClickHouse's MVs inherently lack a built-in mechanism for recomputing or "refreshing" historical data**. Once defined, an MV only processes new data incrementally. If historical or corrected data needed reprocessing, we were forced to intervene manually, inserting data back into the MV target explicitly, adding complexity and maintenance overhead.

Given these issues, we ultimately abandoned MVs altogether and instead opted for **snapshot tables**. Snapshot tables provided the explicit control we needed:

- **Explicit refreshes:** By controlling refresh operations explicitly through scheduled jobs, we achieved predictable data consistency without ambiguity about completion timing.

- **Reliable schema migrations:** With explicit control over table creation and population, we could confidently swap backing tables in our external views, significantly simplifying schema migrations.

This approach provided clarity around both operational state and data freshness, solving the core limitations that made Materialized Views impractical for our needs. We know that ClickHouse has introduced [refreshable materialized views](https://clickhouse.com/docs/materialized-view/refreshable-materialized-view) in newer releases (as of late 2023).

Given these constraints, we never actually implemented MVs in our production environment. Instead, we relied on two explicit approaches to ensure consistency and operational predictability:

- We manually inserted rows into dedicated historical tables and then defined regular ClickHouse views on top of them. This straightforward method allowed full control over both data freshness and schema evolution, eliminating ambiguity around data consistency.

- We created "snapshot tables," explicitly cloning data at defined intervals. This technique allowed precise control over data versioning and migration timing, ensuring that we could safely update views and schemas without concerns over asynchronous data processing.

Both approaches gave us the exact control and reliability required, solving the problems introduced by ClickHouse's Materialized Views without compromising our operational standards or data consistency.

#### Reality Check

Materialized Views sound great on paper - automatic rollups, less boilerplate, fewer moving parts. But in practice, they just didn't give us the control we needed. Since they run asynchronously, we couldn't tell if something failed or when it actually finished. That broke two of our key backend requirements: reliable consistency and predictable migrations.

So, we took a different route. We built it ourselves instead of relying on ClickHouse to manage the logic. We manually insert into historical tables, then create or replace standard views on top. For use cases that need versioned data at specific points in time, we clone rows into what we call "snapshot tables." That way, we know exactly what ran, when it ran, and what the output was - no guessing, no race conditions, no half-finished state.

It's more work up front, but it gave us something MVs couldn't: full control over consistency, flexibility around schema changes, and confidence that the data our users see is always complete and current.

### Lesson 4: Leveraging ClickHouse for Logging and Observability

Perhaps the most surprising benefit of choosing ClickHouse was its adaptability to be used beyond "traditional" analytics. Initially, we deployed it for OLAP-style analytics (user events, dashboards, etc.). Over six months, we found ourselves using ClickHouse for **logging, telemetry, and observability data** as well.

In our application, we wanted users to access logs and telemetry data the same way they access everything else in CloudQuery - through SQL. By leveraging our existing ClickHouse backend, we could treat observability data just like any other table, without spinning up a separate system for logs or metrics. That consistency mattered. And performance wasn't a blocker either; ClickHouse handled it well enough that we now use it to power both our API and UI directly.

#### Logging at Scale

We started routing application logs and system logs into ClickHouse to unify our data platforms. This is a workload that involves appending huge volumes of semi-structured data (e.g., JSON logs) and retaining it for analysis and debugging. We were concerned whether ClickHouse could handle it, but those concerns were quickly dispelled. ClickHouse's compression and columnar storage proved extremely efficient for logs. In fact, ClickHouse has become [something of a de facto standard for log and trace storage in modern observability stacks](https://clickhouse.com/docs/use-cases/observability/introduction#:~:text=engines%20in%20observability-,products.,-More%20specifically%2C%20the). [The ClickHouse team actually did a case study on their own internal logging](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog#:~:text=requires%20a%20few-,assumptions%3A,-Our%20EC2%20infrastructure): they store 19 PiB of uncompressed logs (37 trillion rows!), and with compression, it's just over 1 PiB on S3.

We haven't rolled this out yet, but we're planning to stream logs from Kubernetes into ClickHouse using [Vector](https://vector.dev/).

#### Telemetry and Traces

We also integrated [**OpenTelemetry (OTel) trace data**](https://opentelemetry.io/) into ClickHouse. Traces are high-cardinality, high-volume data, but in our case, they represent sync operations rather than individual user requests. A single span might cover syncing a specific table or AWS region, so the shape of our telemetry is different from traditional request/response traces. We wanted to see if ClickHouse could handle full-fidelity traces at this level of granularity, without sampling, and so far, it's looking promising.

ClickHouse gave us sub-second lookups for trace IDs and the ability to do complex aggregations with SQL. [Companies like Resmo have written about using ClickHouse for unsampled tracing](https://clickhouse.com/blog/how-we-used-clickhouse-to-store-opentelemetry-traces#:~:text=scan%20billions%20of-,rows.,-Customization%20and%20lessons), citing similar experiences where running custom SQL on traces is a huge advantage and cost-saver.

#### Performance and Cost Benefits

Using ClickHouse for these "beyond OLAP" cases brought performance benefits; we found that one ClickHouse cluster could do the work of multiple systems, which is simpler to maintain. Also, when comparing costs, ClickHouse was significantly cheaper for us. An anecdotal comparison: [ClickHouse published](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog#:~:text=Cost%20comparison,expensive%20than%20ClickHouse.) that their log platform (nicknamed "LogHouse") ran at about **$7.66 per TB of uncompressed logs** per month in AWS (after compression, storage, compute - all included). They calculated it to be **200x cheaper** [than a hosted alternative (Datadog)](https://clickhouse.com/blog/building-a-logging-platform-with-clickhouse-and-saving-millions-over-datadog#:~:text=as%20we%20show%20later%20in%20our%20pricing%20analysis%20section%2C%20clickhouse%20is%20at%20least%20200x%20less%20expensive%20than%20datadog%20for%20our%20workload%2C%20assuming%20datadog%20and%20aws%20list%20prices%20for%20hosting%20clickhouse%20and%20storing%20data%20in%20s3.) for equivalent data. In our own case, by putting our platform logging and monitoring data into ClickHouse, we could give users direct queryable access and run only a single, simplified system at the same time.

#### Reality Check

In six months, our usage of ClickHouse expanded from pure OLAP to what might be called "OLTP for analytics" or observability data. ClickHouse handled it all, from user analytics to system logs to tracing, with excellent performance. This versatility has allowed us to consolidate systems and simplify our architecture. We ensured that schemas were designed appropriately (e.g., using appropriate partitioning, sort keys, TTLs for different datasets), but the core engine proved capable of adapting to each scenario. There are of course limits, for instance, large text log messages we still ship to object storage for archive and extremely high-frequency metrics we down sample, but by and large, ClickHouse has shown it can be the backbone for observability data. The fact that ClickHouse even acquired an observability platform, [HyperDX](https://clickhouse.com/blog/clickhouse-acquires-hyperdx-the-future-of-open-source-observability), and emphasizes observability use cases speaks to this strength. For anyone considering ClickHouse, don't pigeonhole it as just a BI database. It's equally adept at powering a logging dashboard, a metrics backend, or a trace query engine.

## If We Had To Do It All Over Again

Reflecting on six months of using ClickHouse here, several key adjustments would have significantly streamlined our deployment. If we could fire up a DeLorean and whisper advice to my past self before embarking on this ClickHouse adventure, here are the top things I'd change:

### Use a Buffer (or Queue) Before Inserts

Early on, we learned a valuable lesson about query consistency. When a new sync started writing fresh data into ClickHouse, there was a window where users could see a mix of old and new records, which meant data from two different syncs would show up side by side. Technically, it wasn't a race condition, but it created a confusing experience that felt inconsistent. Since ClickHouse doesn't support multi-statement transactions, we had to build our own solution. A sort of high-level transaction layer to make syncs appear atomic from the user's perspective. If we'd put a queuing or buffering layer in place earlier, we might've avoided some of the mess.

### Plan Sort Keys Early

When designing our initial schemas, we underestimated just how critical ClickHouse's sorting keys are. The sort key determines how data is physically laid out on disk, which has a direct and massive impact on query performance, especially when your dataset hits hundreds of gigabytes. Our original sort key looked fine on paper, but it fell apart once we started testing with real data at scale.

Luckily, we caught the issue before launch, so fixing it was just a matter of dropping and recreating tables. But here's the real catch: **You can't change a sort key on an existing table**. There's no `ALTER TABLE` for this. Your only option is to rebuild the table from scratch. During development, we dropped and recreated tables countless times without issue. But in production? That kind of fix could mean real downtime. Going forward, we're much more deliberate about evaluating our most common queries and validating that our sort keys align with them - because once the system goes live, mistakes here are painful to unwind.

### ClickHouse Cloud vs. Self-Hosted

When we first launched the new CloudQuery platform, we went with ClickHouse Cloud to get our MVP out the door fast. It was the right call at the time. Spinning up a managed cluster took minutes, and we didn't have to worry about tuning configs or babysitting infrastructure. But when we started planning for a longer-term move to self-hosted ClickHouse, things got messy.

We assumed we could just back up our managed cluster and restore it locally. Turns out, not so simple. Some queries didn't behave the same way, configs needed reworking, and there were just enough subtle differences to make everything annoying. What should've been a clean migration turned into a bunch of patching, testing, and head-scratching.

In hindsight, we should've been more deliberate from day one. Managed ClickHouse was great for prototyping and fast iteration, but we didn't think through how the migration would play out later. Now, we're much more intentional: we use ClickHouse Cloud when speed and scale-out convenience matter most, and go self-hosted where we want fine-grained control or tighter cost management. Planning that balance early would've saved us some pain.

## Looking Ahead

Now that we've survived (and occasionally thrived) with ClickHouse for a while, I'm shamelessly geeking out over what's coming next. Here's what I'm watching for in ClickHouse's future (purely my **wishful speculation**, so grab your salt shaker):

### Better JSON Support

JSON is the love-to-hate-it data format in our stack. ClickHouse has never been bad at JSON, but let's just say I've spent quality time flattening and contorting JSON strings into table columns. The good news is that the ClickHouse's team has been actively working on improved JSON handling, and there's even [a new JSON data type that's been released](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse)!. Native JSON support that's both fast and user-friendly is high on my wish list.

### Full-Text Search Capabilities

As of today, asking ClickHouse to do Google-level text search is a bit like asking a power lifter to run a marathon - it's not their main gig. They do have some experimental full-text index features [lurking in the docs](https://clickhouse.com/docs/engines/table-engines/mergetree-family/invertedindexes#:~:text=full-text%20indexes%20are%20an%20experimental%20type%20of%20secondary%20indexes%20which%20provide%20fast%20text%20search%20capabilities%20for%20string%20or%20fixedstring%20columns.%20the%20main%20idea%20of%20a%20full-text%20index%20is%20to%20store%20a%20mapping%20from%20%22terms%22%20to%20the%20rows%20which%20contain%20these%20terms.%20%22terms%22%20are%20tokenized%20cells%20of%20the%20string%20column), but they require extra setup and aren't yet the one-stop solution to let us retire our dedicated search service. I'm keeping an eye out for any sign that full-text search will get first-class treatment.

## Wrapping Up

Stepping back and looking at the past six months, we can honestly say that **adopting ClickHouse has been worth it**. Not because it solved every problem (it didn't), but because it forced us to level up our data engineering game. We got the speed and scalability we were promised, along with a few humbling reminders that no tool is a silver bullet. ClickHouse didn't magically do all the work for us (darn), but it allowed us to tackle challenges we couldn't have handled otherwise, so long as we met it halfway. Every DB choice is ultimately a compromise, and understanding which trade-offs you're comfortable with is key.

Here's to the next six months being a little smoother.
