---
title: 'Building a Multi-Cloud Asset Inventory for Google Cloud Platform (GCP) and AWS with CloudQuery'
date: 2024-10-25
slug: 'complete-guide-building-multi-cloud-asset-inventory'
description: 'Learn how to build a unified multi-cloud asset inventory with CloudQuery. This post covers pulling data from AWS and GCP, storing it in PostgreSQL, and querying your cloud assets with ease.'
categories: ['DevRel', 'Databases']
tags: ['Tutorials']
heroImage: '/images/blog/complete-guide-building-multi-cloud-asset-inventory/complete-guide-building-multi-cloud-asset-inventory.webp'
canonicalUrl: 'https://www.cloudquery.io/blog/complete-guide-building-multi-cloud-asset-inventory'
contentNotice: 'This post was originally published on CloudQuery blog.'
---

Managing assets across multiple cloud providers like AWS and GCP can be challenging, especially when you are trying to keep track of everything in one place. What if you could centralize this data and make it easy to query? That's exactly what we'll be doing in this live coding session. Using **CloudQuery**, we'll demonstrate how to pull cloud asset data from [**AWS**](https://www.cloudquery.io/hub/plugins/source/cloudquery/aws/latest/docs) and [**GCP**](https://www.cloudquery.io/hub/plugins/source/cloudquery/gcp/latest/docs) and store it in a [**PostgreSQL**](https://www.cloudquery.io/hub/plugins/destination/cloudquery/postgresql/latest/docs) database for easy access and analysis.

