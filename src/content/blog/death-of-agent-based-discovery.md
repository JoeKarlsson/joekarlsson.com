---
title: 'The Death of Agent-Based CMDB Discovery'
slug: death-of-agent-based-discovery
tags:
  - Cloud Infrastructure
  - CMDB
  - Best Practices
date: 2025-10-24
description: Agent-based CMDB discovery fails in cloud environments with containers, serverless, and managed services. API-driven discovery costs 90% less and works everywhere.
heroImage: /images/blog/death-of-agent-based-discovery/thumbnail.webp
categories:
  - Databases
canonicalUrl: https://www.cloudquery.io/blog/death-of-agent-based-discovery
contentNotice: "This post was originally published on CloudQuery's blog."
---

![The Death of Agent-Based CMDB Discovery](/images/blog/death-of-agent-based-discovery/header.webp)

We spent 20 years deploying agents on servers. Then AWS gave us APIs. Why are we still installing agents?

Your Lambda function executes for 200 milliseconds. Your container lives for 45 seconds before Kubernetes kills it. Your RDS database has no operating system you can SSH into. Yet somehow, we're still trying to install discovery agents like it's 2005.

The infrastructure paradigm shifted, but CMDBs didn't adjust. Agents made perfect sense when servers lived in racks and ran for years. They make zero sense when your "server" is an API Gateway endpoint backed by Lambda functions that spin up and vanish 1,000 times per hour. [Traditional CMDB architecture fails 70-80% of the time](https://www.cloudquery.io/blog/cloud-cmdb-vs-traditional-cmdb-2026) precisely because it assumes stable, long-lived infrastructure you can install agents on.

## Why Agents Made Sense (And Why We're Not Wrong for Using Them)

Let's be honest about history. Agents weren't a mistake when we built them.

Physical data centers had no cloud APIs. If you wanted to know what was running on a server, you installed software on that server. There was no other option. The server sat in a rack, you racked and stacked it, you installed your OS, and then you installed your monitoring agent. That agent would phone home through your network, reporting CPU, memory, disk, and whatever else you configured it to track.

Network isolation was real. Your production servers sat in DMZs behind multiple firewalls. Agents could phone home from those isolated networks. API-based discovery? You'd need to poke holes in firewalls and security teams would laugh at you.

Static infrastructure meant install once, run forever. You deployed a server in 2008, installed your agent, and that server ran until 2015. The agent kept running. No container churn, no auto-scaling, no infrastructure as code rebuilding everything every deployment. Install the agent, forget about it, collect data for years.

The security model made sense too. Agents ran with local privileges, which gave them visibility into processes, network connections, file systems, and application behavior. If you needed to know what was happening on a server, you needed local access. APIs didn't exist to tell you what processes were running or which ports were listening.

