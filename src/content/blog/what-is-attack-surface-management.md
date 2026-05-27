---
title: 'What Is Attack Surface Management? A Technical Guide for Cloud Teams'
date: 2026-04-06
slug: what-is-attack-surface-management
description: 'Attack surface management finds exposed cloud assets before attackers do. Learn how ASM differs from CSPM and vulnerability management, with SQL examples.'
categories: ['Work']
tags: ['Security', 'Cloud Infrastructure']
heroImage: /images/blog/what-is-attack-surface-management/thumbnail.png
heroAlt: 'What is Attack Surface Management header image'
canonicalUrl: https://www.cloudquery.io/blog/what-is-attack-surface-management
contentNotice: 'This post was originally published on CloudQuery blog.'
---

![Header Image: What is Attack Surface Management](/images/blog/what-is-attack-surface-management/header.png)

> **Note:** Attack surface management finds what attackers can reach, including resources your security team doesn't know exist. Unlike CSPM (which audits known configurations) or vulnerability management (which scans for CVEs), ASM starts from the attacker's perspective and asks what's reachable from outside. CloudQuery gives cloud teams a continuously updated attack surface inventory across AWS, GCP, and Azure, queryable in SQL.

In 2022, researchers at Tenable found that 62% of organizations have unknown or undiscovered assets on their attack surface. Not misconfigured - unknown. Resources that security teams didn't know existed, exposed to the internet, available for attackers to find.

This is the problem attack surface management (ASM) was built to solve: not just scanning what you know about, but finding everything that could be targeted.

**In this article:**

