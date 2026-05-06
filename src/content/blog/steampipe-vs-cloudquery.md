---
title: 'Steampipe vs CloudQuery: Architecture and Trade-offs'
date: 2026-02-01
slug: 'steampipe-vs-cloudquery'
description: 'Steampipe queries cloud APIs live from the terminal. CloudQuery syncs cloud configuration into a persistent inventory. Here is when to use each.'
categories: ['Dev Tools']
tags: ['CloudQuery', 'Cloud Infrastructure', 'Open Source']
canonicalUrl: 'https://www.cloudquery.io/blog/steampipe-vs-cloudquery'
tldr: 'Steampipe queries cloud APIs in real time from the terminal. CloudQuery syncs cloud configuration into a persistent inventory with policy enforcement, automations, and team collaboration. Choose Steampipe for ad hoc investigations; choose CloudQuery when you need ongoing governance across teams.'
---

## What Is Steampipe?

Steampipe is an open-source CLI tool built by Turbot that lets you query cloud APIs and services using SQL. It bundles a PostgreSQL instance and uses Foreign Data Wrappers (FDWs) to translate SQL queries into live API calls, so you get results directly from the source without first loading data into a database.

The project reached v1.0 in October 2024 and is currently at v2.3.6 as of February 2026. It has roughly 7,700 stars on GitHub and supports 150+ plugins covering AWS, Azure, GCP, Kubernetes, GitHub, Microsoft 365, Salesforce, and dozens of other services, exposing over 2,000 queryable tables in total.

## How Steampipe Works

When you run a SQL query in Steampipe, the embedded PostgreSQL engine delegates each table scan to the relevant plugin, which calls the cloud API in real time. Results are not stored after the query finishes. This "zero-ETL" model means you always see the current state of your infrastructure, but you cannot look back at how things were configured yesterday without re-querying.

## The Turbot Pipes Ecosystem

Steampipe is one piece of a broader open-source ecosystem from Turbot:

- **Powerpipe** adds dashboards, benchmarks, and reports on top of Steampipe data. It includes pre-built compliance mods for CIS, NIST, PCI DSS, and other frameworks.
- **Flowpipe** provides workflow automation ("pipelines as code") so you can act on Steampipe findings - for example, sending a Slack alert when a public S3 bucket is detected.
- **Tailpipe** is a newer tool for SQL-based log analysis, built on DuckDB. It covers AWS CloudTrail, Azure activity logs, and other event sources.
- **Turbot Pipes** is the managed cloud service that hosts Steampipe, Powerpipe, and Flowpipe together, adding shared workspaces, scheduled queries, and enterprise features.

## What Is CloudQuery?

CloudQuery is a cloud asset inventory and governance platform. Unlike Steampipe's query-time API calls, CloudQuery syncs cloud configuration into a persistent data store on a schedule, giving you a point-in-time snapshot you can query, compare, and share.

CloudQuery connects to over 70 cloud and SaaS sources including AWS, Azure, GCP, Kubernetes, Wiz, Okta, PagerDuty, and Cloudflare. Data can be written to multiple destinations such as PostgreSQL, BigQuery, Snowflake, and S3.

## CloudQuery Platform

The CloudQuery Platform is the managed SaaS layer that goes beyond the CLI:

- **Cloud Asset Inventory:** A continuously synced, normalized view of resources across all connected accounts and providers.
- **Policies:** SQL-based detective controls that evaluate infrastructure against compliance frameworks (CIS, SOC 2, NIST, GDPR, DORA) and custom rules.
- **Automations:** Event-driven workflows that trigger on policy violations, configuration drift, or schedule.
- **AI Assistant:** A natural-language query interface that translates questions like "which EC2 instances are missing IMDSv2?" into SQL.
- **Enterprise features:** SSO, RBAC, audit logs, and tenant isolation.

## How CloudQuery Works

CloudQuery runs syncs - either on a schedule or on demand - that call cloud provider APIs and write the results to your chosen database. Because the data is persisted, you can:

- Run queries without hitting API rate limits
- Compare snapshots over time to detect drift
- Build dashboards and alerts on stable data
- Share results across security, platform, and finance teams

## Architecture Comparison

The core architectural difference is when data is fetched:

|                              | Steampipe                                    | CloudQuery                        |
| ---------------------------- | -------------------------------------------- | --------------------------------- |
| Data access                  | Query-time API calls via FDW                 | Pre-synced data in a database     |
| Freshness                    | Always live                                  | As recent as the last sync        |
| History                      | No built-in historical data                  | Snapshot comparisons over time    |
| Rate limits                  | Each query costs API calls                   | One sync; unlimited queries after |
| Query speed on large estates | Slower at scale                              | Faster (queries hit local data)   |
| Infrastructure               | Embedded PostgreSQL, no external DB required | Requires a destination database   |

## Plugin and Integration Ecosystem

Steampipe has a larger plugin count (150+ plugins, 2,000+ tables) and covers more SaaS and developer-tool APIs.

CloudQuery supports over 70 source integrations with a focus on cloud infrastructure, security tools, and FinOps data. Its destination plugin model means you can write synced data to any supported warehouse or lake, which Steampipe does not offer natively.

## Who Is Each Tool For?

**Steampipe fits well when you:**

- Need quick, ad hoc answers from live cloud APIs
- Prefer working in the terminal
- Want minimal infrastructure (no database to manage)
- Operate a small-to-medium cloud estate
- Already use Powerpipe mods for compliance benchmarks

**CloudQuery fits well when you:**

- Need a persistent, queryable inventory across multiple clouds
- Enforce governance policies with continuous evaluation and alerting
- Want historical data to track configuration drift over time
- Have multiple teams sharing cloud visibility
- Run a large estate where live API queries would be too slow or costly
- Need enterprise controls like SSO, RBAC, and audit logs

## Pricing

Steampipe is open-source under the AGPLv3 license. The CLI, plugins, Powerpipe, Flowpipe, and Tailpipe are all free to run locally. Turbot Pipes scales to Team ($10/user/month) and Enterprise tiers.

CloudQuery offers a free tier that includes the CLI and a limited number of synced resources. Paid plans scale based on the number of resources synced across your cloud accounts.

## Can You Use Both?

Yes. Some teams use Steampipe for fast, one-off investigations and CloudQuery for their production governance program. Steampipe answers "what does the infrastructure look like right now?" while CloudQuery answers "what changed, who is out of policy, and what should we do about it?"

## Side-by-Side Comparison

|                    | Steampipe                                   | CloudQuery                                   |
| ------------------ | ------------------------------------------- | -------------------------------------------- |
| Best for           | Ad hoc queries, quick investigations        | Ongoing governance, compliance programs      |
| Data model         | Live API queries, no persistence            | Synced snapshots, persistent storage         |
| Interface          | CLI (Turbot Pipes for SaaS)                 | Platform SaaS (CLI also available)           |
| Compliance         | Powerpipe mods (CIS, NIST, PCI)             | Built-in policies with automation            |
| Team collaboration | Turbot Pipes workspaces                     | Native RBAC, SSO, shared dashboards          |
| Ecosystem          | 150+ plugins, Powerpipe, Flowpipe, Tailpipe | 70+ sources, multiple destinations           |
| Pricing            | OSS free; Turbot Pipes has paid tiers       | Free tier available; Platform has paid tiers |
