---
title: 'We benchmarked our ETL tool and synced 1 million rows in 2 seconds on a MacBook'
date: 2025-08-27
slug: 'etl-benchmark-1-million-rows-2-seconds-macbook'
description: 'We benchmarked our ETL tool and synced 1 million rows in 2 seconds on laptop hardware, which is 68% faster than enterprise platforms. Full methodology and code included.'
categories: ['Work']
tags: ['Engineering']
heroImage: '/images/blog/etl-benchmark-1-million-rows-2-seconds-macbook/thumbnail.png'
canonicalUrl: 'https://www.cloudquery.io/blog/etl-benchmark-1-million-rows-2-seconds-macbook'
contentNotice: 'This post was originally published on CloudQuery blog.'
---

![We bench marked our ETL tool and synced 1 million rows in 2 seconds on a MacBook blog post header](/images/blog/etl-benchmark-1-million-rows-2-seconds-macbook/thumbnail.png)

> **TL;DR:**
> CloudQuery achieved 163,489 rows/sec and 841.9 GB/hour data throughput on an 11-core MacBook - 68% faster than Fivetran's enterprise infrastructure benchmarks. Our Go-based architecture with Apache Arrow integration delivers multi-cloud extraction at 42 resources/sec across AWS, GCP, and Azure simultaneously, using just 47% CPU and 75MB memory. The complete benchmark methodology is [open-source](http://github.com/cloudquery/benchmark) and reproducible on any hardware, from laptops to enterprise clusters.

We ran comprehensive performance benchmarks to test CloudQuery's data synchronization capabilities against industry leaders - and the results exceeded our expectations. This post breaks down our methodology, presents the complete performance data, and explains the architectural choices that enable CloudQuery to outperform managed ETL tools on standard hardware.

We think that the real story here isn't just the data movement speeds - it's that we achieved superior throughput on small, affordable hardware compared to enterprise infrastructure. CloudQuery delivers best-in-class performance whether you're running dev pipelines locally on your MacBook, managing enterprise Kubernetes clusters in the cloud, or deploying on your hardware at any scale.