- [What Is Attack Surface Management?](#what-is-attack-surface-management)
- [What Is the Internal vs. External Attack Surface?](#what-is-the-internal-vs-external-attack-surface)
- [How Does ASM Compare to CSPM and Vulnerability Management?](#how-does-asm-compare-to-cspm-and-vulnerability-management)
- [How to Build a Cloud Attack Surface Inventory with CloudQuery](#how-to-build-a-cloud-attack-surface-inventory-with-cloudquery)
- [Which ASM Tools Are Worth Knowing in 2026?](#which-asm-tools-are-worth-knowing-in-2026)
- [FAQ](#faq)

## What Is Attack Surface Management?

**Attack surface management is the continuous discovery, inventory, and monitoring of all assets an attacker could target - including assets your team doesn't know exist.**

The critical distinction from other security practices: ASM takes an attacker's perspective. Rather than starting with a known inventory and scanning it for vulnerabilities, ASM starts with what's reachable from the outside and works inward. The question isn't "are our known systems secure?" - it's "what can an attacker find and reach?"

A cloud attack surface includes:

- EC2 instances and compute resources with public IPs
- S3 buckets, databases, and storage with public access enabled
- Load balancers, API gateways, and exposed service endpoints
- IAM roles with overly permissive policies
- SaaS applications connected to your cloud via OAuth
- Third-party integrations and partner API access
- Shadow IT - cloud resources provisioned outside of standard workflows

Modern cloud environments make this harder to track. Engineers spin up resources directly through the console, CI/CD pipelines create and destroy infrastructure continuously, and multi-cloud deployments mean the attack surface spans AWS, GCP, and Azure simultaneously. Shadow IT compounds the problem - teams regularly discover cloud resources they didn't know existed when they run their first serious ASM exercise.

## What Is the Internal vs. External Attack Surface?

**The external attack surface** consists of everything reachable from the public internet: endpoints with public IPs, exposed APIs, publicly accessible storage, and any asset that an unauthenticated attacker could reach without first needing to compromise something else. External ASM (EASM) focuses here - discovering what you're exposing to the world.

**The internal attack surface** consists of everything reachable after an attacker has gained an initial foothold: internal services, IAM roles that can be assumed, credentials stored in environment variables, lateral movement paths through VPC peering. Internal ASM looks at blast radius - if one system is compromised, where can an attacker go next?

Effective ASM covers both:

- **External**: What can attackers find without credentials?
- **Internal**: If they get in, what can they reach?

For cloud teams, the most impactful starting point is external: finding public-facing resources that shouldn't be public, particularly storage and compute with sensitive data.

## How Does ASM Compare to CSPM and Vulnerability Management?

These three practices are often confused but protect different things.

|                      | ASM                                  | CSPM                                             | Vulnerability Management           |
| -------------------- | ------------------------------------ | ------------------------------------------------ | ---------------------------------- |
| **Primary question** | What can an attacker find and reach? | Is my cloud configured securely?                 | Which systems have known CVEs?     |
| **Perspective**      | Outside-in (attacker view)           | Inside-out (compliance audit)                    | Inventory-based scan               |
| **Scope**            | All assets, including unknown        | Known cloud configurations                       | Known systems                      |
| **Continuous**       | Yes - real-time discovery            | Yes - continuous API scanning                    | Typically scheduled                |
| **Key output**       | Exposure map, reachability analysis  | Compliance findings, misconfiguration alerts     | CVE list, patch priorities         |
| **Blind spots**      | Exploitability of specific CVEs      | Whether exposed resources are actually reachable | Assets outside the known inventory |

The relationship: **CSPM tells you something is misconfigured. ASM tells you whether that misconfiguration is reachable from the internet.** A public S3 bucket shows up in both - but only ASM tells you what an attacker can actually get to.

Vulnerability management is complementary: it finds known CVEs in software running on your assets. ASM identifies which of those assets are internet-facing in the first place.

In practice, the three work together. CSPM catches misconfigurations. VM prioritizes patching. ASM maps what's exposed and tracks reachability - ensuring the most critical exposures get addressed first.

## How to Build a Cloud Attack Surface Inventory with CloudQuery

A cloud attack surface inventory is a queryable record of every exposed resource across your accounts. The CloudQuery Platform pulls configuration from [AWS, GCP, Azure, and 70+ other sources](https://www.cloudquery.io/hub/plugins/source) into a SQL database you own - no vendor API to query against, no export limits, just tables you can join however you need.

Here are practical queries that map your external exposure.

**Find all S3 buckets with public access enabled:**

```sql copy
SELECT
  account_id,
  name,
  region,
  creation_date
FROM aws_s3_buckets
WHERE
  block_public_acls      = false
  OR block_public_policy = false
  OR ignore_public_acls  = false
  OR restrict_public_buckets = false
ORDER BY account_id;
```

**Find EC2 instances with public IP addresses:**

```sql copy
SELECT
  account_id,
  region,
  instance_id,
  instance_type,
  public_ip_address,
  tags->>'Name'        AS name,
  tags->>'Environment' AS environment
FROM aws_ec2_instances
WHERE public_ip_address IS NOT NULL
ORDER BY account_id, region;
```

**Find RDS instances exposed to the public internet:**

```sql copy
SELECT
  account_id,
  region,
  db_instance_identifier,
  engine,
  engine_version,
  db_instance_class
FROM aws_rds_instances
WHERE publicly_accessible = true
ORDER BY account_id, region;
```

These queries form the foundation of a continuous attack surface inventory. Run them on a schedule via [CloudQuery Policies](https://www.cloudquery.io/docs/platform/features/policies) and you get notified when new exposure appears - a new instance with a public IP, a bucket that lost its public-access block, an RDS instance someone flipped to publicly accessible during a debugging session and never reverted. I've seen that last one more than once.

The advantage over point-in-time scans: CloudQuery syncs continuously, so your attack surface inventory reflects the current state of your infrastructure. When an engineer opens an S3 bucket at 2 p.m., you know by 2:05 p.m.

For teams that want to map reachability more deeply - which exposed instances are connected to which internal services via VPC peering, which IAM roles can be chained - CloudQuery's SQL layer lets you join across tables to trace paths through your environment.

**From finding to fix**

Running the queries and finding exposed resources is step one. Where teams stall is what happens next: who owns the exposed resource, how fast does it need to be remediated, and how do you verify it's actually resolved?

A practical path: triage by environment and exposure type (production databases with public access are more urgent than dev compute with public IPs), cross-reference with resource tags to route findings to the right team, and create tickets that stay open until the next CloudQuery sync confirms the exposure is closed. Human confirmation that "we fixed it" isn't sufficient - the data needs to show the change.

Resources that surface with no Owner tag are a separate problem your ASM process just uncovered. Fix the tagging policy and the exposure at the same time - a resource with no owner tends to get misconfigured again within weeks.

## Which ASM Tools Are Worth Knowing in 2026?

The ASM market has consolidated into two tiers: standalone EASM platforms and ASM capabilities bundled into broader CNAPP platforms.

**Palo Alto Networks Cortex Xpanse** is the most established standalone EASM platform, built from Palo Alto's acquisition of Expanse in 2021. Cortex Xpanse continuously maps internet-facing assets using internet-wide scanning, certificate transparency logs, and passive DNS - without requiring any installation inside your environment.

**CrowdStrike Falcon Surface** extends CrowdStrike's endpoint heritage into external attack surface visibility. Security teams already running CrowdStrike for endpoint detection find it a natural extension into ASM.

**Wiz** (now part of Google following its [$32 billion acquisition completed in March 2026](https://techcrunch.com/2026/03/11/google-completes-32b-acquisition-of-wiz/)) provides ASM as part of its broader CNAPP platform. Wiz's Security Graph correlates external exposure with misconfigurations and excessive permissions, showing not just what's exposed but what an attacker could do with that access.

**Microsoft Defender EASM** is the natural choice for Azure-heavy organizations, providing external surface discovery with deep integration into Microsoft Sentinel and Defender for Cloud.

**Tenable ASM** (formerly Bit Discovery) draws on Tenable's vulnerability database - covering [5+ billion internet-facing assets](https://www.tenable.com/products/attack-surface-management) - to combine external discovery with CVE context, showing not just what's exposed but what known vulnerabilities exist on those exposed assets.

**CloudQuery** fills a different role: not a dedicated ASM scanner, but the data layer that powers ASM-style visibility using your existing cloud provider APIs. If your primary question is "what cloud resources am I exposing?" rather than "what does the internet see about me?", CloudQuery provides that inventory in SQL with no additional agents or scanning infrastructure.

The right choice depends on scope:

- Internet-wide external scanning: Cortex Xpanse, Tenable ASM, or Defender EASM
- Integrated cloud security posture + exposure: Wiz or Cortex Cloud
- SQL-queryable cloud inventory for engineering teams: CloudQuery

[Schedule a demo](https://www.cloudquery.io/contact-us) to see how CloudQuery can help query your cloud attack surface. Or check out the [documentation](https://www.cloudquery.io/docs/platform/introduction).

## FAQ

### What does ASM stand for in security?

ASM stands for Attack Surface Management. It refers to the continuous process of discovering, inventorying, and monitoring all assets that an attacker could potentially target - including assets the organization isn't aware of.

### What's the difference between ASM and vulnerability management?

Vulnerability management scans known systems for known CVEs. Attack surface management discovers what systems exist (including unknown ones) and maps which are reachable from outside the organization. ASM answers "what can attackers find and reach?" VM answers "what vulnerabilities exist on systems we know about?" The two are complementary - ASM identifies the exposure, VM identifies the exploitability of specific CVEs on those exposed assets.

### Is ASM the same as CSPM?

No. [CSPM (Cloud Security Posture Management)](https://www.cloudquery.io/blog/what-is-a-cspm) focuses on whether cloud services are configured correctly against security policies - checking for misconfigurations like public S3 buckets, open security groups, or missing encryption. ASM focuses on what's reachable from the attacker's perspective. A CSPM finding tells you something is misconfigured; ASM tells you whether that misconfigured resource is internet-accessible. They answer different questions and most mature cloud security programs use both.

### What is EASM?

EASM stands for External Attack Surface Management - the subset of ASM focused specifically on what's visible from the public internet. EASM tools continuously scan the internet to find assets associated with your organization: IP ranges, domains, certificates, exposed services. EASM is particularly useful for discovering shadow IT and assets that security teams didn't know existed.

### How does CloudQuery help with attack surface management?

CloudQuery syncs cloud configuration data from AWS, GCP, Azure, and 70+ other sources into a SQL database you control. This gives you a continuously updated inventory of your cloud attack surface - exposed compute instances, public storage, IAM configurations - queryable with SQL. You can write policies that run on every sync and alert when new exposure appears, giving you near-real-time visibility into changes to your attack surface.

### What is shadow IT and why is it an ASM problem?

Shadow IT refers to cloud resources provisioned outside of standard workflows - an engineer who spins up an EC2 instance directly through the console, a team that creates an S3 bucket for a quick data transfer and never removes it, a development environment that never got cleaned up. These resources don't appear in your asset management system, don't get scanned by vulnerability tools, and don't follow your security baseline. For ASM, shadow IT is the hardest category to address because you can't secure what you can't find. Continuous cloud API scanning - the approach CloudQuery and similar tools use - catches shadow IT because it pulls from the authoritative source: the cloud provider's own record of what exists in your accounts.
