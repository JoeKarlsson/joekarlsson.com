---
title: 'Beyond Deploy-Time Checks: Continuous Cloud Governance'
date: 2026-02-25
slug: 'cloud-operations-playbook-part-07-continuous-cloud-governance'
description: >-
  Deploy-time policy checks miss console changes, configuration drift, and external changes. Continuous governance catches what CI/CD pipelines cannot.
categories: ['Work']
tags: ['Cloud Operations', 'Governance']
heroImage: '/images/blog/cloud-operations-playbook-part-07-continuous-cloud-governance/thumbnail.png'
heroAlt: 'Continuous Cloud Governance - Part 7 of the Cloud Operations Playbook series'
canonicalUrl: 'https://www.cloudquery.io/blog/cloud-operations-playbook-part-07-continuous-cloud-governance'
contentNotice: 'This post was originally published on CloudQuery blog.'
---

![Blog header for Continuous Cloud Governance: Part 7 of the Cloud Operations Playbook series](/images/blog/cloud-operations-playbook-part-07-continuous-cloud-governance/header.png)

> **Note:** CI/CD policy checks only catch violations at deploy time. But infrastructure changes through console clicks, configuration drift, and cloud provider updates without ever touching a pipeline. Continuous governance runs the same SQL-based policies at deploy time, on a schedule, and historically so nothing slips through. If your governance only runs when code ships, you're blind to most of the changes that actually cause incidents.
> This post is adapted from the free [Cloud Operations Playbook](https://www.cloudquery.io/resources/cloud-operations-playbook), which includes 20+ production-ready governance queries and the policy lifecycle guide.

## The Governance Blind Spot Most Teams Don't Know They Have

If you've added policy checks to your CI/CD pipeline, you're ahead of most teams. But here's the problem: deploy-time checks only govern changes that flow through your pipeline. And a surprising amount of infrastructure change never touches CI/CD at all.

[misconfigurations are the leading cause of cloud security incidents](https://www.fortinet.com/resources/reports/cloud-security), not from sophisticated attacks. Most of those misconfigurations don't happen during a deployment. They happen between deployments, in ways that your pipeline never sees.

We've talked to dozens of teams who were confident in their governance posture because they had OPA or Sentinel wired into Terraform. Then they ran a full infrastructure scan and found hundreds of resources that had drifted from their intended state. Not because the policies were wrong. Because the policies only ran at one point in time.

## Three Ways Infrastructure Changes Without Your Pipeline

There are three categories of change that bypass CI/CD entirely. Each one creates a governance blind spot.

### Console Changes

It's 2 a.m.. Something is broken in production. An engineer logs into the AWS console, widens a security group to allow inbound traffic for debugging, fixes the issue, and goes back to sleep. The security group stays wide open. No PR was created. No pipeline ran. No policy was evaluated.

This happens constantly. Not because engineers are careless, but because the console exists for a reason. Incidents demand speed, and nobody is going to write a Terraform PR at 2 a.m. when production is down.

### Configuration Drift

An automation script updates a resource tag. A Lambda function modifies an S3 bucket policy. An AWS Config rule remediates a finding by changing a setting you didn't expect. Resource state changes without any human initiating a deployment.

Drift is particularly insidious because it's silent. Nobody gets a notification when a security group rule changes outside of Terraform. The resource just quietly moves from compliant to non-compliant, and stays that way until someone happens to check.

### External Changes

Cloud providers update default behaviors, deprecate features, and modify service configurations. AWS might change the default encryption setting for a service. A new region might not inherit the same guardrails. A managed service update could alter how your resources interact with the network.

Your infrastructure changes even when you don't touch it. And no amount of deploy-time policy checking will catch changes you didn't make.

## CI-Time vs. Continuous Governance

The difference between CI-time governance and continuous governance isn't about the policies themselves. It's about when and how often those policies run.

|                     | CI-Time Only               | Continuous Governance   |
| ------------------- | -------------------------- | ----------------------- |
| Console changes     | Invisible                  | Detected within hours   |
| Configuration drift | Invisible                  | Flagged automatically   |
| Compliance evidence | Point-in-time snapshot     | Continuous history      |
| Coverage            | Only IaC-managed resources | All resources           |
| Policy language     | Rego/Sentinel/proprietary  | SQL (everyone knows it) |

CI-time governance protects one pathway: the deployment pipeline. Continuous governance protects the entire infrastructure surface, regardless of how changes get there.

The [HashiCorp 2024 State of Cloud Strategy Survey](https://www.hashicorp.com/en/state-of-the-cloud) found that only 8% of organizations qualify as "highly cloud-mature." One of the clearest markers separating the 8% from everyone else is whether governance runs continuously or only at deploy time.

## The Three Layers of Continuous Governance

A complete governance model has three layers, and they all use the same policies against the same [data layer](https://www.cloudquery.io/product/cloud-asset-inventory).

**Deploy-time checks** integrate into your CI/CD pipeline. When a Terraform plan runs, policies evaluate the proposed changes before they reach production. This is table stakes. If a PR tries to create a public S3 bucket, it gets blocked before it merges. Most teams already have some version of this.

**Runtime checks** run on a schedule, evaluating your actual infrastructure state against the same [policies](https://www.cloudquery.io/product/policies). Every hour, every six hours, every day, pick your cadence. These are the checks that catch console changes, drift, and external modifications. When a security group gets widened at 2 a.m., the next scheduled evaluation flags it.

**Historical checks** query point-in-time snapshots of your infrastructure. When an auditor asks "were all EBS volumes encrypted on January 15th?" you can answer with data, not guesses. When you're investigating an incident, you can see exactly what changed and when.

The key insight: all three layers should use the same policy language and the same data. You shouldn't need to write the same check three different ways in three different tools.

## Writing Governance Policies in SQL

One of the biggest friction points with traditional governance tools is the policy language. Rego (Open Policy Agent) is powerful but has a steep learning curve. Sentinel is HashiCorp-specific. Every [CSPM](https://www.cloudquery.io/solutions/cspm) vendor has their own proprietary format.

SQL changes the equation. Every engineer on your team already knows it. And when policies are SQL queries against a normalized data layer, they work at deploy time, runtime, and historically without modification.

Here are real governance policies written as SQL queries.

**Find public S3 buckets:**

```sql
SELECT * FROM aws_s3_buckets
WHERE block_public_acls IS NOT TRUE
```

**Find unencrypted EBS volumes:**

```sql
SELECT * FROM aws_ec2_ebs_volumes
WHERE encrypted IS NOT TRUE
```

**Find IAM users without MFA enabled:**

```sql
SELECT * FROM aws_iam_users
WHERE mfa_active IS NOT TRUE
```

**Find security groups allowing SSH from anywhere:**

```sql
SELECT * FROM aws_ec2_security_groups sg
  JOIN aws_ec2_security_group_ip_permissions p
    ON sg._cq_id = p._cq_parent_id
WHERE p.ip_protocol = 'tcp'
  AND p.from_port <= 22
  AND p.to_port >= 22
  AND p.cidr_ip = '0.0.0.0/0'
```

These aren't hypothetical examples. They're production-ready queries that run against real infrastructure data. The same query that blocks a non-compliant Terraform change can run on a schedule to catch drift, and can run against historical data to produce [compliance evidence](https://www.cloudquery.io/product/policies).

> **Note:** These four queries are just the starting point. The [Cloud Operations Playbook eBook](https://www.cloudquery.io/resources/cloud-operations-playbook) includes the full library of 20+ governance SQL queries covering security, compliance, cost, and operational checks, plus the complete policy lifecycle implementation guide for putting them into production.

## The Policy Lifecycle

Governance policies aren't static. They follow a lifecycle that takes them from an idea to continuous enforcement:

1. **Write the policy as a SQL query** against a specific risk
2. **Test against your current state** to find existing violations
3. **Deploy to your CI/CD pipeline** to block new violations
4. **Schedule for continuous evaluation** to catch everything CI/CD misses
5. **Review violations and create exceptions** for intentional deviations
6. **Iterate based on findings** to improve processes, not just enforce rules

The critical mistake most teams make is stopping at step 3. Deploy-time checks are necessary but nowhere near sufficient. Steps 4 through 6 are where governance becomes continuous rather than point-in-time. The [Cloud Operations Playbook eBook](https://www.cloudquery.io/resources/cloud-operations-playbook) walks through each step in detail with specific examples for how to handle exceptions, set evaluation cadences, and build the feedback loop.

## What This Looks Like in Practice

Consider a typical [platform engineering](https://www.cloudquery.io/solutions/platform-engineering) team managing infrastructure across three AWS accounts. Before continuous governance, their process looked like this: run OPA checks in CI, hope nothing changes after deployment, scramble before audits to prove compliance.

After implementing continuous governance with a [unified data layer](https://www.cloudquery.io/docs/cli/getting-started):

Their CI pipeline blocks non-compliant Terraform changes using SQL-based policies. Every six hours, those same policies run against their actual infrastructure state. When an engineer modifies a security group through the console during an incident, the next evaluation catches it and creates a ticket. When their auditor asks for evidence of encryption compliance over the last quarter, they run a historical query and export the results in minutes.

The policies are the same. The data is the same. The difference is that governance runs continuously, not just at deploy time.

## Handling the Transition

If you're moving from CI-time-only governance to continuous governance, here's how to make it practical.

**Start with your highest-risk policies.** Public S3 buckets, open security groups, unencrypted storage, IAM users without MFA. These are the checks where drift creates the most risk. Get these running on a schedule first.

**Set reasonable evaluation cadences.** Not everything needs to run every hour. Critical security policies might run hourly. Compliance checks might run daily. Cost governance might run weekly. Match the cadence to the risk and rate of change.

**Build in exception handling from day one.** If your continuous checks generate hundreds of alerts with no way to document intentional exceptions, your team will start ignoring them within a week. A governance system without exception management is just a noise generator.

**Use the same policy language everywhere.** If your CI checks use Rego, your runtime checks use a CSPM vendor's proprietary format, and your compliance checks use manual spreadsheets, you've tripled your maintenance burden. SQL against a [normalized data layer](https://www.cloudquery.io/product/cloud-asset-inventory) gives you one language for all three layers.

## Automating Remediation

Once you have continuous governance running, the next step is [automated remediation](https://www.cloudquery.io/product/automation). Not every violation needs human intervention. Some are clear-cut enough to fix automatically.

An unencrypted EBS snapshot gets re-encrypted. An overly permissive security group rule gets tightened back to its intended state. A missing required tag gets populated from the resource's metadata.

Start with low-risk, high-confidence automations. The goal isn't to auto-remediate everything. It's to reduce the toil on your team so they can focus on the violations that actually require judgment.

## Key Takeaways

- **CI/CD policy checks are necessary but not sufficient.** They only cover one of the three ways infrastructure changes.
- **Console changes, configuration drift, and external changes bypass your pipeline entirely.** If governance only runs at deploy time, you're blind to most change.
- **Continuous governance uses the same policies at deploy time, runtime, and historically.** One policy language, one data layer, three enforcement points.
- **SQL-based policies lower the barrier to entry.** Every engineer already knows SQL. Nobody needs to learn Rego or a proprietary policy language.
- **Start with your highest-risk policies and expand from there.** Don't try to boil the ocean. Get public buckets and open security groups running on a schedule, then build out.

The next post in this series takes this further. [Part 8 covers Cloud Security Posture Management with SQL](https://www.cloudquery.io/blog/cloud-operations-playbook-part-08-cloud-security-posture-sql), showing how to build a complete CSPM practice using the same SQL-based approach we've covered here.

**About This Series:** This is Part 7 of our 12-part Cloud Operations Playbook series. Each post builds on the previous, covering the gap between what leadership thinks they know about cloud infrastructure and what's actually running.

- [**Part 1**: The Cloud Operations Gap](https://www.cloudquery.io/blog/cloud-operations-playbook-part-01-cloud-operations-gap)
- [**Part 2**: Cloud Operations Maturity Model](https://www.cloudquery.io/blog/cloud-operations-playbook-part-02-cloud-operations-maturity-model)
- [**Part 3**: The Hidden Security Tax](https://www.cloudquery.io/blog/cloud-operations-playbook-part-03-hidden-security-tax)
- [**Part 4**: The Real Cost of Compliance Scrambles](https://www.cloudquery.io/blog/cloud-operations-playbook-part-04-cost-of-compliance-scrambles)
- [**Part 5**: Cloud Waste Calculator](https://www.cloudquery.io/blog/cloud-operations-playbook-part-05-cloud-waste-calculator)
- [**Part 6**: The Visibility-First Governance Model](https://www.cloudquery.io/blog/cloud-operations-playbook-part-06-visibility-first-governance-model)
- **Part 7** (This post): Continuous Cloud Governance
- [**Part 8**: Cloud Security Posture Management with SQL](https://www.cloudquery.io/blog/cloud-operations-playbook-part-08-cloud-security-posture-sql)
- [**Part 9**: Continuous Compliance with SQL](https://www.cloudquery.io/blog/cloud-operations-playbook-part-09-continuous-compliance-sql)
- [**Part 10**: Building an AI-Ready Cloud Data Layer](https://www.cloudquery.io/blog/cloud-operations-playbook-part-10-ai-ready-cloud-data-layer)
- [**Part 11**: The 90-Day Cloud Operations Roadmap](https://www.cloudquery.io/blog/cloud-operations-playbook-part-11-90-day-cloud-operations-roadmap)
- [**Part 12**: Cloud Operations Metrics That Matter](https://www.cloudquery.io/blog/cloud-operations-playbook-part-12-cloud-operations-metrics-scorecard)

Want the complete guide? [Download the free 67-page eBook](https://www.cloudquery.io/resources/cloud-operations-playbook).

## FAQ

### Why Aren't CI/CD Policy Checks Enough for Governance?

CI/CD policy checks only evaluate changes that flow through your deployment pipeline. Infrastructure also changes through console modifications (especially during incidents), configuration drift from automation or manual changes, and external updates from cloud providers. If governance only runs at deploy time, it misses all three of these change vectors.

### What Is Continuous Cloud Governance?

Continuous cloud governance is a model where the same policies run at three points: deploy time (blocking non-compliant changes in CI/CD), runtime (scheduled evaluation of actual infrastructure state), and historically (point-in-time queries for compliance evidence and investigation). All three layers use the same SQL-based policies against the same data layer.

### How Often Should Continuous Governance Policies Run?

It depends on the risk level. Critical security policies like public S3 bucket detection or open security group checks should run every one to six hours. Compliance-oriented checks can run daily. Cost governance policies might run weekly. Match evaluation cadence to the risk and rate of change for each policy category.

### Why Use SQL Instead of Rego or Sentinel for Policies?

SQL has two advantages. First, every engineer already knows it. Rego and Sentinel have steep learning curves that create bottlenecks around the few people who know the language. Second, SQL queries work unchanged across all three governance layers (deploy time, runtime, and historical) when run against a normalized data layer. You write the policy once and use it everywhere.

### How Do I Handle False Positives in Continuous Governance?

Build exception handling into your governance system from the start. Some violations are intentional, like a public S3 bucket serving static website assets. Document these as exceptions with an owner, a reason, and an expiration date. Without exception management, teams quickly learn to ignore alerts, which defeats the purpose of continuous monitoring.

### What's the Difference Between Configuration Drift and a Console Change?

A console change is a deliberate human action, like an engineer logging into AWS and modifying a security group during an incident. Configuration drift is when resource state changes without direct human initiation, through automation scripts, managed service updates, or cloud provider behavior changes. Both bypass CI/CD, but drift is harder to detect because nobody consciously made the change.

### How Does Continuous Governance Help with Compliance Audits?

Traditional compliance requires manual evidence gathering before each audit, often taking weeks. Continuous governance generates compliance evidence automatically by running policies on a schedule and storing results historically. When an auditor asks "were all EBS volumes encrypted on a specific date?" you can query historical data and produce evidence in minutes instead of weeks.

### What Policies Should I Implement First?

Start with the policies that address the highest risk and are easiest to validate: public S3 buckets, unencrypted storage volumes, IAM users without MFA, and security groups with overly permissive rules. These are well-understood, low in false positives, and cover the misconfiguration categories that cause the majority of cloud security incidents.

The free 67-page eBook includes 20+ production-ready governance queries covering security, compliance, cost, and operational checks, plus cadence recommendations for each category. [Download the Cloud Operations Playbook](https://www.cloudquery.io/resources/cloud-operations-playbook). Want help setting up continuous governance? [Talk to the CloudQuery team](https://www.cloudquery.io/contact-us).
