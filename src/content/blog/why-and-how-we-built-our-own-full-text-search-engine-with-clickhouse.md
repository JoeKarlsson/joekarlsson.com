---
title: 'Why (and How) We Built Our Own Full Text Search Engine with ClickHouse'
date: 2025-05-15
slug: 'why-and-how-we-built-our-own-full-text-search-engine-with-clickhouse'
description: 'How we built a full-text search for CloudQuery using ClickHouse, achieving 10x faster queries without dedicated search engines.'
categories: ['Databases']
tags: ['ClickHouse', 'Engineering', 'Data Engineering', 'Full-Text Search']
heroImage: '/images/blog/why-and-how-we-built-our-own-full-text-search-engine-with-clickhouse/thumbnail.webp'
heroAlt: 'Why and How We Built Our Own Full Text Search Engine with ClickHouse'
canonicalUrl: 'https://www.cloudquery.io/blog/why-and-how-we-built-our-own-full-text-search-engine-with-clickhouse'
tldr: 'We built a full text search index directly in ClickHouse using ngrambf_v1 Bloom filter indices instead of adding Elasticsearch or Meilisearch. Our custom key-value flattening approach achieved sub-400ms queries across hundreds of millions of rows, with 10x faster performance on complex searches compared to naive JOIN approaches, without requiring additional infrastructure.'
---

_Co-authored with James Riley at CloudQuery._

![Why and How We Built Our Own Full Text Search Engine with ClickHouse blog post header](/images/blog/why-and-how-we-built-our-own-full-text-search-engine-with-clickhouse/thumbnail.webp)

During a production incident, every second counts. You need to find that specific EC2 instance, security group, or IAM role quickly - but which of the 200+ tables contains the resource you need? This is the core problem we set out to solve.

Using ClickHouse as our database engine rather than a dedicated search tool, we've created a solution that achieves impressive performance while maintaining operational simplicity. Our implementation leverages specialized n-gram Bloom filter indexes and optimized query strategies to deliver lightning-fast results, even across massive datasets.

## The Technical Challenge

Cloud environments we manage generate hundreds of tables with complex relationships. When a user needs to search across AWS, Azure, and GCP resources simultaneously, traditional query approaches fail:

- **Schema complexity**: Cloud providers use different data models and naming conventions
- **Query overhead**: JOINs across many tables perform poorly and require specialist SQL knowledge
- **Scale issues**: Simple text searches become expensive and slow at 100M to a billion rows

Our implementation uses ClickHouse's specialized n-gram Bloom filter indexes and optimized query strategies to deliver universal search across all resources in under 400ms, even with 150M+ rows of data.

Plus, from a DX perspective, we heard from our customers about the same challenge:

"I just want to find stuff quickly without having to learn your entire data model."

The reality is that cloud infrastructure has grown incredibly complex, and nobody wants to write complicated queries or memorize complex data structures.

## Why We Built Our Own Full-Text Search Engine with ClickHouse

