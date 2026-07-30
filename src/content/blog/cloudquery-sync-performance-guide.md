---
title: 'CloudQuery Sync Performance: A Practical Troubleshooting Guide'
date: 2026-03-06
slug: 'cloudquery-sync-performance-guide'
description: 'Why CloudQuery syncs slow down (especially after a plugin upgrade), how to diagnose expensive tables, and the CLI command that replaces the tables wildcard with an explicit list.'
categories: ['Work']
tags: ['AWS', 'Tutorials', 'Best Practices']
heroImage: '/images/blog/cloudquery-sync-performance-guide/thumbnail.webp'
canonicalUrl: 'https://www.cloudquery.io/blog/cloudquery-sync-performance-guide'
contentNotice: 'This post was originally published on CloudQuery blog.'
---

![CloudQuery Sync Performance: A Practical Troubleshooting Guide](/images/blog/cloudquery-sync-performance-guide/header.webp)

> **TL;DR:** Slow syncs typically come from one of two places: cloud provider API rate limits (a hard ceiling you can work around but not eliminate) and syncing more tables than you need, which is what `tables: ["*"]` does by default. The one-liner below generates an explicit table list from your existing configuration, scoped to your plugin version and skip rules, so you can replace the wildcard safely.

We heard from a team recently whose AWS sync went from roughly 20 minutes to over ten hours. No errors. No obvious misconfiguration. The sync eventually finished, but the next run was just as slow.

The culprit turned out to be `tables: ["*"]` combined with a plugin upgrade. That wildcard tells CloudQuery to sync every table the plugin supports, and the AWS plugin supports a lot of them. When the team upgraded to the latest plugin version, new nested tables were added that triggered an API call for every single resource in their environment. The reads became extremely expensive - not because anything was misconfigured, but because the wildcard silently expanded to include tables the team never asked for.

This is a pattern we see regularly. Whether it's a fresh deployment that never got scoped down or a stable configuration that breaks after an upgrade, the wildcard is doing more work than most teams realize.

