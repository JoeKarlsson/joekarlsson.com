---
title: 'How to Build a Multi-Cloud Asset Inventory'
date: 2024-08-29
slug: 'how-to-build-a-multi-cloud-asset-inventory'
description: 'A step-by-step guide to a multi-cloud asset inventory for AWS, GCP and Azure: collect, transform and store cloud data for security, compliance and cost.'
categories: ['Cloud']
writtenFor: 'CloudQuery'
tags: ['Tutorials', 'AWS', 'GCP', 'Azure', 'Cloud Asset Inventory']
heroImage: '/images/blog/how-to-build-a-multi-cloud-asset-inventory/thumb-78463135.webp'
canonicalUrl: 'https://www.cloudquery.io/blog/how-to-build-a-multi-cloud-asset-inventory'
contentNotice: 'This post was originally published on CloudQuery blog.'
heroAlt: 'Colored pins stuck in a map'
updatedDate: 2026-11-12
corrections:
  - date: 2026-11-12
    note: "Several queries used tables and columns that never existed: the cost columns, `azure_virtual_machines`, the load balancer tables, and Azure names in the GCP check. The dbt profile didn't match the database container."
---

Managing multi-cloud environments can overwhelm even experienced cloud architects. Each cloud provider has its own set of tools, APIs, and management practices, leading to fragmented visibility and control. Without a unified view, identifying and managing cloud assets across AWS, Azure, GCP, and other providers becomes daunting.

A complete inventory of all your cloud assets is essential for maintaining security, ensuring compliance, and optimizing costs in complex environments. By centralizing asset data from multiple clouds, organizations can gain the visibility and control needed to mitigate risks, avoid unnecessary expenses, and meet regulatory requirements.

This post builds a multi-cloud asset inventory step by step. Using CloudQuery, an open-source cloud asset management tool, you'll aggregate, normalize, and visualize your cloud assets into one inventory across all your cloud environments.

If you want to follow along with a video version of this post, you can check that out here:

