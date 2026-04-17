---
title: Stop Wasting Time on Cloud UIs and Scripts, and Query Your Cloud Like a Database
date: 2025-03-12
slug: 'query-cloud-like-database-stop-wasting-time'
description: 'CloudQuery SQL Console lets you search your cloud like a database. No more clicking through endless dashboards or writing brittle scripts - just instant answers with SQL.'
categories: ['Work']
tags: ['Product News']
canonicalUrl: 'https://www.cloudquery.io/blog/query-cloud-like-database-stop-wasting-time'
contentNotice: 'This post was originally published on CloudQuery blog.'
---

Managing cloud infrastructure shouldn't feel like looking for a lost sock in the laundry - except the laundry is on fire, and the sock is in another house. Yet, that's exactly how it feels when you're trying to track down misconfigured resources, security risks, or compliance violations across cloud providers like, AWS, GCP, Azure, and Kubernetes.

Cloud providers offer their own UIs, but they are slow, fragmented, and often lack the flexibility to filter and analyze data efficiently.

Ah yes, you _could_ write your own scripts to get this data. Except now, you're maintaining a pile of one-off Python scripts that break every time a cloud provider sneezes. And by the time you gather all the data you need, it's already outdated.

Let's not even get started on spreadsheets...

![A meme featuring scenes of Pablo Escobar, from the TV show Narcos, looking bored and contemplative. It reads, "Me, waiting for Excel to respond after applying a filter on a million-row dataset."](/images/blog/query-cloud-like-database-stop-wasting-time/image1.png)

These inefficiencies come at a cost:

- **Security blind spots**: If you can't see all your cloud assets, you can't secure them.
- **Compliance nightmares** - Manually checking encryption settings, IAM policies, and asset configurations is a one-way ticket to regret.
- **Operational slowdowns** - Debugging cloud issues or optimizing resources across multiple platforms shouldn't take longer than a Lord of the Rings marathon.

Cloud infrastructure is complex, but getting visibility into it shouldn't be. That's where **CloudQuery's new SQL Console** comes in.

## Introducing CloudQuery's SQL Console

CloudQuery's SQL Console is what happens when someone looks at cloud management and says, "Wait, what if this didn't suck?" Instead of clicking through endless dashboards to answer questions about your cloud, you just run a SQL query.

Need to find all your publicly accessible S3 buckets?

Want to check which instances are running with outdated AMIs?

Trying to figure out why your cloud bill suddenly looks like a phone number?

SQL. That's it.

![CloudQuery's SQL Console in action. The interface shows a dark-themed SQL editor where a query is being written and executed.](/images/blog/query-cloud-like-database-stop-wasting-time/image2.gif)

## How CloudQuery Turns Your Cloud into a SQL Database

CloudQuery fixes this by treating your cloud assets like a structured database - because that's exactly what they should be. Instead of bouncing between AWS, GCP, and Azure dashboards or exporting CSVs like it's 1999, you can run SQL queries and get instant answers.

At its core, CloudQuery extracts data from your cloud providers (AWS, GCP, Azure, Kubernetes, and [more](https://www.cloudquery.io/hub/)) and normalizes it into a [ClickHouse](https://clickhouse.com/) database. If you're not familiar with ClickHouse, just know this: it's ridiculously fast, and it's built for large-scale analytical queries.

This means you can search, filter, and analyze your entire cloud infrastructure. No waiting, no stale reports, no "please hold while we process your request."

## Practical Examples of Cloud Governance with the SQL Console

Cloud governance is just about keeping your cloud secure, compliant, and cost-efficient. With our SQL console, you ask a question, and you get an answer**.** Let's look at how this actually helps in real-world scenarios.

### Security: Catching Expired SSL Certificates

Picture this: It's 9 a.m. on a Monday. You're on your second coffee when suddenly, the alerts start rolling in. Users are screaming. Your API is down. The culprit? An **expired SSL certificate.** Classic.

However, you don't have to wait for your customers to find out first. Just run this query and check which certificates are about to expire:

```sql
SELECT
    account_id,
    arn,
    domain_name,
    not_after AS expiry_date,
    status,
    NOW() AS current_time,
    not_after < NOW() AS is_expired
FROM
    aws_acm_certificates
ORDER BY
    not_after ASC;
```

### Compliance: Stopping Cloud Resources from Wandering into the Wrong Regions

Ever had that moment when you realized someone spun up an EC2 instance in a region you _definitely_ don't operate in? Maybe it was an intern? Either way, **running resources in unauthorized regions** is a compliance and security nightmare.

This query helps you track down any rogue resources before they become a problem:

```sql
SELECT cloud, account, name, region, resource_type
FROM cloud_assets
WHERE region NOT IN ('us-east-1', 'us-west-1', 'eu-west-1');
```

### FinOps: Cleaning Up Old Snapshots and Saving Money

Let's talk about **cloud bills**. Specifically, the horrifying moment you realize you're paying for ancient RDS snapshots that no one even remembers creating.

Snapshots are great for backups, but keeping old ones around forever? That's just burning money**.** This query finds snapshots older than six months so you can clean house:

```sql
SELECT arn, allocated_storage, engine
FROM aws_rds_db_snapshots
WHERE instance_create_time < NOW() - INTERVAL '180 days'; -- Older than 6 months
```

You'd be surprised how much unnecessary storage you're paying for. Run this query, delete the stuff you don't need, and watch your cloud bill shrink.

## What's Next?

These are just a few examples, but the impact is huge:

- Security issues get fixed before they break production.
- Compliance violations get caught before an audit makes them your problem.
- Cloud costs drop because you're only paying for what you actually need.

Cloud governance doesn't have to be hard. With CloudQuery, you get instant answers to cloud security risks, compliance gaps, and cost inefficiencies - without the endless clicking, brittle scripts, or outdated spreadsheets.

Want to try CloudQuery? The best way to see how it gives you full visibility into your cloud is to see it in action. Our team can walk you through a live demo tailored to your cloud environment and use cases. Let's see how CloudQuery fits into your stack. [Schedule a demo today](https://www.cloudquery.io/contact-us)

**Stay in the loop:**

- [Sign up for our newsletter](https://www.cloudquery.io/newsletter)
- [Join the CloudQuery Developer Community](https://community.cloudquery.io/)
- Follow us on [LinkedIn](https://www.linkedin.com/company/cloudqueryio), [X](https://x.com/cloudqueryio), and [YouTube](https://www.youtube.com/@cloudqueryio)
- **Check out the docs:** [Read Documentation](https://www.cloudquery.io/docs/platform/introduction)

Want more examples of how people are using the CloudQuery SQL Console?

- [**What services are publicly exposed?**](https://www.cloudquery.io/blog/find-publicly-accessible-s3-buckets-aws)
- [**How to List All EC2 Instances Across Multiple Accounts and Regions**](https://www.cloudquery.io/blog/how-to-list-all-ec2-instances-across-all-aws-regions)
- [**How to Find Azure Resources Affected by TLS 1.0/1.1 Deprecation**](https://www.cloudquery.io/blog/azure-tls-deprecation-guide)
- [**Which cloud resources have expired SSL certificates?**](https://www.cloudquery.io/blog/list-expired-ssl-certificates-aws)