> **Key configuration options used in this post:**
>
> - **`tables`**: The list of tables in your [source configuration](https://www.cloudquery.io/docs/cli/integrations/sources) that CloudQuery will sync. Accepts exact names or wildcard patterns.
> - **`skip_tables`**: Tables to exclude from a sync, even if they match a wildcard in `tables`.
> - **`skip_dependent_tables`**: When `true` (the default), child tables are only synced if their parent table is explicitly listed.
> - **`--filter spec`**: A flag on the `cloudquery tables` command that limits output to tables matching your configuration file, rather than every table the plugin supports.

## Why Are My CloudQuery Syncs Slower Than Expected?

Before getting into configuration, it's worth being direct about something: when CloudQuery syncs from AWS, GCP, or Azure, performance is bounded by those providers' API rate limits, not by CloudQuery's architecture.

Our [performance benchmarks](https://www.cloudquery.io/blog/cloudquery-performance-benchmark-analysis-581gb-throughput-reality-cloud-api-constraints) show this clearly. Processing local file data without any API constraints, CloudQuery processes data as fast as your hardware allows. Against cloud providers, throughput drops to reflect each provider's rate limiting policies.

AWS is the most restrictive of the major providers. The [`DescribeInstances` API](https://docs.aws.amazon.com/AWSEC2/latest/APIReference/throttling.html), for example, enforces per-service throttling that accumulates across paginated requests. Each AWS account has its own independent rate limits, so the number of accounts isn't the bottleneck - it's the volume and cost of the tables you're syncing within each account. Running CloudQuery on AWS infrastructure (EC2 or EKS) instead of locally improves throughput by reducing network latency and benefiting from AWS's internal routing, but the API rate limits remain.

To put this in practical terms: syncing 50-100 tables across a handful of accounts typically takes less than 10 minutes. Syncing 500 tables across dozens of accounts is usually under an hour. If your syncs are taking significantly longer than that, you're likely syncing expensive tables you don't need. The fix is reducing what you sync, not adding more hardware.

This matters because tuning concurrency and parallelism only gets you to the ceiling. Once you're there, the most effective lever is reducing the number of tables you sync. That's where the wildcard problem comes in.

If you're syncing between systems you control (databases, internal services, or file sources), you don't face these same constraints. Non-cloud sources don't have provider-imposed rate limits, so hardware and network become the actual bottlenecks, and the tuning story is different.

## Why Does `tables: ["*"]` Cause Slow Syncs?

The [wildcard](https://www.cloudquery.io/blog/introducing-wildcard-matching-for-tables) is convenient. It means you don't have to enumerate every table you want. But it also means you're syncing every table the plugin supports, and most teams don't need all of them.

The AWS plugin covers a wide range of AWS services, and the table count grows with each release as new services and resource types get added. With `tables: ["*"]`, you're syncing all of them: the ones you care about and the ones you've never looked at.

The slow ones tend to fall into two categories. First, tables that generate an API call per resource - like nested tables that make a request for every single item in your environment. Second, high-volume tables that return massive amounts of data. The worst offenders are [`aws_cloudtrail_events`](https://www.cloudquery.io/hub/plugins/source/cloudquery/aws/latest/tables/aws_cloudtrail_events) and [`aws_cloudwatch_log_streams`](https://www.cloudquery.io/hub/plugins/source/cloudquery/aws/latest/tables/aws_cloudwatch_log_streams), which can take orders of magnitude longer than other tables. Reference tables like [`aws_ec2_instance_types`](https://www.cloudquery.io/hub/plugins/source/cloudquery/aws/latest/tables/aws_ec2_instance_types) (every EC2 instance type AWS offers) and `aws_rds_engine_versions` are also commonly skipped because they contain thousands of rows that rarely change. The [AWS plugin documentation](https://www.cloudquery.io/hub/plugins/source/cloudquery/aws/latest/docs) lists tables commonly skipped for exactly this reason.

This is true on any plugin version. The wildcard is a problem from day one if it's syncing tables you don't need. A stable configuration with `["*"]` is doing more work than most teams realize, and that cost grows as the plugin adds new tables over time.

### Table Selection Approaches Compared

| Approach                               | Pros                                                             | Cons                                                                           | Best For                                                     |
| -------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| `tables: ["*"]`                        | No maintenance, picks up new tables automatically                | Syncs every table including slow ones, breaks unpredictably on plugin upgrades | Initial prototyping only (not recommended for production)    |
| Explicit table list                    | Full control, fastest syncs, predictable behavior                | Requires manual updates when you want new tables                               | Production environments, performance-sensitive syncs         |
| Service-scoped wildcards (`aws_ec2_*`) | Good balance of control and coverage, scoped to services you use | Still picks up new tables within a service                                     | Teams that want auto-coverage for specific services          |
| Wildcards + `skip_tables`              | Broad coverage with exclusions for known slow tables             | Need to maintain the skip list as plugins evolve                               | Teams that need most tables but want to exclude problem ones |

## Why Did My Sync Slow Down After a Plugin Upgrade?

This is one of the most common performance issues we see, and the intro to this post describes a real example: a team's sync went from 20 minutes to 10 hours after a plugin upgrade because new nested tables silently joined their wildcard.

The mechanism is straightforward: each new plugin version can add tables for newly supported services or resource types. With `tables: ["*"]`, those new tables are automatically included in your next sync - no configuration change required.

The `skip_tables` approach doesn't fully solve this either. You might have a working `skip_tables` list for your current plugin version, but the next upgrade can introduce entirely new expensive tables that aren't in your skip list. You're always one upgrade away from a performance regression.

The fix is switching from `tables: ["*"]` to an explicit table list. The `cloudquery tables` CLI command (covered in the next section) generates that list from your current configuration, scoped to your plugin version and skip rules. Once you have an explicit list, plugin upgrades won't silently add new tables. You stay in control of what you sync and can deliberately opt in to new tables when you're ready.

> **Note:** Before upgrading a plugin: Run `cloudquery tables config.yml --filter spec --format json` before and after the upgrade, then diff the output. This shows you exactly which tables were added so you can decide whether to include them.

## How to Generate an Explicit Table List from Your Configuration

The `cloudquery tables` command generates documentation for every table a source plugin supports. With the `--filter spec` flag, it narrows that down to only the tables actually referenced in your configuration file, respecting your `skip_tables` rules and the specific plugin version you're running.

Here's the full workflow:

**Step 1:** Run [`cloudquery tables`](https://www.cloudquery.io/docs/cli-reference/cloudquery_tables) against your configuration file, filtered to your spec:

```bash
cloudquery tables config.yml --filter spec --format json
```

This downloads your plugin version (if not already cached) and writes JSON documentation to `./cq-docs/`. For an AWS source, you'll get a file at `./cq-docs/aws/__tables.json`.

**Step 2:** Extract just the table names from that JSON:

```bash
cat cq-docs/aws/__tables.json | jq -r '[.. | objects | select(has("name") and has("relations")) | .name] | sort'
```

The `jq` query traverses the nested JSON structure and pulls out every object that has both a `name` and `relations` field. That's how parent tables are structured in the output. The result is a sorted list of table names, one per line. If the JSON schema changes in a future CLI version, inspect the raw output with `cat cq-docs/aws/__tables.json | jq '.' | head -50` and adjust the query accordingly.

**Step 3:** Run both commands together:

```bash
cloudquery tables config.yml --filter spec --format json && \
  cat cq-docs/aws/__tables.json | \
  jq -r '[.. | objects | select(has("name") and has("relations")) | .name] | sort'
```

The output looks like this (abbreviated):

```
aws_ec2_instances
aws_ec2_security_groups
aws_ec2_vpcs
aws_iam_roles
aws_rds_instances
aws_s3_buckets
...
```

**Step 4:** Replace `tables: ["*"]` in your configuration file with this explicit list. If you're using YAML:

```yaml
tables:
  - aws_ec2_instances
  - aws_ec2_security_groups
  - aws_ec2_vpcs
  - aws_iam_roles
  - aws_rds_instances
  - aws_s3_buckets
```

One thing worth noting: `--filter spec` respects whatever `skip_tables` you already have in your configuration. Tables you've excluded won't reappear in the output, so you're not undoing your existing skip rules.

> **Note:** By default, `skip_dependent_tables` is set to `true` in source configurations. This means child tables are only included if their parent table is explicitly listed. When you switch from `["*"]` to an explicit list, verify that any child tables you need are either listed explicitly or that you've set `skip_dependent_tables: false`.

## How Do I Find Which Tables Are Slowing Down My Sync?

If you're trying to diagnose a slow sync, the [`--tables-metrics-location` flag](https://www.cloudquery.io/docs/cli-reference/cloudquery_sync) on `cloudquery sync` writes per-table timing data to a file you can monitor in real time:

```bash
cloudquery sync config.yml --tables-metrics-location ./metrics.json
```

> **Note:** `--tables-metrics-location` is currently in Preview and requires plugins released on or after July 10, 2024. Check that your source plugins are up to date before using this flag.

The output includes duration, row count, and error count per table. Sort by duration to find your bottlenecks:

```bash
cat metrics.json | jq 'sort_by(.duration_ms) | reverse | .[0:10]'
```

Tables at the top of that list are your candidates for either explicit exclusion (if you don't need them) or skip rules. The [AWS plugin documentation](https://www.cloudquery.io/hub/plugins/source/cloudquery/aws/latest/docs) has a dedicated "Skip Tables" section with a recommended list of commonly skipped tables and the rationale for each.

## What If I Still Need Broad Table Coverage?

If you genuinely need most tables but want to avoid syncing the ones that are slow or irrelevant, targeted wildcards are the middle ground. Instead of `["*"]`, use service-scoped patterns:

```yaml
tables:
  - aws_ec2_*
  - aws_s3_*
  - aws_iam_*
  - aws_rds_*
skip_tables:
  - aws_ec2_instance_types
  - aws_rds_engine_versions
```

This approach still automatically picks up new EC2 or S3 tables in future plugin releases, but scopes the wildcard to services you actually use. Any new service added to the AWS plugin won't silently join your sync unless you've added its prefix.

## Can Incremental Syncs Help?

For some tables, yes. CloudQuery supports both full syncs and incremental syncs. Full syncs replace the synced data on each run, while incremental syncs append new data, meaning earlier data is still available and subsequent runs only fetch what's changed.

Not every table supports incremental syncs, but for the ones that do, it can cut sync time significantly on repeat runs. If you're syncing a table that rarely changes (like `aws_ec2_vpcs` or `aws_iam_roles`), incremental mode avoids re-fetching the same data every cycle. Check the [source configuration documentation](https://www.cloudquery.io/docs/cli/integrations/sources) for how to enable incremental syncs on supported tables.

The tradeoff: incremental syncs don't remove data that no longer exists at the source, so stale records can accumulate. Full syncs give you a clean snapshot every time. For most teams, a mix of both works well: incremental for stable, high-volume tables and full for everything else.

## Does This Apply to GCP, Azure, and Other Plugins?

Everything in this post applies to any CloudQuery source plugin, not only AWS. The `cloudquery tables --filter spec` command, the wildcard patterns, `skip_tables`, and `--tables-metrics-location` all work the same way regardless of the plugin.

For GCP, the output file would be at `./cq-docs/gcp/__tables.json`. For Azure, `./cq-docs/azure/__tables.json`. The `jq` query is identical. Each plugin has its own set of tables that vary in sync cost, so the same principle holds: know what you're syncing and skip what you don't need.

- [GCP plugin on CloudQuery Hub](https://www.cloudquery.io/hub/plugins/source/cloudquery/gcp/latest/docs)
- [Azure plugin on CloudQuery Hub](https://www.cloudquery.io/hub/plugins/source/cloudquery/azure/latest/docs)

## How Do I Audit What I'm Syncing?

Whether you're setting up a new sync or reviewing an existing one, diffing your table list over time is a good habit. Save the output of `cloudquery tables --filter spec` as a snapshot, then compare it whenever your configuration or plugin version changes:

```bash
# Save your current table list
cloudquery tables config.yml --filter spec --format json
cat cq-docs/aws/__tables.json | jq -r '[.. | objects | select(has("name") and has("relations")) | .name] | sort' > tables-snapshot.txt
```

If you're about to change your plugin version, run the same command afterward and diff the two files to see exactly what was added or removed. The [AWS plugin changelog](https://www.cloudquery.io/hub/plugins/source/cloudquery/aws/latest/versions) explains what each new table covers.

For teams running on the CloudQuery Platform, per-table sync duration is visible directly in the UI. You can see exactly which tables are taking longest without needing the metrics file approach.

## What to Do Right Now

If you're on a wildcard configuration and haven't had a performance problem yet, run the table generation command against your current plugin version and save the output. That explicit list is your baseline. It shows you exactly what `["*"]` is doing today, and replacing it gives you control over what you sync - especially before your next plugin upgrade.

If you're already seeing slow syncs (particularly after a plugin upgrade), start with `--tables-metrics-location` to identify the specific tables causing problems, then decide whether to skip them or whether you actually need them. Most of the time it's the former.

If you're running large cloud environments and want help working through sync architecture (table selection, scheduling strategy, or multi-instance distribution), we're happy to walk through it. [Schedule a demo with our team](https://www.cloudquery.io/contact-us) and we can look at your specific setup.

**Resources:**

- [CloudQuery performance benchmarks](https://www.cloudquery.io/blog/cloudquery-performance-benchmark-analysis-581gb-throughput-reality-cloud-api-constraints) (healthy sync throughput reference)
- [Performance tuning documentation](https://www.cloudquery.io/docs/cli/advanced/performance-tuning)
- [AWS plugin documentation](https://www.cloudquery.io/hub/plugins/source/cloudquery/aws/latest/docs) (includes skip tables list)
- [`cloudquery tables` CLI reference](https://www.cloudquery.io/docs/cli-reference/cloudquery_tables)
- [`cloudquery sync` CLI reference](https://www.cloudquery.io/docs/cli-reference/cloudquery_sync)
- [Source configuration reference](https://www.cloudquery.io/docs/cli/integrations/sources)
- [AWS EC2 API throttling documentation](https://docs.aws.amazon.com/AWSEC2/latest/APIReference/throttling.html)

## Frequently Asked Questions

**How long should a typical AWS sync take?**

It depends on how many tables you're syncing and how many accounts you're covering. For 50-100 tables across a handful of accounts, less than 10 minutes is typical. Syncing 500 tables across dozens of accounts is usually under an hour. If your syncs are taking significantly longer than that, you're likely syncing expensive tables you don't need - check the per-table metrics to identify the bottlenecks.

**What's the difference between `skip_tables` and removing a table from the list?**

If you're using an explicit table list, there's no difference. `skip_tables` is useful when you're using wildcards. It lets you write `tables: ["aws_ec2_*"]` to get all EC2 tables while excluding specific expensive ones like `aws_ec2_instance_types`. Without wildcards, you'd just leave the table off your list.

**How does CloudQuery handle API throttling from cloud providers?**

CloudQuery includes built-in retry logic and respects provider-specific rate limits. Each plugin knows its provider's throttling patterns and backs off accordingly. You can also adjust plugin-level concurrency settings to be more or less aggressive, but exceeding the provider's rate limit will always result in throttled requests regardless of configuration. The [performance tuning documentation](https://www.cloudquery.io/docs/cli/advanced/performance-tuning) covers these settings in detail.

**Should I use full syncs or incremental syncs?**

Full syncs give you a clean snapshot every run but re-fetch everything. Incremental syncs are faster on repeat runs because they only pull new data, but stale records can accumulate since deletions at the source aren't reflected. Most teams use a mix: incremental for stable, high-volume tables and full for everything else.

**How do I know which tables my `["*"]` configuration is actually syncing?**

Run `cloudquery tables config.yml --filter spec --format json` and extract the table names from the output JSON. The tutorial section above walks through the exact commands. This gives you the full list of what the wildcard resolves to for your specific plugin version and `skip_tables` rules.

**Can I split a sync across multiple CloudQuery instances?**

Yes. Splitting your table list across two or more instances effectively doubles (or more) your throughput, since each instance operates within its own API rate limit allocation. This is especially useful for large enterprise environments where total sync time is a constraint. Divide your tables between instances and run them in parallel.

**What's the fastest way to see per-table performance in the CloudQuery Platform?**

Open a sync run in the Platform UI and you'll see per-table duration, row count, and status without needing any CLI flags or metrics files. This is the quickest way to spot which tables are contributing the most to your total sync time.

**Why did my sync slow down after upgrading my plugin?**

Plugin upgrades can add new tables for newly supported services or resource types. If you're using `tables: ["*"]`, those new tables are silently included in your next sync. Some of them - particularly nested tables that make an API call per resource - can be extremely expensive. The fix is switching to an explicit table list using `cloudquery tables --filter spec`, which pins your sync to exactly the tables you need. See the [dedicated section above](#why-did-my-sync-slow-down-after-a-plugin-upgrade) for the full walkthrough.

**Does the `cloudquery tables --filter spec` command work with all plugins?**

Yes. It works with any CloudQuery source plugin (AWS, GCP, Azure, and all others). The output directory and file name will match the plugin name (`./cq-docs/gcp/__tables.json` for GCP, `./cq-docs/azure/__tables.json` for Azure), but the command and `jq` query are identical across plugins.