![Diagram illustrating a multi-cloud asset inventory workflow powered by CloudQuery. The image shows data flow from various cloud sources (AWS, Google Cloud, and Microsoft Azure) through CloudQuery's ETL process into a PostgreSQL database. The data is then used for analytics and visualizations.](/images/blog/complete-guide-building-multi-cloud-asset-inventory/complete-guide-building-multi-cloud-asset-inventory.webp)

We'll cover the entire process - from configuring CloudQuery for multi-cloud data ingestion to running queries that help you manage, secure and understand your cloud assets.

If you want to follow along with a video version of this post, you can check that out here:

[![Live Coding: Building a Multi-Cloud Asset Inventory with AWS & GCP using CloudQuery and Postgres YouTube Video](/images/blog/complete-guide-building-multi-cloud-asset-inventory/video-thumbnail.webp)](https://www.youtube.com/embed/nFA2C5JgjPw)

## Key Takeaways

- How to configure **CloudQuery** to pull asset data from both **AWS** and **GCP**.
- Setting up **PostgreSQL** as the backend to store and query cloud asset information.
- An introduction to **ETL (Extract, Transform, Load)** processes to bring in cloud data.
- Best practices for querying and managing cloud resources in a multi-cloud environment.

## Why Build a Multi-Cloud Asset Inventory?

As companies increasingly rely on multiple cloud providers, keeping track of resources becomes crucial for operations and security. Cloud assets like storage buckets, virtual machines, and security policies often span multiple clouds. Without centralized oversight, it's easy to lose track of important assets, leading to security vulnerabilities, inefficiencies, and unnecessary spend.

Using **CloudQuery**, we can easily pull this data into a central database and ensure everything is visible from one location. This simplifies tracking down assets, audits their configurations, and ensures they comply with your security policies.

### Overview of the Process

Here's what we'll be doing:

1. **Install and configure CloudQuery**: Set up the tool that pulls in data from AWS and GCP.
2. **Set up PostgreSQL**: Store your cloud data in a robust, queryable database.
3. **Sync AWS and GCP data**: Import assets from both clouds into PostgreSQL.
4. **Run example queries**: Retrieve and analyze your cloud assets.

> **Note:** CloudQuery supports any source integration with any destination. You can find more information about the available integrations in the [CloudQuery Hub](https://www.cloudquery.io/hub/).

Let's dive in.

---

## Step 0: Prerequisites

Before jumping into the demo, you'll need to meet a few prerequisites to ensure everything runs smoothly. These setup steps will prepare your environment to sync cloud data from AWS and GCP into PostgreSQL. If you're new to CloudQuery, the [AWS to PostgreSQL quickstart](https://www.cloudquery.io/docs/cli/getting-started/aws-to-postgresql) covers the full setup end-to-end for AWS alone.

### 1. AWS Access

You will need AWS credentials to pull cloud asset data from AWS. You can check out all the ways to authenticate with AWS [here](https://www.cloudquery.io/hub/plugins/source/cloudquery/aws/latest/docs#authentication).

### 3. GCP Authentication

To access GCP assets, you'll need to authenticate using the [GCP CLI](https://cloud.google.com/sdk/docs/install). First, install the Google Cloud SDK if you don't already have it.

### 4. Docker

We'll be using [Docker](https://www.docker.com/) to run a PostgreSQL container where cloud assets from AWS and GCP will be stored. Make sure Docker is installed and running on your local machine before proceeding with the demo.

## Step 1: Installing CloudQuery

The first step is to install **CloudQuery**, which will act as the engine for pulling in cloud asset data. CloudQuery is open-source, which means it's free to use and easy to extend if needed. It supports a wide range of cloud providers, and in our case, we'll focus on AWS and GCP.

To get started, install CloudQuery using **Homebrew**:

```bash
brew install cloudquery/tap/cloudquery
```

After the installation, you'll need to log in using your CloudQuery credentials:

```bash
cloudquery login
```

This login gives CloudQuery access to your cloud accounts and allows it to pull in asset data. Once logged in, you're ready to start pulling in cloud data.

## Step 2: Setting Up PostgreSQL

Now, we need a place to store all this data. We'll use PostgreSQL, a powerful (and popular) open-source database that works great for storing structured data like cloud assets.

If you don't already have a PostgreSQL database set up, you can easily run one in a Docker container. This is a fast way to get things running without much setup. Here's the command to start PostgreSQL in Docker:

```bash
docker run --name postgres_container \
--restart unless-stopped \
--env POSTGRES_USER=postgres \
--env POSTGRES_PASSWORD=postgres \
--env POSTGRES_DB=asset_inventory \
--publish 5432:5432 \
--volume pgdata:/var/lib/postgresql/data \
postgres
```

This command will launch a PostgreSQL pre-configured container to store your cloud assets. The credentials are set to `postgres` for both the username and password, but you can adjust this as needed.

## Step 3: Configuring CloudQuery for AWS

Next, we'll configure CloudQuery to pull data from AWS and sync it to PostgreSQL. CloudQuery works by defining sources (like AWS) and destinations (like PostgreSQL). It then automates the process of syncing data between them.

Start by initializing a CloudQuery project for AWS:

```bash
cloudquery init --source=aws --destination=postgresql
```

This command sets up the necessary configurations for pulling data from AWS and storing it in PostgreSQL. The configurations are defined in a YAML file that CloudQuery generates for you. In our case, we're targeting AWS S3 buckets, but CloudQuery supports many other AWS resources like EC2 instances, security groups, and more.

Now, let's take a quick look at how we can define this process. Here's a basic example of what the configuration file looks like (`aws_to_postgresql.yaml`):

```yaml
kind: source
spec:
  # Source spec section
  name: aws
  path: cloudquery/aws
  registry: cloudquery
  version: 'v28.1.0'
  tables: ['aws_s3_buckets']
  destinations: ['postgresql']
---
kind: destination
spec:
  name: 'postgresql'
  path: 'cloudquery/postgresql'
  registry: 'cloudquery'
  version: 'v8.6.4'
  write_mode: 'overwrite-delete-stale'
```

This file tells CloudQuery to pull in AWS S3 buckets and store them in the PostgreSQL database running on localhost.

## Step 4: Syncing Data from AWS

With our configuration in place, we're ready to start syncing data.

To sync AWS data into PostgreSQL, run the following command:

```bash
cloudquery sync aws_to_postgresql.yaml
```

This will kick off the process of pulling S3 bucket data from AWS and storing it in your PostgreSQL database.

### Example 1: List AWS S3 Buckets

Now that we have data in PostgreSQL, let's run a simple query to list the first 10 S3 buckets:

```bash
docker exec -it postgres_container psql -U postgres -d asset_inventory -c 'SELECT name, region FROM aws_s3_buckets LIMIT 10;'
```

### Example 2: Identify Public Buckets

Let's get to something a little bit more interesting, since security is always a primary concern, let's write a query to identify any S3 buckets that have public access policies enabled:

```bash
docker exec -it postgres_container psql -U postgres -d asset_inventory -c "
SELECT
 name, arn, policy_status
FROM
 aws_s3_buckets
WHERE
 policy_status->>'isPublic' = 'true';
"
```

This query will show you which buckets are publicly accessible, which is a critical piece of information for platform security engineers.

## Step 5: Configuring CloudQuery for GCP

Once we have AWS data stored, we can repeat this process for GCP. Initialize CloudQuery for GCP with:

```bash
cloudquery init --source=gcp --destination=postgresql
```

Then, sync GCP data in the same way:

```bash
cloudquery sync gcp_to_postgresql.yaml
```

Now you'll have cloud asset data from both AWS and GCP stored in PostgreSQL.

## Step 6: Querying Your Cloud Assets

Once your cloud assets are stored in PostgreSQL, you can query them just like any other database. Let's look at a few useful queries.

### Example 3: Unified View Across AWS and GCP

Now, let's combine data from both AWS and GCP to get a unified view of our cloud storage buckets:

```bash
docker exec -it postgres_container psql -U postgres -d asset_inventory -c "
SELECT
 name AS bucket_name,
 creation_date AS created_date,
 region AS location,
 'AWS' AS cloud_provider
FROM
 aws_s3_buckets

UNION ALL

SELECT
 name AS bucket_name,
 created AS created_date,
 location AS location,
 'GCP' AS cloud_provider
FROM
 gcp_storage_buckets
ORDER BY
 created_date DESC;
"
```

This query lists all buckets from both AWS and GCP, showing their creation dates, locations, and which cloud provider they belong to. It's a simple way to track assets across clouds.

## Summary

Building a multi-cloud asset inventory allows you to centralize data from multiple providers like AWS and GCP, giving you better visibility and control over your cloud infrastructure. With CloudQuery and PostgreSQL, you can easily pull in data, store it, and query it all in one place.

By following this guide, you'll have a functional asset inventory, and you can start running queries to manage and secure your cloud resources more effectively.

_Want to see CloudQuery in action?_ [Schedule a demo with our team](https://www.cloudquery.io/contact-us) or check out the [platform documentation](https://www.cloudquery.io/docs/platform/introduction) to learn more.

Want help getting started? Join the [CloudQuery community](https://community.cloudquery.io/) to connect with other users and experts, or message our team directly [here](https://www.cloudquery.io/contact-us) if you have any questions.

## Additional Resources

- [How to Build a Multi-Cloud Asset Inventory](https://www.cloudquery.io/blog/how-to-build-a-multi-cloud-asset-inventory)
- [Building a Cloud Asset Inventory with AWS](https://www.cloudquery.io/blog/building-cloud-asset-inventory-with-aws)
- [Building a Cloud Asset Inventory with GCP](https://www.cloudquery.io/blog/building-cloud-asset-inventory-with-gcp)
- [How to Build a Cloud Asset Inventory for Azure](https://www.cloudquery.io/blog/how-to-build-a-cloud-asset-inventory-for-azure)
- [AWS integration Documentation](https://www.cloudquery.io/hub/plugins/source/cloudquery/aws/latest/docs)
- [GCP Plugin Documentation](https://www.cloudquery.io/hub/plugins/source/cloudquery/gcp/latest/docs)
- [Azure Plugin Documentation](https://www.cloudquery.io/hub/plugins/source/cloudquery/azure/latest/docs)
- [Export AWS Data to PostgreSQL](https://www.cloudquery.io/hub/export-data/aws/postgresql)
- [Export GCP Data to PostgreSQL](https://www.cloudquery.io/hub/export-data/gcp/postgresql)
- [Export Azure Data to PostgreSQL](https://www.cloudquery.io/hub/export-data/azure/postgresql)
- [Building a Multi-Cloud Asset Inventory Data Lake with CloudQuery and Snowflake](https://medium.com/snowflake/building-a-multi-cloud-asset-inventory-data-lake-with-cloudquery-and-snowflake-fcd1b86f1055)
- [Building a Multi-cloud Resource Data Lake Using CloudQuery (AWS Blog)](https://aws.amazon.com/blogs/opensource/building-a-multicloud-resource-data-lake-using-cloudquery/)
