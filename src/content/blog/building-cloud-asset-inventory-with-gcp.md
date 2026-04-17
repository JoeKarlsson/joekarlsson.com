---
title: 'Step-by-Step Guide to Building a Cloud Asset Inventory for GCP'
date: 2024-06-13
slug: 'building-cloud-asset-inventory-with-gcp'
description: 'Learn how to build a GCP cloud asset inventory with CloudQuery, PostgreSQL, and dbt. Covers setup, data transformation with dbt models, and querying your cloud resources.'
categories: ['Work']
tags: ['Cloud Asset Inventory', 'GCP', 'Tutorials']
heroImage: '/images/blog/building-cloud-asset-inventory-with-gcp/image1.webp'
canonicalUrl: 'https://www.cloudquery.io/blog/building-cloud-asset-inventory-with-gcp'
contentNotice: 'This post was originally published on CloudQuery blog.'
---

Are you experiencing challenges in managing your Google Cloud Platform (GCP) infrastructure? Do you need help keeping track of all your cloud assets, ensuring compliance, and maintaining security? If these issues sound familiar, then it's time to consider implementing a cloud asset inventory.

Managing assets in cloud environments such as GCP is growing increasingly complex. As organizations expand their cloud infrastructure, tracking resources, ensuring compliance, and maintaining strong security measures become more challenging. The dynamic nature of cloud environments, with frequent changes and additions, complicates asset management further. Therefore, a comprehensive cloud asset inventory is essential. It offers a clear and organized view of all cloud resources, streamlining operations and mitigating potential risks.

