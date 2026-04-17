---
title: 'One Year Into DORA: What Actually Worked for ICT Asset Registers'
date: 2026-01-26
slug: dora-ict-asset-register
description: One year into DORA enforcement, 46% of institutions still struggle with asset registers. Learn what worked, common pitfalls, and how to prepare for stricter 2026 enforcement.
categories: ['DevRel', 'Databases']
tags: ['Security', 'Cloud Asset Inventory', 'Governance']
heroImage: /images/blog/dora-ict-asset-register/thumbnail.png
heroAlt: 'One Year Into DORA: What Actually Worked for ICT Asset Registers'
canonicalUrl: https://www.cloudquery.io/blog/dora-ict-asset-register
contentNotice: 'This post was originally published on CloudQuery blog.'
---

![One Year Into DORA: What Actually Worked for ICT Asset Registers](/images/blog/dora-ict-asset-register/header.png)

> **Note:** One year into DORA enforcement, the April 2025 Register of Information submission revealed a clear divide: organizations with automated, queryable asset inventories submitted in hours, while those relying on spreadsheets scrambled for weeks. With BaFin signaling stricter enforcement for 2026, the playbook is clear: treat cloud infrastructure as queryable data, not documentation to maintain.

January 17, 2025 came and went. Then came April, and the first real test.

