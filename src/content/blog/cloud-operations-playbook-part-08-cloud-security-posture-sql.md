---
title: 'Writing Cloud Security Posture Checks in SQL'
date: 2026-02-26
slug: 'cloud-operations-playbook-part-08-cloud-security-posture-sql'
description: >-
  Write cloud security checks in SQL instead of proprietary policy languages. See practical queries for public buckets, MFA, encryption, and more.
categories: ['Work']
tags: ['Cloud Operations', 'Security']
heroImage: '/images/blog/cloud-operations-playbook-part-08-cloud-security-posture-sql/thumbnail.png'
heroAlt: 'Cloud Security Posture Management with SQL'
canonicalUrl: 'https://www.cloudquery.io/blog/cloud-operations-playbook-part-08-cloud-security-posture-sql'
contentNotice: 'This post was originally published on CloudQuery blog.'
---

![Cloud Security Posture Management with SQL](/images/blog/cloud-operations-playbook-part-08-cloud-security-posture-sql/header.png)

> **Note:** Traditional CSPM tools force you to learn proprietary policy languages like Rego or vendor-specific DSLs. But if your cloud asset data lives in a database, you can write security checks in SQL instead. Your security team writes checks that engineering can actually read. Your checks live in version control next to your infrastructure code. And the same query that finds a misconfiguration can serve as compliance evidence, investigation tool, and automated policy check all at once.
> This post is adapted from the free [Cloud Operations Playbook](https://www.cloudquery.io/resources/cloud-operations-playbook), which includes the complete SQL security check library for all major cloud providers.

## The Problem with Proprietary Policy Languages

Here's something that bothers us about the CSPM market: [96% of organizations report concern about their cloud security posture](https://www.fortinet.com/resources/reports/cloud-security), and the industry response has been to create dozens of tools that each speak their own language.

One vendor wants you to write Rego. Another uses Sentinel. A third has built an entirely custom DSL that only works inside their platform. Your security engineers learn the syntax, write a few hundred rules, and then discover they need something the language doesn't support. Or worse, they leave the company and take all the institutional knowledge with them because nobody else can read the policies.

Meanwhile, [misconfigurations remain the leading cause of cloud security incidents](https://www.fortinet.com/resources/reports/cloud-security). Not sophisticated attacks. Not zero-days. Just resources configured wrong, and security checks that didn't catch them in time.

The CSPM market hit $1.64 billion in 2023 and is growing at 45% year over year. Organizations keep buying more tools. The misconfiguration rate stays flat. Something about this approach isn't working.

## What If Security Checks Were Just SQL?

Think about what a security check actually is. It's a question: "Do any S3 buckets allow public access?" That's it. A question about the current state of your infrastructure.

If your [cloud asset inventory](https://www.cloudquery.io/product/cloud-asset-inventory) lives in a database, that question becomes a SQL query. Not a policy written in a language your engineering team can't read. Not a rule locked inside a vendor platform you can't export from. Just a query.

This changes the dynamics completely. Your security team writes a check, and your platform engineers can review it in the same PR where they review Terraform changes. Your compliance team needs evidence for an auditor, and the query result IS the evidence. You're investigating an incident at 2 a.m., and you use the same query language you use for everything else.

No new language. No new tool to learn. No vendor lock-in on your security policies.

## Five SQL Queries That Replace Entire CSPM Modules

Let's get concrete. Here are five [security policy](https://www.cloudquery.io/product/policies) checks written as SQL queries against a cloud asset inventory.

### 1. Find Public S3 Buckets

This is the check every CSPM tool runs first. S3 bucket misconfigurations are behind some of the most high-profile cloud data breaches. In it's straightforward:

```sql
SELECT account_id, region, name, arn
FROM aws_s3_buckets
WHERE block_public_acls IS NOT TRUE
   OR block_public_policy IS NOT TRUE
   OR ignore_public_acls IS NOT TRUE
   OR restrict_public_buckets IS NOT TRUE;
```

Four conditions. If any of the four public access block settings isn't enabled, the bucket shows up. You can read this query and immediately understand what it checks. Try saying the same about a Rego policy that does the same thing.

### 2. Find Unencrypted EBS Volumes

Encryption at rest is a baseline requirement for most compliance frameworks. Finding unencrypted volumes shouldn't require a specialized tool:

```sql
SELECT account_id, region, volume_id, state, size
FROM aws_ec2_ebs_volumes
WHERE encrypted IS NOT TRUE;
```

Two lines of WHERE clause. The query returns the account, region, volume ID, current state, and size so you can prioritize which volumes to address first. Large, active volumes in production accounts get fixed before small, stopped volumes in dev.

### 3. Find IAM Users Without MFA

MFA for console users is non-negotiable in any security framework. But finding the gaps usually means clicking through the IAM console account by account:

```sql
SELECT account_id, user_name, arn, password_last_used
FROM aws_iam_users
WHERE mfa_active IS NOT TRUE
  AND password_enabled IS TRUE;
```

This query specifically filters for users who have console passwords but no MFA. It skips service accounts that only use API keys, which is the kind of nuance that pre-built CSPM rules sometimes miss. The `password_last_used` column helps you prioritize: a user who logged in yesterday is more urgent than one who hasn't logged in for six months.

### 4. Find Security Groups Allowing SSH from Anywhere

Open SSH to the world is one of the most common findings in any cloud security assessment. The SQL version handles the join between security groups and their permission rules:

```sql
SELECT sg.account_id, sg.group_id, sg.group_name, p.cidr_ip
FROM aws_ec2_security_groups sg
JOIN aws_ec2_security_group_ip_permissions p
  ON sg._cq_id = p._cq_parent_id
WHERE p.ip_protocol = 'tcp'
  AND p.from_port <= 22
  AND p.to_port >= 22
  AND p.cidr_ip = '0.0.0.0/0';
```

The port range check (`from_port <= 22 AND to_port >= 22`) catches both rules that specifically open port 22 and overly broad rules that open a range including port 22. That's a subtlety many quick-and-dirty scripts miss.

### 5. Cross-Cloud Security Posture in a Single Query

This is where SQL-based CSPM really pulls ahead. Traditional tools run separate rule sets per cloud provider. With SQL against a unified [cloud asset inventory](https://www.cloudquery.io/product/cloud-asset-inventory), you can check posture across providers in a single query:

```sql
-- AWS public buckets
SELECT 'AWS' as provider, name as resource, region
FROM aws_s3_buckets WHERE block_public_acls IS NOT TRUE
UNION ALL
-- GCP public buckets
SELECT 'GCP' as provider, name as resource, location as region
FROM gcp_storage_buckets WHERE iam_policy::text LIKE '%allUsers%';
```

One query. Two providers. Same result set. Try doing that with a vendor-specific CSPM tool and you'll be switching between two different consoles, exporting two different CSVs, and manually combining results in a spreadsheet.

> **Note:** These five queries are a starting point, not the full picture. The [Cloud Operations Playbook eBook](https://www.cloudquery.io/resources/cloud-operations-playbook) includes the complete SQL security check library with queries for all major cloud providers, plus a framework for building custom checks tailored to your specific environment and compliance requirements.

## Why SQL Beats Proprietary Policy Languages

We've talked to dozens of teams who've made this switch. The benefits go beyond just "SQL is easier to write."

|                     | Traditional CSPM           | SQL-Based CSPM              |
| ------------------- | -------------------------- | --------------------------- |
| Policy language     | Rego, Sentinel, vendor DSL | SQL                         |
| Custom checks       | Limited or complex         | Write a query               |
| Cross-cloud         | Per-provider rules         | Single query, all providers |
| Investigation       | Separate workflow          | Same query language         |
| Compliance evidence | Export from vendor         | Query results ARE evidence  |
| Learning curve      | New language per tool      | SQL (already known)         |

The version control angle matters more than people expect. When your security policies are SQL files in a Git repository, you get pull request reviews, blame history, change tracking, and the ability to tie policy changes to specific incidents or compliance requirements. That audit trail is worth more than any vendor dashboard.

Custom checks are where the real time savings appear. Every organization has environment-specific security requirements that don't map to pre-built rules. With writing a custom check for your tagging requirements or naming conventions takes five minutes. With a proprietary language, it might take days of learning the rule syntax, or it might not be possible at all. The [Cloud Operations Playbook eBook](https://www.cloudquery.io/resources/cloud-operations-playbook) includes multi-cloud variants of every query shown above plus dozens more, covering Azure, GCP, and cross-provider checks you can adapt to your environment.

## From Ad Hoc Queries to Automated Checks

Writing a SQL query is step one. The real power comes when you [automate](https://www.cloudquery.io/product/automation) those queries to run continuously.

The progression looks like this:

**Week 1: Manual investigation.** Your security team writes queries to answer specific questions. "Are there public buckets?" becomes a query they run when someone asks.

**Week 2: Scheduled scans.** Those ad hoc queries get saved and scheduled. Run the full set every night. Pipe results to Slack or PagerDuty based on severity.

**Week 4: Policy-as-code.** Queries move into version control. Changes go through PR review. Each query gets metadata: severity, compliance mapping, remediation instructions, and an owner.

**Month 2: Continuous posture management.** Queries run against fresh inventory data synced multiple times per day. New violations trigger alerts within hours, not weeks. You've built a custom [CSPM solution](https://www.cloudquery.io/solutions/cspm) that exactly matches your environment.

This progression from ad hoc to automated is natural because there's no language gap between the investigation query and the production policy. The same SQL query you wrote at 2 a.m. during an incident becomes the automated check that prevents the next one.

## Building Your First SQL-Based Security Check Suite

If you're starting from scratch, here's a practical sequence:

**Start with the high-impact basics.** Public storage buckets, unencrypted volumes, MFA gaps, and overly permissive security groups. These five queries alone cover findings that represent the majority of cloud security audit failures.

**Add your environment-specific checks.** What tags does your organization require? What naming conventions indicate production vs. development? What resource types should never exist outside specific regions? These are the checks no vendor can pre-build for you.

**Map queries to compliance frameworks.** Tag each query with the compliance controls it supports: SOC 2 CC6.1, CIS Benchmark 2.1.1, your internal security standards. This turns your query library into a [compliance automation](https://www.cloudquery.io/product/policies) engine.

**Set severity and routing.** Not every finding needs a page. Public S3 buckets in production accounts get immediate alerts. Missing tags in dev accounts get a weekly summary. Match the response to the risk.

You don't need to build this from scratch. CloudQuery's [policy packs](https://www.cloudquery.io/product/policies) include hundreds of pre-written SQL checks mapped to common compliance frameworks. But the point is that you CAN build it from scratch, modify any check, or write entirely new ones in a language your team already speaks.

## The Multi-Cloud Security Advantage

Most organizations we talk to run workloads across at least two cloud providers. Traditional CSPM tools handle this by running separate scanning engines per provider, each with their own rule format and their own results dashboard.

SQL against a unified asset inventory eliminates that fragmentation. Your security team writes one query that spans AWS, GCP, and Azure. The [cloud asset inventory](https://www.cloudquery.io/product/cloud-asset-inventory) handles the normalization. The query results show up in a single result set with a provider column so you can see the full picture.

This matters for [platform engineering](https://www.cloudquery.io/solutions/platform-engineering) teams too. When a developer asks "is my service secure?", the answer shouldn't depend on which cloud provider they deployed to. A unified query layer means consistent security checks regardless of where the infrastructure runs.

## Getting Started

The fastest path to SQL-based CSPM is:

1. **Get your cloud inventory into a database.** CloudQuery's [quickstart guide](https://www.cloudquery.io/docs/cli/getting-started) gets you syncing AWS, GCP, or Azure resources in under 15 minutes.
2. **Run the five queries from this post.** See what comes back. The results usually surprise people.
3. **Write one custom check specific to your environment.** Pick your most common audit finding and express it as SQL.
4. **Schedule your checks.** Move from ad hoc to automated.

If you're already running a CSPM tool, you don't have to rip it out. Start by running SQL checks alongside it. Compare what each approach catches. Most teams find the SQL approach catches things their existing tool misses, simply because custom checks are so much easier to write.

Browse our full list of [integrations](https://www.cloudquery.io/hub/plugins/source) to see which cloud providers and services you can query today. And if you want to talk through how SQL-based CSPM fits into your existing security stack, [reach out to the CloudQuery team](https://www.cloudquery.io/contact-us).

## Key Takeaways

- **SQL is the most widely known query language on earth.** Using it for security checks eliminates the learning curve that comes with proprietary policy languages
- **The same query serves multiple purposes.** Investigation, compliance evidence, and automated policy check in one artifact
- **Cross-cloud posture checks become trivial.** A single SQL query can span AWS, GCP, and Azure
- **Version-controlled policies create an audit trail.** Pull request reviews for security policy changes are more valuable than any vendor dashboard
- **Start with five queries and expand from there.** Public buckets, encryption, MFA, security groups, and one custom check specific to your environment

The next post takes the SQL approach further. [Part 9 covers Continuous Compliance with SQL](https://www.cloudquery.io/blog/cloud-operations-playbook-part-09-continuous-compliance-sql), showing how to map queries to specific compliance framework controls and generate audit-ready evidence automatically.

**About This Series:** This is Part 8 of our 12-part Cloud Operations Playbook series. Each post builds on the previous, covering the gap between what leadership thinks they know about cloud infrastructure and what's actually running.

- [**Part 1**: The Cloud Operations Gap](https://www.cloudquery.io/blog/cloud-operations-playbook-part-01-cloud-operations-gap)
- [**Part 2**: Cloud Operations Maturity Model](https://www.cloudquery.io/blog/cloud-operations-playbook-part-02-cloud-operations-maturity-model)
- [**Part 3**: The Hidden Security Tax](https://www.cloudquery.io/blog/cloud-operations-playbook-part-03-hidden-security-tax)
- [**Part 4**: The Real Cost of Compliance Scrambles](https://www.cloudquery.io/blog/cloud-operations-playbook-part-04-cost-of-compliance-scrambles)
- [**Part 5**: Cloud Waste Calculator](https://www.cloudquery.io/blog/cloud-operations-playbook-part-05-cloud-waste-calculator)
- [**Part 6**: The Visibility-First Governance Model](https://www.cloudquery.io/blog/cloud-operations-playbook-part-06-visibility-first-governance-model)
- [**Part 7**: Continuous Cloud Governance](https://www.cloudquery.io/blog/cloud-operations-playbook-part-07-continuous-cloud-governance)
- **Part 8** (This post): Cloud Security Posture Management with SQL
- [**Part 9**: Continuous Compliance with SQL](https://www.cloudquery.io/blog/cloud-operations-playbook-part-09-continuous-compliance-sql)
- [**Part 10**: Building an AI-Ready Cloud Data Layer](https://www.cloudquery.io/blog/cloud-operations-playbook-part-10-ai-ready-cloud-data-layer)
- [**Part 11**: The 90-Day Cloud Operations Roadmap](https://www.cloudquery.io/blog/cloud-operations-playbook-part-11-90-day-cloud-operations-roadmap)
- [**Part 12**: Cloud Operations Metrics That Matter](https://www.cloudquery.io/blog/cloud-operations-playbook-part-12-cloud-operations-metrics-scorecard)

Want the complete guide? [Download the free 67-page eBook](https://www.cloudquery.io/resources/cloud-operations-playbook).

## FAQ

### What Is SQL-Based CSPM?

SQL-based Cloud Security Posture Management means writing your security checks as SQL queries against a cloud asset inventory stored in a database. Instead of using proprietary rule languages like Rego or vendor-specific DSLs, you express security policies in standard SQL. Any engineer who can write a SELECT statement can read and contribute to security checks.

### How Does SQL-Based CSPM Compare to Traditional CSPM Tools?

Traditional CSPM tools use proprietary policy engines with their own languages and rule formats. SQL-based CSPM uses standard SQL against your cloud asset data. The main advantages are: no new language to learn, easy custom checks, cross-cloud queries in a single statement, version-controlled policies, and query results that double as compliance evidence.

### Do I Need to Replace My Existing CSPM Tool?

No. Many teams run SQL-based checks alongside their existing CSPM tool. Start by writing SQL equivalents of your most important checks and compare coverage. SQL-based CSPM is especially strong for custom checks specific to your environment and for cross-cloud posture queries. Over time, you may find the SQL approach covers enough to simplify your tooling.

### What Cloud Providers Can I Write SQL Security Checks For?

Any provider whose resources are synced into your [cloud asset inventory](https://www.cloudquery.io/product/cloud-asset-inventory). CloudQuery supports AWS, GCP, Azure, and dozens of other services. The SQL queries look the same regardless of provider, with table names prefixed by the provider (e.g., `aws_s3_buckets`, `gcp_storage_buckets`). Cross-cloud queries use `UNION ALL` to combine results.

### How Do I Automate SQL Security Checks?

Start by saving your queries and running them on a schedule. Pipe results to alerting systems like Slack or PagerDuty based on severity. Store queries in version control with metadata including severity, compliance mapping, and remediation instructions. CloudQuery's [automation capabilities](https://www.cloudquery.io/product/automation) let you run checks continuously against fresh inventory data.

### Can SQL-Based CSPM Help with Compliance Audits?

Yes. Each SQL query can be mapped to specific compliance controls (SOC 2, CIS Benchmarks, PCI DSS, etc.). The query results serve as direct compliance evidence without needing to export from a vendor platform. When an auditor asks "show me all unencrypted storage," you run the query and hand them the results. See [Part 9 on Continuous Compliance](https://www.cloudquery.io/blog/cloud-operations-playbook-part-09-continuous-compliance-sql) for a detailed walkthrough.

### What's the Biggest Advantage of SQL over Rego or Other Policy Languages?

Accessibility. SQL is already known by virtually every engineer, analyst, and many non-technical stakeholders. When your security team writes a check in the platform engineering team can review it without learning a new language. The security policy becomes a shared artifact that everyone can contribute to, rather than a black box maintained by specialists.

### How Many SQL Queries Do I Need to Get Started?

Five. Start with public storage buckets, unencrypted volumes, IAM users without MFA, overly permissive security groups, and one custom check specific to your organization. These cover the most common findings in cloud security audits. Expand from there based on your compliance requirements and incident history.

The free 67-page eBook includes the full SQL security check library for all major cloud providers, multi-cloud variants of every check, and a framework for building custom checks for your environment. [Download the Cloud Operations Playbook](https://www.cloudquery.io/resources/cloud-operations-playbook). Want help? [Talk to the CloudQuery team](https://www.cloudquery.io/contact-us).