Here's how the numbers break down: We pushed 163,489 rows per second through our data pipeline while processing 841.9 GB/hour on an 11-core MacBook. For comparison, [Fivetran's latest published benchmarks](https://www.fivetran.com/benchmarking) show 500+ GB/hour throughput at roughly 105,000-117,000 rows/sec on enterprise GCP infrastructure with 16 cores and 128GB RAM - that's 68% higher throughput on hardware you probably have sitting on your desk.

![Side-by-side performance comparison chart showing CloudQuery vs Fivetran throughput metrics.](/images/blog/etl-benchmark-1-million-rows-2-seconds-macbook/image4.png)

## Why data movement performance matters

Slow data synchronization creates cascading infrastructure costs. We've observed engineering teams waiting 8 hours for inventory updates because their ETL tool couldn't keep pace with API changes across three cloud providers. Meanwhile, they're paying for idle compute resources and missing SLA windows.

Performance impacts extend beyond operational efficiency. When you're syncing cloud infrastructure data, every minute of delay affects monitoring, compliance, and cost management systems. Slow data sync results in stale dashboards, missed security alerts, and finance teams working with outdated spend data.

For teams pushing the envelope of real-time data delivery for financial or AI use cases, CloudQuery's can be the difference between winning and losing. When the stakes are high, speed matters.

We measured our performance to demonstrate that modern architecture choices can deliver enterprise-grade performance on any hardware, from laptops to data centers.

## Benchmark methodology and reproducibility

Our benchmark follows rigorous testing principles with complete transparency. The entire testing framework is open source, allowing independent verification of our performance claims.

### Testing Framework Architecture

These benchmarks were executed on a MacBook Pro with an M3 processor and 36GB of RAM, running macOS Sequoia. This consumer-grade hardware provides a consistent baseline for performance measurement and represents typical development environments.

Our benchmark framework implements comprehensive performance monitoring with process-specific resource tracking. Rather than measuring system-wide metrics, we monitor CloudQuery's specific CPU and memory utilization during execution. This approach isolates CloudQuery's performance characteristics from background system processes.

The framework supports:

**Source diversity**: File, AWS, GCP, Azure, PostgreSQL, ClickHouse, SQLite
**Destination compatibility**: SQLite, PostgreSQL, ClickHouse with destination-specific optimizations
**Concurrent execution**: Configurable worker pools for parallel source processing
**Resource monitoring**: Process-specific CPU and memory tracking with 100ms sampling intervals
**Dual throughput metrics**: Both rows/second and MB/second (GB/hour) measurement
**Comprehensive reporting**: CSV and Markdown output with detailed system specifications

#### Performance Measurement Methodology

Our calculations follow standard throughput measurement practices:

```python
rows_per_second = total_rows / (end_time - start_time)
mb_per_second = total_data_mb / (end_time - start_time)
gb_per_hour = mb_per_second * 3.6
cpu_percent = process.cpu_percent(interval=0.1)
memory_mb = process.memory_info().rss / 1024 / 1024
```

Resource utilization data is collected at 100ms intervals throughout execution, providing granular performance insights without introducing measurement overhead that could affect results.

#### Comparative Performance Analysis

| Metric        | CloudQuery (MacBook) | Industry Benchmarks\* | Configuration        |
| ------------- | -------------------- | --------------------- | -------------------- |
| **Rows/sec**  | 163,489              | 50,000-111,000        | 11-core M3 processor |
| **GB/hour**   | 841.9                | 500+ (verified)       | Consumer hardware    |
| **CPU usage** | 47%                  | Not disclosed         | Headroom available   |
| **Memory**    | 12GB peak            | Unknown               | 33% of available     |

\*Industry performance varies significantly. Independent analysis shows processing time differences of 19x between fastest and slowest ETL tools for equivalent workloads.

![Side-by-side performance comparison chart showing ETL Tool Data Throughput in GB per Hour.](/images/blog/etl-benchmark-1-million-rows-2-seconds-macbook/image5.png)

#### Architectural Performance Factors

CloudQuery's performance characteristics result from specific architectural decisions that create multiplicative performance benefits:

**Concurrency optimization**: Go's goroutine model utilizes 2KB stack allocation versus megabytes for OS threads, enabling thousands of concurrent operations without memory overhead constraints.

**Memory layout efficiency**: Apache Arrow integration provides columnar memory format enabling SIMD vectorization. This architecture processes 64-byte buffers with single CPU instructions rather than 24+ scalar operations, delivering 10-100x performance improvements in real-world implementations.

**Zero-copy operations**: Arrow eliminates serialization overhead between processes while maintaining 64-byte memory alignment that matches CPU cache boundaries for optimal memory access patterns.

**I/O optimization**: HTTP/2 connection multiplexing reduces network overhead, while SQLite WAL mode with memory mapping minimizes disk I/O bottlenecks.

These architectural choices compound to produce the observed throughput performance on consumer hardware.

#### Benchmark Reproducibility

Complete benchmark implementation is available in the [benchmark repository](https://github.com/cloudquery/benchmark). The repository includes:

- Complete configuration files used in testing
- Test data generators for consistent dataset creation
- Exact execution scripts and parameters
- Multiple iteration framework with statistical averaging

```bash
git clone https://github.com/cloudquery/benchmark
cd benchmark
python benchmark.py --source file --dest clickhouse
```

Our methodology prioritizes reproducible results with consistent hardware specifications and realistic workload patterns. The framework validates performance against actual customer use cases rather than synthetic benchmarks alone.

#### Performance Validation

The demonstrated throughput on consumer hardware exceeds enterprise cloud infrastructure performance in published benchmarks. This performance profile maintains consistency across deployment scenarios, from development environments to production data centers, due to the architectural optimizations that reduce dependency on specialized hardware configurations.

#### Performance comparison: small hardware vs enterprise cloud

| Metric        | CloudQuery (MacBook) | Fivetran (GCP Enterprise) | Advantage         |
| ------------- | -------------------- | ------------------------- | ----------------- |
| **Rows/sec**  | 163,489              | ~111,000                  | 47% faster        |
| **GB/hour**   | 841.9                | 500+                      | 68% faster        |
| **Hardware**  | 11-core laptop       | 16-core cloud server      | Smaller footprint |
| **CPU usage** | 47%                  | Not disclosed             | Room to scale     |

![Side-by-side performance comparison chart showing ETL Tool Data Throughput in GB per Hour.](/images/blog/etl-benchmark-1-million-rows-2-seconds-macbook/image5.png)

The key here is that we can achieve superior throughput on consumer laptop hardware compared to enterprise cloud infrastructure. This performance profile enables consistent results across any deployment scenario, from development environments to production data centers.

## What makes CloudQuery fast

### Go concurrency architecture

CloudQuery leverages Go's goroutine model for lightweight concurrency. Each goroutine uses approximately 2KB of stack space compared to megabytes for OS threads, enabling thousands of concurrent operations with minimal resource overhead. This architecture scales effectively whether running on a laptop or a 64-core server.

### Apache Arrow integration

Apache Arrow's columnar memory format provides 10-100x performance improvements through SIMD vectorization. Instead of row-wise processing, we handle entire 64-byte buffers with single CPU instructions. Arrow's zero-copy data access eliminates serialization overhead between processes, creating genuine zero-copy data movement from source to destination.

![Technical architecture diagram showing Go goroutines vs traditional threads, plus Apache Arrow columnar format benefits.](/images/blog/etl-benchmark-1-million-rows-2-seconds-macbook/image6.png)

## Multi-cloud performance testing results

Our benchmark framework tests real-world multi-cloud extraction performance across AWS, GCP, and Azure simultaneously on laptop hardware. Unlike traditional data integration tools that serialize cloud provider access, CloudQuery's architecture enables concurrent extraction from multiple cloud APIs.

Multi-cloud benchmark results (MacBook hardware):

| Cloud Provider | Resources Extracted | Throughput | Processing Time | CPU Usage |
| -------------- | ------------------- | ---------- | --------------- | --------- |
| AWS            | 1,863 resources     | 36.33/sec  | 51.28s          | 10.2%     |
| Azure          | 742 resources       | 41.62/sec  | 17.83s          | 6.3%      |
| GCP            | 109 resources       | 8.23/sec   | 13.25s          | 7.2%      |

These results demonstrate production-grade multi-cloud data extraction running on consumer laptop hardware, with CPU usage remaining below 11% across all cloud providers. Most enterprise ETL platforms require dedicated cloud infrastructure to achieve comparable multi-cloud processing capabilities.

### Multi-cloud optimization approach

CloudQuery treats each cloud provider as an independent system with separate rate limits and API patterns. Our architecture respects these constraints while maximizing concurrent utilization:

- **AWS rate limits:** 20 requests/sec sustained, burst capacity up to 100
- **Azure rate limits:** Variable by subscription and resource type
- **GCP rate limits:** 10 requests/sec sustained, service-specific variations

The variation in resource counts reflects different infrastructure footprints in each cloud, while the consistent low CPU usage demonstrates efficient resource utilization across all providers.

This concurrent multi-cloud approach delivers significant advantages over tools that process cloud providers sequentially, reducing total extraction time and enabling real-time infrastructure visibility across hybrid cloud environments.

## Architecture advantages over enterprise ETL tools

### Specialized cloud infrastructure focus

CloudQuery is purpose-built for cloud infrastructure data extraction and management. This specialization enables architectural decisions that wouldn't work for general-purpose data integration, including optimizations for cloud resource relationships and API patterns.

### Resource efficiency

Our benchmark demonstrates 47% CPU usage and 75.7MB memory consumption on laptop hardware while outperforming enterprise ETL platforms. Traditional enterprise tools typically require dedicated cloud infrastructure and significantly more resources to achieve comparable throughput.

![Resource utilization comparison showing CPU utilization for CloudQuery vs typical enterprise ETL.](/images/blog/etl-benchmark-1-million-rows-2-seconds-macbook/image7.png)

![Resource utilization comparison showing memory usage CloudQuery vs typical enterprise ETL.](/images/blog/etl-benchmark-1-million-rows-2-seconds-macbook/image3.png)

### Self-hosted performance advantages

CloudQuery processes data entirely on your infrastructure, eliminating network overhead to vendor-hosted processing. This approach avoids the latency and bottlenecks inherent in vendor-routed data processing.

## CloudQuery by the numbers

\*All metrics achieved on laptop hardware.

**163,489 rows/sec**
Peak database throughput (47% faster than enterprise ETL).
**841.9 GB/hour**
Data processing throughput (68% faster than Fivetran's enterprise setup)

**75.7MB memory**
Lightweight footprint during operation

**100MB binary**
Complete deployment package size

**93% efficiency**
API utilization under cloud provider rate limits

**Verify these results yourself:** Our complete benchmark methodology, test configurations, and measurement scripts are available in [our open-source repository](https://github.com/cloudquery/benchmark). See how we can improve and how much more you can squeeze out of our benchmarks. The methodology, configurations, and code enable independent verification on any hardware.

Data integration requires more engineering focus and less vendor dependency. We built CloudQuery to deliver superior performance on any hardware - from laptops to enterprise infrastructure - because your data pipeline performance shouldn't require expensive cloud infrastructure to beat industry benchmarks.

## Resources

- [CloudQuery benchmark repository](https://github.com/cloudquery/benchmark)
- [CloudQuery documentation](https://www.cloudquery.io/docs/platform/introduction)
- [Performance tuning guide](https://www.cloudquery.io/docs/cli/advanced/performance-tuning)
