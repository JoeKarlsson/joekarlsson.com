---
title: What We Learned Querying Cloud Infra for Expired Dependencies
date: 2025-03-20
slug: 'what-we-learned-querying-cloud-infra-for-expired-dependencies'
description: 'Learn how to easily track and fix end-of-life cloud services across AWS, Azure, and GCP with CloudQuery new End-of-Life (EOL) integration.'
categories: ['Work']
tags: ['Engineering', 'Product News']
heroImage: '/images/blog/what-we-learned-querying-cloud-infra-for-expired-dependencies/thumbnail.webp'
canonicalUrl: 'https://www.cloudquery.io/blog/what-we-learned-querying-cloud-infra-for-expired-dependencies'
contentNotice: 'This post was originally published on CloudQuery blog.'
---

Every cloud engineer has, at some point, found themselves frantically searching for unsupported software lurking in their environment. Maybe it's an _EKS cluster running an ancient Kubernetes version_, or a _Lambda function still clinging to Python 3.7_ like it's 2019. Whatever it is, finding it is always a pain, especially when you have multiple cloud providers in the mix.

![Meme of a man confidently thinking the tech stack is modern (left), realizing half the dependencies are already out of support (right).](/images/blog/what-we-learned-querying-cloud-infra-for-expired-dependencies/image1.webp)

And here's the thing: this happens all the time. In our experience, identifying EOL (end-of-life) software across AWS, Azure, and GCP is one of the most frustratingly common problems teams run into. You don't get a nice alert from your cloud provider saying, "Hey, your function runtime is about to be deprecated, want us to fix that for you?" Instead, you get zero security patches, compliance headaches, and broken services at the worst possible time.

Tracking this manually? Forget it. Every cloud provider stores this information differently, in different APIs and in different formats.