In this tutorial, you will build a cloud asset manager for GCP using [CloudQuery](https://www.cloudquery.io/). You'll connect to your GCP account, collect data on all your cloud assets, and store it in a PostgreSQL database for analysis and reporting. However, with CloudQuery, you can extract data from [ANY data source](https://www.cloudquery.io/hub/plugins/source) ([AWS](https://www.cloudquery.io/hub/plugins/source/cloudquery/aws/latest/docs), [GCP](https://www.cloudquery.io/hub/plugins/source/cloudquery/gcp/latest/docs), [etc](https://www.cloudquery.io/hub/plugins/source).) and load it into [ANY data destination](https://www.cloudquery.io/hub/plugins/destination) ([Snowflake](https://www.cloudquery.io/hub/plugins/destination/cloudquery/snowflake/latest/docs), [BigQuery](https://www.cloudquery.io/hub/plugins/destination/cloudquery/bigquery/latest/docs), [Databricks](https://www.cloudquery.io/hub/plugins/destination/cloudquery/databricks/latest/docs), [DuckDB](https://www.cloudquery.io/hub/plugins/destination/cloudquery/duckdb/latest/docs), [ClickHouse](https://www.cloudquery.io/hub/plugins/destination/cloudquery/clickhouse/latest/docs), etc.).

Looking to build a Cloud Asset Inventory for your AWS data? Check our tutorial, [Building an AWS Cloud Asset Inventory](https://www.cloudquery.io/blog/building-cloud-asset-inventory-with-aws).

## Building a Cloud Asset Inventory for your GCP Resources

Let's break down the tech stack and architecture of this project, and I'll explain why we're using each component.

![Diagram illustrating the workflow of building a cloud asset inventory. The process starts with source data from GCP, Google Cloud, and GCP, which is then processed by CloudQuery for ELT (Extract, Load, Transform). The data is stored in a PostgreSQL data warehouse. dbt is used for data transformations within the data warehouse.](/images/blog/building-cloud-asset-inventory-with-gcp/image1.webp)

- **CloudQuery**
  - This tool helps us sync cloud asset data from GCP into any database, in this case, we are using PostgreSQL.
  - _Why_: CloudQuery is a super powerful and flexible data movement platform that allows you to sync from any data source into any data source.
- **PostgreSQL (DB)**
  - This is our database where we'll store all the collected cloud asset data.
  - _Why_: PostgreSQL is a strong, open-source relational database. It's great for handling complex queries and ensuring data integrity, which is exactly what we need for structured data storage and querying.
- **dbt (Data Build Tool)**
  - dbt is used to transform and model the data stored in PostgreSQL.
  - _Why_: With dbt, we can apply transformations directly within the data warehouse. This makes our data pipelines more efficient and maintainable, which is a huge win for keeping everything organized and running smoothly.

While CloudQuery can run locally as a binary or in Docker, for convenience, we'll be running CloudQuery locally and the other services in Docker. This setup helps streamline the process and keeps the environment consistent. By these tools together, you're creating a powerful setup that can collect, store, transform, and visualize our cloud asset data efficiently and effectively.

It's important to note that _you can re-use your current data and infrastructure stack of data warehouse and business intelligence (BI) tools when you use CloudQuery_. You can sync data from any data source and persist them into any database. We find that this flexibility helps you derive even more insights from your infrastructure data. As well as helping you reduce cloud costs, by allowing you to reuse the data tech stack that your data team is already familiar with.

### Prerequisites

Before we get started, make sure you have a basic understanding of GCP, and how to use the command-line interface. You'll also need a GCP account with the necessary permissions. You will also need [Docker](https://www.docker.com/) installed on your machine. Docker is needed for PostgreSQL and dbt as CloudQuery doesn't require Docker and can run on any machine and architecture as a single compiled binary.

### Setting Up Your Environment

To keep things simple, you're going to build a local development environment using [Docker Compose](https://docs.docker.com/compose/). Using Docker to run PostgreSQL, dbt, and other services, while running CloudQuery locally as a self-constrained binary executable. It allows you to take advantage of Docker's ease of use for container management while leveraging the full capabilities of CloudQuery directly on your local machine.

[We have also written some guides to help you deploy CloudQuery into production on different platforms](https://www.cloudquery.io/docs/cli/managing-cloudquery/deployments/overview).

Not interested in deploying and maintaining your CloudQuery infrastructure? You might be interested in trying out the CloudQuery Platform, so be sure to [join our wait list](https://www.cloudquery.io/contact-us).

The complete set of all the code used in this tutorial can be found at the bottom of this post.

### Getting Started With CloudQuery

To get started with CloudQuery, download and follow the installation instructions for your operating system [here](https://www.cloudquery.io/download).

**Note**: If you have any questions or encounter an issue when following along with this post, the best place to get help is to join the [CloudQuery Community](https://community.cloudquery.io).

### Setting Up a Docker Container for PostgreSQL as the Data Store for GCP Cloud Asset Data

To set up a local PostgreSQL database using Docker, you can run the following command:

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

This command pulls the PostgreSQL image (version 15) from Docker Hub, sets the password for the `postgres` user to `postgres`, and runs the container in detached mode (-d). The -p 5432:5432 option maps the container's port 5432 (PostgreSQL's default port) to port 5432 on the host machine, allowing you to connect to the database locally.

_Note_: While PostgreSQL is used in this example, any compatible database can be used as the data store for your GCP Cloud Asset data. PostgreSQL is chosen for its robustness and widespread adoption, but you can configure your setup to use another database system if preferred.

## How to Sync GCP Cloud Assets to PostgreSQL with CloudQuery

The CloudQuery GCP source integration extracts information from many of the supported services by Microsoft GCP and loads it into any supported CloudQuery destination (e.g. PostgreSQL, BigQuery, Snowflake, and [more](https://www.cloudquery.io/hub/plugins/destination)).

It's time to write the CloudQuery Config file to connect to your GCP data. You can pick up the basic configuration for our chosen cloud platforms from the [CloudQuery Hub](https://www.cloudquery.io/hub/plugins/source/cloudquery/azure/latest/docs).

### How to pull Cloud Asset data from GCP

For this tutorial, you'll be using the [CloudQuery GCP integration](https://www.cloudquery.io/hub/plugins/source/cloudquery/gcp/latest/docs). Copy that into a new file called `config.yml`.

```yaml
kind: source
spec:
  # Source spec section
  name: "gcp"
  path: "cloudquery/gcp"
  registry: "cloudquery"
  version: "v14.1.0"
  tables: [*]
  destinations: ["postgresql"]c
  spec:
    project_ids: ["my-project"]
```

This CloudQuery configuration file sets up a data source from GCP to extract information from various GCP services. The extracted data is then directed to a PostgreSQL database for storage. This setup allows for efficient data extraction, transformation, and storage, enabling easier analysis and visualization of GCP data.

For the spec>tables - be sure to include all the assets you want to sync with your Cloud Asset Inventory.

**_Note_**: If you are interested in building a multi-cloud asset inventory, you can pull assets from [any cloud provider](https://www.cloudquery.io/hub/plugins/source), including [AWS](https://www.cloudquery.io/hub/plugins/source/cloudquery/aws/latest/docs) and [Azure](https://www.cloudquery.io/hub/plugins/source/cloudquery/azure/latest/docs), using CloudQuery.

### How to Authenticate and Connect to your GCP Data

The GCP integration authenticates using your [Application Default Credentials](https://cloud.google.com/sdk/gcloud/reference/auth/application-default). Available options are all the same options described [here](https://cloud.google.com/docs/authentication/provide-credentials-adc) in detail.

Then, login with the GCP CLI:

```bash
gcloud auth application-default login
```

**_WARNING_**: Using this method to Authenticate to GCP is not recommended for production use. The suggested way is to use [Workload identity federation](https://cloud.google.com/iam/docs/workload-identity-federation). If not available you can always use service account keys and export the location of the key via GOOGLE_APPLICATION_CREDENTIALS. Highly not recommended as long-lived keys are a security risk

### How to save GCP Cloud Assets in PostgreSQL

Next, you'll need a destination integration, so head back to the [CloudQuery Hub](https://www.cloudquery.io/hub/), click Explore, and then [Destinations](https://www.cloudquery.io/hub/plugins/destination). For this example, you'll be using [PostgreSQL](https://www.cloudquery.io/hub/plugins/destination/cloudquery/postgresql/latest/docs), so find that using the search or by scrolling down the list. However, you can sync your GCP data to any other destination, and if your database isn't there, you can [build your own custom plugin](https://www.cloudquery.io/docs/cli/integrations/creating-new-integration)! At the bottom of the Config file, place a new line that contains --- and paste in the example Config for the [PostgreSQL plugin](https://www.cloudquery.io/hub/plugins/destination/cloudquery/postgresql/latest/docs#overview-configuration).

Which should look something like this:

```yaml
---
kind: destination
spec:
  name: 'postgresql'
  path: 'cloudquery/postgresql'
  registry: 'cloudquery'
  version: 'v8.0.8'
  spec:
    connection_string: 'postgresql://postgres:postgres}@db:5432/${POSTGRES_DB}?sslmode=disable'
```

And with that, the CloudQuery Config is ready. Now is a good time to test it out. Make sure your PostgreSQL Docker container is running, then we need to run the CloudQuery job so that it syncs your GCP assets into PostgreSQL with:

```bash
cloudquery sync ./config.yml
```

Now you can connect to PostgreSQL and explore the data. For example, you can use this is an example query you can use to ensure your data has been correctly synced. This query finds all the storage accounts that are allowing non-HTTPS traffic:

```bash
docker exec -it xxx /bin/bash

psql -U postgres

SELECT * from GCP_storage_accounts where enable_https_traffic_only = false;
```

### How to Use dbt to Transform GCP Data into a Cloud Asset Inventory

dbt (Data Build Tool) is used here to transform your raw GCP data into structured tables. These tables are then ready to be consumed by visualization tools for easier data interpretation and analysis. This process is fully customizable, allowing you to tailor the transformations to fit your specific GCP configuration and requirements.

To simplify data transformations, CloudQuery provides several pre-built dbt projects, including cloud security and compliance frameworks like PCI_DSS, and Foundational Security Best Practices. But for this tutorial, you will be using our prebuilt [GCP Asset Inventory](https://www.cloudquery.io/hub/addons/transformation/cloudquery/gcp-asset-inventory/latest/docs) transformation. Here's how you set up your dbt Transformations:

Go to the [GCP Asset Inventory pack](https://www.cloudquery.io/hub/addons/transformation/cloudquery/gcp-asset-inventory/latest/docs), and download and extract the contents into your project folder.

Finally, you need to define the `dbt-profiles.yml` file itself in your project directory:

```yaml
config:
  send_anonymous_usage_stats: False
  use_colors: True

GCP_asset_inventory:
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
  --volume $(pwd)/cloudquery_transformation_gcp-asset-inventory_vX.X.X:/usr/app \
  --volume $(pwd)/dbt-profiles.yml:/root/.dbt/profiles.yml \
  ghcr.io/dbt-labs/dbt-postgres:1.8.1 run
```

_Note: If you're copying this sample directly into your Docker Compose file, **make sure you set the version number to match the one you've downloaded**._

**What Happens When You Run This Command?**

- Docker pulls the specified dbt image from GitHub Container Registry.

- A new container starts, named `dbt_container`, with the specified environment variables.

- Local directories and files are mapped to directories and files inside the container, making your dbt project and configuration available to dbt.

- dbt runs the dbt run command inside the container, which processes your data models and executes them against the connected PostgreSQL database.

You can now query your new tables to find additional data about your cloud, like, _How many resources by project and region?_

```sql
select project_id, region, count(*)
from gcp_resources
group by project_id, region
order by count(*) desc
```

## Summary

In this tutorial, you walked through the process of building a cloud asset inventory for GCP using CloudQuery. Here's a quick recap of what you achieved:

- **Setting up CloudQuery**: You configured CloudQuery to connect to your GCP account and gather detailed asset data.
- **Storing Data in PostgreSQL**: You set up a PostgreSQL database to store the collected asset data, enabling efficient querying and analysis.
- **Transforming Data with dbt**: You utilized dbt to apply data transformations, enhancing the quality and usability of your cloud asset inventory.

By using CloudQuery, you can ensure that your asset inventory is comprehensive, adaptable, and integrated with your broader data strategy. This empowers your team to gain better insights and make informed decisions, ultimately driving more value from your cloud infrastructure.

_Ready to dive deeper?_ Join the [CloudQuery Community](https://community.cloudquery.io) to connect with other users and experts. You can also try out CloudQuery locally with our [quick start guide](https://www.cloudquery.io/download) or [setup a call with our team](https://www.cloudquery.io/contact-us) to learn more about how CloudQuery can help you manage your cloud assets more effectively.

Thank you for following along, and we hope this guide helps you effectively manage your GCP cloud assets!

## Additional Resources

- [Building an AWS Cloud Asset Inventory](https://www.cloudquery.io/blog/building-cloud-asset-inventory-with-aws#what-is-a-cloud-asset-inventory?)
- [What is a Cloud Asset Inventory?](https://www.cloudquery.io/blog/what-is-a-cloud-asset-inventory)
- [How to Visualize CloudQuery Data with AWS](https://www.cloudquery.io/blog/cloud-asset-inventory-cloudquery-aws-quicksight)
- [Watch: Google Cloud Asset Inventory 101](https://www.youtube.com/embed/c0LVkrTLmVY)
- [Watch: Build an AWS Cloud Asset Inventory](https://www.youtube.com/embed/H5RpX5z4H40)

## Code

### CloudQuery

`config.yml`

```yaml
kind: source
spec:
  # Source spec section
  name: "gcp"
  path: "cloudquery/gcp"
  registry: "cloudquery"
  version: "v14.1.0"
  tables: [*]
  destinations: ["postgresql"]
  spec:
    project_ids: ["my-project"]
---
kind: destination
spec:
  name: "postgresql"
  path: "cloudquery/postgresql"
  registry: "cloudquery"
  version: "v8.0.8"
  spec:
    connection_string: "postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:5432/${POSTGRES_DB}?sslmode=disable"
```

### dbt

`dbt-profiles.yml`

```yaml
config:
  send_anonymous_usage_stats: False
  use_colors: True

GCP_asset_inventory:
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