[ITIL frameworks](https://www.axelos.com/certifications/itil-service-management) and CMDBs were born in this era. The agent-based discovery model matched how infrastructure actually worked.

## The Cloud Broke Everything Agents Assumed

Then cloud providers gave us APIs, and suddenly agents stopped making sense. But we kept installing them anyway, because that's what CMDBs do.

### Containers: Where Do You Install It?

Your Kubernetes pod spins up, runs for 2 minutes, and terminates. Where do you install the agent?

Option 1: Sidecar container. Now every pod runs two containers instead of one. Your 1,000-pod cluster becomes 2,000 containers. Each sidecar consumes 200-500MB of memory. That's 200-500GB of RAM across your cluster doing nothing but running agents. You're paying for compute to run discovery software instead of running your application.

Option 2: Bake the agent into your container image. Now your 100MB application image becomes 400MB because you embedded the agent. Every image pull is 4x larger. Your container registry bill increases. Your pod startup time increases because Kubernetes has to pull a bigger image.

Option 3: DaemonSet that discovers containers from the host. This works, but it's reading container metadata from the Kubernetes API anyway. Why not just query the API directly and skip the agent entirely?

A 1,000-pod cluster with sidecar agents means 1,000 agent instances constantly polling, reporting, consuming resources. The Kubernetes API already knows about every pod, every container, every image, every volume mount. The agent is duplicating work the API already provides.

### Serverless: The Function That Doesn't Wait

Your AWS Lambda function cold starts in 100-200 milliseconds [[AWS Lambda](https://aws.amazon.com/lambda/faqs/)]. Agent initialization takes 2-5 seconds to start up, register with your CMDB, and begin collecting data.

The function already finished executing before the agent even initialized.

You literally cannot install an agent in a Lambda function that runs for 200ms. Even if you could, the function would time out waiting for the agent to start. And if you somehow made it work, you'd pay for 2-5 seconds of Lambda execution time just to initialize a discovery agent for a function that runs for 200ms.

It doesn't work. There's no workaround. Agents fundamentally cannot discover serverless infrastructure.

### Managed Services: No OS, No Agent

RDS has no operating system you can access. You can't SSH to your PostgreSQL database. You can't install an agent on DynamoDB. S3 buckets don't run Linux. CloudFront distributions don't have a file system. API Gateway endpoints don't accept RPM packages.

70-80% of AWS services are managed services with no compute you control [[AWS Services](https://aws.amazon.com/products/)]. Azure and GCP have similar percentages. The majority of modern cloud infrastructure has nowhere to install an agent.

Your CMDB needs to know about these resources. Security teams need to audit S3 bucket policies. Compliance teams need to verify RDS encryption settings. FinOps teams need to track DynamoDB table sizes and costs.

Agents can't help you. There's no installation target.

### Auto-Scaling: Agents Can't Keep Up

Your application scales from 50 EC2 instances to 500 instances in 5 minutes because traffic spiked. Each instance takes 30-60 seconds to boot, install packages, start your application, and become healthy. The agent adds another 30-60 seconds to register with your CMDB, establish connectivity, and begin reporting data.

By the time 200 agents finish registration, traffic drops and Kubernetes scales back down to 50 instances. Those 200 agents never fully registered before their instances terminated. Your CMDB shows 250 instances when reality is 50. You're making decisions based on data that's 5-10% inaccurate because agents lag behind infrastructure changes.

The image problem makes this worse. Baking agents into AMIs means every AMI update requires rebuilding images with new agent versions. Security patch? Rebuild your AMIs. Agent update? Rebuild your AMIs. You're coupling agent lifecycle to application lifecycle, which creates deployment dependencies that don't need to exist.

## The Hidden Cost Nobody Talks About

Agents consume resources. Everyone knows this, but nobody calculates the real cost at scale.

Agent overhead per instance:

- CPU: 2-5% constant usage [[Datadog Agent Resource Usage](https://docs.datadoghq.com/tracing/troubleshooting/agent_apm_resource_usage/)]
- Memory: 200-500MB resident
- Network: Constant polling, heartbeats, metric shipping
- Compute cost: $3-5 per instance per month

That sounds small. But multiply by 10,000 instances.

10,000 instances x $4/month = $40,000/year just in compute overhead. That's before you count operational costs: agent updates, debugging crashed agents, certificate rotation, credential management, version compatibility testing across your fleet.

Recent research on serverless systems shows computational overhead from agents equivalent to 10-40% of CPU cycles spent on request handling, primarily from instance churn and agent initialization [[ArXiv Serverless Overhead](https://arxiv.org/html/2509.03104)]. Auto-scaling environments pay this cost constantly as pods and instances cycle.

The accuracy problem costs even more. Agents miss short-lived resources that terminate before registration completes. Agents can't see managed services at all. Agent failures create blind spots where resources exist but your CMDB doesn't know about them.

Research shows 81% of organizations struggle with asset visibility gaps [[Vertice](https://www.vertice.one/explore/cloud-visibility)]. When your CMDB is 5-10% inaccurate, security teams miss unencrypted databases, compliance audits fail, and FinOps teams make budget decisions based on incomplete data.

## APIs Changed Everything (And Nobody Adjusted)

Cloud providers built APIs for every service. AWS has APIs. Azure has APIs. GCP has APIs. Every managed service exposes configuration through APIs. We have a better way to do discovery, but we're still installing agents because that's what CMDBs have always done.

Every cloud service has an API. EC2's `DescribeInstances` returns instance metadata [[AWS EC2 API](https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_DescribeInstances.html)]. S3's `GetBucketPolicy` returns bucket configurations [[AWS S3 API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetBucketPolicy.html)]. RDS's `DescribeDBInstances` returns database parameters [[AWS RDS API](https://docs.aws.amazon.com/AmazonRDS/latest/APIReference/API_DescribeDBInstances.html)]. APIs are consistent, documented, versioned, and detailed.

Here's how you discover RDS configuration:

```bash
# Try installing an agent on RDS (spoiler: you can't)
ssh rds.example.amazonaws.com
# Permission denied (there's no OS to SSH into)

# Use the API instead
aws rds describe-db-instances --db-instance-identifier prod-db

# Returns JSON with 50+ configuration parameters:
# - Instance class, storage, IOPS
# - Encryption settings (at-rest, in-transit)
# - Backup configuration and retention
# - Network configuration (VPC, subnets, security groups)
# - IAM authentication settings
# - Multi-AZ configuration
# - Read replica topology
```

The API returns everything. No agent installation required. No SSH access needed. No compute overhead. Just query the API, parse JSON, and store the results.

What APIs give you:

- No installation, no maintenance, no patching
- Works for services without OS (S3, Lambda, DynamoDB, CloudFront)
- Consistent data model across all resource types
- Read-only access via IAM (least privilege security)
- Instant discovery of new resources (no registration lag)

Rate limits are manageable. AWS `DescribeInstances` falls into the highest tier of API throttling limits as a read-only Describe action [[AWS EC2 API Throttling](https://docs.aws.amazon.com/ec2/latest/devguide/ec2-api-throttling.html)]. AWS Cloud Map's `DiscoverInstances` allows 2,000 requests per second with a 1,000 token/second refill rate [[AWS Cloud Map Throttling](https://docs.aws.amazon.com/cloud-map/latest/dg/throttling.html)]. Pagination handles large datasets. Exponential backoff handles burst traffic. CloudQuery's benchmark shows 581 GB/hour throughput for API-based discovery [[CloudQuery Benchmark](https://www.cloudquery.io/blog/cloudquery-performance-benchmark-analysis-581gb-throughput-reality-cloud-api-constraints)].

You can discover 100,000 resources faster via API than you can install agents on 1,000 servers.

## Security Model Flip

Agents create security risks we've normalized because we've been using them for 20 years.

Every agent is another binary to patch. CVEs hit agent software just like any other application. When a vulnerability drops, you need to update agents across your entire fleet. That's 10,000 package updates, 10,000 service restarts, 10,000 opportunities for something to break.

Agents run with elevated privileges because they need visibility into system resources. That means agent compromise gives attackers elevated access on every host. An attacker who compromises an agent binary can potentially move laterally across your infrastructure because agents are installed everywhere with consistent privilege levels.

Credential storage happens on every instance. Each agent needs credentials to authenticate with your CMDB. That's 10,000 credential stores you need to manage, rotate, and audit. If one instance is compromised, those credentials are exposed.

API-based discovery flips the security model. You create a single IAM role with read-only permissions. That role can assume cross-account roles to discover resources in multiple AWS accounts. Permissions are scoped to exactly what's needed: `ec2:Describe*`, `rds:Describe*`, `s3:GetBucket*`. No write permissions. No instance-level credentials. No software running on your infrastructure.

AWS CloudTrail logs every API call. You get an audit trail of every discovery operation: who called which API, when, and what data was accessed. Try getting that audit trail from 10,000 agents writing to local log files.

Centralized credential management means one place to rotate secrets. Need to rotate your discovery credentials? Update one IAM role. Done. No package deploys, no service restarts, no coordination across 10,000 instances.

The blast radius shrinks. Agent compromise affects every host running that agent. API credential compromise affects one read-only IAM role that you can revoke in seconds.

## The Transition Path (How to Actually Do This)

You don't rip out agents overnight. Here's the pragmatic approach.

Start with cloud-native infrastructure where APIs provide complete coverage. AWS, Azure, and GCP expose APIs for compute, storage, networking, security, and managed services. Every resource type has a corresponding API.

For managed services, you have no choice. RDS, DynamoDB, S3, Lambda, API Gateway, CloudFront - there's no agent option. Use APIs or have zero visibility.

For containers and serverless, APIs are more efficient. Query the Kubernetes API for pod inventory instead of running sidecar agents. Query the Lambda API for function configurations instead of trying to instrument functions that run for 200ms.

For EC2 instances, you can choose. If you need host-level metrics (CPU per process, network connections, file system usage), keep agents. If you need instance metadata (AMI, instance type, security groups, IAM role, network interfaces), APIs provide that data without installing anything. Most teams realize they only need instance metadata for CMDB purposes, and host-level metrics come from CloudWatch.

Tools exist for API-based discovery. CloudQuery syncs data from 70+ cloud and SaaS providers to your database [[CloudQuery Integrations](https://www.cloudquery.io/hub)]. Steampipe provides live API queries without data synchronization [[Steampipe](https://github.com/turbot/steampipe)]. Native cloud services like [AWS Config](https://www.cloudquery.io/blog/aws-config-vs-cloudquery), Azure Resource Graph, and Google Cloud Asset Inventory provide API-driven inventory within single cloud providers.

For on-premises infrastructure, agents still make sense. Your physical data center doesn't have cloud APIs. Legacy servers don't expose REST endpoints. Network devices use SNMP or SSH. Keep agents there. Use APIs everywhere else.

## Key Takeaways: Agent-Based vs Agentless Discovery

**Implementation & Cost:**

- Agent overhead: 2-5% CPU, 200-500MB memory per instance, $30K-$50K/year at 10,000-instance scale
- API discovery: Zero compute overhead on discovered infrastructure, centralized credential management, one-time setup
- Operational burden: Agents require patching, version management, debugging across entire fleet
- CloudQuery eliminates agent deployment entirely with API-based sync across 70+ cloud and SaaS providers

**Technical Architecture:**

- Agents cannot install on 70-80% of cloud services (RDS, S3, Lambda, DynamoDB, managed services)
- APIs provide 50-100+ configuration attributes per resource with read-only access
- Serverless and container environments lose 10-40% of CPU cycles to agent initialization churn during auto-scaling
- CloudQuery syncs complete infrastructure state via APIs with [581 GB/hour throughput](https://www.cloudquery.io/blog/cloudquery-performance-benchmark-analysis-581gb-throughput-reality-cloud-api-constraints), covering resources agents cannot reach

**Security & Reliability:**

- API approach: Read-only IAM, centralized auditing via CloudTrail, scoped least-privilege access
- Agent approach: Elevated privileges on every instance, distributed credential storage, lateral movement risk
- Visibility gaps: 81% of organizations struggle with asset inventory accuracy, agents miss short-lived resources
- CloudQuery provides complete visibility across multi-cloud environments without installing a single agent

## Agents Are Dead. Long Live APIs.

Cloud infrastructure is fundamentally API-driven. When 70-80% of your AWS resources are managed services with no OS to install agents on, agent-based discovery is fighting against the architecture instead of working with it.

The future is agentless, multi-cloud, API-first. Organizations that adjust their CMDB approach to match cloud architecture get better visibility, lower costs, and fewer operational headaches. CloudQuery was built specifically for this API-driven world - syncing cloud infrastructure data from [AWS](https://www.cloudquery.io/hub/plugins/source/cloudquery/aws), [Azure](https://www.cloudquery.io/hub/plugins/source/cloudquery/azure), [GCP](https://www.cloudquery.io/hub/plugins/source/cloudquery/gcp), and 70+ other providers without requiring a single agent installation.

"We removed 10,000 agents and replaced them with 100 lines of Python calling APIs. Our CMDB is more accurate now, and we saved $40K/year in agent overhead."

That's the path forward. Start with managed services where agents don't work anyway. Expand to containers and serverless where agents add overhead without value. Keep agents only where APIs don't exist.

CloudQuery makes this transition straightforward: connect your cloud accounts with read-only credentials, sync infrastructure data to [PostgreSQL](https://www.cloudquery.io/hub/plugins/destination/cloudquery/postgresql), [BigQuery](https://www.cloudquery.io/hub/plugins/destination/cloudquery/bigquery), [Snowflake](https://www.cloudquery.io/hub/plugins/destination/cloudquery/snowflake), or any SQL database, and query your complete infrastructure without managing agent deployments.

## Try CloudQuery Today

Ready to eliminate agents from your CMDB discovery workflow?

**[Start with CloudQuery](https://www.cloudquery.io/download)**

CloudQuery provides:

- **Zero agent deployment** - API-based discovery across all cloud providers
- **Complete visibility** - Discover managed services, containers, and serverless resources agents cannot reach
- **Multi-cloud support** - Unified view across AWS, Azure, GCP, and 70+ integrations
- **SQL-based analysis** - Query infrastructure data with familiar SQL instead of proprietary tools
- **Open source foundation** - Self-hosted or managed cloud options

Get started in minutes, not weeks. No agent rollout required.

**New to CloudQuery?** Follow our step-by-step tutorial: [Building an AWS Cloud Asset Inventory](https://www.cloudquery.io/blog/building-cloud-asset-inventory-with-aws) - learn how to set up CloudQuery, sync AWS infrastructure data, and visualize your cloud assets.

## Frequently Asked Questions

### What is agentless discovery?

Agentless discovery uses cloud provider APIs to inventory resources without installing software on each asset. It queries APIs like AWS `DescribeInstances`, Azure Resource Graph, or GCP Cloud Asset Inventory to collect configuration data, providing visibility across managed services, containers, and serverless workloads where agents cannot run.

### What is the difference between agent-based and agentless discovery?

Agent-based discovery installs software on every resource, consuming 2-5% CPU and 200-500MB memory per instance while requiring ongoing patching and maintenance. Agentless discovery calls cloud provider APIs directly with zero installation, works for managed services like RDS and S3 where agents cannot run, and uses centralized read-only credentials instead of distributed agent authentication.

### How much does agent overhead cost at scale?

Agents consume $3-5 per instance per month in compute overhead (CPU, memory, network). At 10,000 instances, agent overhead costs $30K-$50K annually before counting operational costs for patching, debugging, and credential management. Serverless environments experience 10-40% additional CPU overhead from agent initialization churn during auto-scaling [[ArXiv](https://arxiv.org/html/2509.03104)].

### Can agentless discovery work for containers and serverless?

Yes. Agentless discovery queries the Kubernetes API for pod inventory (`namespace`, image, resource limits, volume mounts) or AWS Lambda API for function configurations (runtime, memory, timeout, environment variables, IAM role). This eliminates sidecar agent overhead in containers and works for serverless where agents cannot initialize fast enough for 100-200ms function execution times.

### What cloud providers support agentless discovery?

AWS, Azure, and GCP provide APIs for all resource types. AWS offers `Describe*` APIs for EC2, RDS, S3, Lambda, and 200+ services. Azure provides Resource Graph with KQL queries. GCP offers Cloud Asset Inventory API. Tools like CloudQuery support 70+ integrations [[CloudQuery](https://www.cloudquery.io/hub)], and Steampipe supports 140+ data sources [[Steampipe](https://github.com/turbot/steampipe)] across cloud providers, SaaS platforms, and infrastructure systems.

### Do APIs have rate limits that make discovery slow?

AWS Describe APIs have high rate limits (5,000+ requests/second for read operations) [[AWS](https://docs.aws.amazon.com/ec2/latest/devguide/ec2-api-throttling.html)]. CloudQuery demonstrates 581 GB/hour throughput for API-based discovery [[CloudQuery](https://www.cloudquery.io/blog/cloudquery-performance-benchmark-analysis-581gb-throughput-reality-cloud-api-constraints)]. Pagination and exponential backoff handle large datasets efficiently. API-based discovery scales better than 10,000 agents simultaneously polling endpoints.

### Are agents still needed for on-premises infrastructure?

Yes. On-premises data centers lack cloud provider APIs, so agents remain the primary discovery method for physical servers, network devices, and legacy applications. Hybrid approaches use API-based discovery for cloud resources (AWS, Azure, GCP) and agent-based discovery for on-premises systems, with agent footprint shrinking as workloads migrate to cloud.

### How do I migrate from agent-based to agentless discovery?

Start with managed services (RDS, S3, Lambda, DynamoDB) where agents cannot run. Implement API-based discovery using tools like CloudQuery, Steampipe, or cloud-native asset inventory services (AWS Config, Azure Resource Graph). Expand to containers and serverless where APIs provide complete visibility without agent overhead. Keep agents only for on-premises infrastructure lacking API access.