Before building our own solution, we carefully evaluated external search engines like [Elasticsearch](https://www.elastic.co/elasticsearch), [Meilisearch](https://www.meilisearch.com/), and [Quickwit](https://quickwit.io/) to determine if they would meet our needs.

While all these options provided excellent full-text search capabilities, they presented several limitations for our specific use case:

1. **Memory constraints**: Most specialized search engines are memory-intensive, making them costly to run at the scale we required.
2. **Operational complexity**: Adding another service to our architecture would increase maintenance overhead.
3. **Data synchronization challenges**: Our asset inventory data changes frequently (with each sync), requiring continuous reindexing.
4. **Existing investment**: We already use ClickHouse as our primary analytics database and have deep expertise with it, as documented in our previous post ["Six Months with ClickHouse at CloudQuery"](/blog/six-months-with-clickhouse-at-cloudquery).

Given these constraints, we decided to implement full-text search directly within ClickHouse, our existing database engine. This approach allowed us to:

- Leverage our existing infrastructure
- Avoid additional operational overhead
- Create a truly integrated search engine

![Drake meme with two panels. Top panel shows Drake gesturing disapprovingly at 'Dedicated full-text search engine'. Bottom panel shows Drake smiling approvingly at 'Abusing ClickHouse harder'](/images/blog/why-and-how-we-built-our-own-full-text-search-engine-with-clickhouse/image3.webp)

## Technical Implementation

### Flattened Key-Value Approach

The core of our solution is a specialized search index table in ClickHouse that uses a flattened key-value structure. Rather than attempting to search across all our original tables (which would require complex joins and be prohibitively slow), we created a separate search index table that represents cloud resources in a structure optimized for search.

Here's a high-level overview of our schema:

```bash
Search Index Table
├── Resource metadata (_cq_id, _cq_source_table, cloud, resource_type, etc.)
├── Property data
│   ├── key: The property path (e.g., "tags.Name" or "security_groups[0].id")
│   ├── type: The data type (String, Int64, etc.)
│   ├── value columns (str, int, float, bool, etc.): Type-specific storage
│   └── weight: Importance score for relevance ranking
└── Multiple n-gram Bloom filter indices
    ├── On key column with different n-gram sizes (1, 2, 4, 8)
    ├── On str column with different n-gram sizes
```

This design allows rapid lookups across deeply nested data structures, as described in [ClickHouse's official Skipping Indices documentation](https://clickhouse.com/docs/optimize/skipping-indexes) on data storage optimization.

Key features of this design:

1. **Flattened structure**: Each row represents a single property of a resource, enabling searches across deeply nested structures
2. **Type-specific columns**: Values are stored in type-specific columns for efficient storage and querying
3. **Multiple Bloom filter indices**: Various n-gram sizes support different search patterns
4. **Relevance scoring**: The weight column prioritizes more important properties in search results

### Leveraging ClickHouse's n-gram Bloom Filters

The core technology that allows our fast text search is [ClickHouse's `ngrambf_v1` index type](https://clickhouse.com/docs/engines/table-engines/mergetree-family/mergetree#n-gram-bloom-filter). This specialized data skipping index leverages [Bloom filters](https://en.wikipedia.org/wiki/Bloom_filter) to dramatically improve search performance.

![Expanding brain meme showing three levels of database sophistication. Top panel: 'WRITING COMPLEX JOINS' with normal brain. Middle panel: 'USING OPENSEARCH ACROSS MULTIPLE SHARDS' with glowing brain. Bottom panel: 'ClickHouse WITH N-GRAM BLOOM FILTERS' with maximally enlightened, glowing blue brain.](/images/blog/why-and-how-we-built-our-own-full-text-search-engine-with-clickhouse/image1.webp)

The team at Tinybird wrote an [excellent blog post](https://www.tinybird.co/blog-posts/using-bloom-filter-text-indexes-in-clickhouse) about using Bloom filter indexes for text search in ClickHouse, which was extremely helpful in our implementation. I highly recommend reading it for a deeper understanding of how these indices work.

#### How n-gram ClickHouse Bloom Filters Work

The `ngrambf_v1` index works by:

1. Breaking text into n-grams (substrings of length n)
2. Adding these n-grams to a Bloom filter (a probabilistic data structure)
3. Using the Bloom filter during queries to quickly determine if a text pattern might exist in a field

For example, with n=3, the word "search" would be split into the trigrams "sea", "ear", "arc", "rch".

```bash
Word: "search"
Positions:   [s][e][a][r][c][h]
             └──┴──┘
                └──┴──┘
                   └──┴──┘
                      └──┴──┘
Trigrams:    ["sea", "ear", "arc", "rch"]
```

When searching for "arc", the Bloom filter can quickly tell us which granules (blocks of text data) might contain this pattern, which allows ClickHouse's Bloom Filter to skip reading large portions of data that definitely don't contain that block of text.

#### Our Multi-tier n-gram Approach

For our implementation, we created multiple Bloom filter indices with different n-gram sizes:

1. **Single character (n=1)**: For catching any search with wildcards like `%a%`
2. **Bigrams (n=2)**: Efficient for short search terms like "IP" or "S3"
3. **Medium n-grams (n=4)**: Balanced performance for most searches like "prod" or "test"
4. **Larger n-grams (n=8)**: Optimal for longer search terms like "security" or "instance"

This multi-tier approach allows us to efficiently handle diverse search patterns while maintaining reasonable storage overhead. When a user searches for "kube", the query can use the n=4 index; when searching for a longer string like "ap-northeast-1", it can use the n=8 index.

#### Tuning Bloom Filter Parameters

The `ngrambf_v1` index takes several parameters that affect its performance:

```javascript
ngrambf_v1(n, size_in_bytes, hash_count, seed);
```

Where:

- `n`: The n-gram size
- `size_in_bytes`: The size of the Bloom filter in bytes (affects false positive rate)
- `hash_count`: Number of hash functions to use (affects false positive rate)
- `seed`: Random seed for hash functions

Like Tinybird found in their testing, we had to carefully balance these parameters. Larger Bloom filters reduce false positives, but increase storage requirements. More hash functions can improve accuracy, but slow down insertions.

Our testing showed that a Bloom filter size of `1024 bytes` with a single hash function provided the best balance of performance and storage overhead for our use case. This was significantly smaller than Tinybird's optimal configuration of `8192 bytes`, likely due to differences in our data characteristics and query patterns.

### Query Processing and Relevance Ranking

For query processing, we initially tried using JOINs and UNIONs to combine results from different conditions, but found these approaches too slow and memory-intensive. On tables with ~150 million rows, these queries would take around ~90 seconds and consume ~25GB of RAM.

We developed a more efficient query strategy that:

1. Performs OR of all subconditions
2. Counts matches for each subcondition separately
3. Groups results by resource ID
4. Filters groups by positive match counts
5. Sorts by relevance score

The relevance scoring system uses the `weight` column to prioritize results. Properties with higher weights (like IDs, names, and other primary fields) rank higher than deeper nested properties. We sum the weights and sort the results in descending order of total score.

Our optimized query strategies and careful implementation enabled effective search across massive datasets. While the 10x improvement quoted in our benchmarks represents specific test cases rather than general performance, the real transformation is more fundamental: customers went from not being able to search through their resources at all to having a responsive search capability that typically responds in under 400 milliseconds. This shift from "impossible" to "near-instantaneous" completely changes how users interact with their data.

The specific optimizations we've implemented (such as efficient query strategies and specialized Bloom filter indices) have proven particularly valuable for certain query patterns, allowing the system to handle even challenging search scenarios with reasonable performance. From a usability perspective, this consistent sub-second response time - regardless of the underlying complexity - is what makes the feature truly valuable.

## Performance Results and Tradeoffs

When we set out to measure our full-text search implementation, we wanted to establish a solid baseline for comparison. We designed a set of benchmark queries representing different potential search patterns, which we categorized into representative "shapes" like basic-frequent, frequent, and infrequent. These weren't based on actual user behavior (as we didn't yet have comprehensive data on search patterns), but rather represented our best estimation of different query types users might execute.

For each query shape, we tested four different execution strategies repeatedly to account for the natural variability in database performance. Running the same query dozens of times helped us smooth out anomalies from background merges or cache misses that could skew our results.

### Query Execution Strategies

Our testing compared four fundamentally different approaches to executing full-text search queries:

The first approach, which we called "naive," was straightforward, but inefficient. It looked up each search term individually and then joined the results together. While simple to implement, it scanned excessive amounts of data and performed poorly at scale, especially for search terms matching large numbers of resources.

![Diagram of a "SEARCH QUERY" breaking into two parallel result sets, each labeled "Results," joined together via a "JOIN" block. Depicts the naive strategy that performs separate term lookups followed by a join.](/images/blog/why-and-how-we-built-our-own-full-text-search-engine-with-clickhouse/image2.webp)

We then developed an "ungrouped" strategy that unions all term lookups first before aggregating results. This reduced join overhead but still required reading all data matching any search term.

Our third approach, "ungrouped-limited," was a breakthrough, but with important trade-offs. This strategy is essentially a simplified version that works well for single search conditions:

```sql
SELECT
   _cq_source_table,
   _cq_id,
   weight
FROM cloud_assets_search
WHERE <condition>
LIMIT 1 BY (_cq_source_table, _cq_id)
LIMIT <limit>
```

The key here is that for single search conditions, we can significantly reduce query times by limiting the number of matches we retrieve per resource and applying an early result limit. This approach dramatically reduced query times for common searches, but it comes with a big limitation: it cannot properly handle complex `AND` conditions where matches might only appear in later portions of the dataset.

For example, in a search for `a AND b` where the only resources matching both terms appear in the last quarter of the dataset, limiting results too early would miss these valid matches entirely. Additionally, this approach doesn't sum weights across multiple matching properties, instead choosing a single arbitrary weight, which sacrifices some precision in relevance ranking.

![Diagram that shows multiple search terms flowing through a single "STR MATCH → UNION ALL → AGGREGATE" path, reflecting that the strategy supports any number of sub-conditions, not just one.](/images/blog/why-and-how-we-built-our-own-full-text-search-engine-with-clickhouse/ungrouped.webp)

Finally, we developed what became our default strategy: the `sumIf` approach. This method sums match weights across all terms in a single pass using a materialized score column:

```sql
SELECT
    _cq_source_table,
    _cq_id,
    sumIf(weight, <condition1>) AS score1,
    sumIf(weight, <condition2>) AS score2,
    ...
    score1 + score2 + ... AS total_score
FROM cloud_assets_search
GROUP BY _cq_source_table,_cq_id
HAVING score1 > 0 AND score2 > 0 AND ...
ORDER BY total_score DESC
LIMIT <limit>
```

While this approach doesn't benefit from the early termination that made ungrouped-limited fast for simple queries, it scales almost linearly with result size and query complexity. Crucially, it correctly handles arbitrarily complex filter conditions and intersection logic, making it our most reliable and versatile strategy for production use. The `sumIf` approach produces the most accurate relevance scoring by properly accounting for all matching properties of each resource.

![Flow diagram showing three "SEARCH TERM" boxes feeding into a single "UNION ALL" box, which then flows into an "AGGREGATE" box. Diagram showing the single-pass aggregation strategy: term lookups union before a single aggregate step.](/images/blog/why-and-how-we-built-our-own-full-text-search-engine-with-clickhouse/image7.webp)

### The Results

The performance improvements we achieved were substantial, especially for challenging query patterns where the condition matched a large portion of the dataset. For example, in our basic-frequent benchmark (which tests worst-case performance where the condition matched approximately 72% of all rows), we reduced median latency from ~3,800 milliseconds to just 385 milliseconds using the ungrouped-limited strategy. That's a **10x speedup** for these challenging cases.

![Bar chart titled 'Basic-Frequent: Median Query Time by Variant' showing median query times (ms) for four strategies: ungrouped-limited ~390 ms, ungrouped ~2730 ms, naive ~3820 ms, and the single-pass strategy ~3810 ms, ungrouped-limited is markedly faster than the others.](/images/blog/why-and-how-we-built-our-own-full-text-search-engine-with-clickhouse/image6.webp)

It's important to note that the ungrouped-limited strategy is essentially a practical compromise for situations where a user queries something that would return millions of results. It's based on the assumption that users would prefer to get approximate results quickly rather than waiting a minute or more for exact results. The "\*-frequent" benchmarks represent worst-case scenarios for our system, not necessarily the most common user queries (as we don't yet have comprehensive data on actual search patterns).

This performance came with tradeoffs. In ungrouped and ungrouped-limited, we sacrifice some precision and relevance scoring, especially when conditions match a large number of results. This is due to the nature of our dataset, where common substrings appear frequently and can overwhelm result sets. In these cases, traditional relevance heuristics become less meaningful, and speed becomes the priority.

To mitigate this, we added a **pre-evaluation step** that quickly counts how many rows match each subcondition. When we detect that one subcondition matches significantly fewer rows than others, we can restructure the query, for example, by applying a `JOIN` or `x IN (SELECT ...)` on the smaller condition first. This reduces unnecessary scans and constrains the scope of broader subconditions, helping to minimize result bloat and optimize execution plans dynamically.

In production, we primarily use the `sumIf` strategy as our default approach for most queries, as it correctly handles complex search conditions and provides the most accurate relevance scoring. However, for certain high-volume search patterns where performance is critical, we can fall back to the faster ungrouped-limited approach.

What surprised us was how much more impact **query strategy optimization had compared to engine-level improvements.** Upgrading to [ClickHouse 25.4 with lazy materialization](https://clickhouse.com/blog/clickhouse-gets-lazier-and-faster-introducing-lazy-materialization) yielded a modest **5 to 10% gain**, whereas changing the query structure itself gave us a **10x performance boost**. This validated our hypothesis: tailoring query structure to real-world workloads is often more effective than relying on general-purpose performance features.

Not all query types responded equally to our strategies. Some frequent patterns (e.g., those that touch many columns or use deeply nested data) remained slow across all variants (~11s), suggesting they may require different optimization techniques. Meanwhile, infrequent and basic-infrequent queries (those with sparse matching conditions) were already fast (<10 ms), so additional optimizations would bring diminishing returns.

### Key Tradeoffs in Our Implementation

Like any engineering decision, our full-text search implementation involved important tradeoffs:

First, **we prioritized read performance over write speed.** The Bloom filter indices that make our searches so fast do slow down data insertion. But given that search performance during critical incidents is far more important than insertion speed during periodic syncs, this was an easy tradeoff to make.

Second, **we accepted increased storage requirements in exchange for query speed**. The multiple Bloom filter indices with different n-gram sizes increase our storage footprint by about 25-30%, but the performance gains for our users easily justify this cost.

Third, **we evolved our update strategy for efficiency and simplicity**. Initially, we dropped and rebuilt the search index after each sync - a brute-force approach that guaranteed consistency and kept the code path minimal while the feature was new.

However, we've since developed a more efficient approach that reuses unmodified index parts. This optimization is currently in final review and will likely be deployed by the time this blog post is published. The new approach maintains the consistency guarantees while significantly reducing rebuild times and resource usage. As data volumes continue to grow, we may further refine this with incremental materialized views or background merge jobs, with decisions driven by performance metrics and operational reliability rather than dogma.

### Lessons Learned

Our testing and implementation revealed several practical insights for others looking to implement high-performance text search in ClickHouse:

![Dave Chappelle meme with caption 'YOU DON'T NEED A SEARCH ENGINE IF YOUR DATABASE HAS BLOOM FILTERS' and bottom text 'Modern problems require modern solutions'. Shows Chappelle in a suit with red tie gesturing as if making a point.](/images/blog/why-and-how-we-built-our-own-full-text-search-engine-with-clickhouse/image9.webp)

The [**warm vs. cold state of your ClickHouse cluster makes a substantial difference**](https://clickhouse.com/docs/guides/developer/ttl#implementing-a-hotwarmcold-architecture). Background merges, cold caches, and OS disk I/O can introduce 10-20% performance variability. For consistent benchmarking, it's essential to warm up your cluster and disable heavy merges during testing.

**Different query shapes benefit from different optimization strategies.** The key factors we optimize for are "how many results does each subcondition return" and "how many subconditions do we have." For queries with subconditions that return few results, we can leverage early filtering to minimize the data scanned. For queries with many subconditions, focusing on efficient evaluation and minimizing redundant data access becomes critical.

An important optimization we discovered is that certain subconditions are merged during query compilation. For example, a query like `resource_type=aws_ec2_instances AND demo` contains one column-wise condition (`resource_type=aws_ec2_instances`, which filters on an indexed column) and one row-wise condition (`demo`, which searches key-value pairs). The column-wise conditions can be merged and efficiently evaluated using standard database indexes, while each separate row-wise condition requires separate evaluation. Understanding this distinction allows us to structure queries to maximize the use of column-wise filtering before applying more expensive row-wise operations.

**Bloom filter tuning requires balancing multiple factors**. Larger filters reduce false positives but increase memory usage and insertion cost. We found that starting with moderate sizes (1024 bits) and measuring collision rates worked well, allowing us to adjust based on real-world performance.

**Operational patterns matter too**. Our approach of nightly offline rebuilds with atomic table swaps effectively hides the heavy insertion overhead from users. For workloads requiring near-real-time updates, incremental materialized views might be a better approach despite their added complexity.

Finally, **thoughtful partitioning and ordering of your data can make a huge difference**. Instead of slicing the search-index table by sync date, we partition by source table (i.e., `resource type`). Each partition holds rows with near-identical key/value shapes, so Bloom-filter bitmaps stay dense, data pages compress better, and queries that scope to a single resource type, our most common pattern, hit only one partition's parts. We still order the MergeTree key so that high-cardinality predicates (`type`, `key`, `weight`, ...) come first, giving ClickHouse maximum leverage for data skipping and late-materialisation.

## Impact

The implementation of full-text search has transformed how our customers interact with CloudQuery. We've seen:

1. **Faster incident response**: Security teams can quickly locate affected resources during incidents.
2. **Improved resource discovery**: Engineers can easily find resources without needing extensive knowledge of our data model.
3. **Simplified troubleshooting**: Operations teams can trace dependencies between resources by finding all references to specific identifiers.

The implementation of full-text search has fundamentally transformed how our customers interact with their cloud. It's a shift from not being able to search effectively at all to having powerful search capabilities at their fingertips. What would have previously required complex, manually-crafted SQL queries across multiple tables (a task many users simply couldn't or wouldn't attempt) is now accessible through a search box.

## Future Directions

While our current implementation has proven highly effective for us, we're working on several improvements:

1. **Incremental indexing**: Moving from full reindexing to incremental updates for better efficiency.
2. **Natural language search**: Exploring LLM-powered search to translate natural language queries into our query format.
3. **Relation visualization**: Adding the ability to visualize relationships between resources discovered through search.
4. **Performance optimizations**: Continuing to fine-tune our Bloom filter configurations based on usage patterns.
5. **Enhanced relevance scoring**: Developing more sophisticated relevance models based on user feedback and interaction data.

## Wrapping Up

Our experience building full-text search directly in ClickHouse rather than integrating a specialized search engine provides valuable lessons for other engineering teams.

Sometimes the "right" solution isn't using a specialized tool, but rather leveraging the capabilities of systems you already have. By deepening our understanding of ClickHouse's indexing capabilities, we created a solution that:

1. Integrates seamlessly with our existing infrastructure
2. Avoids operational complexity of managing another service
3. Provides excellent performance for our specific use case
4. Leverages our team's existing expertise

For teams considering similar projects, we recommend:

1. **Thoroughly evaluate the capabilities of your existing systems** before adding new dependencies
2. **Understand the specific requirements of your use case** rather than assuming you need a specialized solution
3. **Benchmark different approaches** against realistic datasets
4. **Accept reasonable tradeoffs** that align with your priorities (in our case, optimizing for read performance over write efficiency)

Full-text search has become one of the most appreciated features in CloudQuery Platform, validating our decision to build rather than integrate. While specialized search engines certainly have their place, sometimes the best solution is hiding in plain sight within the tools you already know and use.

## References

1. [ClickHouse Data Skipping Indexes Documentation](https://clickhouse.com/docs/optimize/skipping-indexes)
2. [Using Bloom Filter Indexes for Real-time Text Search in ClickHouse (Tinybird)](https://www.tinybird.co/blog-posts/using-bloom-filter-text-indexes-in-clickhouse)
3. [ClickHouse Bloom Filters Explained (Altinity)](https://altinity.com/blog/skipping-indices-part-2-bloom-filters)
4. [Introducing Inverted Indices in ClickHouse](https://clickhouse.com/blog/clickhouse-search-with-inverted-indices)
5. [Solving Large Logs with ClickHouse (Embrace)](https://embrace.io/blog/solving-large-logs-with-clickhouse/)
