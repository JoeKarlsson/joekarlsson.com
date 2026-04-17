---
title: 'Mapping SOC 2 and CIS Controls to SQL for Continuous Compliance'
date: 2026-02-27
slug: 'cloud-operations-playbook-part-09-continuous-compliance-sql'
description: >-
  Map SOC 2 and CIS controls to SQL queries that run daily. Replace quarterly audit scrambles with continuous compliance evidence generation.
categories: ['DevRel', 'Databases']
tags: ['Cloud Operations', 'Governance']
heroImage: '/images/blog/cloud-operations-playbook-part-09-continuous-compliance-sql/thumbnail.png'
heroAlt: 'From Audit Panic to Continuous Compliance with SQL'
canonicalUrl: 'https://www.cloudquery.io/blog/cloud-operations-playbook-part-09-continuous-compliance-sql'
contentNotice: 'This post was originally published on CloudQuery blog.'
---

![From Audit Panic to Continuous Compliance with SQL](/images/blog/cloud-operations-playbook-part-09-continuous-compliance-sql/header.png)

> **Note:** Compliance frameworks like SOC 2 and CIS Benchmarks map directly to SQL queries against your cloud infrastructure data. Instead of scrambling before audits to prove compliance at one point in time, you can run those queries daily and generate evidence continuously. This post shows how to map specific compliance controls to build a continuous compliance loop, and shift from audit panic to always-on proof.
> This post is adapted from the free [Cloud Operations Playbook](https://www.cloudquery.io/resources/cloud-operations-playbook), which includes full control-to-SQL mapping tables for SOC 2, CIS, PCI-DSS, and HIPAA.

New to SOC 2? Start with [What Is SOC 2? A Technical Guide for Cloud Engineering Teams](https://www.cloudquery.io/blog/what-is-soc2-compliance) for a primer on Trust Service Criteria, Type I vs. Type II, and how cloud infrastructure controls map to audit requirements.

## Two Problems, One Solution

[Part 4 of this series](https://www.cloudquery.io/blog/cloud-operations-playbook-part-04-cost-of-compliance-scrambles) laid out why compliance scrambles cost teams weeks of engineering time every audit cycle. [Part 8](https://www.cloudquery.io/blog/cloud-operations-playbook-part-08-cloud-security-posture-sql) showed how SQL can replace proprietary CSPM policy languages for security checks. This post connects those two ideas: using SQL-based policies to make compliance continuous rather than periodic.

The connection is straightforward. If you can write a security check as a SQL query, you can map that query to a compliance control. If you can map it to a control, you can schedule it to run daily. If it runs daily, you have evidence that proves compliance every single day, not just the day the auditor shows up.

That shift, from point-in-time proof to continuous evidence, is what separates organizations that scramble from organizations that don't.

## Mapping Compliance Frameworks to SQL

Every compliance framework reduces to a set of controls. Each control is a specific requirement: "users must have MFA enabled," "data must be encrypted at rest," "network access must be restricted." These are questions about the state of your infrastructure. And questions about infrastructure state are exactly what SQL was built for.

Let's walk through two major frameworks and show how their controls translate directly into queries.

### SOC 2 Trust Services Criteria

SOC 2 is the framework that keeps most SaaS companies up at night. Its Trust Services Criteria define broad categories of controls, and each category maps to specific infrastructure checks.

**CC6.1 - Logical and Physical Access Controls**

This control requires that you manage who can access your systems and how. In AWS, that means IAM users, roles, MFA status, and access key hygiene. The SQL version:

```sql
SELECT account_id, user_name, arn, password_last_used,
       access_key_1_last_used_date, access_key_2_last_used_date
FROM aws_iam_users
WHERE mfa_active IS NOT TRUE
  AND password_enabled IS TRUE;
```

Run this daily. If the result set is empty, CC6.1's MFA requirement is met. If it's not empty, you know exactly which users need attention. The query result, timestamped and stored, IS your evidence.

**CC6.6 - System Boundaries**

This control is about restricting access at the network level. Security groups, network ACLs, VPC configurations. The query for overly permissive security groups:

```sql
SELECT sg.account_id, sg.group_id, sg.group_name,
       p.ip_protocol, p.from_port, p.to_port, p.cidr_ip
FROM aws_ec2_security_groups sg
JOIN aws_ec2_security_group_ip_permissions p
  ON sg._cq_id = p._cq_parent_id
WHERE p.cidr_ip = '0.0.0.0/0'
  AND p.ip_protocol != '-1';
```

Any security group allowing inbound access from anywhere shows up. Map this to CC6.6, schedule it, and you've got continuous evidence that your system boundaries are enforced.

**CC6.7 - Data Movement Restrictions**

This control covers how data moves in and out of your environment. S3 bucket policies, CloudTrail logging, and data transfer configurations:

```sql
SELECT account_id, name, arn, region
FROM aws_s3_buckets
WHERE logging_target_bucket IS NULL
   OR logging_target_bucket = '';
```

Buckets without access logging can't prove what data moved where. This query catches them.

**CC7.2 - System Monitoring**

SOC 2 requires that you actively monitor your environment for anomalies. That means CloudWatch alarms, GuardDuty, and CloudTrail trails need to be running:

```sql
SELECT account_id
FROM aws_accounts
WHERE account_id NOT IN (
  SELECT DISTINCT account_id
  FROM aws_cloudtrail_trails
  WHERE is_logging IS TRUE
);
```

Any account without an active CloudTrail trail fails CC7.2. Run this query hourly if you want, and you'll know within the hour if someone disables logging.

### CIS Benchmarks

CIS Benchmarks are more prescriptive than SOC 2. Each benchmark control has a specific check with a clear pass/fail criteria. That makes them even easier to express as SQL. We've shown the SOC 2 mappings in detail above. The same pattern applies to CIS, PCI-DSS, and HIPAA: read the control description, translate it to a SQL query, tag it, and schedule it. The eBook includes the full control-to-SQL mapping tables for all four frameworks, but here are a few CIS examples to show how prescriptive controls translate to even simpler queries.

**CIS AWS 1.4 - Root Account MFA**

The root account is the skeleton key to your AWS environment. MFA is non-negotiable:

```sql
SELECT account_id, user_name, arn
FROM aws_iam_users
WHERE user_name = 'root'
  AND mfa_active IS NOT TRUE;
```

One query. Pass or fail. If this returns rows, you have a critical finding.

**CIS AWS 2.1.1 - S3 Default Encryption**

Every S3 bucket should have server-side encryption configured:

```sql
SELECT account_id, name, arn, region
FROM aws_s3_buckets
WHERE server_side_encryption_configuration IS NULL;
```

Unencrypted buckets in 2026 are an automatic audit finding. This query finds them in seconds across every account.

**CIS AWS 3.1 - CloudTrail Enabled in All Regions**

Multi-region CloudTrail is the foundation of audit logging. Without it, you have blind spots:

```sql
SELECT account_id
FROM aws_accounts
WHERE account_id NOT IN (
  SELECT DISTINCT account_id
  FROM aws_cloudtrail_trails
  WHERE is_multi_region_trail IS TRUE
    AND is_logging IS TRUE
);
```

If this query returns any account IDs, those accounts are operating without proper audit trails. That's a CIS failure and a real security risk.

> **Note:** Want the full mapping tables? The eBook includes complete control-to-SQL mapping tables for SOC 2, CIS Benchmarks, PCI-DSS, and HIPAA, plus a ready-to-use continuous compliance dashboard template. [Download the free eBook](https://www.cloudquery.io/resources/cloud-operations-playbook).

## The Continuous Compliance Loop

Individual queries are useful. But the real value comes from running them as a system. Here's how we think about the continuous compliance loop:

**Step 1: Define controls as SQL queries.** Take your compliance framework, whether that's SOC 2, CIS, PCI-DSS, or HIPAA, and write a SQL query for each applicable control. Start with the ones that caused pain in your last audit.

**Step 2: Map queries to framework requirements.** Tag each query with the controls it satisfies. One query might cover multiple controls. The MFA check above applies to both SOC 2 CC6.1 and CIS 1.4.

**Step 3: Schedule queries against live data.** Run them daily at minimum. Hourly for critical controls. Run them against a [cloud asset inventory](https://www.cloudquery.io/product/cloud-asset-inventory) that syncs fresh data from your cloud providers multiple times per day.

**Step 4: Track compliance posture over time.** Don't just check pass/fail today. Store results historically. "We've been 98% compliant for the last 90 days" is a much stronger statement to an auditor than "we're compliant right now."

**Step 5: Generate evidence automatically.** Each scheduled query run produces timestamped results. Those results are your audit evidence. No manual collection, no CSV exports, no last-minute scrambles. The evidence is a byproduct of running the system.

**Step 6: Alert on regressions.** A control that was passing yesterday and fails today is a signal that something changed. Maybe someone modified a security group. Maybe encryption got disabled during a deployment. Catching regressions in hours rather than months is the difference between a quick fix and an audit finding.

## Evidence, Not Performance

Here's the fundamental shift: traditional compliance is a performance. You rehearse, you prepare your evidence, you present it to the auditor, and you hope you pass. Continuous compliance isn't a performance. It's a system that produces evidence as it runs.

Think about the difference:

| Traditional Compliance                | Continuous Compliance                     |
| ------------------------------------- | ----------------------------------------- |
| Compile evidence before audit         | Evidence generated every day              |
| Prove compliance at one point in time | Prove compliance every day                |
| Gaps between audits are invisible     | Gaps are detected and flagged immediately |
| Auditors see a snapshot               | Auditors see a trend line                 |
| Scramble when something fails         | Fix regressions as they happen            |

Auditors are increasingly expecting continuous evidence. They don't just want to see that you're compliant today. They want to see that you were compliant last Tuesday, and the Tuesday before that, and every day since their last visit. [96% of organizations report concern about their cloud security posture](https://www.fortinet.com/resources/reports/cloud-security), but concern without continuous evidence is just worry.

Regulations are pushing in this direction too. NIS2 in Europe demands ongoing security posture management. DORA requires financial services firms to demonstrate continuous operational resilience. [Gartner predicts that by 2026, 60% of organizations will prioritize preventing cloud misconfiguration](https://www.gartner.com/en/documents/4540599) as a primary security focus. The industry is moving toward always-on compliance. The only question is whether you get there proactively or reactively.

## What a Compliance Dashboard Looks Like

Once your queries run on a schedule, you can build a view of your compliance posture that updates itself. Imagine a dashboard that shows:

| Framework | Control | Description                       | Status  | Last Passing | Trend (30d) |
| --------- | ------- | --------------------------------- | ------- | ------------ | ----------- |
| SOC 2     | CC6.1   | All IAM users have MFA            | Passing | Today        | 100%        |
| SOC 2     | CC6.6   | No unrestricted security groups   | Failing | 3 days ago   | 97%         |
| SOC 2     | CC6.7   | S3 access logging enabled         | Passing | Today        | 100%        |
| SOC 2     | CC7.2   | CloudTrail active in all accounts | Passing | Today        | 100%        |
| CIS       | 1.4     | Root account MFA enabled          | Passing | Today        | 100%        |
| CIS       | 2.1.1   | S3 default encryption             | Passing | Today        | 98%         |
| CIS       | 3.1     | Multi-region CloudTrail           | Passing | Today        | 100%        |

That CC6.6 row is failing because someone opened a security group three days ago. You can see it, investigate it, and fix it before the next audit. Without this dashboard, you wouldn't discover the issue until audit prep began, weeks or months from now.

The 30-day trend column is what auditors love. It tells a story about your operational discipline. A control that's been at 100% for 90 days straight is far more convincing than a control that you can demonstrate is passing today.

## Building Your Compliance Query Library

If you're starting from scratch, here's a practical approach:

**Start with your last audit's findings.** Whatever the auditor flagged last time, write SQL queries for those controls first. Those are your highest-risk areas and the ones where you'll get the most immediate value.

**Map the critical controls for your primary framework.** SOC 2 has roughly 60 controls that apply to most SaaS companies. CIS AWS Benchmarks have about 50 checks at Level 1. You don't need all of them on day one. Start with the 15-20 that matter most for your environment.

**Tag and categorize.** Each query gets metadata: the framework it maps to, the specific control ID, a severity level, a remediation runbook link, and an owner. This metadata turns a collection of queries into a [compliance automation](https://www.cloudquery.io/product/policies) system.

**Store queries in version control.** SQL files in a Git repository, reviewed through pull requests. When your auditor asks "who approved this compliance check and when?", you point them to the Git history. That audit trail is more credible than any vendor dashboard.

CloudQuery's [policy packs](https://www.cloudquery.io/product/policies) include pre-built query libraries mapped to SOC 2, CIS, PCI-DSS, and other frameworks. You can use them as-is, customize them for your environment, or use them as reference for writing your own. The point is that they're SQL. You own them. You can read them. You can change them.

## From Quarterly Panic to Daily Confidence

The math on this is simple. If your team spends four weeks per audit cycle gathering evidence manually, and you audit twice a year, that's eight weeks of engineering time gone. For a ten-person team, that's roughly $300K per year in direct labor costs, plus the opportunity cost of everything those engineers didn't build.

With continuous compliance, audit prep shrinks to a day or two. You're not gathering evidence. The evidence already exists. You're reviewing it, confirming it's current, and packaging it for the auditor.

The real benefit isn't the time savings, though. It's the confidence. When your [CSPM checks](https://www.cloudquery.io/solutions/cspm) and compliance queries run daily as part of your [cloud operations](https://www.cloudquery.io/product/cloud-ops) practice, you know your posture every morning. You don't wonder whether something drifted since the last audit. You don't lose sleep before the auditor arrives. You hand them a dashboard and a stack of timestamped query results covering every day since their last visit.

That's the shift from compliance as a performance to compliance as a property of your system.

## Getting Started

Here's the fastest path from where you are to continuous compliance:

1. **Get your cloud data into a queryable format.** CloudQuery's [quickstart guide](https://www.cloudquery.io/docs/cli/getting-started) gets your cloud resources synced into a database in under 15 minutes.
2. **Pick five controls from your primary framework.** Write SQL queries for each one. Run them manually and review the results.
3. **Schedule those queries to run daily.** Store the results. Set up alerts for failures.
4. **Expand to full framework coverage over 30 days.** Add five more controls per week until your primary framework is covered.
5. **Build the historical record.** After 30 days of daily runs, you'll have a compliance trend line that tells a compelling story.

If you've already followed the [SQL-based CSPM approach from Part 8](https://www.cloudquery.io/blog/cloud-operations-playbook-part-08-cloud-security-posture-sql), you're halfway there. Those security queries already map to compliance controls. You just need to add the framework tags, the scheduling, and the historical tracking.

Want help mapping your specific compliance requirements to SQL? [Talk to the CloudQuery team](https://www.cloudquery.io/contact-us).

## Key Takeaways

- **Compliance controls are just questions about infrastructure state.** SQL is built for exactly those questions
- **One query can serve multiple frameworks.** An MFA check satisfies SOC 2 CC6.1 and CIS 1.4 simultaneously
- **Daily query runs produce continuous evidence.** Timestamped results replace manual evidence collection entirely
- **Historical trends matter more than point-in-time snapshots.** Auditors want to see 90 days of compliance, not a single passing check
- **Start with your last audit's pain points.** Write SQL for whatever caused the most scrambling last time and expand from there

The next post in this series looks ahead. [Part 10 covers Building an AI-Ready Cloud Data Layer](https://www.cloudquery.io/blog/cloud-operations-playbook-part-10-ai-ready-cloud-data-layer), showing how the same queryable infrastructure data that powers security and compliance becomes the foundation for AI-driven cloud operations.

**About This Series:** This is Part 9 of our 12-part Cloud Operations Playbook series. Each post builds on the previous, covering the gap between what leadership thinks they know about cloud infrastructure and what's actually running.

- [**Part 1**: The Cloud Operations Gap](https://www.cloudquery.io/blog/cloud-operations-playbook-part-01-cloud-operations-gap)
- [**Part 2**: Cloud Operations Maturity Model](https://www.cloudquery.io/blog/cloud-operations-playbook-part-02-cloud-operations-maturity-model)
- [**Part 3**: The Hidden Security Tax](https://www.cloudquery.io/blog/cloud-operations-playbook-part-03-hidden-security-tax)
- [**Part 4**: The Real Cost of Compliance Scrambles](https://www.cloudquery.io/blog/cloud-operations-playbook-part-04-cost-of-compliance-scrambles)
- [**Part 5**: Cloud Waste Calculator](https://www.cloudquery.io/blog/cloud-operations-playbook-part-05-cloud-waste-calculator)
- [**Part 6**: The Visibility-First Governance Model](https://www.cloudquery.io/blog/cloud-operations-playbook-part-06-visibility-first-governance-model)
- [**Part 7**: Continuous Cloud Governance](https://www.cloudquery.io/blog/cloud-operations-playbook-part-07-continuous-cloud-governance)
- [**Part 8**: Cloud Security Posture Management with SQL](https://www.cloudquery.io/blog/cloud-operations-playbook-part-08-cloud-security-posture-sql)
- **Part 9** (This post): Continuous Compliance with SQL
- [**Part 10**: Building an AI-Ready Cloud Data Layer](https://www.cloudquery.io/blog/cloud-operations-playbook-part-10-ai-ready-cloud-data-layer)
- [**Part 11**: The 90-Day Cloud Operations Roadmap](https://www.cloudquery.io/blog/cloud-operations-playbook-part-11-90-day-cloud-operations-roadmap)
- [**Part 12**: Cloud Operations Metrics That Matter](https://www.cloudquery.io/blog/cloud-operations-playbook-part-12-cloud-operations-metrics-scorecard)

Want the complete guide? [Download the free 67-page eBook](https://www.cloudquery.io/resources/cloud-operations-playbook).

## FAQ

### What Is Continuous Compliance?

Continuous compliance means your infrastructure is checked against regulatory and framework requirements on an ongoing basis, not just before audits. SQL queries mapped to specific controls run daily or hourly against live cloud data. The results serve as timestamped evidence that proves compliance every day, not just on audit day. It's the difference between a smoke detector that's always on and one you test once a year.

### How Do I Map Compliance Controls to SQL Queries?

Start with your compliance framework's control descriptions. Each control specifies a requirement like "all users must have MFA" or "data must be encrypted at rest." Translate that requirement into a SQL query against your [cloud asset inventory](https://www.cloudquery.io/product/cloud-asset-inventory). Tag the query with the framework name and control ID. One query can map to multiple controls across different frameworks.

### Which Compliance Frameworks Can I Cover with SQL?

Any framework whose controls relate to infrastructure configuration. SOC 2 Trust Services Criteria, CIS Benchmarks for AWS, GCP, and Azure, PCI-DSS, HIPAA technical safeguards, NIS2, and DORA all include controls that translate to queries about resource state. The more prescriptive the framework (like CIS Benchmarks), the more directly its controls map to SQL.

### How Often Should Compliance Queries Run?

Daily is a good baseline for most controls. Critical controls, like root account MFA or CloudTrail logging, can run hourly. The frequency depends on how quickly you need to detect regressions and how often your infrastructure data syncs. If your [cloud asset inventory](https://www.cloudquery.io/product/cloud-asset-inventory) syncs every six hours, running queries more frequently than that won't catch additional changes.

### What Do Auditors Think of SQL-Based Compliance Evidence?

Auditors care about evidence quality, not the tool that produced it. Timestamped query results that show daily compliance status are stronger evidence than manually compiled spreadsheets that prove compliance at a single point in time. The version-controlled query definitions also demonstrate that your checks are repeatable and reviewable, which auditors appreciate.

### How Long Does It Take to Build a Compliance Query Library?

Most teams can get meaningful coverage in 30 days. Start with five to ten queries covering your most critical controls in week one. Add five more per week. By week four, you'll have 20-25 queries covering the controls that matter most for your environment. Pre-built [policy packs](https://www.cloudquery.io/product/policies) can accelerate this significantly since you can adopt them as-is or customize them.

### Can I Use the Same Queries for Multiple Compliance Frameworks?

Yes. Many compliance controls overlap across frameworks. An MFA enforcement query satisfies SOC 2 CC6.1, CIS AWS 1.4, and PCI-DSS Requirement 8.3 simultaneously. Tag each query with every control it covers, and a single query library serves multiple audits. This reduces maintenance and ensures consistent checks across frameworks.

### How Does Continuous Compliance Reduce Audit Prep Time?

In traditional audit prep, teams spend weeks gathering evidence from scattered systems. With continuous compliance, evidence is generated daily as a byproduct of scheduled query runs. When audit time arrives, you review the existing evidence and package it for the auditor. Teams that make this shift typically reduce audit prep from weeks to one or two days.

The free 67-page eBook includes complete control-to-SQL mapping tables for SOC 2, CIS Benchmarks, PCI-DSS, and HIPAA, plus a continuous compliance dashboard template you can deploy directly. [Download the Cloud Operations Playbook](https://www.cloudquery.io/resources/cloud-operations-playbook). Have questions? [Talk to the CloudQuery team](https://www.cloudquery.io/contact-us).