[![Live Coding: Building a Multi-Cloud Asset Inventory with AWS & GCP using CloudQuery and Postgres YouTube Video](/images/blog/complete-guide-building-multi-cloud-asset-inventory/video-thumbnail.webp)](https://www.youtube.com/embed/nFA2C5JgjPw)

## Multi-cloud cloud asset inventory technical architecture

1. **Data Collection with CloudQuery**

CloudQuery is at the heart of our architecture. It's an open-source tool that allows you to query and sync cloud asset data across multiple cloud providers. In this guide, we'll be syncing data from Google Cloud Platform (GCP), Microsoft Azure, and Amazon Web Services (AWS). In addition to these three services, CloudQuery supports all major cloud providers, giving you the flexibility to expand your inventory as needed.

CloudQuery connects directly to the APIs of each cloud provider, extracting detailed information about your resources. Whether it's virtual machines, storage buckets, or networking components, CloudQuery pulls this data into a consistent format that can be quickly processed.

1. **Data Transformation with dbt**

Once the raw cloud data is collected, it needs to be transformed into a format built for analysis and reporting. That's the job of dbt (Data Build Tool), which cleans, organizes, and normalizes your cloud asset data.

Using dbt, we'll take the raw data from CloudQuery and apply transformations to ensure consistency across different cloud providers. This process includes standardizing naming conventions, aggregating similar asset types, and enriching the data with additional metadata. The goal is to create a single, cohesive dataset that accurately reflects your entire cloud environment.

1. **Data Storage with PostgreSQL**

The transformed data needs to be stored in a centralized location where it can be easily queried and analyzed. For this guide, we'll be using PostgreSQL as our destination database.

While we're using PostgreSQL in this example, CloudQuery allows you to sync your data into any data store of your choice, whether it's another relational database, a data warehouse, or a data lake. That lets you fit your cloud asset inventory into your existing data infrastructure.

![A multi-cloud asset inventory powered by CloudQuery: asset data from AWS, Google Cloud and Microsoft Azure goes through CloudQuery's ETL into a PostgreSQL database, which feeds analytics and visualizations.](/images/blog/how-to-build-a-multi-cloud-asset-inventory/multi-cloud-inventory.svg)

## Building a Multi-cloud Asset Inventory

### Prerequisites

Before we get started, you will also need GCP, AWS, and Azure accounts with the necessary permissions. Your machine will also need [Docker](https://www.docker.com/) installed. Docker is needed for PostgreSQL and dbt as CloudQuery doesn't require Docker and can run on any machine and architecture as a single compiled binary.

### Getting Started With CloudQuery

To get started with CloudQuery, download and follow the installation instructions for your operating system [here](https://www.cloudquery.io/download).

Are you not interested in deploying and maintaining your CloudQuery infrastructure? You might want to try out the [CloudQuery Platform](https://www.cloudquery.io/docs/platform/introduction).

### Setting Up a PostgreSQL Data Store

To set up a local PostgreSQL database using Docker, you can run the following command:

```bash
docker run --name postgres_container \
  --restart unless-stopped \
  --env POSTGRES_USER=postgres \
  --env POSTGRES_PASSWORD=postgres \
  --env POSTGRES_HOST=db \
  --env POSTGRES_DB=asset_inventory \
  --publish 5432:5432 \
  --volume pgdata:/var/lib/postgresql \
  --detach \
  postgres:18
```

This command pulls the PostgreSQL image (version 18) from Docker Hub, sets the password for the `postgres` user to `postgres`, and runs the container in detached mode (-d). The -p 5432:5432 option maps the container's port 5432 (PostgreSQL's default port) to port 5432 on the host machine, allowing you to connect to the database locally.

> **Note:** While PostgreSQL is used in this example, any compatible database can be used as the data store for your GCP Cloud Asset data. PostgreSQL is chosen for its robustness and widespread adoption, but you can configure your setup to use another database system if preferred.

### How to pull cloud asset data from AWS

You'll be using the [CloudQuery AWS integration](https://www.cloudquery.io/hub/plugins/source/cloudquery/aws/latest/docs). Follow the [instructions to authenticate your AWS instance](https://www.cloudquery.io/hub/plugins/source/cloudquery/aws/latest/docs#authentication). Then, locally, create a new file called `config.yml` and copy the following into this file.

```yaml
kind: source
spec:
  name: aws
  path: cloudquery/aws
  registry: cloudquery
  version: 'v35.9.0'
  tables:
    - aws_apigateway_rest_api_stages
    - aws_apigatewayv2_api_stages
    - aws_apigatewayv2_api_routes
    - aws_autoscaling_groups
    - aws_codebuild_projects
    - aws_config_configuration_recorders
    - aws_cloudwatch_metric_alarms
    - aws_cloudtrail_trail_event_selectors
    - aws_cloudwatchlogs_metric_filters
    - aws_cloudfront_distributions
    - aws_iam_accounts
    - aws_iam_credential_reports
    - aws_iam_password_policies
    - aws_iam_users
    - aws_ec2_network_acls
    - aws_ec2_security_groups
    - aws_efs_access_points
    - aws_elasticbeanstalk_environments
    - aws_elbv1_load_balancers
    - aws_elbv2_load_balancers
    - aws_rds_clusters
    - aws_sns_subscriptions
    - aws_s3_accounts
  destinations:
    - postgresql
```

This CloudQuery configuration file sets up a data source from AWS to extract information from various AWS services, such as API Gateway, IAM, and RDS, using specific tables. The extracted data is then directed to a PostgreSQL database for storage.

For the tables, include [all the assets](https://www.cloudquery.io/hub/plugins/source/cloudquery/aws/latest/tables) you want to sync with your Cloud Asset Inventory.

### How to sync cloud asset data from GCP

You'll be using the [CloudQuery GCP integration](https://www.cloudquery.io/hub/plugins/source/cloudquery/gcp/latest/docs). Follow the [instructions to authenticate your GCP instance](https://www.cloudquery.io/hub/plugins/source/cloudquery/gcp/latest/docs#overview-authentication). In your `config.yml`, copy the following into this file.

```yaml
---
kind: source
spec:
  # Source spec section
  name: gcp
  path: cloudquery/gcp
  registry: cloudquery
  version: 'v24.4.0'
  tables:
    - gcp_storage_buckets
  destinations:
    - postgresql
```

This CloudQuery configuration file sets up a GCP data source to extract information from various GCP services. The extracted data is then directed to a PostgreSQL database for storage.

### How to sync cloud asset data from Azure

You'll be using the [CloudQuery Azure integration](https://www.cloudquery.io/hub/plugins/source/cloudquery/azure/latest/docs) to sync your data into your data store. Follow the [instructions to authenticate your Azure instance](https://www.cloudquery.io/hub/plugins/source/cloudquery/azure/latest/docs#overview-authentication). In your `config.yml`, copy the following:

```yaml
---
kind: source
spec:
  # Source spec section
  name: azure
  path: cloudquery/azure
  registry: cloudquery
  version: 'v23.5.5'
  destinations:
    - postgresql
  tables:
    - azure_compute_virtual_machines
```

## How to save all your cloud asset data into PostgreSQL

Next, you'll need a destination integration, and for this example, you'll be using [CloudQuery's PostgreSQL Destination Integration](https://www.cloudquery.io/hub/plugins/destination/cloudquery/postgresql/latest/docs).

> **Note:** You can sync your data to any other destination, and if your database isn't there, you can [build your own custom integration](https://www.cloudquery.io/docs/cli/integrations/creating-new-integration)!

At the bottom of the Config file, paste the following:

```yaml
---
kind: destination
spec:
  name: postgresql
  path: cloudquery/postgresql
  registry: cloudquery
  version: 'v8.19.0'
  spec:
    connection_string: 'postgresql://postgres:postgres@localhost:5432/asset_inventory?sslmode=disable'
```

And with that, the CloudQuery Config is ready. Now is a good time to test it out. Make sure your PostgreSQL Docker container is running, then we need to run the CloudQuery job so that it syncs your cloud assets into PostgreSQL with:

```bash
cloudquery sync ./config.yml
```

Now, you can connect to PostgreSQL and explore the data. For example, you can use this as an example query to ensure your data has been correctly synced. This query finds all the storage buckets that don't have uniform bucket-level access turned on:

```bash
docker exec -it postgres_container /bin/bash

psql -U postgres -d asset_inventory

SELECT name, location FROM gcp_storage_buckets WHERE (uniform_bucket_level_access->>'Enabled')::boolean IS NOT TRUE;
```

### How to use dbt to convert your cloud data into a cloud asset inventory

CloudQuery provides several pre-built dbt projects to simplify data transformations, including security and compliance frameworks like PCI_DSS, CIS, and Foundational Security Best Practices. But for this tutorial, you will be using our prebuilt [AWS Asset Inventory](https://www.cloudquery.io/hub/addons/transformation/cloudquery/aws-asset-inventory/latest/docs), [GCP Asset Inventory](https://www.cloudquery.io/hub/addons/transformation/cloudquery/gcp-asset-inventory/latest/docs), and the [Azure Asset Inventory](https://www.cloudquery.io/hub/addons/transformation/cloudquery/azure-asset-inventory/latest/docs) transformations. Here's how you set up your dbt Transformations.

First, you will need to go to each of the dbt transformations and download and extract the contents into your project folder.

Next, you must create a `profiles.yml` file in your profile directory and configure each transformation:

```yaml
gcp_asset_inventory: # This should match the name in your dbt_project.yml
  target: dev
  outputs:
    dev:
      type: postgres
      host: host.docker.internal
      user: postgres
      pass: postgres
      port: 5432
      dbname: asset_inventory
      schema: public # default schema where dbt will build the models
      threads: 1 # number of threads to use when running in parallel

azure_asset_inventory: # This should match the name in your dbt_project.yml
  target: dev
  outputs:
    dev:
      type: postgres
      host: host.docker.internal
      user: postgres
      pass: postgres
      port: 5432
      dbname: asset_inventory
      schema: public # default schema where dbt will build the models
      threads: 1 # number of threads to use when running in parallel

aws_asset_inventory: # This should match the name in your dbt_project.yml
  target: dev
  outputs:
    dev:
      type: postgres
      host: host.docker.internal
      user: postgres
      pass: postgres
      port: 5432
      dbname: asset_inventory
      schema: public # default schema where dbt will build the models
      threads: 1 # number of threads to use when running in parallel
```

To run dbt with Docker, you can use this Docker CLI command to set up the environment and execute dbt commands. You will need to run this for each transformation.

```bash
docker run --platform linux/amd64 --name dbt_container \
  --env POSTGRES_USER=postgres \
  --env POSTGRES_PASSWORD=postgres \
  --env POSTGRES_HOST=host.docker.internal \
  --env POSTGRES_DB=asset_inventory \
  --add-host=host.docker.internal:host-gateway \
  --volume $(pwd)/cloudquery_transformation_gcp-asset-inventory_vX.X.X:/usr/app \
  --volume ~/.dbt/profiles.yml:/root/.dbt/profiles.yml \
  ghcr.io/dbt-labs/dbt-postgres:1.9.0 run
```

> **Note:** If you're copying this sample directly, be sure that you set the version number to match the one you downloaded.

## Analyzing your multi-cloud cloud asset inventory data

When you centralize your data from AWS, Azure, and GCP into a single database, you can enrich, compare, and analyze your assets using consistent tooling, like SQL, that you're already familiar with. This unified approach allows you to uncover insights that would be difficult, if not impossible, to achieve if your data was stuck within each cloud provider.

With your multi-cloud asset inventory in one place, you can start answering critical questions about your infrastructure. For example, you can identify which instances cost you the most across all clouds, spot redundant resources that could be consolidated, and analyze cross-cloud data transfer costs to optimize your spending.

To get you started, here are three example queries:

### Cross-cloud instance inventory

This query pulls together data on compute instances from AWS, Azure, and GCP, standardizing the fields for provider, instance ID, instance type, and region. It then combines the results into a single list sorted by provider and instance type, so every instance size you run across all three cloud providers shows up in one place.

```sql
SELECT provider, instance_id, instance_type, region
FROM (
 SELECT 'AWS' as provider, instance_id, instance_type, region FROM aws_ec2_instances
 UNION ALL
 SELECT 'Azure' as provider, properties->>'vmId' as instance_id, properties->'hardwareProfile'->>'vmSize' as instance_type, location as region FROM azure_compute_virtual_machines
 UNION ALL
 SELECT 'GCP' as provider, id::text as instance_id, regexp_replace(machine_type, '.*/', '') as instance_type, regexp_replace(zone, '.*/(.*)-[a-z]$', '\1') as region FROM gcp_compute_instances
) as cross_cloud_instances
ORDER BY provider, instance_type;
```

### How to identify redundant load balancers across clouds

This query identifies load balancers across AWS, Azure, and GCP with fewer than two associated instances, helping spot potentially redundant or underutilized load balancers.

```sql
SELECT lb_id, provider, region, associated_instances_count
FROM (
 SELECT arn as lb_id, 'AWS' as provider, region, jsonb_array_length(COALESCE(instances, '[]'::jsonb)) as associated_instances_count
 FROM aws_elbv1_load_balancers
 UNION ALL
 SELECT id as lb_id, 'Azure' as provider, location as region,
   (SELECT COUNT(*)
    FROM jsonb_array_elements(COALESCE(properties->'backendAddressPools', '[]'::jsonb)) as pool,
         jsonb_array_elements(COALESCE(pool->'properties'->'backendIPConfigurations', '[]'::jsonb))) as associated_instances_count
 FROM azure_network_load_balancers
 UNION ALL
 SELECT self_link as lb_id, 'GCP' as provider, regexp_replace(region, '.*/', '') as region, cardinality(COALESCE(instances, '{}')) as associated_instances_count
 FROM gcp_compute_target_pools
) as cross_cloud_lbs
WHERE associated_instances_count < 2;
```

### Analyze cross-cloud data transfer costs

This query helps identify underutilized load balancers across AWS, Azure, and GCP by highlighting those with fewer than two associated instances, which can indicate inefficiency or potential cost savings.

```sql
SELECT lb_id, provider, region, associated_instances_count
FROM (
 SELECT arn as lb_id, 'AWS' as provider, region, jsonb_array_length(COALESCE(instances, '[]'::jsonb)) as associated_instances_count
 FROM aws_elbv1_load_balancers
 UNION ALL
 SELECT id as lb_id, 'Azure' as provider, location as region,
   (SELECT COUNT(*)
    FROM jsonb_array_elements(COALESCE(properties->'backendAddressPools', '[]'::jsonb)) as pool,
         jsonb_array_elements(COALESCE(pool->'properties'->'backendIPConfigurations', '[]'::jsonb))) as associated_instances_count
 FROM azure_network_load_balancers
 UNION ALL
 SELECT self_link as lb_id, 'GCP' as provider, regexp_replace(region, '.*/', '') as region, cardinality(COALESCE(instances, '{}')) as associated_instances_count
 FROM gcp_compute_target_pools
) as cross_cloud_lbs
WHERE associated_instances_count < 2;
```

## Summary

In this post, you explored the architecture and process for building a multi-cloud asset inventory, highlighting the importance of centralizing your cloud data for enhanced security, compliance, and cost management.

You learned how to use CloudQuery to sync data from AWS, Azure, and GCP, transform it with dbt, and store it in PostgreSQL, all while maintaining flexibility in your data store choice.

_Want to see CloudQuery in action?_ [Schedule a demo with our team](https://www.cloudquery.io/contact-us) or check out the [platform documentation](https://www.cloudquery.io/docs/platform/introduction) to learn more.

Want help getting started? Join the [CloudQuery community](https://community.cloudquery.io/) to connect with other users and experts, or message our team directly [here](https://www.cloudquery.io/contact-us) if you have any questions.

## Code Samples

### CloudQuery Configuration

```yaml file=cloudquery.yaml
kind: source
spec:
  name: aws
  path: cloudquery/aws
  registry: cloudquery
  version: 'v35.9.0'
  tables:
    - aws_apigateway_rest_api_stages
    - aws_apigatewayv2_api_stages
    - aws_apigatewayv2_api_routes
    - aws_autoscaling_groups
    - aws_codebuild_projects
    - aws_config_configuration_recorders
    - aws_cloudwatch_metric_alarms
    - aws_cloudtrail_trail_event_selectors
    - aws_cloudwatchlogs_metric_filters
    - aws_cloudfront_distributions
    - aws_iam_accounts
    - aws_iam_credential_reports
    - aws_iam_password_policies
    - aws_iam_users
    - aws_ec2_network_acls
    - aws_ec2_security_groups
    - aws_efs_access_points
    - aws_elasticbeanstalk_environments
    - aws_elbv1_load_balancers
    - aws_elbv2_load_balancers
    - aws_rds_clusters
    - aws_sns_subscriptions
    - aws_s3_accounts
  destinations:
    - postgresql
  # AWS Spec
  # Learn more about the configuration options at https://www.cloudquery.io/hub/plugins/source/cloudquery/aws/latest/docs
---
kind: source
spec:
  # Source spec section
  name: gcp
  path: cloudquery/gcp
  registry: cloudquery
  version: 'v24.4.0'
  tables:
    - gcp_storage_buckets
  destinations:
    - postgresql
  # GCP Spec
  # Learn more about the configuration options at https://www.cloudquery.io/hub/plugins/source/cloudquery/gcp/latest/docs
---
kind: source
spec:
  # Source spec section
  name: azure
  path: cloudquery/azure
  registry: cloudquery
  version: 'v23.5.5'
  destinations:
    - postgresql
  tables:
    - azure_compute_virtual_machines
  # Azure Spec
  # Learn more about the configuration options at https://cql.ink/azure_source
  spec:
---
kind: destination
spec:
  name: postgresql
  path: cloudquery/postgresql
  registry: cloudquery
  version: 'v8.19.0'
  spec:
    connection_string: 'postgresql://postgres:postgres@localhost:5432/asset_inventory?sslmode=disable'
```

## FAQs

**Q: What is a cloud asset inventory?**

A: A cloud asset inventory is a centralized record of all cloud resources and assets across one or multiple cloud environments. It includes details like virtual machines, storage buckets, networking components, and other resources, providing visibility and control to ensure security, compliance, and cost optimization.

**Q: Why is a multi-cloud asset inventory important?**

A: A multi-cloud asset inventory is important for maintaining security, ensuring compliance, and optimizing costs by centralizing asset data, enabling better visibility and control across cloud environments.

**Q: What tool is recommended for building a multi-cloud asset inventory?**

A: CloudQuery is recommended for building a multi-cloud asset inventory, as it allows for querying and syncing cloud asset data across multiple cloud providers.

**Q: How does CloudQuery handle data from different cloud providers?**

A: CloudQuery connects directly to the APIs of cloud providers, extracting detailed information about resources and normalizing it into a consistent format that can be easily processed.

**Q: What are the prerequisites for building a multi-cloud asset inventory?**

A: You need GCP, AWS, and Azure accounts with necessary permissions, Docker installed for PostgreSQL and dbt, and CloudQuery installed on your machine.

**Q: How can you verify that your cloud asset data has been correctly synced to PostgreSQL?**

A: You can run SQL queries on the PostgreSQL database, such as querying for storage buckets without uniform bucket-level access, to verify that the data has been correctly synced.

**Q: What are the cloud providers I can connect to with CloudQuery?**

A: CloudQuery supports connections to all major cloud providers, including Amazon Web Services (AWS), Google Cloud Platform (GCP), Microsoft Azure, Alibaba Cloud, IBM Cloud, Oracle Cloud, and others. This allows you to aggregate and manage assets across multiple cloud environments.

**Q: Can I save my cloud asset data anywhere?**

A: Yes, CloudQuery allows you to save your cloud asset data in any compatible data store. This includes relational databases like PostgreSQL, data warehouses, data lakes, or even custom destinations by building your own plugins. This flexibility makes it easy to integrate into your existing data infrastructure.

## Additional Resources

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
