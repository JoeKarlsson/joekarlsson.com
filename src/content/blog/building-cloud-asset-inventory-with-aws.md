---
title: 'Building an AWS Cloud Asset Inventory'
date: 2025-03-12
slug: 'building-cloud-asset-inventory-with-aws'
description: 'Learn how to build a cloud asset inventory in AWS using CloudQuery, PostgreSQL, and Grafana. This guide covers setting up CloudQuery, transforming data with dbt, and visualizing cloud assets for improved security and compliance.'
categories: ['DevRel', 'Databases']
tags: ['Tutorials', 'Cloud Asset Inventory', 'AWS']
heroImage: '/images/blog/building-cloud-asset-inventory-with-aws/thumbnail.png'
canonicalUrl: 'https://www.cloudquery.io/blog/building-cloud-asset-inventory-with-aws'
contentNotice: 'This post was originally published on CloudQuery blog.'
---

AWS is vast. Like, "wandering through a grocery store you've never been to before, with 87 aisles, and you're looking for _one_ specific brand of peanut butter" vast (Come on, you know what I'm talking about, right?). Well, in my opinion, keeping track of your AWS cloud assets? Even worse. If you've ever thought, "Do we actually need all these instances, or did someone just forget to turn them off in 2017?", then you probably need a Cloud Asset Management Tool. Welcome. You're in the right place.

We're going to set up an [AWS cloud asset inventory](https://www.cloudquery.io/hub/plugins/source/cloudquery/aws/latest/docs) using CloudQuery, the developer first, unified platform for cloud governance, security, and FinOps. But, this is not about CloudQuery, it's about getting your AWS resources under control and following some Cloud Asset Management Best Practices. But, yeah, CloudQuery happens to be the best way to do it.

![CloudQuery Platform's Cloud Asset Inventory interface](/images/blog/building-cloud-asset-inventory-with-aws/image1.gif)

**What This Post Covers:**

- Why you need a cloud asset inventory (yes, even you)
- How to sync your AWS data and actually make sense of it
- A simple, repeatable way to keep your inventory fresh

Grab some coffee. Let's get a handle on all your AWS resources.

## What is a Cloud Asset Inventory?

The core of any Cloud Asset Management solution is a Cloud Asset Inventory. Fundamentally, a Cloud Asset Inventory is a centralized database of all the cloud assets you're paying for.

A Cloud Asset Inventory is constructed by collecting information from the various Cloud Platform APIs (e.g. AWS, Google Cloud, Azure, etc.) and storing it in an accessible format, such as a SQL database.

## Why Bother with a Cloud Asset Inventory for AWS?

You know what's fun? Realizing your AWS bill is double what it should be because **someone left a fleet of forgotten RDS instances running**. Or, better yet, getting an auditor's email that politely asks, "So, uh, where's the compliance data for this region?" and you have no idea that region even exists.

An asset inventory helps with:

- **Security** - Find what's exposed before hackers do.
- **Compliance** - Know where your data lives.
- **FinOps** - Stop paying for things you don't use.

It's like spring cleaning but for your cloud. And less emotionally distressing than finding out your old hoodie has been living under the couch for three years.

You may have heard that AWS Config is great if you want continuous monitoring and compliance checks within AWS. But here's the catch - it's AWS-only and event-driven. CloudQuery, on the other hand, doesn't just stop at AWS. It pulls in data from multiple clouds and SaaS providers, giving you a full picture of all your cloud infrastructure in one place.

Plus, AWS Config charges you per rule, per change - which can add up fast. CloudQuery? Flat cost and query-driven, so you only look at the data you care about. Want to analyze everything across accounts, regions, and services without worrying about AWS billing surprises? CloudQuery's got you.

## How to Sync Your AWS Cloud Config Data

### Step 1: Sign Up for CloudQuery

You'll need a [CloudQuery account](https://www.cloudquery.io/contact-us). No account, no inventory.

### Step 2: Set Up Your Data Sync

[Connect AWS with CloudQuery](https://www.cloudquery.io/hub/plugins/source/cloudquery/aws/latest/docs) with all the tables you need for your inventory. You can find a list here: [https://www.cloudquery.io/hub/plugins/source/cloudquery/aws/latest/tables](https://www.cloudquery.io/hub/plugins/source/cloudquery/aws/latest/tables)

### Step 3: Run Your Data Sync

Click **Run Sync**. Watch in awe as your AWS are synced to CloudQuery.

## Making Your Cloud Inventory Actually Useful

Now that you've got your AWS inventory set up, what do you actually do with it? It's not just about having a list of resources - it's about making sense of them.

For different teams, this means different things:

- Security teams need to lock down misconfigurations before they turn into headline-worthy breaches.
- Governance teams want to cross-check policies without manually clicking through the AWS console (because that's a special kind of pain).
- FinOps folks are on a mission to find and kill zombie resources before they eat the budget.

Here's how each team can put CloudQuery to work with real queries:

![A demo of CloudQuery Platform's SQL Console.](/images/blog/building-cloud-asset-inventory-with-aws/image3.gif)

## Security Teams: Find Misconfigurations and Exposed Resources

Security teams need to **identify misconfigured resources before attackers do**. The challenge? AWS environments are constantly changing, and what was secure yesterday might be a risk today. Without a clear view of your cloud assets, it's easy for **publicly accessible storage, overly permissive security groups, and unencrypted data** to slip through the cracks. These example queries help **pinpoint security gaps** so you can fix them before they become someone else's opportunity.

### Find all publicly accessible S3 buckets

Public S3 buckets are a common security risk. This query quickly **identifies exposed storage** that could leak sensitive data.

```sql
SELECT
    name,
    region,
    public_access
FROM
    aws_s3_buckets
WHERE
    public_access = true;
```

### List security groups with open SSH (port 22) access to the world

If an EC2 security group allows **SSH access from anywhere**, that's an **open door** for attackers. This query finds those weak spots.

```sql
SELECT
    security_group_id,
    description,
    ip_permissions
FROM
    aws_ec2_security_groups
WHERE
    '0.0.0.0/0' = ANY(ip_permissions -> 'IpRanges');
```

### Detect EC2 instances without encryption enabled on their root volumes

Encryption ensures data remains **protected at rest**. This query flags instances where encryption is missing, helping security teams enforce compliance.

```sql
SELECT
    instance_id,
    instance_type,
    volume_id,
    encrypted
FROM
    aws_ec2_volumes
WHERE
    encrypted = false;
```

## Governance Teams: Cross-check Infrastructure Against Policies

Governance teams need visibility and accountability across cloud assets to ensure compliance. Without a clear inventory, policy enforcement becomes a guessing game - one that auditors love and engineers hate. Whether it's ensuring every resource is properly tagged, tracking down unauthorized deployments, or proving that your infrastructure actually follows internal security baselines, having queryable, structured data makes compliance a whole lot less painful.

### Find all IAM users who haven't logged in for 90+ days

Unused IAM accounts **increase the attack surface**. This query helps **audit inactive users** and decommission them.

```sql
SELECT
    user_name,
    last_login
FROM
    aws_iam_users
WHERE
    last_login < NOW() - INTERVAL '90 days';
```

### Identify untagged resources (cost allocation + compliance tracking)

If resources aren't tagged, **cost allocation, ownership tracking, and policy enforcement become a nightmare**. This query ensures **everything is labeled** properly.

```sql
SELECT
    resource_id,
    resource_type,
    tags
FROM
    aws_tagging_resources
WHERE
    tags IS NULL OR jsonb_array_length(tags) = 0;
```

### Check which AWS regions are in use (avoid shadow IT)

Teams often **forget** about regions they're not actively managing. This query **identifies where resources are actually running**, helping prevent surprise compliance issues.

```sql
SELECT
    DISTINCT region
FROM
    aws_ec2_instances;
```

---

## FinOps Teams: Identify Cost Savings Opportunities

FinOps folks want to slash unnecessary cloud costs, but finding wasted spend in AWS can feel like searching for loose change in a couch - except the couch is the size of a football field, and every seat cushion costs money. Unused instances, forgotten storage, and databases with over provisioned CPUs and memory add up fast. These queries help spot wasteful spending, right-size resources, and eliminate budget leaks before they drain your cloud budget.

![Running a query that identifies underutilized compute instances.](/images/blog/building-cloud-asset-inventory-with-aws/image4.gif)

### Find unused EC2 instances (low CPU usage over time)

Instances sitting **idle** waste money. This query helps teams **identify underutilized EC2 instances** to right-size or shut down.

```sql
SELECT
    instance_id,
    instance_type,
    AVG(cpu_utilization) as avg_cpu_usage
FROM
    aws_cloudwatch_metrics
WHERE
    metric_name = 'CPUUtilization'
GROUP BY
    instance_id, instance_type
HAVING
    AVG(cpu_utilization) < 5;
```

### Find unattached EBS volumes (orphaned storage costs)

Unused EBS volumes **still incur costs**. This query **identifies orphaned storage** so teams can **delete and save**.

```sql
SELECT
    volume_id,
    size_gb,
    state
FROM
    aws_ec2_volumes
WHERE
    state = 'available';
```

### Spot over-provisioned RDS instances (low CPU & memory usage)

Many teams **over-provision databases** without realizing it. This query **identifies RDS instances with too little CPU and Memory allocation**, helping **cut unnecessary costs**.

```sql
SELECT
    db_instance_identifier,
    db_instance_class,
    AVG(cpu_utilization) as avg_cpu_usage,
    AVG(memory_utilization) as avg_memory_usage
FROM
    aws_rds_metrics
WHERE
    metric_name IN ('CPUUtilization', 'FreeableMemory')
GROUP BY
    db_instance_identifier, db_instance_class
HAVING
    AVG(cpu_utilization) < 10 AND AVG(memory_utilization) < 20;
```

## Final Word

If you've been following along, then at this point, you've got a **fully synced AWS cloud asset inventory** with CloudQuery. No more guessing about what's running, where it lives, or how much it's costing you. You also now know:

- **Why you need an AWS cloud asset inventory** (because surprise bills and security gaps are fun for no one).
- **How to set up CloudQuery and sync your AWS resources** for a complete, up-to-date inventory.
- **How different teams - Security, Governance, and FinOps - can query this data** to solve real problems.

Now, let's talk about **what you can actually do with this data** beyond just looking at it. [CloudQuery](https://platform-api-docs.cloudquery.io/) is **developer-first**, meaning everything you do in the UI, you can also **automate and extend** via our **REST API**. Whether you want to integrate cloud asset data into your existing workflows or build something custom, the possibilities are endless. Here are a few ideas to get you started:

- **Integrate It Into Your App** - Pull in real-time cloud asset data wherever you need it.
- **Set Up Alerts & Notifications** - Get notified when misconfigurations or cost spikes happen.
- **Build Custom Dashboards** - Visualize your cloud footprint exactly how you want it.
- **Use CloudQuery's Built-in Dashboards** - No extra setup required - just log in and start exploring.

Having an inventory is one thing - **making it actionable is what really matters**. If you prefer to run CloudQuery from the command line, follow our step-by-step [AWS to PostgreSQL guide](https://www.cloudquery.io/docs/cli/getting-started/aws-to-postgresql) to sync your AWS resources into a local database in minutes. Ready to get started with the full platform? [**Reach out to our team**](https://www.cloudquery.io/contact-us) and start building smarter cloud governance today.

The best way to understand how CloudQuery transforms cloud visibility is to see it live. Our team can walk you through a tailored demo based on your cloud environment and use cases. Let's talk about how CloudQuery can fit into your stack. [Schedule a demo today](https://www.cloudquery.io/contact-us)

**Stay in the loop:**

- [Sign up for our newsletter](https://www.cloudquery.io/newsletter)
- [Join the CloudQuery Developer Community](https://community.cloudquery.io/)
- Follow us on [LinkedIn](https://www.linkedin.com/company/cloudqueryio), [X](https://x.com/cloudqueryio), and [YouTube](https://www.youtube.com/@cloudqueryio)
- **Check out the docs** [Read Documentation](https://www.cloudquery.io/docs/platform/introduction)

## Additional Resources

- [CloudQuery Platform API](https://platform-api-docs.cloudquery.io/)
- [CloudQuery REST API Guide](https://www.cloudquery.io/docs/platform/introduction#rest-api)
- [Google Cloud Asset Inventory 101](https://www.youtube.com/embed/c0LVkrTLmVY)
- [What is a Cloud Asset Inventory?](https://www.cloudquery.io/blog/what-is-a-cloud-asset-inventory)
- [Cloud Asset Inventory with AWS QuickSight](https://www.cloudquery.io/blog/cloud-asset-inventory-cloudquery-aws-quicksight)
- [Build an AWS Cloud Asset Inventory](https://www.youtube.com/embed/H5RpX5z4H40)

## FAQs

**Q: What is a Cloud Asset Inventory?**

A: A Cloud Asset Inventory is a centralized database that tracks all cloud resources and assets within an organization's cloud environment, such as AWS. It helps in monitoring, managing, and securing these assets effectively.

**Q: Why do I need a Cloud Asset Inventory for my AWS environment?**

A: An asset inventory helps improve security, ensure compliance, manage costs, and enhance operational efficiency by providing a comprehensive view of all cloud resources.

**Q: What is CloudQuery and how does it help with Cloud Asset Inventory?**

A: CloudQuery is a tool that collects and normalizes cloud infrastructure data from AWS and other cloud providers. It helps in building a cloud asset inventory by gathering detailed information about cloud resources.

**Q: How do I set up CloudQuery to gather AWS asset data?**

A: You need to configure CloudQuery with your AWS credentials and specify the resources you want to inventory. This setup involves creating a configuration file and running CloudQuery to sync data from AWS.

**Q: What are the prerequisites for setting up a Cloud Asset Inventory with CloudQuery?**

A: Basic knowledge of AWS, SQL, and command-line interface is required. You also need an AWS account with the necessary permissions and PostgreSQL installed locally.

**Q: How does CloudQuery address the limitations of traditional asset inventory solutions?**

A: CloudQuery provides a highly customizable solution that allows organizations to build their own asset inventories using their existing data warehouses and BI tools. This flexibility enables deeper insights, better integration with existing data, and reduces costs.

**Q: Can CloudQuery work with existing data warehouse and BI tools?**

A: Yes, CloudQuery can integrate seamlessly with your current stack of data warehouse and BI tools. This allows you to drive more insights by combining infrastructure data with other business data and leveraging the expertise of your existing tech team.

**Q: What is an infrastructure data lake and how does it relate to CloudQuery?**

A: An infrastructure data lake is a concept where all infrastructure-related data is collected and stored in a centralized repository for analysis. CloudQuery supports this idea by enabling organizations to gather and analyze comprehensive infrastructure data within their data warehouses.
