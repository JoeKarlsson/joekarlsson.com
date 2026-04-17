---
title: 'How to Build a Cloud Asset Inventory for Azure'
date: 2024-11-25
slug: 'how-to-build-a-cloud-asset-inventory-for-azure'
description: 'Learn how to build an Azure cloud asset inventory with CloudQuery and PostgreSQL. Covers setup, dbt transformations, and visualizing assets for security and compliance.'
categories: ['DevRel', 'Databases']
tags: ['Tutorials', 'Cloud Asset Inventory', 'Azure']
heroImage: '/images/blog/how-to-build-a-cloud-asset-inventory-for-azure/image1.webp'
canonicalUrl: 'https://www.cloudquery.io/blog/how-to-build-a-cloud-asset-inventory-for-azure'
contentNotice: 'This post was originally published on CloudQuery blog.'
---

Are you experiencing challenges in managing your Azure infrastructure? Do you need help keeping track of all your cloud assets, ensuring compliance, and maintaining security? If these issues sound familiar, then it's time to consider implementing a cloud asset inventory.

Managing assets in cloud environments such as Azure is growing increasingly complex. As organizations expand their cloud infrastructure, tracking resources, ensuring compliance, and maintaining strong security measures become more challenging. The dynamic nature of cloud environments, with frequent changes and additions, complicates asset management further. Therefore, a comprehensive cloud asset inventory is essential. It offers a clear and organized view of all cloud resources, streamlining operations and mitigating potential risks.

In this tutorial, you will build a cloud asset manager for Azure using CloudQuery. You'll connect to your Azure account, collect data on all your cloud assets, and store it in a PostgreSQL database for analysis and reporting. However, with CloudQuery, you can extract data from [ANY data source](https://www.cloudquery.io/hub/plugins/source) ([AWS](https://www.cloudquery.io/hub/plugins/source/cloudquery/aws/latest/docs), [GCP](https://www.cloudquery.io/hub/plugins/source/cloudquery/gcp/latest/docs), [etc](https://www.cloudquery.io/hub/plugins/source).) and load it into [ANY data destination](https://www.cloudquery.io/hub/plugins/destination) ([Snowflake](https://www.cloudquery.io/hub/plugins/destination/cloudquery/snowflake/latest/docs), [BigQuery](https://www.cloudquery.io/hub/plugins/destination/cloudquery/bigquery/latest/docs), [Databricks](https://www.cloudquery.io/hub/plugins/destination/cloudquery/databricks/latest/docs), [DuckDB](https://www.cloudquery.io/hub/plugins/destination/cloudquery/duckdb/latest/docs), [ClickHouse](https://www.cloudquery.io/hub/plugins/destination/cloudquery/clickhouse/latest/docs), etc.).

