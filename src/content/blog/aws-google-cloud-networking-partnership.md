---
title: 'AWS + Google Cloud Networking Partnership: Connectivity Solved, Visibility Still Broken'
date: 2026-01-20
slug: 'aws-google-cloud-networking-partnership'
description: 'AWS and Google Cloud partnered on multicloud networking, provisioning connections in minutes. But network pipes were the easy problem. Unified visibility across different cloud APIs remains unsolved.'
categories: ['Work']
tags: ['Cloud Infrastructure', 'AWS', 'GCP']
heroImage: '/images/blog/aws-google-cloud-networking-partnership/thumbnail.webp'
canonicalUrl: 'https://www.cloudquery.io/blog/aws-google-cloud-networking-partnership'
contentNotice: 'This post was originally published on CloudQuery blog.'
---

![AWS + Google Cloud Networking Partnership header](/images/blog/aws-google-cloud-networking-partnership/header.webp)

In November 2025, AWS and Google Cloud [announced](https://cloud.google.com/blog/products/networking/aws-and-google-cloud-collaborate-on-multicloud-networking) something that would have seemed impossible a few years ago: a jointly-engineered multicloud networking partnership. AWS Interconnect - multicloud and Google Cross-Cloud Interconnect now let you provision private, high-speed connections between clouds in minutes instead of weeks.

This is good news. MACsec encryption between edge routers, quad-redundancy across facilities, an [open specification on GitHub](https://github.com/aws/AWSInterconnect) that other providers can adopt. Microsoft Azure is joining in 2026. The network engineers who spent weeks coordinating circuits and BGP configurations are probably relieved.

Here's the thing: network pipes were never the hard part of multi-cloud. You can now connect an AWS VPC to a Google Cloud VPC in minutes. You still don't know what's actually running in either one.

## What AWS and Google Actually Announced

The [partnership](https://aws.amazon.com/blogs/networking-and-content-delivery/aws-and-google-cloud-collaborate-to-simplify-multicloud-networking/) combines AWS Interconnect - multicloud with Google's Cross-Cloud Interconnect into a managed service. During preview, you get 1 Gbps connections across five US and European regions. General availability will scale to 100 Gbps.

The technical specs matter for network teams. MACsec encryption is mandatory - hardware won't transmit traffic unless encryption is active. Quad-redundancy means physically separate interconnect facilities and routers. Continuous monitoring catches issues before they cause outages. The APIs follow an open specification, so this isn't a proprietary lock-in play.

David Terrar, CEO of the UK Tech Industry Forum, [noted](https://www.networkworld.com/article/4098773/aws-finally-moves-to-simplify-multicloud-operations-with-google.html): "It's important to have an open standard, it's the ideal way of simplifying things."

Fair point. Simplifying network provisioning and simplifying multi-cloud operations are two different problems entirely.

## Why Network Connectivity Was the Easier Problem

Networking fundamentals are well-understood. BGP has been routing traffic since 1994. Dedicated fiber connections between data centers aren't new. Companies like Megaport and Equinix have offered cross-cloud connectivity for years. AWS Direct Connect and GCP Cloud Interconnect already existed separately.

What the partnership actually delivers is convenience. Instead of coordinating with multiple vendors, managing physical circuits, and configuring routers manually, you click a button in either console. Provisioning drops from weeks to minutes. That's a real improvement for teams building hybrid architectures.

Convenience wasn't the blocking issue for most multi-cloud teams, though. The blocking issue is that AWS and Google Cloud speak completely different languages.

## The Harder Problem: Multi-Cloud Visibility

When you call AWS's [`DescribeInstances`](https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_DescribeInstances.html) API, you get back a specific JSON schema with fields like `InstanceId`, `InstanceType`, and `SecurityGroups`. When you call GCP's [`compute.instances.list`](https://cloud.google.com/compute/docs/reference/rest/v1/instances/list), you get a completely different schema with `id`, `machineType`, and `networkInterfaces`.

Same concept - "list my virtual machines" - but different authentication methods, different pagination strategies, different rate limits, and different response structures. Now multiply that across storage, databases, IAM, networking, and serverless resources. AWS uses IAM roles. GCP uses service accounts. Azure uses managed identities. Each has different permission models, different policy languages, different ways of expressing "this service can access that bucket."

According to a [Futuriom survey](https://www.networkworld.com/article/4098773/aws-finally-moves-to-simplify-multicloud-operations-with-google.html), 82% of enterprises expect AI growth will accelerate multicloud deployment demand. More clouds means more API inconsistency, more data model fragmentation, more security teams checking three different consoles to answer one question.

A faster network pipe doesn't help when you can't answer: "Which resources across all our clouds are missing encryption right now?"

## Networking vs Visibility: The Real Comparison

| Challenge          | Network Connectivity          | Visibility and Governance                                       |
| ------------------ | ----------------------------- | --------------------------------------------------------------- |
| AWS-Google status  | Solved (partnership)          | Unsolved                                                        |
| Technical approach | BGP, dedicated bandwidth      | API normalization across providers                              |
| Implementation     | Minutes with new service      | Requires tooling and ongoing work                               |
| Underlying APIs    | Standard networking protocols | Provider-specific (DescribeInstances vs compute.instances.list) |
| Data model         | IP addresses, routes          | 50+ attributes per resource, different schemas                  |

### Terminology

**API-based discovery** means calling cloud provider APIs directly to get current resource state, rather than installing agents or running network scans. AWS returns EC2 data through `DescribeInstances`, GCP through `compute.instances.list`.

**Multi-cloud asset inventory** is a unified view of resources across cloud providers, typically stored in a SQL database for querying. Instead of checking three consoles, you run one query.

**Data normalization** is the process of mapping different schemas into comparable formats - so AWS tags and GCP labels can be queried together.

## What Unified Visibility Actually Requires

Solving multi-cloud visibility means normalizing data across fundamentally different APIs. You need to handle authentication for each cloud - AWS credentials, GCP service accounts, Azure service principals. You need to understand each provider's rate limits and pagination. You need continuous syncing of compute, storage, IAM, databases, and serverless resources - not just network state.

This is where cloud asset inventory approaches come in. Tools like [CloudQuery](https://www.cloudquery.io/docs/cli/getting-started) call APIs like `DescribeInstances` and `compute.instances.list`, extract the full resource schemas, and load everything into SQL databases. Instead of three consoles, you write one query across `aws_ec2_instances` and `gcp_compute_instances`. The goal: answer "show me all unencrypted storage" regardless of which cloud the buckets live in.

The [CloudQuery Hub](https://www.cloudquery.io/hub/plugins/source) covers 90+ providers with 600+ tables. But the broader point isn't about any specific tool - it's that multi-cloud visibility requires active data normalization work that no network partnership will solve.

## Key Takeaways

- AWS and Google's partnership makes network connectivity faster - credit where it's due
- But connectivity was never the blocking issue for most multi-cloud teams
- The real challenge: unified visibility and governance across different APIs and data models
- AWS `DescribeInstances` and GCP `compute.instances.list` return completely different schemas
- Solving multi-cloud requires normalizing data from different APIs into queryable formats
- Faster network pipes don't help if you can't see what's running through them

## Moving Forward

As multi-cloud adoption accelerates - 82% of enterprises expect AI to drive more of it - the visibility gap widens. The AWS-Google partnership removes network friction, and that's useful progress. But don't confuse faster network provisioning with operational visibility.

Platform engineers still need unified asset inventory across clouds. Security teams still need to query resources regardless of which provider hosts them. The announcement addresses the easier problem. The harder one remains.

## Frequently Asked Questions

### What did AWS and Google Cloud announce about multicloud networking?

In November 2025, AWS and Google Cloud [announced](https://cloud.google.com/blog/products/networking/aws-and-google-cloud-collaborate-on-multicloud-networking) a jointly-engineered partnership combining AWS Interconnect - multicloud and Google Cross-Cloud Interconnect. The service provisions private, encrypted connections between clouds in minutes instead of weeks, with MACsec encryption and quad-redundancy.

### Why is multi-cloud visibility harder than multi-cloud networking?

Networking uses standard protocols like BGP that work the same everywhere. Cloud visibility requires normalizing completely different APIs - AWS `DescribeInstances` returns different data structures than GCP `compute.instances.list`. Each provider also uses different authentication, rate limits, and IAM models.

### What is AWS Interconnect - multicloud?

AWS Interconnect - multicloud is AWS's managed service for private connectivity to other cloud providers. During preview, it offers 1 Gbps connections to Google Cloud across five regions, scaling to 100 Gbps at general availability. The [open specification](https://github.com/aws/AWSInterconnect) allows other providers to adopt the standard.

### How do cloud asset inventory tools help with multi-cloud visibility?

Cloud asset inventory tools call each provider's APIs (like `DescribeInstances` for AWS), extract resource data with full schemas, and load it into SQL databases. This lets teams query across clouds with standard SQL instead of checking multiple consoles. [CloudQuery](https://www.cloudquery.io/docs/cli/getting-started) supports 90+ providers through this approach.

### When will Microsoft Azure join the AWS-Google networking partnership?

According to the [announcement](https://aws.amazon.com/blogs/networking-and-content-delivery/aws-and-google-cloud-collaborate-to-simplify-multicloud-networking/), Microsoft Azure is planned to join the service in 2026.

### What are the main challenges of managing resources across multiple clouds?

The main challenges include different APIs and data models per provider, inconsistent IAM systems (AWS roles vs GCP service accounts vs Azure managed identities), fragmented tagging and labeling conventions, and no unified query language across providers. Network connectivity doesn't address any of these.