Financial institutions across the EU rushed to submit their Register of Information on ICT third-party arrangements. The submission didn't go smoothly for everyone. Luxembourg's CSSF [extended its submission portal until May 31](https://www.deloitte.com/lu/en/our-thinking/future-of-advice/after-dora-register-of-information-submission-the-real-work-begins.html) because so many organizations needed to fix errors and resubmit. According to [Deloitte's Wave 3 survey](https://panorays.com/blog/dora-strategy-for-2026/), 46% of financial institutions cited the RoI as the most challenging part of DORA compliance.

One year in, a pattern has emerged. The organizations that sailed through the April submission weren't necessarily the ones with the biggest budgets or the largest compliance teams. [McKinsey found](https://www.mckinsey.com/capabilities/risk-and-resilience/our-insights/europes-new-resilience-regime-the-race-to-get-ready-for-dora) institutions spending 5-15 million euros on DORA programs, yet only 33% felt confident they could meet all requirements by the deadline. The difference between success and scramble wasn't resources. It was approach.

## What Did the First Year of DORA Enforcement Look Like

The gap between deadline and readiness was wider than most anticipated. [McKinsey's survey](https://www.mckinsey.com/capabilities/risk-and-resilience/our-insights/europes-new-resilience-regime-the-race-to-get-ready-for-dora) of major European financial institutions painted a sobering picture: only one-third expressed confidence they could fulfill all DORA regulatory expectations by the enforcement date. Half of surveyed institutions still treated digital resilience as an "IT problem" rather than an organization-wide concern. Meanwhile, [40% of companies](https://www.mckinsey.com/capabilities/risk-and-resilience/our-insights/europes-new-resilience-regime-the-race-to-get-ready-for-dora) dedicated more than seven full-time employees just to managing the DORA register.

The April 2025 RoI submission exposed these gaps publicly. Organizations struggled with data quality across multiple dimensions: accuracy, completeness, consistency, and integrity. The EBA published observations from testing, identifying common issues that forced many institutions to resubmit multiple times. The root cause in most cases wasn't a lack of effort. It was that asset data lived in spreadsheets, siloed systems, and tribal knowledge that couldn't be consolidated quickly enough.

> **Note:** Financial entities must identify, classify, and document all ICT assets, their configurations, and interdependencies. This includes assets on remote sites, network resources, and hardware equipment. Reviews must occur at least annually and after any major change. [EUR-Lex DORA Regulation](https://eur-lex.europa.eu/eli/reg/2022/2554/oj/eng)

The contract amendment burden added another layer of complexity. A mid-to-large financial services organization typically has 500+ ICT contracts. [Industry analysis from Ankura](https://ankura.com/insights/dora-in-2025-navigating-post-deadline-challenges-and-the-road-ahead) estimated 2,500-4,000+ hours minimum for DORA contract review and amendment alone. BaFin [acknowledged](https://www.deloittelegal.de/dl/en/services/legal/analysis/dora-contract-compliance-challenge.html) that not all contracts have been adapted yet, but expects completion in 2026.

Then July happened. POST Luxembourg suffered an ["exceptionally advanced" cyberattack](https://gouvernement.lu/en/gouvernement/delles-lex/actualites.gouvernement/2025/07-juillet/25-celulle-crise-post.html) on July 23, 2025, causing a nationwide telecommunications outage. 4G and 5G networks went down for more than three hours. Emergency services became inaccessible. The government convened a crisis unit on July 25. [EY Luxembourg called it](https://www.ey.com/en_lu/insights/wealth-asset-management/luxembourg-market-pulse/dora-one-year-later-from-regulatory-compliance-to-strategic-resilience) "exactly why DORA was introduced." The incident was a real-world reminder that ICT asset visibility isn't just a compliance checkbox. It's the foundation for actually responding when things go wrong.

## Why Did Some Organizations Succeed While Others Scrambled

[Skadden's analysis of the first six months](https://www.skadden.com/insights/publications/2025/07/the-last-piece-of-dora-falls-into-place) revealed that compliance maturity varied widely across the industry. Banks and large IT providers with existing robust frameworks fared better, while smaller fund managers started from less robust positions and required more wide-ranging changes. But across the board, certain patterns separated those who succeeded from those who scrambled.

**Automated discovery consistently outperformed manual documentation.** [Dynatrace reported](https://www.dynatrace.com/news/blog/financial-institutions-achieve-dora-compliance-with-automation/) that organizations can automate up to 80% of DORA technical tasks, reducing required time and personnel by 50-70%. The organizations that invested in automated asset discovery before the deadline found themselves running queries while others were still consolidating spreadsheets. Companies without automated tracking [overspend 12-20% on IT annually](https://www.lansweeper.com/blog/itam/how-to-automate-it-asset-inventory-for-large-networks/) due to duplicate purchases, unused licenses, and poor resource allocation. The compliance benefits are almost a side effect of the operational improvements.

**Targeted, risk-based scoping optimized compliance spending.** DORA sets two tiers of obligations: a baseline set and stricter requirements for services supporting "critical or important functions." [Skadden noted](https://www.skadden.com/insights/publications/2025/07/the-last-piece-of-dora-falls-into-place) that organizations were often tempted to define their critical functions in overly broad terms, which triggered unnecessary obligations for minor IT systems. Those who took a targeted approach focused resources on areas presenting the greatest enforcement risk rather than trying to treat everything equally.

**Continuous sync replaced point-in-time snapshots.** Asset inventories go stale immediately after creation. DORA requires updates after "major changes," not just annual reviews. Organizations running daily or real-time syncs maintained accurate inventories without the pre-audit scramble that plagued those relying on periodic manual updates.

**Queryable data enabled audit readiness in minutes, not weeks.** When regulators ask for specific asset configurations or dependency mappings, SQL queries return answers immediately. Organizations that transformed their cloud infrastructure into queryable databases could generate reports on demand. Those relying on spreadsheets needed weeks of consolidation and manual verification.

## What Approaches Are Still Failing

Despite a full year of enforcement, [industry analysis shows](https://panorays.com/blog/dora-strategy-for-2026/) many institutions continue to rely on manual processes, generic tick-box questionnaires, fragmented data, and inconsistent oversight. The result is often superficial assessments that fall short of capturing nuanced risk exposure.

Siloed inventories per cloud provider remain surprisingly common. Teams track AWS resources in one system, Azure in another, and GCP somewhere else entirely. When auditors ask for a unified view of all ICT assets, someone has to manually consolidate everything. This isn't just inefficient. It introduces errors and gaps that auditors will find.

Limited visibility into subcontractors continues to exacerbate concentration risk. Many organizations are still in early stages of adapting due diligence processes, particularly for monitoring subcontractor chains. Recent EU-level guidance on outsourcing and subcontracting has added new expectations here that caught some institutions off guard.

Configuration documentation drifts from reality between updates. That security group rule changed three months ago? The spreadsheet still shows the old configuration. This gap between documented state and actual state is exactly what creates risk, and exactly what auditors look for.

| Approach                  | Year One Experience              | Audit Readiness               |
| ------------------------- | -------------------------------- | ----------------------------- |
| Manual spreadsheets       | Constant updates, always behind  | Days to weeks of preparation  |
| Per-provider consoles     | Siloed views, no unified picture | Manual consolidation required |
| Traditional CMDB          | Update lag, configuration drift  | Data accuracy concerns        |
| Automated asset inventory | Continuous sync, queryable data  | Minutes to generate reports   |

The 46% who cite RoI as their biggest challenge aren't struggling because the regulation is unreasonable. They're struggling because their approach doesn't scale to the complexity of modern cloud infrastructure.

## How Can You Stop Wasting Time Chasing Your Own Data

Here's the frustrating reality that year one exposed: most organizations spend more time trying to get data about their own cloud infrastructure than actually using that data for compliance. Teams log into three different cloud consoles, export CSVs, reconcile spreadsheets, and still end up with gaps and stale information. The April 2025 RoI deadline turned this everyday frustration into a crisis.

The organizations that succeeded took a different approach. Instead of chasing data across consoles and spreadsheets, they set up automated syncs from their cloud providers to a central database. The cloud APIs already have all the asset data you need. The question is whether you're accessing it efficiently or wasting time on manual exports.

Here's what that looks like in practice. A single query can unify asset inventory across all cloud providers:

```sql
SELECT
  'AWS' AS provider,
  account_id AS account,
  region AS location,
  instance_id AS resource_id,
  instance_type AS resource_type
FROM aws_ec2_instances
UNION ALL
SELECT
  'GCP' AS provider,
  project_id AS account,
  zone AS location,
  name AS resource_id,
  machine_type AS resource_type
FROM gcp_compute_instances
UNION ALL
SELECT
  'Azure' AS provider,
  subscription_id AS account,
  location AS location,
  name AS resource_id,
  vm_size AS resource_type
FROM azure_compute_virtual_machines;
```

This query runs in seconds and returns a complete, current picture of compute resources across your entire infrastructure. No console hopping. No CSV exports. No reconciliation headaches.

[CloudQuery](https://www.cloudquery.io/docs/cli/getting-started) makes this straightforward by syncing cloud provider APIs to databases like PostgreSQL, BigQuery, or Snowflake. The [AWS](https://www.cloudquery.io/hub/plugins/source/cloudquery/aws), [GCP](https://www.cloudquery.io/hub/plugins/source/cloudquery/gcp), and [Azure](https://www.cloudquery.io/hub/plugins/source/cloudquery/azure) plugins cover hundreds of services each, and the data stays current because syncs run on your schedule. For organizations with existing CMDBs, the [ServiceNow plugin](https://www.cloudquery.io/hub/plugins/source/cloudquery/servicenow) keeps those systems current with actual cloud state instead of relying on manual updates.

The point is eliminating the hassle of getting data about your own infrastructure. When auditors ask questions, you answer with queries instead of scrambling to pull together information you should already have.

## What Should You Expect From Regulators in 2026

BaFin held an event on December 4, 2025 titled "IT supervision in the financial sector: The first year of DORA." Their message was unambiguous: 2025 was a "year of transformation," but [that transition period is over](https://www.deloittelegal.de/dl/en/services/legal/analysis/dora-contract-compliance-challenge.html). Stricter enforcement is coming, including on-site inspections and supervisory discussions. No further grace period should be expected.

By January 17, 2026, the European Commission is [submitting a supervisory review report](https://www.quodorbis.com/what-to-expect-january-2026-dora-review-and-supervision/) following consultations with the ESAs. This review assesses whether to expand DORA's scope to statutory auditors, signaling a potential broadening of supervisory reach beyond the current scope.

The 2026 RoI submission cycle expects "more mature submissions" with detailed documentation of ICT third-party arrangements, including subcontractors and evidence of ongoing risk mitigation. Regulators saw the errors and extensions of April 2025. They won't be as patient this time around.

On November 18, 2025, the European Supervisory Authorities [designated 19 ICT service providers as "critical"](https://www.ey.com/en_lu/insights/wealth-asset-management/luxembourg-market-pulse/dora-one-year-later-from-regulatory-compliance-to-strategic-resilience) under DORA, including AWS, Microsoft Azure, and Google Cloud. For the first time, major cloud platforms face direct EU supervision. This changes the compliance conversation for every financial institution using these providers, because your third-party risk management now needs to account for how these providers are being supervised themselves.

The penalties for non-compliance remain significant: up to 2% of total annual worldwide turnover for institutions, up to 1% of average daily global turnover for critical ICT providers (imposable daily for up to six months), and individual fines up to 1 million euros.

## Key Takeaways

Year one exposed a clear divide. Organizations that built automated, queryable asset inventories handled the April 2025 RoI submission smoothly. Those relying on manual processes and spreadsheets scrambled for weeks and often needed extensions to fix errors.

The patterns that worked are clear:

- [46% of institutions](https://panorays.com/blog/dora-strategy-for-2026/) cite the Register of Information as the most challenging DORA requirement
- [Only 33%](https://www.mckinsey.com/capabilities/risk-and-resilience/our-insights/europes-new-resilience-regime-the-race-to-get-ready-for-dora) felt confident at the January 2025 deadline
- [Automation reduces](https://www.dynatrace.com/news/blog/financial-institutions-achieve-dora-compliance-with-automation/) DORA compliance time and personnel by 50-70%
- The [POST Luxembourg attack](https://gouvernement.lu/en/gouvernement/delles-lex/actualites.gouvernement2024+en+actualites+toutes_actualites+communiques+2025+07-juillet+25-celulle-crise-post.html) in July 2025 validated why ICT resilience matters beyond compliance
- [BaFin signaled](https://www.deloittelegal.de/dl/en/services/legal/analysis/dora-contract-compliance-challenge.html) on-site inspections and stricter enforcement for 2026
- [19 critical ICT providers](https://www.ey.com/en_lu/insights/wealth-asset-management/luxembourg-market-pulse/dora-one-year-later-from-regulatory-compliance-to-strategic-resilience) including AWS, Azure, and GCP now face direct EU supervision

If year one was reactive, make year two proactive. The organizations that succeeded treated this as an infrastructure problem, not a documentation problem. Start with your critical business functions, automate what you're tracking manually, and build queries for your specific audit requirements.

**Stop wasting time chasing data about your own cloud.** [Download CloudQuery for free](https://www.cloudquery.io/download) and see how much easier it is to get visibility into your infrastructure. You can also [contact CloudQuery](https://www.cloudquery.io/contact-us) to discuss your specific DORA compliance requirements.

## Frequently Asked Questions

### What is a DORA ICT asset register?

A DORA ICT asset register is a documented inventory of all ICT assets supporting business functions, as required by [DORA Article 8](https://eur-lex.europa.eu/eli/reg/2022/2554/oj/eng). This includes hardware, software, network resources, and cloud services, along with their configurations, interdependencies, and criticality classifications. The register must be updated at least annually and after any major change.

### What changed after the first year of DORA enforcement?

The April 2025 Register of Information submission exposed widespread gaps in asset documentation. [Luxembourg's CSSF extended deadlines](https://www.deloitte.com/lu/en/our-thinking/future-of-advice/after-dora-register-of-information-submission-the-real-work-begins.html) due to submission errors. The [POST Luxembourg cyberattack](https://gouvernement.lu/en/gouvernement/delles-lex/actualites.gouvernement2024+en+actualites+toutes_actualites+communiques+2025+07-juillet+25-celulle-crise-post.html) in July 2025 demonstrated real-world consequences of ICT vulnerabilities. BaFin [declared the "transformation year" over](https://www.deloittelegal.de/dl/en/services/legal/analysis/dora-contract-compliance-challenge.html) in December 2025, signaling stricter enforcement ahead.

### What data points must be tracked under DORA Article 8?

Financial entities must track asset identification (type, owner, location), criticality classification, configuration details, business functions supported, interdependencies with other assets, third-party service provider relationships, and change history. All documentation must be reviewed at least annually per the [DORA regulation](https://eur-lex.europa.eu/eli/reg/2022/2554/oj/eng).

### How often must ICT asset registers be updated under DORA?

DORA requires at least annual reviews, but updates must occur whenever major changes happen. Organizations running continuous or daily syncs maintain more accurate inventories and face less scrambling before audits or regulatory submissions.

### What are the penalties for DORA non-compliance?

Financial institutions face fines up to 2% of total annual worldwide turnover. Critical ICT third-party providers can be fined up to 1% of average daily global turnover, imposable daily for up to six months. Individual executives may face personal fines up to 1 million euros.

### Can you track multi-cloud assets in one place for DORA compliance?

Yes. Tools like CloudQuery sync [AWS](https://www.cloudquery.io/hub/plugins/source/cloudquery/aws), [GCP](https://www.cloudquery.io/hub/plugins/source/cloudquery/gcp), and [Azure](https://www.cloudquery.io/hub/plugins/source/cloudquery/azure) resources to a single database, enabling unified SQL queries across all providers. This eliminates manual consolidation and provides the unified view auditors expect.

### When is the Register of Information deadline for 2026?

The annual RoI submission occurs in early 2026, following the same cycle as 2025. Regulators expect [more mature submissions](https://www.quodorbis.com/what-to-expect-january-2026-dora-review-and-supervision/) with detailed subcontractor documentation and evidence of ongoing risk mitigation.

### How does automated asset inventory compare to manual tracking for DORA?

According to [Dynatrace](https://www.dynatrace.com/news/blog/financial-institutions-achieve-dora-compliance-with-automation/), automation can handle up to 80% of DORA technical tasks, reducing required time and personnel by 50-70%. Manual approaches led to the widespread errors and deadline extensions seen in April 2025. Automated approaches provide continuous accuracy and audit-ready reporting on demand.
