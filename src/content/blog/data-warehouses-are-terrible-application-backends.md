---
title: 'Data Warehouses Are Terrible Application Backends'
date: 2024-04-05
slug: 'data-warehouses-are-terrible-application-backends'
description: ‘The ever-increasing tide of data has become a paradox of plenty for today’’s developers. According to a report from Seagate, by 2025 worldwide data will grow to a staggering 163 zettabytes, over 10...'
categories: ['Databases']
heroImage: '/images/blog/data-warehouses-are-terrible-application-backends/add14bab-data-warehouse-1-1024x505-1.webp'
heroAlt: 'Diagram showing why data warehouses make poor application backends'
tldr: 'Data warehouses like Snowflake and BigQuery are great for BI dashboards but terrible for user-facing apps. Job pool queuing creates unpredictable latency, concurrency is expensive to scale, and cache layers sacrifice data freshness. Use a real-time data platform instead.'
---

The ever-increasing tide of data has become a paradox of plenty for today’s developers. According to [a report from Seagate](https://www.seagate.com/www-content/our-story/trends/files/Seagate-WP-DataAge2025-March-2017.pdf), by 2025 worldwide data will grow to a staggering 163 zettabytes, over 10 times the volume in 2016. More data should mean deeper insights and better user experiences, but it also leads to problems.

For data-oriented developers, this explosion is a double-edged sword. It presents an incredible opportunity to build user-facing features powered by data and using [real-time analytics](https://www.tinybird.co/blog-posts/real-time-analytics-a-definitive-guide?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=data-warehouse-backend&utm_content=inline-mention). On the other hand, processing all that data with minimal latency and at high concurrency can be really challenging with a typical modern data stack.

[Data warehouses](https://www.tinybird.co/blog-posts/why-data-warehouses?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=data-warehouse-backend&utm_content=inline-mention), in particular, are the resting place of choice for big data at modern companies, and their online analytical processing (OLAP) approach is perfect for complex, long-running analytical queries over big data for things like business intelligence reports and dashboards.

However, they make terrible application backends.

This post explains why a combination of job pool management, concurrency constraints and latency concerns preclude data warehouses from effectively functioning as a storage layer for user-facing applications, and why you should consider alternative technology for your data app stack.

## Understanding the Data Warehouse

Ten years ago, data warehouses were the hot, new thing in the data world. Capable of storing a whole mess of structured data and processing complex analytical queries, data warehouses set a new bar for how businesses run their internal business-intelligence processes.

Specifically, data warehouses do three things that have made analytics accessible and powerful:

- They separate storage and compute, reducing costs to scale.

- They use distributed compute and cloud networking to maximize query throughput.

- They democratize analytics with the well-known SQL.

If you want a good primer on why data warehouses exist and what they’ve enabled for modern data teams, I encourage you to read [this](https://www.tinybird.co/blog-posts/why-data-warehouses?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=data-warehouse-backend&utm_content=inline-mention).

Today, data warehouses like Snowflake, BigQuery, Redshift and Azure Synapse still occupy the head of the table in many companies’ data stacks, and because of their favored position within the organization, developers may be tempted to use them as a storage layer for user-facing analytics. They have the power to run complex analytical queries that these use cases demand; the data is already there, and you’re already paying for them. What’s not to love?

As it turns out, quite a bit. Here are the reasons why application developers can’t rely on data warehouses as a storage layer for their user-facing analytics.

## The Unpredictable World of Job Pools and Nondeterministic Latency

Data warehouses process analytical queries in a job pool. Snowflake, [for example](https://www.tinybird.co/blog-posts/real-time-solutions-with-snowflake?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=data-warehouse-backend&utm_content=inline-mention), uses a shared pool approach to process queries concurrently, aiming to optimize available computing resources.

Here’s the problem: Job pools create nondeterministic latency with a set floor. A simple `SELECT 1` on Snowflake could potentially run in a few milliseconds, but more likely it will take a second or more simply because it must be processed in a queue with all the other queries.

Even the best [query-optimization strategies](https://www.tinybird.co/blog-posts/5-rules-for-writing-faster-sql-queries?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=data-warehouse-backend&utm_content=inline-mention) can’t overcome this limitation.

Running a query on a data warehouse is like playing a game of “latency roulette.” You can spin the wheel the same way every time, but the final outcome (in this case, the latency of the query response) lands unpredictably.

Now, if you’re a backend developer building APIs over a storage layer, you’d never take a chance on nondeterministic latency like this. Users expect snappy APIs that respond within milliseconds. The database query should be one of the fastest things in the request path, even compared to network latency. If you’re building on top of a data warehouse, this won’t be the case, and your users will feel the pain.

## The Illusion of Scalability

Latency is but one part of the equation for API builders. The second is concurrency. If you’re building an API that you intend to scale, [solid fundamentals](https://thenewstack.io/the-fundamentals-of-data-api-design/) demand that you provide low-latency responses for a highly concurrent set of users.

When you dive deeper into the functionality of data warehouses, you’ll realize that to genuinely scale horizontally to accommodate increased query concurrency, you need to either spin up new virtual warehouses or increase their cluster limit, or both. For example, if you wanted to support just 100 concurrent queries per minute on Snowflake, you’d need 10 multicluster warehouses.

And spinning up new warehouses isn’t cheap. Just ask your buddies [over in data engineering](https://www.tinybird.co/blog-posts/5-snowflake-struggles-that-every-data-engineer-deals-with?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=data-warehouse-backend&utm_content=inline-mention). For the Snowflake example, you’d be [paying more than $30,000 a month](https://www.tinybird.co/blog-posts/real-time-solutions-with-snowflake#a-realistic-example?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=data-warehouse-backend&utm_content=inline-mention).

Concurrency constraints in data warehouses like Snowflake present one of the most significant challenges for developing real-time applications. With a large volume of queries knocking at your warehouse’s door, and a limited number of resources to serve them, you’re bound to experience some serious latency issues unless you scale up and out. And scaling up and out is often prohibitively expensive.

## Building Cache Layers: A Recent Trend and Its Drawbacks

OK, so nobody really builds an application directly on top of a data warehouse, right? Obviously, you’d use a caching layer like [Redis](https://redis.com/?utm_content=inline+mention) or some other [real-time database](https://thenewstack.io/real-time-databases-who-is-using-them-and-why/) to make sure your API requests are fast and balanced even with many concurrent users.

![This is a common approach when the data you need to support your application resides in a data warehouse. In theory, the approach seems workable. In reality, it carries some serious drawbacks, the most significant of which is data freshness.](/images/blog/data-warehouses-are-terrible-application-backends/d9f44aba-image3-e1689172194931.webp)_This is a common approach when the data you need to support your application resides in a data warehouse. In theory, the approach seems workable. In reality, it carries some serious drawbacks, the most significant of which is data freshness._

Simply put, using a cache layer works great for shrinking query latency, but it still won’t work for applications built over streaming data that must always serve the most recent events.

Think about a [fraud-detection use case](https://www.tinybird.co/blog-posts/how-to-build-a-real-time-fraud-detection-system?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=data-warehouse-backend&utm_content=inline-mention) where a financial institution must determine if a transaction is fraudulent within the time it takes to complete the transaction (a few seconds). This usually involves a complex analytical process or [online machine learning feature store](https://www.tinybird.co/blog-posts/using-tinybird-as-a-serverless-online-feature-store?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=data-warehouse-backend&utm_content=inline-mention) based on just-created data. If that data hits the warehouse before your backend APIs, no cache layer will save you. The cache is great for enabling low-latency API requests by storing analytics [recently run in batch ETL (extract, transform, load) processes](https://www.tinybird.co/blog-posts/event-driven-architecture-best-practices-for-databases-and-files?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=data-warehouse-backend&utm_content=inline-mention), but it can’t access just-created data, because the warehouse is still processing it.

## The Alternative: Real-Time Data Platforms

As I mentioned, the fundamental problem of building data-intensive applications over data warehouses boils down to a failure to maintain:

- low-latency queries

- from highly-concurrent users

- over fresh data

So, what’s the alternative?

For building user-facing applications, you should turn to [real-time data platforms](https://www.tinybird.co/product?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=data-warehouse-backend&utm_content=inline-mention) like [Tinybird](https://www.tinybird.co?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=data-warehouse-backend&utm_content=inline-mention).

## What Is a Real-Time Data Platform?

A real-time data platform helps data and engineering teams create high-concurrency, low-latency data products over streaming data at scale.

A real-time data platform uses a [columnar database](https://www.tinybird.co/blog-posts/when-to-use-columnar-database?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=data-warehouse-backend&utm_content=inline-mention) under the hood so it can handle the complex analytical workloads previously relegated to data warehouses but at a much faster pace. Furthermore, a real-time data platform typically offers a low-latency publication layer, exposing low-latency APIs to data-intensive applications that may rely on both batch and streaming data sources. Building APIs at scale for streaming data platforms is often not considered but can be a massive pain to maintain and scale as your data scales.

## Reference Architectures for Real-Time Data Platforms

When building on top of real-time data platforms, consider two incremental architectures for your data stack.

In the first approach, the data warehouse can still be the primary underpinning storage layer, where the real-time data platform effectively serves as a publication layer. In this architecture, data is synced between the data warehouse and the real-time data platform either on a schedule or on ingestion, and the real-time data platform handles additional transformations as well as providing a low-latency, high concurrency API.

![Real-time data platforms like Tinybird can function like a cache layer over a data warehouse using native connectors. In this way, they eliminate the need for custom object-relational mapping (ORM) code but still may suffer some data freshness constraints.](/images/blog/data-warehouses-are-terrible-application-backends/7ba0b530-image1-e1689172257371.webp)_Real-time data platforms like Tinybird can function like a cache layer over a data warehouse using native connectors. In this way, they eliminate the need for custom object-relational mapping (ORM) code but still may suffer some data freshness constraints._

In practice, this is similar to using a real-time data platform as a caching layer, with the added benefit of avoiding the need to write custom API code to connect the cache with your application and having the ability to perform additional enrichment or transformations with the power of full online analytical processing (OLAP).

The second approach bypasses the data warehouse entirely or operates in parallel. Assuming event data is placed on some kind of message queue or streaming platform, the real-time data platform subscribes to streaming topics and ingests data as it’s created, performing the necessary transformations and offering an API layer for the application to use.

![Real-time data platforms like Tinybird can function like a cache layer over a data warehouse using native connectors. In this way, they eliminate the need for custom object-relational mapping (ORM) code but still may suffer some data freshness constraints.](/images/blog/data-warehouses-are-terrible-application-backends/df9e6486-image2-e1689172310954.webp)_Real-time data platforms like Tinybird can function like a cache layer over a data warehouse using native connectors. In this way, they eliminate the need for custom object-relational mapping (ORM) code but still may suffer some data freshness constraints._

This can be the preferred approach since it eliminates the data freshness issues that still exist when a caching layer is used over a data warehouse and, with the right real-time data platform, streaming ingestion can be trivial.

## The Benefits of a Real-Time Data Platform

- **Native data-source connectors:** Real-time data platforms can integrate with various data sources and other tech stack components. This makes it easy to unify and join multiple data sources for real-world use cases. For example, you can combine data from [Snowflake](https://www.tinybird.co/blog-posts/real-time-solutions-with-snowflake?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=data-warehouse-backend&utm_content=inline-mention) or [BigQuery](https://www.tinybird.co/blog-posts/real-time-applications-with-bigquery-connector?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=data-warehouse-backend&utm_content=inline-mention) with streaming data from [Confluent](https://www.tinybird.co/blog-posts/real-time-streaming-analytics-confluent-connector-tinybird?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=data-warehouse-backend&utm_content=inline-mention) or [Apache Kafka](https://www.tinybird.co/docs/ingest/kafka.html?highlight=kafka?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=data-warehouse-backend&utm_content=inline-mention). Tinybird, for example, even offers a simple [HTTP-streaming endpoint](https://www.tinybird.co/docs/ingest/events-api.html?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=data-warehouse-backend&utm_content=inline-mention) that makes it trivial to stream events directly within upstream application code.

- **Real-time OLAP power:** Like data warehouses, a real-time data platform gives developers the ability to run complex OLAP workloads.

- **Cost-effective:** Establishing a publication layer on Snowflake using traditional methods would necessitate additional virtual warehouses, thereby leading to [increased costs](https://www.tinybird.co/blog-posts/real-time-solutions-with-snowflake#snowflake-will-cost---30k-a-month?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=data-warehouse-backend&utm_content=inline-mention). In contrast, the [pricing model](https://www.tinybird.co/docs/billing/plans-and-pricing.html?highlight=billing?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=data-warehouse-backend&utm_content=inline-mention) for real-time data platforms are often predicated on the volume of data processed via the publication layer, resulting in a [significant reduction in cost](https://www.tinybird.co/blog-posts/real-time-solutions-with-snowflake#tinybird-will-cost---3k-a-month?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=data-warehouse-backend&utm_content=inline-mention) when used as an application backend.

- **Scalability:** Many real-time data platforms are serverless, so infrastructure scales with you, handling big data with high levels of performance and availability. Rather than host your database on bare metal servers or tweak cluster settings with managed databases, you can focus on building and shipping use cases while the real-time data platform handles scale under the hood.

- **Zero glue code:** Even with a cache layer over data warehouses, you’d still have to write glue code: ETLs to get data from the warehouse to your cache, and ORM code to publish APIs from your cache. A real-time data platform, in contrast, handles the entire data flow, from ingestion to publication, with zero glue code. Data gets synced using native connectors, transformations get defined with SQL, and queries are instantly [published as scalable APIs](https://www.tinybird.co/docs/concepts/apis.html?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=data-warehouse-backend&utm_content=inline-mention) with built-in documentation, authentication token management and dynamic query parameters.

![Like a data warehouse, Tinybird offers OLAP storage with SQL-based transformations. Unlike data warehouses, it preserves data freshness and offers a low-latency, high-concurrency API layer to support application development.](/images/blog/data-warehouses-are-terrible-application-backends/07329be8-image4-e1689172386107.webp)_Like a data warehouse, Tinybird offers OLAP storage with SQL-based transformations. Unlike data warehouses, it preserves data freshness and offers a low-latency, high-concurrency API layer to support application development._

Where data warehouses fail as application backends, real-time data platforms like Tinybird shine. Like data warehouses, these platforms support heavy data loads and complex analytics, but they do so in a way that preserves data freshness, minimizes query latency and scales to support high concurrency.

## Wrapping Up

Data warehouses aren’t bad technology, but they are bad application backends. Despite their power and usefulness for business intelligence, they simply can’t cost-effectively handle the freshness, latency and concurrency requirements that data-oriented applications must support.

[Real-time data platforms](https://www.tinybird.co/product?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=data-warehouse-backend&utm_content=inline-mention), on the other hand, function exceptionally well as backends for data-intensive applications across a wide variety of use cases: [real-time personalization](https://www.tinybird.co/use-cases/realtime-personalization?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=data-warehouse-backend&utm_content=inline-mention), [in-product analytics](https://www.tinybird.co/use-cases/in-product-analytics?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=data-warehouse-backend&utm_content=inline-mention), [operational intelligence](https://www.tinybird.co/use-cases/operational-analytics?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=data-warehouse-backend&utm_content=inline-mention), [anomaly detection](https://www.tinybird.co/use-cases/anomaly-detection-alerts?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=data-warehouse-backend&utm_content=inline-mention), [usage-based pricing](https://www.tinybird.co/use-cases/usage-based-pricing?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=data-warehouse-backend&utm_content=inline-mention), [sports betting and gaming](https://www.tinybird.co/use-cases/sports-betting-gaming?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=data-warehouse-backend&utm_content=inline-mention), [inventory management](https://www.tinybird.co/use-cases/smart-inventory-management?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=data-warehouse-backend&utm_content=inline-mention) and more.

Ready to experience the industry-leading real-time data platform? [Try Tinybird today](https://www.tinybird.co/signup?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q3-2023-the-new-stack&utm_term=data-warehouse-backend&utm_content=inline-mention) for free.
