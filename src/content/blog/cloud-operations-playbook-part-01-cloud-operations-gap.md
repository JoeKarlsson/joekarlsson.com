---
title: 'The Cloud Operations Gap in Multi-Cloud Environments'
date: 2026-02-17
slug: 'cloud-operations-playbook-part-01-cloud-operations-gap'
description: >-
  89% of organizations use multiple clouds but only 8% are cloud-mature. Learn what the Cloud Operations Gap is and why it costs teams hours every week.
categories: ['DevRel', 'Databases']
tags: ['Cloud Operations', 'Platform Engineering', 'Security']
heroImage: /images/blog/cloud-operations-playbook-part-01-cloud-operations-gap/thumbnail.png
canonicalUrl: https://www.cloudquery.io/blog/cloud-operations-playbook-part-01-cloud-operations-gap
contentNotice: 'This post was originally published on CloudQuery blog.'
---

![Blog header for The Cloud Operations Gap: Part 1 of the Cloud Operations Playbook series](/images/blog/cloud-operations-playbook-part-01-cloud-operations-gap/header.png)

> **Note:** **TL;DR:** The "Cloud Operations Gap" is the distance between what leadership thinks they know about cloud infrastructure and what's actually running. 89% of organizations now operate across multiple clouds, yet only 8% qualify as highly cloud-mature. Fragmented tooling traps critical context in silos, making basic questions like "how many S3 buckets do we have?" surprisingly hard to answer. This post explains why the gap exists, why it's getting worse, and how to start measuring it.
> This post is adapted from the free [Cloud Operations Playbook](https://www.cloudquery.io/resources/cloud-operations-playbook), a 67-page guide covering everything from self-assessment to automated governance.

## You Probably Can't Count Your Own Infrastructure

You probably have 847 different AWS resources running across six accounts right now. Or maybe it's 1,200 resources across nine accounts. The scary part? You probably can't tell me if those numbers are right or wrong.

Not a failure of your team. Just the natural state of cloud infrastructure in 2026.

Most organizations approach cloud operations by buying point tools: one for cost, one for security, one for compliance. Each tool solves one problem but creates another - data fragmentation. The result is a visibility gap that compounds over time, and no single tool in your stack is designed to close it.

## How Cloud Sprawl Actually Happens

It always starts the same way. One team spins up an AWS account. Another team does the same. An acquisition adds three more accounts. A PoC quietly becomes production. Before you know it, you're looking at nine accounts across three providers, half set up by people who've already left the company.

[89% of organizations now use multiple cloud providers](https://www.flexera.com/blog/finops/cloud-computing-trends-flexera-2024-state-of-the-cloud-report/). A significant portion of those workloads are cloud-native while the rest remain in legacy infrastructure. Two operational models running in parallel, with different tooling for each.

M&A accelerates this faster than anything else. Every acquisition brings its own cloud accounts, its own tooling, its own naming conventions, and its own tribal knowledge - usually held by people who don't survive the reorg. One VP of Infrastructure we spoke to inherited three AWS organizations and a GCP project through a single acquisition. It took his team four months to inventory what they'd bought.

And here's the uncomfortable organizational truth: [cloud operations](https://www.cloudquery.io/product/cloud-ops) is often nobody's job. It sits in the gap between platform engineering, SRE, security, and finance. Platform eng owns the developer experience. SRE owns uptime. [Security](https://www.cloudquery.io/solutions/cspm) owns posture. Finance owns the budget. But who owns the complete view of what's actually running, how it's configured, and whether it matches what anyone intended? Usually nobody. That gap is where problems hide.

We call this the Cloud Operations Gap: the distance between what leadership thinks they know and what's actually running.

## Why This Is Getting Worse Right Now

Cloud sprawl isn't new. But three converging forces are turning a manageable nuisance into a strategic risk.

**AI infrastructure is adding a new dimension of complexity.** GPU instances, training clusters, and inference endpoints don't behave like traditional compute. They're expensive, they're scarce, and they're being provisioned urgently by teams that don't always follow the usual guardrails. If you couldn't track your EC2 instances, good luck tracking your SageMaker endpoints.

**Regulatory pressure is intensifying.** NIS2 in Europe, DORA for financial services, and tightening [SOC 2](https://www.cloudquery.io/blog/what-is-soc2-compliance) expectations mean that "we'll figure out compliance before the audit" is no longer a viable strategy. Auditors want continuous evidence, not a quarterly scramble. That requires infrastructure data you can actually query.

**Cloud costs have become a board-level conversation.** [FinOps](https://www.cloudquery.io/solutions/fin-ops) has moved from a grassroots optimization effort to a CFO priority. But you can't optimize costs you can't attribute, and you can't attribute costs across resources you can't see. [84% of cloud decision-makers cite managing spend as their main challenge](https://www.flexera.com/blog/finops/cloud-computing-trends-flexera-2024-state-of-the-cloud-report/). It's been the top challenge two years running. Not getting better.

## The Fragmentation Problem Up Close

Most organizations we talk to have some version of this setup:

Cost data lives in CloudHealth, Kubecost, or the native cloud billing consoles. Security findings are in Wiz, Prisma Cloud, or AWS Security Hub. Infrastructure state is spread across Terraform Cloud, the AWS console, and that spreadsheet someone started two years ago. There's no single [asset inventory](https://www.cloudquery.io/product/cloud-asset-inventory) that ties it all together. Compliance evidence gets manually compiled before every audit.

Each tool does its job. But none of them talk to each other.

We saw this at a mid-size SaaS company that had acquired eight different observability and governance tools over three years. Each one was good at its specific job. But when their new CISO asked a simple question - "show me all our public-facing resources that haven't been patched in 90 days" - the room went silent. The answer required correlating data from four different systems that had never been designed to work together. After six months trying to build integrations, they ripped out five of the tools and started over with a unified data layer. Painful. But the alternative was permanent fragmentation.

Here's the question that breaks most organizations: "Which S3 buckets contain PII and are accessible from the internet?" Answering it requires pulling from security, configuration, and data classification systems that were never designed to work together.

## Not All Infrastructure Is Created Equal

Infrastructure gets created in wildly different ways, and that's what makes this so hard.

| How It Was Created     | Typical Risk Profile                             | Visibility |
| ---------------------- | ------------------------------------------------ | ---------- |
| IaC with PR review     | Low - tagged, documented, reproducible           | High       |
| IaC without review     | Medium - reproducible but may have config issues | Medium     |
| Console (planned)      | Medium - often untagged, undocumented            | Low        |
| Console (incident)     | High - created under pressure, never cleaned up  | Minimal    |
| Automated/scheduled    | Unknown - depends on who wrote the automation    | Varies     |
| Third-party/contractor | High - tribal knowledge left with the person     | Minimal    |

Then there's shadow infrastructure: resources that exist but aren't tracked by any team. A test environment that became permanent. A Lambda function triggered by a CloudWatch rule that nobody monitors. An S3 bucket created for a one-time data migration that still holds production data. These resources don't show up in your IaC, they're not in your [CMDB](https://www.cloudquery.io/solutions/cloud-cmdb), and they won't appear in any dashboard - until something goes wrong.

And even infrastructure that was created correctly doesn't stay that way. Configuration drift is silent and constant. A security group rule gets widened during troubleshooting and never tightened back. An S3 bucket policy is modified to unblock a deployment and forgotten. [misconfigurations are the leading cause of cloud security incidents](https://www.fortinet.com/resources/reports/cloud-security). Not malicious actors exploiting zero-days. Just resources created wrong, configured wrong, or drifted from their intended state over time.

## What Mature Operations Actually Look Like

The [HashiCorp 2024 State of Cloud Strategy Survey](https://www.hashicorp.com/en/state-of-the-cloud) found that only 8% of organizations qualify as "highly cloud-mature." That's not a bell curve with most organizations in the middle. It's a long tail, with the vast majority stuck in reactive mode.

Why the gap between perception and reality? Because maturity signals are misleading. Having Terraform doesn't mean you're mature if only 40% of your infrastructure is managed by it. Having a security scanner doesn't mean you're secure if alerts go to a Slack channel nobody reads. Having a tagging policy doesn't mean you have consistent tags - it means you have a document that describes tags you wish you had.

Here's what the gap actually looks like in practice:

| What Mature Looks Like                                    | What Most Teams Have                                   |
| --------------------------------------------------------- | ------------------------------------------------------ |
| Query any resource across all providers in seconds        | Log into 3 consoles and cross-reference spreadsheets   |
| Compliance evidence generated automatically, continuously | Quarterly fire drill pulling data from 5+ systems      |
| Cost anomalies flagged before the monthly bill arrives    | "Why is our AWS bill $40K higher this month?"          |
| Policy violations blocked or auto-remediated at deploy    | Post-hoc security reviews that find issues weeks later |
| Clear ownership for every resource                        | "Who owns this?" followed by shrugs                    |

The gap between where teams are and where they need to be isn't a tooling problem. It's a visibility problem. You can't govern what you can't see. You can't automate what you can't query. And you can't answer questions about your infrastructure when the answers are scattered across fifteen different systems that don't talk to each other.

> **Note:** **Want to score your own operations gap?** The free Cloud Operations Playbook eBook includes a complete self-assessment framework with detailed remediation paths for each gap type, plus the full Cloud Operations Maturity Model that this series is built on. [Get the eBook](https://www.cloudquery.io/resources/cloud-operations-playbook).

## Where to Start: Five Questions to Ask This Week

Before reading further in this series, try answering these questions about your own environment:

1. **Can you enumerate all cloud accounts, resources, and owners across every provider?** Try counting your S3 buckets across all accounts. Time yourself.

2. **Are security policies enforced consistently, regardless of how resources are provisioned?** Resources created through Terraform, clicked into existence via the console, and inherited from acquisitions - are they all covered?

3. **Can you generate audit-ready compliance evidence in hours instead of weeks?** If your auditor called tomorrow, how long before you could produce evidence for SOC 2 CC6.1?

4. **Do you know what percentage of cloud spend is unattributed to a team or service?** Check your top 10 cost drivers. How many are missing an `owner` tag?

5. **Can you answer "what changed in the last 7 days?" without manual investigation?** If you can't, that's the gap measured in hours.

Score each from 1 (not at all) to 5 (fully confident). Most organizations score between 10 and 16 out of 30. The eBook includes a more detailed scoring guide with weighted criteria and specific improvement actions for each score range. The chapters that follow explain why the gap exists and how to close it. Get started with the [quickstart guide](https://www.cloudquery.io/docs/cli/getting-started).

## Key Takeaways

- **Accept fragmentation as your starting point, not a failure.** Then focus on fixing it systematically
- **Audit your actual infrastructure state** against what leadership believes exists; the gap is usually larger than expected
- **Map where your critical context is trapped** and list the questions you can't answer today
- **Take the self-assessment above** to baseline your maturity level before reading further

The next post in this series puts a dollar figure on the gap. [Part 2 covers the Cloud Operations Maturity Model](https://www.cloudquery.io/blog/cloud-operations-playbook-part-02-cloud-operations-maturity-model) - a framework for scoring your team across six capability dimensions so you can track improvement over time.

**About This Series:** This is Part 1 of our 12-part Cloud Operations Playbook series. Each post builds on the previous, covering the gap between what leadership thinks they know about cloud infrastructure and what's actually running.

- **Part 1** (This post): The Cloud Operations Gap
- [**Part 2**: Cloud Operations Maturity Model](https://www.cloudquery.io/blog/cloud-operations-playbook-part-02-cloud-operations-maturity-model)
- [**Part 3**: The Hidden Security Tax](https://www.cloudquery.io/blog/cloud-operations-playbook-part-03-hidden-security-tax)
- [**Part 4**: The Real Cost of Compliance Scrambles](https://www.cloudquery.io/blog/cloud-operations-playbook-part-04-cost-of-compliance-scrambles)
- [**Part 5**: Cloud Waste Calculator](https://www.cloudquery.io/blog/cloud-operations-playbook-part-05-cloud-waste-calculator)
- [**Part 6**: The Visibility-First Governance Model](https://www.cloudquery.io/blog/cloud-operations-playbook-part-06-visibility-first-governance-model)
- [**Part 7**: Continuous Cloud Governance](https://www.cloudquery.io/blog/cloud-operations-playbook-part-07-continuous-cloud-governance)
- [**Part 8**: Cloud Security Posture Management with SQL](https://www.cloudquery.io/blog/cloud-operations-playbook-part-08-cloud-security-posture-sql)
- [**Part 9**: Continuous Compliance with SQL](https://www.cloudquery.io/blog/cloud-operations-playbook-part-09-continuous-compliance-sql)
- [**Part 10**: Building an AI-Ready Cloud Data Layer](https://www.cloudquery.io/blog/cloud-operations-playbook-part-10-ai-ready-cloud-data-layer)
- [**Part 11**: The 90-Day Cloud Operations Roadmap](https://www.cloudquery.io/blog/cloud-operations-playbook-part-11-90-day-cloud-operations-roadmap)
- [**Part 12**: Cloud Operations Metrics That Matter](https://www.cloudquery.io/blog/cloud-operations-playbook-part-12-cloud-operations-metrics-scorecard)

Want the complete guide? [Download the free 67-page eBook](https://www.cloudquery.io/resources/cloud-operations-playbook).

## FAQ

### What Is the Cloud Operations Gap?

The Cloud Operations Gap is the distance between what leadership thinks they know about their cloud infrastructure and what's actually running. It shows up as inability to answer basic questions ("how many S3 buckets do we have?"), delayed security investigations, compliance scrambles, and unattributed cloud costs.

### Why Can't Most Organizations Answer Basic Infrastructure Questions?

Because infrastructure data is fragmented across dozens of tools - cost data in one place, security findings in another, configuration state in a third. Each tool has its own data model and none of them are designed to work together. Answering cross-domain questions requires manual correlation that most teams don't have time for.

### How Does Cloud Sprawl Happen?

Cloud sprawl compounds through organic growth (teams spinning up accounts independently), M&A (inheriting entire cloud estates), shadow IT (unapproved resources that become permanent), and configuration drift (compliant resources that slowly go out of compliance). No single event causes it - it's the accumulation over time.

### What Percentage of Organizations Are Cloud-Mature?

According to the [HashiCorp 2024 State of Cloud Strategy Survey](https://www.hashicorp.com/en/state-of-the-cloud), only 8% of organizations qualify as "highly cloud-mature." The vast majority (roughly 80%) are still in reactive or partially visible modes, discovering problems after they happen rather than preventing them.

### How Do I Measure My Organization's Cloud Operations Gap?

Start with the five-question self-assessment in this post. Score your organization from 1-5 on inventory completeness, security policy coverage, compliance evidence generation, cost attribution, and change tracking. Most teams score between 10-16 out of 30. Track this score quarterly as you implement improvements.

### What's the Difference Between Cloud Operations and DevOps?

DevOps focuses on the software delivery pipeline - CI/CD, deployment automation, developer productivity. Cloud operations focuses on the infrastructure itself - what's running, how it's configured, whether it's compliant, and who owns it. They overlap but cloud operations sits at a higher level, spanning security, compliance, cost, and [platform engineering](https://www.cloudquery.io/solutions/platform-engineering).

The free 67-page eBook includes the complete self-assessment with detailed scoring criteria, remediation paths for each gap type, and dimension-by-dimension improvement guides. Have questions? [Talk to the CloudQuery team](https://www.cloudquery.io/contact-us).