That's why we built [CloudQuery's new End of Life (EOL) integration](https://www.cloudquery.io/hub/plugins/source/cloudquery/endoflife/latest/docs), because this problem shouldn't be this hard. This integration pulls in end-of-life data from [endoflife.date](https://endoflife.date/) and makes it queryable alongside your cloud infrastructure. Now, instead of digging through multiple cloud dashboards, you can run a single SQL query and instantly see which services are unsupported or about to be.

![Meme showing two perspectives on cloud management: one side struggling with managing different clouds separately, the other happily querying everything in one place.](/images/blog/what-we-learned-querying-cloud-infra-for-expired-dependencies/image3.webp)

In this post, I'll walk you through some things we learned using the EOL Integration, and how to use SQL to find and fix outdated software across [AWS](https://www.cloudquery.io/hub/plugins/source/cloudquery/aws/latest/docs), [Azure](https://www.cloudquery.io/hub/plugins/source/cloudquery/azure/latest/docs), and [GCP](https://www.cloudquery.io/hub/plugins/source/cloudquery/gcp/latest/docs) in one place, so you can spend less time playing _guess-the-deprecated-service_ and more time actually fixing it.

## Identifying Cloud and Software Products Losing Support in the Next 30 Days

I'm sure you already know this, but running unsupported software is a really bad idea. If a product loses support, that means no more security patches, no bug fixes, and no help when things go sideways. That's a nightmare for security and cloud governance teams, who need to ensure everything stays secure, compliant, and actually working.

This query retrieves a **list of products that will lose support within the next 30 days.**

```sql
SELECT
 product,
 cycle,
 latest,
 lts,
 support_until
FROM endoflife_products
WHERE support_until < DATE(NOW() + INTERVAL 30 DAY)
 AND support_until >= NOW()
ORDER BY product;
```

Great, you've got a list of products about to lose support. Now what? A list is nice, but _real value comes from applying this to your actual tech stack and cloud environments_. Knowing that Kubernetes 1.24 is expiring soon is only helpful if you can check whether **_your_** clusters are affected.

That's where CloudQuery makes life easier. Instead of juggling multiple tools and dashboards, CloudQuery lets you pull in data from multiple cloud providers and services, enrich it, and analyze it all in one place. No more hopping between AWS, GCP, and some random spreadsheet to get the full picture. Everything is centralized and queryable using SQL.

And because I like making things easy, I'll show you how to apply this to real-world use cases below, so you can actually do something with this information instead of just staring at a table.

## How to check if your AWS EKS cluster is running an unsupported Kubernetes version

This query checks all your **Amazon EKS clusters** and compares their **Kubernetes version** to see if they are unsupported or will lose support within three months. It assigns a **red status** to already unsupported versions and a **yellow status** to versions that will be unsupported soon, helping teams prioritize upgrades.

```sql
WITH
 now() AS current_time,
 current_time + toIntervalMonth(3) AS three_months_ahead

SELECT
 eks.name AS cluster_name,
 eks.version AS kubernetes_version,
 eol.product,
 eol.cycle,
 eol.eol,
 eol.eol_since,
 eol.support_until,
 multiIf(
     eol.eol = true, 'red',  -- Already unsupported
     eol.support_until <= three_months_ahead, 'yellow',  -- Soon unsupported
     'green'
 ) AS status
FROM aws_eks_clusters AS eks
LEFT JOIN endoflife_products AS eol
 ON eks.version = eol.cycle
WHERE eol.product = 'kubernetes'
  AND (eol.eol = true OR eol.support_until <= three_months_ahead);
```

If your EKS cluster shows up **red** in the query results, it's already unsupported. If it's **yellow**, you've got three months before it joins the unsupported club. Either way, it's time to upgrade. Before upgrading, make sure you check with AWS to see their supported Kubernetes versions [here](https://docs.aws.amazon.com/eks/latest/userguide/kubernetes-versions.html).

Amazon EKS will automatically upgrade existing control planes (not nodes) to the oldest supported version through a gradual deployment process after the end of extended support date. After the automatic control plane update, users _must [manually update their cluster add-ons and Amazon EC2 nodes](https://docs.aws.amazon.com/eks/latest/userguide/update-cluster.html#update-existing-cluster)_. Amazon EKS does not allow control planes to stay on a version that has reached the end of support.

Before upgrading the cluster, update your node groups to ensure compatibility.

**For Managed Node Groups**
List existing node groups:

```bash
aws eks list-nodegroups --cluster-name <cluster-name>
```

Then, upgrade each node group:

```bash
aws eks update-nodegroup-version --cluster-name <cluster-name> --nodegroup-name <node-group-name>
```

After updating the nodes, upgrade the control plane.

```bash
sh aws eks update-cluster-version --name --kubernetes-version
```

This process may take several minutes. AWS will handle upgrading the control plane components. Once the upgrade is complete, confirm everything is running as expected:

```bash
aws eks describe-cluster --name --query "cluster.version"
```

If everything looks good, your cluster will now be running a supported Kubernetes version. If not, be sure to check the AWS EKS logs.

## How to find AWS RDS Databases Reaching End of Standard Support

Upgrading your AWS services before they hit their end-of-life date isn't just about security and compliance, it can save you real money. AWS doesn't just stop supporting outdated services; in many cases, they start charging you extra for continued usage.

Take Amazon RDS MySQL, for example. [Once its end of standard support date passes, AWS automatically enrolls your databases into RDS Extended Support](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/extended-support-charges.html), which comes with extra charges per vCPU per hour. That means every day you delay upgrading, you're paying more for the same service, without getting new features or improvements.

You can avoid these unnecessary costs by identifying and upgrading outdated RDS databases before AWS starts charging you.

Here's how:

```sql
-- Set the current time and calculate the threshold date (30 days from now)
WITH
    now() AS now_time,
    now() + toIntervalDay(30) AS threshold,
    eol_data AS (
        SELECT
            lower(cycle) AS cycle,
            lower(product) AS product,
            eol_since,
        FROM endoflife_products
        WHERE lower(product) = 'amazon-rds-mysql'
    )
-- Retrieve RDS MySQL instances reaching EOL within the next 30 days
SELECT
    r.account_id,
    r.engine,
    r.major_engine_version,
    e.eol_since AS "RDS end of standard support date",
    dateDiff('day', now_time, e.eol_since) AS days_until_standard_support_end,
    multiIf(
        e.eol_since < now_time, 'Extended support active',
        e.eol_since <= threshold, 'Upgrade soon',
        'Standard support active'
    ) AS support_status
FROM aws_rds_engine_versions AS r
INNER JOIN eol_data AS e
    ON lower(r.engine) = replace(e.product, 'amazon-rds-', '')
    AND lower(r.major_engine_version) = e.cycle
WHERE e.eol_since <= threshold;
```

When you run this query:

- Checks all your RDS MySQL instances and finds those reaching EOL within the next 30 days.
- Flags instances already in _Extended Support_, so you know where you're paying extra.
- Gives a clear upgrade priority list, so you can fix things before AWS bills you more.

## Identifying and Upgrading AWS Lambda Functions Running Python 3.8 Before Deprecation

Once AWS drops support, there are no more security patches, meaning every hacker with an internet connection gets a free shot at your outdated functions.

And if you're in cloud governance or compliance, congratulations, you now have an audit headache because unsupported software is a big red flag for frameworks like SOC 2, ISO 27001, and PCI DSS. Plus, do you really want to explain to your boss why critical functions broke after an AWS update? No? Then run the query, find your at-risk functions, and upgrade before Python 3.8 turns into a security time bomb.

This query retrieves AWS Lambda functions with their version details and joins them with Python end-of-life support data for runtimes expiring between the current time and six months from now.

```sql
-- Set the current time and calculate six months ahead
WITH
    now() AS current_time,
    current_time + toIntervalMonth(6) AS six_months_ahead

-- Retrieve AWS Lambda functions with their version details and join them with Python EOL support data
SELECT
    f.arn AS function_arn,
    fv.function_name,
    fv.version,
    fv.runtime,
    eol.support_until,
    eol.eol,
    eol.eol_since
FROM aws_lambda_functions AS f
JOIN aws_lambda_function_versions AS fv ON f.arn = fv.function_arn
JOIN endoflife_products AS eol ON fv.runtime = eol.cycle
WHERE eol.product LIKE '%python%'
  AND eol.support_until < six_months_ahead
  AND eol.support_until >= current_time;
```

If your Lambda functions are running Python 3.8 or older, AWS won't support them anymore. Here's what you need to do:

1. Go to the AWS Lambda console, open your function, and change the runtime to Python 3.9 or later. If you prefer the CLI, run:

   ```bash
   aws lambda update-function-configuration --function-name <function-name> --runtime python3.9
   ```

2. Some of your libraries might be outdated, so you'll need to update your dependencies. Run:

   ```bash
   pip install --upgrade -r requirements.txt
   ```

Then, be sure to test everything locally before deploying.

## How to Find Unsupported Versions of Lambda and Cloud Functions from AWS, Azure, and GCP

Keeping track of serverless functions across multiple cloud providers can feel like herding cats. Every platform has its own naming conventions, monitoring tools, and ways of storing function metadata. AWS has Lambda, Azure calls them App Service Web Apps, and GCP splits them between Cloud Functions v1 and v2. Trying to track down which functions are running outdated Python versions across all three? That's a nightmare - unless you centralize everything.

That's where CloudQuery comes in. Instead of digging through AWS, Azure, and GCP individually, you can pull all your functions into one place and analyze them with a single SQL query

![CloudQuery SQL Console running a query to identify outdated serverless functions across AWS, Azure, and GCP, displaying results in a unified table.](/images/blog/what-we-learned-querying-cloud-infra-for-expired-dependencies/image2.webp)

The query below does exactly that. It gathers end-of-life details for Python, Node, and Go from a products table and combines function details from AWS, Azure, and GCP into a single dataset. It then joins these datasets on the runtime field and assigns a status color (red, yellow, green) based on the support expiration date.

```sql
WITH
    -- Retrieve EOL details for Python, Node, and Go runtimes
    eol_data AS (
        SELECT
            lower(cycle) AS cycle,
            support_until,
            eol,
            eol_since,
            lower(product) AS product
        FROM endoflife_products
        WHERE lower(product) LIKE '%python%'
           OR lower(product) LIKE '%node%'
           OR lower(product) LIKE '%go%'
    ),

    -- Combine function data from AWS, Azure, GCP (v1 and v2)
    all_functions AS (
        -- AWS Lambda Functions: extract details from the configuration JSON
        SELECT
            f.arn AS function_id,
            JSONExtractString(f.configuration, 'FunctionName') AS function_name,
            lower(JSONExtractString(f.configuration, 'Version')) AS function_version,
            lower(JSONExtractString(f.configuration, 'Runtime')) AS runtime,
            'AWS' AS cloud_provider
        FROM aws_lambda_functions AS f
        WHERE lower(JSONExtractString(f.configuration, 'Runtime')) LIKE '%python%'
           OR lower(JSONExtractString(f.configuration, 'Runtime')) LIKE '%node%'
           OR lower(JSONExtractString(f.configuration, 'Runtime')) LIKE '%go%'

        UNION ALL

        -- Azure Functions: extract runtime from properties JSON and remove the "|" character;
        -- function_version is set to a constant 'latest'
        SELECT
            id AS function_id,
            name AS function_name,
            'latest' AS function_version,
            replaceAll(lower(regexpExtract(properties, '"linuxFxVersion":s*"([^"]+)"', 1)), '|', '') AS runtime,
            'Azure' AS cloud_provider
        FROM azure_appservice_web_apps
        WHERE lower(regexpExtract(properties, '"linuxFxVersion":s*"([^"]+)"', 1)) LIKE '%python%'
           OR lower(regexpExtract(properties, '"linuxFxVersion":s*"([^"]+)"', 1)) LIKE '%node%'
           OR lower(regexpExtract(properties, '"linuxFxVersion":s*"([^"]+)"', 1)) LIKE '%go%'

        UNION ALL

        -- GCP Cloud Functions (v1)
        SELECT
            name AS function_id,
            name AS function_name,
            CAST(version_id AS String) AS function_version,
            lower(runtime) AS runtime,
            'GCP' AS cloud_provider
        FROM gcp_functions_functions
        WHERE lower(runtime) LIKE '%python%'
           OR lower(runtime) LIKE '%node%'
           OR lower(runtime) LIKE '%go%'

        UNION ALL

        -- GCP Cloud Functions (v2) using build_config for runtime; function_version set to 'latest'
        SELECT
            name AS function_id,
            name AS function_name,
            'latest' AS function_version,
            lower(JSONExtractString(build_config, 'runtime')) AS runtime,
            'GCPv2' AS cloud_provider
        FROM gcp_functionsv2_functions
        WHERE lower(JSONExtractString(build_config, 'runtime')) LIKE '%python%'
           OR lower(JSONExtractString(build_config, 'runtime')) LIKE '%node%'
           OR lower(JSONExtractString(build_config, 'runtime')) LIKE '%go%'
    )

SELECT
    af.cloud_provider,
    multiIf(
        ed.eol = true OR ed.support_until < now(), 'red',
        ed.support_until < now() + toIntervalMonth(9), 'yellow',
        'green'
    ) AS status,
    af.runtime,
    CASE
      WHEN lower(af.function_version) = '$latest' THEN 'latest'
      ELSE af.function_version
    END AS function_version,
    af.function_id,
    af.function_name
FROM all_functions AS af
LEFT JOIN eol_data AS ed
    ON af.runtime = ed.cycle
ORDER BY status, cloud_provider;
```

## Wrap Up

If there's one thing you take away from this, _tracking unsupported software across cloud environments doesn't have to be painful_. [CloudQuery's EOL integration](https://www.cloudquery.io/hub/plugins/source/cloudquery/endoflife/latest/docs) makes it easy to find and fix end-of-life services before they turn into security risks or compliance nightmares.

### What You Can Do Now

- Run these queries in CloudQuery to get a view of unsupported software in your infrastructure.
- Identify at-risk services before they become a problem. Whether it's an old Kubernetes cluster, a deprecated Lambda runtime, or an unsupported database, knowing early means you can fix it before it breaks.
- Plan upgrades proactively instead of scrambling to patch things at the last minute - or worse, during an outage.

### How to Integrate It with CloudQuery's API

Want to fetch end-of-life data and pipe it into your systems programmatically? The [CloudQuery API](https://platform-api-docs.cloudquery.io/) lets you integrate your Cloud Data into your apps so you can:

- Push findings to your ticketing system or CMDB for streamlined upgrade tracking.
- Set up scheduled reports to monitor EOL software over time.
- Integrate notifications into your Slack, PagerDuty, or internal dashboards so your team gets alerts before an outdated service becomes a crisis.
- Pull your cloud EOL data into your existing workflows, whether that's for cloud governance, security monitoring, or compliance tracking.

### Next Steps

Try out the [CloudQuery EOL Integration](https://www.cloudquery.io/hub/plugins/source/cloudquery/endoflife/latest/docs) and start automating end-of-life tracking in your cloud infrastructure today.

The best way to understand how CloudQuery transforms cloud visibility is to see it live. Our team can walk you through a tailored demo based on your cloud environment and use cases. Let's talk about how CloudQuery can fit into your stack. [Schedule a demo today](https://www.cloudquery.io/contact-us)

**Stay updated on the latest from CloudQuery:**

- [Sign up for our newsletter](https://www.cloudquery.io/newsletter)
- [Join the CloudQuery Developer Community](https://community.cloudquery.io/)
- Follow us on [LinkedIn](https://www.linkedin.com/company/cloudqueryio), [X](https://x.com/cloudqueryio), and [YouTube](https://www.youtube.com/@cloudqueryio)
- **Explore Docs:** [Read Documentation](https://www.cloudquery.io/docs/platform/introduction)
