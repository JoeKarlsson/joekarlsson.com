---
title: 'Why ClickHouse Should Be Your Next Database'
date: 2024-04-05
slug: 'why-clickhouse-should-be-your-next-database'
description: “Today, we’re jumping into databases. Another database to learn? But before you sprint for the hills, allow me to introduce you to ClickHouse.”
categories: ['Web Dev']
writtenFor: 'Tinybird'
heroImage: '/images/blog/why-clickhouse-should-be-your-next-database/thumb-5be2e70d.webp'
heroAlt: 'Ancient Greek columns at sunset'
tldr: 'ClickHouse is a column-oriented database built for real-time analytics on huge datasets. It loads data 23x faster than PostgreSQL, uses 8.5x less storage, and powers real-time analytics at companies like Cloudflare and Yandex.'
---

Today, we’re jumping into databases. Now, I can hear you sigh: “Another database to learn? Seriously?” But before you sprint for the hills, allow me to introduce you to [ClickHouse](https://thenewstack.io/clickhouse-rapidly-rivals-other-open-source-databases-in-active-contributors/), the Sonic the Hedgehog of the database multiverse.

## Lightning Quick: Decoding ClickHouse Architecture

ClickHouse is an open source, column-oriented database management system (DBMS) designed for running [real-time analytical queries](https://thenewstack.io/two-sizes-fit-most-postgresql-and-clickhouse/) and updates on mammoth datasets. And by “mammoth” I mean “if you printed it out, you’d probably need a forest’s worth of paper” big.

### What’s Behind the Speed of ClickHouse?

To uncover this mystery, let’s peer into its architecture.

![Normalization versus denormalization, using a student's grades. Normalized (OLTP): the student links to separate rows for each subject, Science B, English A, History B and Maths C, which suits looking up one grade. Denormalized (OLAP): all the grades sit together on one report card, History B, Maths C, English A and Science B, which suits analyzing many grades at once, the way ClickHouse works.](/images/blog/why-clickhouse-should-be-your-next-database/normalization.svg)

ClickHouse is like a powerful system used by university administrators. As a student, you may want to quickly check your grade on a single assignment or test, which is a simple, straightforward transaction. However, the administrators need to perform more complex operations. They’re calculating class averages, evaluating grade distributions for the entire semester, analyzing patterns in student performance across all subjects and more. To accomplish these tasks, they’re not just looking at one student’s grades, but rather, they’re analyzing vast volumes of data from all students.

### How about Scalability?

Did I mention ClickHouse loves big data? This [database system scales](https://roadmap.sh/guides/scaling-databases) beautifully across clusters, so your data can grow bigger than a reality TV star’s ego, and ClickHouse would still handle it without breaking a sweat. Need to add more nodes to your cluster? No problem. Want to keep your data replicated for higher availability? ClickHouse says, “Sure, why not?”

![ClickHouse scaling across a cluster: a load balancer spreads queries over shards 0, 1 through N. Each shard has two replicas, each a ClickHouse server on its own machine and cloud disk, and the replicas in a shard copy data to each other, with data backup underneath.](/images/blog/why-clickhouse-should-be-your-next-database/cluster.svg)

## What Makes ClickHouse Unique?

ClickHouse is a true column-oriented DBMS. It stores values compactly, with no extra data alongside them, which speeds up processing. It also supports constant-length values, which keeps storage efficient. ClickHouse can process hundreds of millions of rows per second, more than systems like HBase and Cassandra.

ClickHouse is also flexible as a database management system. It isn't confined to a single database: you can create tables and databases, load data and run queries in real time, without reconfiguring or restarting the server.

Additional features that amplify ClickHouse’s uniqueness include:

- **Data compression**: This fundamental characteristic dramatically enhances performance.

- **Disk storage of data**: ClickHouse uniquely combines low-latency data extraction with the cost-effectiveness of using regular hard drives.

- **Parallel and distributed processing**: ClickHouse capitalizes on multicore and multiserver environments to speed up large queries, a rare feature in columnar DBMSs.

- **SQL support**: With extensive support for SQL, ClickHouse stands out in handling various queries.

- **Vector engine**: Processing data by vectors enhances CPU efficiency, a unique approach contributing to ClickHouse’s superior performance.

- **Real-time data updates and fast indexing**: ClickHouse’s continuous data addition and quick indexing cater to real-time needs.

- **Suitability for online queries**: With low latency, ClickHouse ensures immediate query processing, a key requirement for online operations.

Together, these features make ClickHouse a fast, flexible system for large-scale, real-time data processing. One feature I find particularly interesting is how ClickHouse handles text search - I dug into that in my post on [using Bloom filter indexes for real-time text search in ClickHouse](/blog/using-bloom-filter-indexes-for-real-time-text-search-in-clickhouse/).

## The ClickHouse Advantage: Real-World Use Cases

Just to prove I’m not pulling your leg here, let’s look at some real-world use cases.

### Cloudflare

Yes, the folks who practically hold up half the internet [use ClickHouse for real-time query analytics on terabytes of data every single day](https://blog.cloudflare.com/http-analytics-for-6m-requests-per-second-using-clickhouse/)! Cloudflare uses ClickHouse to manage real-time DNS query analytics for up to 6 million requests per second, which involves processing terabytes of data. From an architectural perspective, ClickHouse’s column-oriented database design plays a key role.

The new architecture includes:

- **Kafka consumers**: 106 Go consumers per each partition consume Cap’n Proto raw logs and extract/prepare needed more than 100 ClickHouse fields. Consumers no longer do any aggregation logic.

- **ClickHouse cluster**: 36 nodes with x3 replication factor. It handles non-aggregate requests, logs ingestion and then produces aggregates using materialized views.

- **Zone Analytics API**: Rewritten and optimized version of the API in Go, with many meaningful metrics, health checks and failover scenarios.

![Server diagram for Cloudflare’s central data center based on ClickHouse. Source: https://blog.cloudflare.com/http-analytics-for-6m-requests-per-second-using-clickhouse/](/images/blog/why-clickhouse-should-be-your-next-database/2c587eb1-image3.webp)_Server diagram for Cloudflare’s central data center based on ClickHouse. Source: [https://blog.cloudflare.com/http-analytics-for-6m-requests-per-second-using-clickhouse/](https://blog.cloudflare.com/http-analytics-for-6m-requests-per-second-using-clickhouse/)_

As you can see, the architecture of the new data pipeline is simpler and fault tolerant. It provides analytics for all of Cloudflare’s more than 7 million customers’ domains totaling more than 2.5 billion monthly unique visitors and over 1.5 trillion monthly page views.

### Yandex.Metrica

The world’s second-largest web analytics platform, [Yandex.Metrica uses ClickHouse to handle over a trillion rows of data. A trillion!](https://web.archive.org/web/20251010002015/https://devdoc.net/database/ClickhouseDocs_19.4.1.3-docs/introduction/ya_metrika_task/) Yandex uses ClickHouse for:

- Storing data for session replay.

- Processing intermediate data.

- Building global reports with analytics.

- Running queries for debugging the Yandex.Metrica engine.

- Analyzing logs from the API and the user interface.

ClickHouse handles this scale with distributed storage and compute, which is what lets Yandex process that much data. Its flexible sharding and replication keep the data reliable and highly available, which matters at Yandex’s volume and speed.

## PostgreSQL vs. ClickHouse: An Analytical Comparison

Let’s take a look at how ClickHouse compares to PostgreSQL for dealing with a typical workload in clickstream and traffic analysis, web analytics, machine-generated data, structured logs and web event data. This benchmark scenario reflects the typical queries in ad-hoc analytics and real-time dashboards. The dataset used was acquired from the actual traffic recording of one of the world’s largest web analytics platforms. Both ClickHouse and PostgreSQL systems have been optimally tuned and deployed on a c6a.4xlarge server with 500GB gp2 storage.

The benchmark data has been obtained from the [ClickHouse Benchmark](https://benchmark.clickhouse.com).

### Data Load Time

This parameter refers to the time taken to load the dataset into the database.

![Bar chart of the time to load the same dataset, both databases tuned: ClickHouse 507 seconds, PostgreSQL 11,800 seconds, 23 times longer.](/images/blog/why-clickhouse-should-be-your-next-database/load-time.svg)

### Storage Size

This parameter refers to the space occupied by the data in the database.

![Bar chart of the disk space the same dataset takes, both databases tuned: ClickHouse 14.08 GiB, PostgreSQL 120.02 GiB, 8.5 times more.](/images/blog/why-clickhouse-should-be-your-next-database/storage-size.svg)

ClickHouse also proves to be more storage-efficient. The benchmark indicates that ClickHouse uses about 8.5 times less storage compared to PostgreSQL for the same dataset.

These results come from one analytical scenario, and real-world results might vary based on the use case and how each system is tuned.

You can also check out how ClickHouse compares to other databases in the [benchmark report](https://benchmark.clickhouse.com).

## What’s the Best Way to Start Using ClickHouse?

Think you might be ready to try ClickHouse? There are a few ways to start, most simply with the open source [version](https://github.com/ClickHouse/ClickHouse).

Prefer to avoid hosting and scaling yourself? [Tinybird](https://www.tinybird.co?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q2-2023-the-new-stack&utm_term=clickhouse-database), a tool that developers affectionately dub “ClickHouse++” takes ClickHouse’s already powerful capabilities, offers [serverless hosting](https://www.tinybird.co/clickhouse?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q2-2023-the-new-stack&utm_term=clickhouse-database) and adds even more developer-focused goodness to the mix, including

- **Native integration with multiple data sources** (like [Kafka](https://www.tinybird.co/integrations/kafka-data?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q2-2023-the-new-stack&utm_term=clickhouse-database), [S3](https://www.tinybird.co/integrations/amazon-s3?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q2-2023-the-new-stack&utm_term=clickhouse-database), [GCS](https://www.tinybird.co/integrations/google-cloud-storage?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q2-2023-the-new-stack&utm_term=clickhouse-database), [BigQuery](https://www.tinybird.co/integrations/google-bigquery?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q2-2023-the-new-stack&utm_term=clickhouse-database), [Snowflake](https://www.tinybird.co/integrations/snowflake?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q2-2023-the-new-stack&utm_term=clickhouse-database), and more. It even offers a [streaming HTTP endpoint](https://www.tinybird.co/docs/guides/ingest-from-the-events-api.html?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q2-2023-the-new-stack&utm_term=clickhouse-database) to capture events directly from your application or service.

- **UI, CLI and API:** Tinybird abstracts the complexities of a powerful database into [a workflow](https://www.tinybird.co/product?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q2-2023-the-new-stack&utm_term=clickhouse-database), that offers interactions through UI, a CLI and a RESTful API.

- **Rapid API development framework:** With Tinybird, you can query your database tables with composable nodes of familiar SQL, and instantly publish your queries as dynamic, documented, secure and scalable APIs to power your app dev, as in [this example](https://www.tinybird.co/blog-posts/designing-and-implementing-a-weather-data-api?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q2-2023-the-new-stack&utm_term=clickhouse-database).

## So, What Are You Waiting for?

If you’re a data engineer or a software developer constantly juggling large volumes of data and crunching numbers for real-time analytics, ClickHouse is your best bet. Once you’ve tasted the speed of ClickHouse (and Tinybird), there’s no going back.

## Learn More

- For a detailed look at ClickHouse, visit its [official documentation](https://clickhouse.com/docs).

- To understand how Tinybird can supercharge your ClickHouse experience, check out the [Tinybird documentation](https://www.tinybird.co/docs?utm_source=the-new-stack&utm_medium=paid-publisher&utm_campaign=q2-2023-the-new-stack&utm_term=clickhouse-database).

## FAQs

**Q: Is ClickHouse suitable for online transaction processing (OLTP) systems?**

No, ClickHouse is designed primarily for online analytical processing (OLAP). It’s perfect for real-time analytical queries on large data volumes, not transactional systems.

**Q: How does ClickHouse manage data redundancy and availability?**

ClickHouse supports asynchronous multimaster replication. You can configure it to keep copies of your data on different nodes for higher availability.

**Q: What language does ClickHouse use for queries?**

ClickHouse uses SQL for queries. So, if you’re familiar with SQL, you’ll feel right at home.

**Q: How does Tinybird enhance ClickHouse’s functionality?**

Tinybird is a serverless platform that lets you build real-time analytics APIs on top of ClickHouse at high speed. It provides a much more ergonomic developer experience with features designed for real-time app development. So, it’s like adding an extra layer of speed and convenience to your ClickHouse setup.