Looking to build a Cloud Asset Inventory for your AWS data? Check our tutorial, [Building an AWS Cloud Asset Inventory](https://www.cloudquery.io/blog/building-cloud-asset-inventory-with-aws).

## Building a Cloud Asset Inventory for your Azure Resources

Let's break down the tech stack and architecture of this project, and I'll explain why we're using each component.

![Diagram illustrating the workflow of building a cloud asset inventory. The process starts with source data from Azure, Google Cloud, and Azure, which is then processed by CloudQuery for ELT (Extract, Load, Transform). The data is stored in a PostgreSQL data warehouse. dbt is used for data transformations within the data warehouse.](/images/blog/how-to-build-a-cloud-asset-inventory-for-azure/image1.webp)

If you want to follow along with a video version of this post, you can check that out here:

[![Live Coding: Building a Multi-Cloud Asset Inventory with AWS & GCP using CloudQuery and Postgres YouTube Video](/images/blog/complete-guide-building-multi-cloud-asset-inventory/video-thumbnail.webp)](https://www.youtube.com/embed/nFA2C5JgjPw)

## Step 0: Prerequisites

Before jumping into the demo, you'll need a few prerequisites to ensure everything runs smoothly. These setup steps will prepare your environment to sync cloud data from AWS and GCP into PostgreSQL.

### 1. Azure Access

You will need Azure credentials to pull cloud asset data from AWS. You can checkout all the ways to authenticate with Azure [here](https://www.cloudquery.io/hub/plugins/source/cloudquery/azure/latest/docs#overview-authentication).

### 3. Docker

We'll be using [Docker](https://www.docker.com/) to run a PostgreSQL container where cloud assets from Azure will be stored. Make sure Docker is installed and running on your local machine before proceeding with the demo.

### Step 1: Installing CloudQuery

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

_Note: If you have any questions or encounter an issue when following along with this post, the best place to get help is to join the [CloudQuery Community](https://community.cloudquery.io)._

### Setting Up PostgreSQL as the Data Store for Azure Cloud Asset Data

Now, we need a place to store all this data. We'll use PostgreSQL, a powerful (and popular) open-source database that works great for storing structured data like cloud assets.

If you don't already have a PostgreSQL database set up, you can easily run one in a Docker container. This is a fast way to get things running without much setup. Here's the command to start PostgreSQL in Docker:

```bash
docker run --name postgres_container \
--restart unless-stopped \
--env POSTGRES_USER=postgres \
--env POSTGRES_PASSWORD=postgres \
--env POSTGRES_HOST=db \
--env POSTGRES_DB=asset_inventory \
--publish 5432:5432 \
--volume pgdata:/var/lib/postgresql/data \
postgres
```

This command will launch a PostgreSQL pre-configured container to store your cloud assets. The credentials are set to `postgres` for both the username and password, but you can adjust this as needed.

_Note_: While PostgreSQL is used in this example, any compatible database can be used as the data store for your Azure Cloud Asset data. PostgreSQL is chosen for its robustness and widespread adoption, but you can configure your setup to use another database system if preferred.

## Step 3: Configuring CloudQuery

Next, we'll configure CloudQuery to pull data from AWS and sync it to PostgreSQL. CloudQuery works by defining sources (like AWS) and destinations (like PostgreSQL). It then automates the process of syncing data between them.

Start by initializing a CloudQuery project for Azure:

```bash
cloudquery init --source=azure --destination=postgresql
```

This command sets up the necessary configurations for pulling data from Azure and storing it in PostgreSQL. The configurations are defined in a YAML file that CloudQuery generates for you.

Now, let's take a quick look at how we can define this process. Here's a basic example of what the configuration file looks like (`azure_to_postgresql.yaml`):

```yaml
kind: source
spec:
  name: 'azure'
  path: 'cloudquery/azure'
  registry: 'cloudquery'
  version: 'v15.5.0'
  destinations: ['postgresql']
  tables: ['azure_compute_virtual_machines']
  spec:
---
kind: destination
spec:
  name: 'postgresql'
  path: 'cloudquery/postgresql'
  registry: 'cloudquery'
  version: 'v8.6.8'
  write_mode: 'overwrite-delete-stale'
  spec:
    connection_string: '${POSTGRESQL_CONNECTION_STRING}'
```

This CloudQuery configuration file sets up a data source from Azure to extract information from various Azure services, such as API Gateway, IAM, and RDS, using specific tables. The extracted data is then directed to a PostgreSQL database for storage. This setup allows for efficient data extraction, transformation, and storage, enabling easier analysis and visualization of Azure data.

For the `spec>tables` - be sure to include all the assets you want to sync with your Cloud Asset Inventory.

**_Note_**: If you are interested in building a [multi-cloud asset inventory](https://www.cloudquery.io/blog/how-to-build-a-multi-cloud-asset-inventory), you can pull assets from [any cloud provider](https://www.cloudquery.io/hub/plugins/source), including [AWS](https://www.cloudquery.io/hub/plugins/source/cloudquery/aws/latest/docs) and [GCP](https://www.cloudquery.io/hub/plugins/source/cloudquery/gcp/latest/docs), using CloudQuery.

### How to Authenticate and Connect to your Azure Data

First, install the [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli). Then, login with the Azure CLI:

```bash
az login
```

**_WARNING_**: Using only Azure CLI login is not recommended for production use, as it requires spawning a new Azure CLI process each time an authentication token is needed. Refer to our documentation on [how to authenticate to Azure using Environmental Variables](https://www.cloudquery.io/hub/plugins/source/cloudquery/azure/latest/docs#overview-authentication-with-environment-variables).

## Step 4: Syncing Data from Azure

With our configuration in place, we're ready to start syncing data. To sync Azure data into PostgreSQL, run the following command:

```bash
cloudquery sync azure_to_postgresql.yaml
```

Now you can connect to PostgreSQL and explore the data. For example, you can use this is an example query you can use to ensure your data has been correctly synced. This query finds all the storage accounts that are allowing non-HTTPS traffic:

```bash
docker exec -it postgres_container psql -U postgres -c "
SELECT * FROM azure_storage_accounts WHERE enable_https_traffic_only = false;
"
```

### How to Use dbt to Transform Azure Data into a Cloud Asset Inventory

dbt (Data Build Tool) is used here to transform your raw Azure data into structured tables. These tables are then ready to be consumed by visualization tools for easier data interpretation and analysis. This process is fully customizable, allowing you to tailor the transformations to fit your specific Azure configuration and requirements.

To simplify data transformations, CloudQuery provides several pre-built dbt projects, including security and compliance frameworks like PCI_DSS, CIS, and Foundational Security Best Practices. But for this tutorial, you will be using our prebuilt [Azure Asset Inventory](https://www.cloudquery.io/hub/addons/transformation/cloudquery/azure-asset-inventory/latest/docs) transformation. Here's how you set up your dbt Transformations:

Go to the [Azure Asset Inventory pack](https://www.cloudquery.io/hub/addons/transformation/cloudquery/azure-asset-inventory/latest/docs), and download and extract the contents into your project folder.

Finally, you need to define the `dbt-profiles.yml` file itself in your project directory:

```yaml
config:
  send_anonymous_usage_stats: False
  use_colors: True

azure_asset_inventory:
  target: postgres
  outputs:
    postgres:
      type: postgres
      host: "{{ env_var('POSTGRES_HOST') }}"
      user: "{{ env_var('POSTGRES_USER') }}"
      pass: "{{ env_var('POSTGRES_PASSWORD') }}"
      port: 5432
      dbname: "{{ env_var('POSTGRES_DB') }}"
      schema: public
      threads: 1
```

To run dbt with Docker, you can use this Docker CLI command to set up the environment and execute dbt commands.

```bash
docker run --platform linux/amd64 --name dbt_container \
  --env POSTGRES_USER=postgres \
  --env POSTGRES_PASSWORD=postgres \
  --env POSTGRES_HOST=db \
  --env POSTGRES_DB=asset_inventory \
  --volume $(pwd)/cloudquery_transformation_azure-asset-inventory_vX.X.X:/usr/app \
  --volume $(pwd)/dbt-profiles.yml:/root/.dbt/profiles.yml \
  ghcr.io/dbt-labs/dbt-postgres:1.8.1 run

```

_Note: If you're copying this sample directly into your Docker Compose file, **make sure you set the version number to match the one you've downloaded**._

**What Happens When You Run This Command?**

- Docker pulls the specified dbt image from GitHub Container Registry.

- A new container starts, named `dbt_container`, with the specified environment variables.

- Local directories and files are mapped to directories and files inside the container, making your dbt project and configuration available to dbt.

- dbt runs the dbt run command inside the container, which processes your data models and executes them against the connected PostgreSQL database.

You can now query your new tables to find additional data about your cloud, like, _how many resources are there per subscription?_

```sql
select subscription_id, count(*)
from azure_resources
group by subscription_id
order by count(*) desc
```

## Summary

In this tutorial, you walked through the process of building a cloud asset inventory for Azure using CloudQuery. Here's a quick recap of what you achieved:

- **Setting up CloudQuery**: You configured CloudQuery to connect to your Azure account and gather detailed asset data.
- **Storing Data in PostgreSQL**: You set up a PostgreSQL database to store the collected asset data, enabling efficient querying and analysis.
- **Transforming Data with dbt**: You utilized dbt to apply data transformations, enhancing the quality and usability of your cloud asset inventory.

By using CloudQuery, you can ensure that your asset inventory is comprehensive, adaptable, and integrated with your broader data strategy. This empowers your team to gain better insights and make informed decisions, ultimately driving more value from your cloud infrastructure.

_Want to see CloudQuery in action?_ [Schedule a demo with our team](https://www.cloudquery.io/contact-us) or check out the [platform documentation](https://www.cloudquery.io/docs/platform/introduction) to learn more.

Want help getting started? Join the [CloudQuery community](https://community.cloudquery.io/) to connect with other users and experts, or message our team directly [here](https://www.cloudquery.io/contact-us) if you have any questions.

Thank you for following along, and we hope this guide helps you effectively manage your Azure cloud assets!

## Additional Resources

- [Building an AWS Cloud Asset Inventory](https://www.cloudquery.io/blog/building-cloud-asset-inventory-with-aws#what-is-a-cloud-asset-inventory?)
- [What is a Cloud Asset Inventory?](https://www.cloudquery.io/blog/what-is-a-cloud-asset-inventory)
- [How to Visualize CloudQuery Data with AWS QuickSight](https://www.cloudquery.io/blog/cloud-asset-inventory-cloudquery-aws-quicksight)
- [Watch: Google Cloud Asset Inventory 101](https://www.youtube.com/embed/c0LVkrTLmVY)
- [Watch: Build an AWS Cloud Asset Inventory](https://www.youtube.com/embed/H5RpX5z4H40)

## Code

### CloudQuery

`config.yml`

```yaml
kind: source
spec:
  # Source spec section
  name: 'azure'
  path: 'cloudquery/azure'
  registry: 'cloudquery'
  version: 'v13.3.2'
  destinations: ['postgresql']
  tables: ['*']
---
kind: destination
spec:
  name: 'postgresql'
  path: 'cloudquery/postgresql'
  registry: 'cloudquery'
  version: 'v8.0.8'
  spec:
    connection_string: 'postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:5432/${POSTGRES_DB}?sslmode=disable'
```

### dbt

`dbt-profiles.yml`

```yaml
config:
  send_anonymous_usage_stats: False
  use_colors: True

azure_asset_inventory:
  target: postgres
  outputs:
    postgres:
      type: postgres
      host: "{{ env_var('POSTGRES_HOST') }}"
      user: "{{ env_var('POSTGRES_USER') }}"
      pass: "{{ env_var('POSTGRES_PASSWORD') }}"
      port: 5432
      dbname: "{{ env_var('POSTGRES_DB') }}"
      schema: public
      threads: 1
```
