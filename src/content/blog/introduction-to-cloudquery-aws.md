---
title: 'Introduction to CloudQuery for AWS'
date: 2025-10-03
slug: 'introduction-to-cloudquery-aws'
description: "Discover how CloudQuery solves cloud visibility fragmentation by providing AI-powered insights across all AWS resources. Learn CloudQuery's architecture, how it transforms multi-source data into unified schemas, and why it's become essential for security monitoring, cost optimization, and compliance automation."
categories: ['Work']
tags: ['AWS', 'Cloud Infrastructure']
heroImage: '/images/blog/introduction-to-cloudquery-aws/thumbnail.webp'
canonicalUrl: 'https://www.cloudquery.io/blog/introduction-to-cloudquery-aws'
contentNotice: 'This post was originally published on CloudQuery blog.'
tldr: 'CloudQuery transforms cloud visibility from fragmented dashboards and siloed tools into unified, queryable infrastructure intelligence. Connect AWS accounts with read-only IAM roles, sync data from 240+ services plus external SaaS platforms, normalize everything into consistent schemas, and query across your entire technology stack. No agents, no infrastructure changes - just comprehensive visibility that drives security, cost optimization, and operational excellence.'
---

![Introduction to CloudQuery for AWS header](/images/blog/introduction-to-cloudquery-aws/header.webp)

Quick questions: How many cloud resources in your AWS environment are publicly accessible? How many are currently unencrypted? Which ones cost the most?

If you can't answer those questions immediately, you don't have a cloud problem - you have a visibility problem.

Most teams struggle with fragmented cloud visibility. Data lives scattered across multiple dashboards, monitoring tools, and AWS services. Most tools solve only a slice of your visibility needs - security OR cost OR basic inventory, but never comprehensive infrastructure intelligence in one place.

That's the problem CloudQuery solves.

In this video, AWS Partner Solutions Architect Keegan Marazzi sits down with CloudQuery Developer Advocate Joe Karlsson to explore what CloudQuery is, what problems it solves, and how its architecture delivers unified visibility across your entire cloud infrastructure.

[![Introduction to CloudQuery for AWS Video Thumbnail](/images/blog/introduction-to-cloudquery-aws/video.webp)](https://www.youtube.com/embed/dGiHSQKSKpw)

## The Cloud Visibility Problem

Most teams can't answer fundamental questions about their cloud infrastructure:

- What resources exist across all our AWS accounts?
- How are resources configured and connected?
- Which teams own which infrastructure?
- Where are our security risks and cost optimization opportunities?

This isn't a technical failure - it's a structural problem. Cloud visibility is fragmented across:

- AWS Console dashboards (siloed by service)
- Security monitoring tools (focused only on threats)
- Cost management platforms (focused only on spend)
- Compliance tools (focused only on policy violations)
- Custom scripts and spreadsheets (ad-hoc and unmaintained)

Each tool provides partial answers. None deliver comprehensive infrastructure intelligence.

## What CloudQuery Does

CloudQuery provides **AI-powered visibility and actionable insights** across all cloud resources, unified in a single queryable platform.

### 1. Complete Cloud Coverage

**See everything** that exists in your AWS environment:

- Not just EC2 instances and S3 buckets
- Lambda functions, RDS databases, CloudFormation stacks
- That random infrastructure someone deployed six months ago and forgot about
- **All 240+ AWS services** across all accounts and regions

**Multi-cloud, multi-account, multi-region visibility - all in single queries.**

Real-time updates ensure that every time someone spins up a new resource, your inventory reflects it immediately.

### 2. Deep Configuration Intelligence

**Understand how** your cloud is configured:

- Deep metadata from AWS services
- Configuration settings for every resource
- Resource relationships (which connects to what)
- Ownership information (who launched resources and when)

**Example: EC2 instance visibility includes:**

- The instance itself (type, state, launch time)
- Security groups and network ACLs
- VPC configuration and subnet placement
- IAM roles and permissions

_Note: Gathering this comprehensive view requires 10+ different AWS API calls - CloudQuery handles all of this complexity automatically, providing a unified snapshot at one point in time._

- Who launched it and when
- Complete network topology showing connectivity

**Tag governance** across resources identifies which teams own infrastructure and which environments they support (production, staging, development).

### 3. Risk Detection and Opportunity Identification

**Spot risks before they're exploited:**

- Security misconfigurations (public S3 buckets, expired SSL certificates)
- Compliance violations (SOC2, PCI, CIS benchmarks)
- Operational risks (single points of failure, missing backups)

**Find cost optimization opportunities:**

- Unused EBS volumes sitting idle
- Unattached Elastic IPs costing money
- Idle RDS instances consuming resources
- Wasted reserved capacity

**Automate compliance monitoring** for SOC2, PCI-DSS, CIS benchmarks, and custom organizational policies.

**Identify operational trends** before they become problems - capacity issues, performance degradation, configuration drift.

## How CloudQuery Works

CloudQuery's architecture delivers unified visibility through four key components:

### 1. Read-Only AWS Access

CloudQuery is **completely read-only** with your AWS environment:

- No agents to install
- No infrastructure modifications
- No security access or write permissions
- Connects via IAM roles with describe and list permissions only

**Zero impact on your production infrastructure.** CloudQuery observes and reports - it never modifies resources.

### 2. Multi-Source Data Collection

CloudQuery doesn't just connect to AWS - it integrates multiple data sources:

**AWS accounts** (all regions, all services):

- EC2, S3, RDS, Lambda, CloudFormation
- Security groups, IAM roles, VPC configurations
- CloudWatch metrics, CloudTrail logs
- All 240+ AWS services

**External SaaS platforms:**

- **Wiz** for security findings
- **Datadog** for monitoring metrics
- **Splunk** for log analytics
- **GitHub/GitLab** for code repository data
- **PagerDuty** for incident management
- 50+ other integrations

**Why multi-source matters:** Enrich cloud configuration data with security findings, monitoring metrics, code changes, and operational context. Get a truly holistic view of what's running in your cloud and why things happened.

### 3. Data Transformation and Normalization

**This is where the magic happens.**

CloudQuery takes data from disparate sources - AWS APIs, SaaS platforms, monitoring tools - and transforms them into a **unified schema**.

**What normalization means:**

- EC2 instances from AWS
- GitLab projects from your code repositories
- Wiz vulnerabilities from security scanning
- Datadog metrics from monitoring

**All get the same treatment:**

- Consistent field names across all sources
- Standardized relationships between resources
- Unified timestamps and data types
- Predictable schemas that make querying simple

This isn't just data collection - it's data transformation into a format designed for analysis, not just storage.

### 4. Flexible Data Storage

- Persist data into your own infrastructure
- Data Lake (S3, Azure Blob)
- Data Warehouse (Snowflake, BigQuery, Redshift)
- Database (PostgreSQL, MySQL, SQLite)
- Files (CSV, JSON, Parquet)

## What This Architecture Solves

### Eliminates Visibility Fragmentation

Instead of jumping between AWS Console, security dashboards, cost management tools, and monitoring platforms, **everything is in one place - a single source of truth** for your entire cloud infrastructure.

### Enables Intelligent Decision Making

CloudQuery isn't just about collecting data - it's about **making data actionable**:

- Security teams identify and remediate vulnerabilities immediately
- FinOps teams discover cost optimization opportunities across accounts
- Compliance teams automate policy monitoring and audit preparation
- Engineering teams understand infrastructure dependencies and relationships

### Scales with Your Organization

As your AWS footprint grows - new accounts, new services, new teams - CloudQuery scales automatically. No re-architecture required.

## Key Capabilities Recap

**Complete visibility:**

- See everything across all AWS accounts, regions, and services
- No more blind spots or surprises
- Real-time updates when resources change

**Unified data model:**

- Consistent schemas across your entire cloud infrastructure
- Whether it's an AWS EC2 instance or a GitLab project, data is predictable and queryable
- Relationships mapped automatically

**Actionable intelligence:**

- More than just collecting data
- Enables intelligent decisions and automated actions
- Integrate with security tools, cost management, compliance automation, and operational workflows

---

_Ready to get started? Learn more about [cloud asset inventory fundamentals](https://www.cloudquery.io/blog/what-is-cloud-asset-inventory), [design principles for effective inventories](https://www.cloudquery.io/blog/how-to-design-cloud-asset-inventory-aws), and [maximizing value from cloud visibility](https://www.cloudquery.io/blog/five-tips-maximum-value-cloud-asset-inventory)._

## Video Transcript

**Keegan:** Hi, everyone. My name is Keegan Marazzi. Thanks for joining us. I'm a partner solutions architect here at AWS where my team's mission is to discover, develop, and deliver solutions with our partners. Today here, I'm joined with Joe Carlson. He's a senior cloud developer advocate at Cloud Query. Say hi, Joe.

**Joe:** Hi, Keegan. Thanks for having me. Okay. Keegan, today we're going to be introducing Cloud Query as a cloud asset inventory for AWS. And we're going to be digging into what it is, what problems it addresses, and then give a overview of its architecture. You can see here a little spoiler alert. So Keegan, I actually wanted to ask you a quick question, completely rhetorical. How many cloud resources are publicly available in environments you manage? How many are currently unencrypted? Which one of those cost the most? And Keegan, if you can't answer any of those questions, no problem. You probably have a visibility problem with your cloud and not a cloud problem.

**Keegan:** So we have these questions about our cloud environments. What can we really do to address them and get that visibility that you're talking about?

**Joe:** Yeah, and don't worry. Most teams can't and most teams don't have a ton of visibility into their cloud resources. And oftentimes we find visibility can be pretty fragmented. Getting data about your cloud can be kind of messy and siloed. And most tools only solve a slice of the questions you have around that, like security costs are just giving you a basic list of your inventory. And that's the problem that cloud query actually solves. So with cloud query teams actually get an AI powered visibility and actionable insights across all of their cloud resources. And it can help you find things like what cloud resources exist. You can get complete cloud coverage or coverage across AWS, including all your counts and regions. So not just your EC2 and S3 buckets, but Lambda functions, RDS snapshots, and all the random cloud formation stacks that you put together six months ago and forgotten. multi-cloud account, multi-region visibility, all in single queries. And you can get real-time updates every time someone spends up a new resource. You can also find things like how your cloud is currently configured. It makes it easy to get deep metadata from AWS and configuration settings, relationships, who owns what resource and where and when they set it up. And you can see things like EC2 instances plus the security groups. BPC, IM roles, who launched it and when. Complete network topology across your resources showing which resources stock to which. And you can also govern different tags across the resources. You can know which team owns what and which environment they're currently looking at. The last thing too can help you with is spotting risks and finding opportunities in your cloud. So things like security misconfigurations, you can identify before they get exploited. So public S3 buckets, expired SSL certs, etc. And it can also do things like find costs that are could be wasteful. So unused EBS volumes, idle RDS instances, wasted reserve capacity. It can help you find and build automated compliance monitoring for SOC2, PCI, CIS, whatever. And it basically just helps you find operational trends before they become problems.

**Keegan:** Awesome. So I feel like I have a good idea of what Cloud Query does. Can we talk a little bit about how it works?

**Joe:** Yeah. Let's dig into it. We have this beautiful drawing that I put together. Thank you. But let's dig into it. First, Cloud Query's read only with your AWS environment, which means you don't have to make any modifications to your infrastructure. There's no agents, no security access, or nothing that's going to be edited or changed on there. And it connects to your AWS environments and accounts using IM roles with described and list permissions only. But the thing that makes it powerful, it's not just AWS environments. It connects to, it also connects multiple data sources like other SaaS environments. Cloud query is able to extract data from multiple data source. different sources, including AWS accounts, but things like Wiz, Datadog, GitHub, GitLab, you can import things like your Wiz for security findings, Splunk for log analytics, and Datadog for monitoring metrics. So you can enrich your cloud configuration data with data from other sources to really get a holistic view of what's going on in your cloud and why things happened. And then here is where the magic happens in Cloud Query. So CloudQuery takes all your data from these cloud sources. It transforms and normalizes them into a unified schema. So that means your EC2 instances, your GitLab projects, vulnerabilities, and data dog metrics all get the same treatment. So it makes that you have consistent. field names, standardized relationships, and unified time stamps to make it easy to query and analyze across everything. This isn't just about data collection, it's data normalization, and everything gets transformed to format that makes it easy for you to analyze it. Okay, so we're gonna move deeper down the ladder here. There are basically two options for managing and using Cloud Query. You can manage it on your own using the CLI. CLI is useful if you wanna persist that data into your own, Data Lake, Data Warehouse, PostgreSQL database, whatever. Or in the cloud where that gets managed. So you can do automated syncs. And our backend is built in ClickHouse. So you have SuperSpeedy, massively scalable. analysis you can do on the backend too. But either way, you end up with a unified view of your entire technology stack, AWS resources, application code, security findings, operational metrics, all queryable, all through a single place. And this architecture really solves a fundamental problem of visibility fragmentation in the cloud. So instead of having to jump between all these different dashboards and all these different places, it can all be in one single place for a single source of truth. That's a lot. Okay, let's wrap up what we covered here today. So cloud query solves the cloud visibility problem that's been plaguing infrastructure teams. Cloud query makes it easy for you to see everything across all your accounts, all your regions and all your SaaS platforms. That means no more blind spots, no more surprises when you're building in the cloud. It also helps you create and maintain a unified data model with consistent schemas across your entire cloud infrastructure, whether it's an AWS EC2 instance or a GitLab project. The data is predictable and queryable. And it's more than just collecting that data. It makes it easy for you to make intelligent decisions and take action on that data.

## FAQ

**Q: Does CloudQuery require agents or infrastructure changes?**

A: No. CloudQuery is completely read-only and agentless. It connects to AWS accounts using IAM roles with describe and list permissions only. No agents to install, no infrastructure modifications, no security risks from write access.

**Q: What AWS permissions does CloudQuery need?**

A: Read-only access (describe and list permissions) across AWS services you want to inventory. Many organizations start with AWS managed `ReadOnlyAccess` policy, then refine to least-privilege access. CloudQuery never needs write permissions - it observes infrastructure, never modifies it.

**Q: How does CloudQuery handle multi-account AWS environments?**

A: CloudQuery uses cross-account IAM roles to collect data from all your AWS accounts. Configure roles in each account with read-only permissions, then CloudQuery assumes those roles to sync data. All data gets normalized into a unified schema with account ID as a key dimension, enabling queries that span your entire organization.

**Q: Can CloudQuery sync data from non-AWS sources?**

A: Yes. CloudQuery integrates with 50+ platforms including Azure, GCP, GitHub, GitLab, Datadog, Wiz, Okta, PagerDuty, Kubernetes, and more. This multi-source capability enables correlation between cloud infrastructure, application code, security findings, and operational metrics - providing holistic visibility beyond just AWS.

**Q: How often does CloudQuery sync data?**

A: Configurable based on your needs. CloudQuery Platform offers automated syncs from every 5 minutes to daily. Self-hosted deployments using the CLI can be scheduled however frequently you need. Security use cases often require real-time or sub-five-minute updates, while cost optimization can work with daily syncs.

**Q: Where does CloudQuery store data?**

A: You choose. Self-hosted deployments can persist to any destination - PostgreSQL, MySQL, Snowflake, BigQuery, S3, CSV files, or 50+ other destinations. CloudQuery Platform manages storage for you using ClickHouse for high-performance analytics. Data never leaves your control in self-hosted deployments. To get started with PostgreSQL locally, see the [AWS to PostgreSQL guide](https://www.cloudquery.io/docs/cli/getting-started/aws-to-postgresql).

**Q: What's the difference between CloudQuery and AWS Config?**

A: AWS Config focuses on compliance monitoring and configuration change tracking for AWS resources only. CloudQuery provides broader capabilities - multi-cloud support, custom SQL queries, integration with external SaaS platforms, flexible data models, and multiple storage destinations. Many organizations use AWS Config as one input alongside CloudQuery for comprehensive visibility.

**Q: How does CloudQuery handle sensitive data?**

A: CloudQuery only reads metadata and configuration data - not application data stored in databases or file systems. You control what data gets synced through table selection and configuration. Data in transit is encrypted. For self-hosted deployments, data never leaves your infrastructure. CloudQuery Platform is SOC2 compliant with enterprise-grade security controls.

**Q: Can I write custom queries against CloudQuery data?**

A: Yes. CloudQuery normalizes data into SQL-queryable formats. Write custom queries in SQL, integrate with BI tools like Tableau or Looker, build dashboards, create alerts, or feed data into automation workflows. The unified schema makes complex multi-service queries straightforward.

**Q: How does CloudQuery pricing work?**

A: CloudQuery offers a free open-source CLI for self-hosted deployments. CloudQuery Platform (managed service) pricing is based on resources synced and query volume. Contact CloudQuery for enterprise pricing or check [cloudquery.io/pricing](https://www.cloudquery.io/pricing) for current plans.

**Q: What's the performance impact on AWS accounts?**

A: Minimal. CloudQuery makes read-only API calls during syncs, similar to what AWS Config or other monitoring tools do. API calls stay well within AWS service quotas for typical deployments. You can configure sync frequency and throttling to control API usage if needed.
