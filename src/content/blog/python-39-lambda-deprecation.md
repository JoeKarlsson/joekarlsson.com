---
title: 'AWS Lambda Python 3.9 End-of-Support: Find and Upgrade Every Affected Function'
date: 2026-02-10
slug: 'python-39-lambda-deprecation'
description: 'AWS Lambda Python 3.9 security patches stopped Dec 15, 2025. Find every affected function across all accounts with SQL queries and upgrade to 3.12 or 3.13.'
categories: ['DevRel', 'Databases']
tags: ['AWS', 'Tutorials', 'Cloud Infrastructure']
heroImage: '/images/blog/python-39-lambda-deprecation/thumbnail.png'
canonicalUrl: 'https://www.cloudquery.io/blog/python-39-lambda-deprecation'
contentNotice: 'This post was originally published on CloudQuery blog.'
---

![Blog header for finding AWS Lambda functions running deprecated Python 3.9 runtime](/images/blog/python-39-lambda-deprecation/header.png)

> **TL;DR**
>
> AWS stopped applying security patches to the Python 3.9 Lambda runtime on December 15, 2025. If you have functions still running `python3.9`, they are exposed right now. CloudQuery syncs Lambda configurations into SQL tables across all your AWS accounts and regions, letting you find every affected function with a single query. Prioritize by tags, VPC configuration, and recent activity, then upgrade to Python 3.12 or 3.13.

You probably got the AWS Health notification about Python 3.9 end-of-support and thought you had time. Here's the thing: the deadline already passed. As of December 15, 2025, AWS stopped applying security patches to the `python3.9` runtime. Every day your functions stay on Python 3.9, they're running unpatched code in production.

The good news is that your functions still work. The bad news is that AWS will [block function creates on August 31, 2026 and block updates on September 30, 2026](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html), so you're on borrowed time for making changes too. With functions scattered across dozens of accounts and regions, clicking through the AWS Console to find them all doesn't scale. This post gives you the SQL queries to identify every affected function, prioritize the risky ones, and plan your migration.

> **Note:** **End-of-support** means AWS stops patching the runtime and drops technical support eligibility. Your functions still run, but they're frozen on an unpatched version. **Block function create** means you can't deploy new functions on that runtime. **Block function update** means you can't change code or configuration on existing functions - you're locked out of updates entirely. The runtime itself is still part of the **Lambda execution environment**, the managed container that runs your function code.

## What Is the Python 3.9 Deprecation Timeline?

[Python 3.9 reached community end-of-life on October 5, 2025](https://endoflife.date/python). AWS follows upstream EOL with its own phased deprecation for [Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html):

**December 15, 2025 (already passed):** AWS stopped applying security patches to `python3.9`. Functions using this runtime lost technical support eligibility. This is where we are right now - your Python 3.9 functions are running without security updates.

**August 31, 2026:** You won't be able to create new Lambda functions using `python3.9`. Existing functions keep running.

**September 30, 2026:** You won't be able to update existing functions using `python3.9`. This is the hard deadline - after this, you're locked out of code and configuration changes.

And Python 3.9 isn't the only one. Here's the current state of Python runtimes in Lambda:

| Runtime     | Identifier   | OS                | End of Support   | Block Create | Block Update |
| ----------- | ------------ | ----------------- | ---------------- | ------------ | ------------ |
| Python 3.13 | `python3.13` | Amazon Linux 2023 | Jun 30, 2029     | Jul 31, 2029 | Aug 31, 2029 |
| Python 3.12 | `python3.12` | Amazon Linux 2023 | Oct 31, 2028     | Nov 30, 2028 | Jan 10, 2029 |
| Python 3.11 | `python3.11` | Amazon Linux 2    | Jun 30, 2027     | Jul 31, 2027 | Aug 31, 2027 |
| Python 3.10 | `python3.10` | Amazon Linux 2    | Oct 31, 2026     | Nov 30, 2026 | Jan 15, 2027 |
| Python 3.9  | `python3.9`  | Amazon Linux 2    | **Dec 15, 2025** | Aug 31, 2026 | Sep 30, 2026 |
| Python 3.8  | `python3.8`  | Amazon Linux 2    | Oct 14, 2024     | Aug 31, 2026 | Sep 30, 2026 |

> **Note:** Python 3.8 and 3.9 share the same block create/update dates. If you still have `python3.8` functions from [the October 2024 deprecation](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html), now is the time to clean those up too.

## What Do I Need to Run These Queries?

> **Note:** Using CloudQuery Platform? You can skip the manual setup below. [CloudQuery Platform Policies](https://www.cloudquery.io/blog/introducing-cloudquery-platform-policies) let you turn any of the SQL queries in this post into a continuous detective control that runs automatically against your infrastructure. Set up a policy to flag deprecated Lambda runtimes and get notified the moment a new violation appears.

- **CloudQuery CLI** - [Download here](https://www.cloudquery.io/download), or use [CloudQuery Platform](https://www.cloudquery.io/product/cloud-asset-inventory) for a managed experience
- **PostgreSQL database** - any PostgreSQL instance works as the sync destination
- **AWS credentials** - configured for each account you want to audit (see the [AWS integration docs](https://www.cloudquery.io/hub/plugins/source/cloudquery/aws/latest/docs) for multi-account setup)

That's it. The queries below work against the synced data, so you don't need direct AWS access to run them after the initial sync.

## How Do I Find All Affected Lambda Functions?

The AWS CLI requires you to query each region separately with `aws lambda list-functions --region us-east-1 --query "Functions[?Runtime=='python3.9']"`. With dozens of accounts across multiple regions, that approach falls apart fast.

CloudQuery syncs your Lambda function data into a SQL database, letting you query across all accounts and regions in one shot. If you already have CloudQuery running, skip to the queries below. If not, here's the minimal configuration file to get started:

```yaml
kind: source
spec:
  name: aws
  path: cloudquery/aws
  registry: cloudquery
  version: 'v32.48.3'
  tables: ['aws_lambda_functions']
  destinations: ['postgresql']
---
kind: destination
spec:
  name: postgresql
  path: cloudquery/postgresql
  registry: cloudquery
  version: 'v8.13.1'
  spec:
    connection_string: ${PG_CONNECTION_STRING}
```

Run the sync:

```bash
cloudquery sync config.yml
```

CloudQuery calls AWS Lambda's [`ListFunctions`](https://docs.aws.amazon.com/lambda/latest/api/API_ListFunctions.html) API across all configured accounts and regions, pulling configuration data including the `Runtime` field into the [`aws_lambda_functions`](https://www.cloudquery.io/hub/plugins/source/cloudquery/aws/latest/tables/aws_lambda_functions) table.

> **Note:** All queries below use the [`aws_lambda_functions`](https://www.cloudquery.io/hub/plugins/source/cloudquery/aws/latest/tables/aws_lambda_functions) table. Add it to your CloudQuery configuration file's `tables` list to sync this data. If you want to run the full runtime audit, that's the only table you need.

### Find Every Python 3.9 Function

```sql
SELECT
    account_id,
    region,
    configuration->>'FunctionName' AS function_name,
    configuration->>'Runtime' AS runtime,
    configuration->>'LastModified' AS last_modified,
    arn
FROM
    aws_lambda_functions
WHERE
    configuration->>'Runtime' = 'python3.9'
ORDER BY
    account_id, region, function_name;
```

### Count by Account and Region

This gives you a quick read on which accounts and regions have the most work ahead:

```sql
SELECT
    account_id,
    region,
    COUNT(*) AS affected_functions
FROM
    aws_lambda_functions
WHERE
    configuration->>'Runtime' = 'python3.9'
GROUP BY
    account_id, region
ORDER BY
    affected_functions DESC;
```

### Audit All Deprecated and Near-EOL Runtimes at Once

If you're already running this audit, you probably have stragglers from older deprecations too. This query flags every Lambda function running a deprecated or soon-to-be-deprecated runtime:

```sql
SELECT
    account_id,
    region,
    configuration->>'FunctionName' AS function_name,
    configuration->>'Runtime' AS runtime,
    CASE
        WHEN configuration->>'Runtime' IN ('python2.7', 'python3.6', 'python3.7') THEN 'Deprecated - Updates Blocked'
        WHEN configuration->>'Runtime' IN ('python3.8', 'python3.9') THEN 'Deprecated - Unpatched'
        WHEN configuration->>'Runtime' IN ('nodejs14.x', 'nodejs16.x') THEN 'Deprecated - Updates Blocked'
        WHEN configuration->>'Runtime' = 'nodejs18.x' THEN 'Deprecated - Unpatched'
        WHEN configuration->>'Runtime' = 'dotnet6' THEN 'Deprecated - Unpatched'
        WHEN configuration->>'Runtime' = 'java8' THEN 'Deprecated - Updates Blocked'
        ELSE 'Supported'
    END AS status,
    arn
FROM
    aws_lambda_functions
WHERE
    configuration->>'Runtime' IN (
        'python2.7', 'python3.6', 'python3.7', 'python3.8', 'python3.9',
        'nodejs14.x', 'nodejs16.x', 'nodejs18.x',
        'dotnet6', 'java8'
    )
ORDER BY
    status, runtime, account_id;
```

> **Note:** Instead of hardcoding runtime strings, CloudQuery's [End-of-Life (EOL) source integration](https://www.cloudquery.io/hub/plugins/source/cloudquery/endoflife/latest/docs) pulls deprecation data from [endoflife.date](https://endoflife.date/) into the `endoflife_products` table. Join it with `aws_lambda_functions` to automatically flag any function running an unsupported runtime - no manual list to maintain. See [What We Learned Querying Cloud Infra for Expired Dependencies](https://www.cloudquery.io/blog/what-we-learned-querying-cloud-infra-for-expired-dependencies) for full examples across AWS, Azure, and GCP.

## How Do I Prioritize Functions for Migration?

Finding affected functions is step one. Step two is figuring out which ones to fix first. Not every Lambda function carries the same risk - a production payment processor running unpatched Python 3.9 needs attention before a dev account's test function. Here are several queries to help you triage.

### By Environment Tags (Production First)

Most teams tag functions with environment labels. If your tagging is consistent, this is the fastest way to find what matters:

```sql
SELECT
    account_id,
    region,
    configuration->>'FunctionName' AS function_name,
    tags->>'Environment' AS environment,
    tags->>'Team' AS team,
    arn
FROM
    aws_lambda_functions
WHERE
    configuration->>'Runtime' = 'python3.9'
    AND (
        tags->>'Environment' ILIKE '%prod%'
        OR tags->>'Environment' ILIKE '%production%'
    )
ORDER BY
    account_id, region;
```

### By VPC Configuration (Connected to Private Infrastructure)

Functions attached to a VPC are usually accessing private resources like RDS databases or internal services. That's a signal they're doing something important:

```sql
SELECT
    account_id,
    region,
    configuration->>'FunctionName' AS function_name,
    configuration->'VpcConfig'->>'VpcId' AS vpc_id,
    configuration->>'MemorySize' AS memory_mb,
    arn
FROM
    aws_lambda_functions
WHERE
    configuration->>'Runtime' = 'python3.9'
    AND configuration->'VpcConfig'->>'VpcId' IS NOT NULL
    AND configuration->'VpcConfig'->>'VpcId' != ''
ORDER BY
    account_id, region;
```

### By Resource Allocation (Bigger Functions = More Critical)

Functions with higher memory and longer timeouts tend to be doing heavier work. A 3 GB function with a 15-minute timeout is probably processing something important:

```sql
SELECT
    account_id,
    region,
    configuration->>'FunctionName' AS function_name,
    (configuration->>'MemorySize')::integer AS memory_mb,
    (configuration->>'Timeout')::integer AS timeout_seconds,
    arn
FROM
    aws_lambda_functions
WHERE
    configuration->>'Runtime' = 'python3.9'
ORDER BY
    memory_mb DESC, timeout_seconds DESC;
```

### By Last Modified Date (Recently Updated = Actively Used)

Functions that were recently modified are actively maintained. Functions that haven't been touched in years might be candidates for deletion rather than migration:

```sql
SELECT
    account_id,
    region,
    configuration->>'FunctionName' AS function_name,
    configuration->>'LastModified' AS last_modified,
    CASE
        WHEN (configuration->>'LastModified')::timestamptz > NOW() - INTERVAL '90 days' THEN 'Active'
        WHEN (configuration->>'LastModified')::timestamptz > NOW() - INTERVAL '365 days' THEN 'Stale'
        ELSE 'Abandoned'
    END AS activity_status,
    arn
FROM
    aws_lambda_functions
WHERE
    configuration->>'Runtime' = 'python3.9'
ORDER BY
    last_modified DESC;
```

### Combined Priority Score

This query pulls together multiple signals into a single prioritized view. Higher-memory, VPC-attached, recently modified functions with production tags rise to the top:

```sql
SELECT
    account_id,
    region,
    configuration->>'FunctionName' AS function_name,
    configuration->>'Runtime' AS runtime,
    (configuration->>'MemorySize')::integer AS memory_mb,
    (configuration->>'Timeout')::integer AS timeout_seconds,
    configuration->'VpcConfig'->>'VpcId' AS vpc_id,
    configuration->>'LastModified' AS last_modified,
    tags->>'Environment' AS environment,
    tags->>'Team' AS team,
    CASE
        WHEN tags->>'Environment' ILIKE '%prod%' THEN 3
        WHEN tags->>'Environment' ILIKE '%stag%' THEN 2
        ELSE 1
    END
    + CASE WHEN configuration->'VpcConfig'->>'VpcId' IS NOT NULL
           AND configuration->'VpcConfig'->>'VpcId' != '' THEN 2 ELSE 0 END
    + CASE WHEN (configuration->>'MemorySize')::integer >= 1024 THEN 1 ELSE 0 END
    + CASE WHEN (configuration->>'LastModified')::timestamptz > NOW() - INTERVAL '90 days' THEN 1 ELSE 0 END
    AS priority_score,
    arn
FROM
    aws_lambda_functions
WHERE
    configuration->>'Runtime' = 'python3.9'
ORDER BY
    priority_score DESC, memory_mb DESC;
```

## What Are the Python 3.12 and 3.13 Upgrade Paths?

Python 3.12 and 3.13 are both solid choices. The right one depends on how aggressive you want to be with the upgrade.

**Python 3.12** runs on Amazon Linux 2023, is well-tested in Lambda environments, and has support through October 2028. It's the safer choice if you want stability and a wide compatibility window. [Python 3.12 has been available in Lambda since December 2023](https://docs.aws.amazon.com/lambda/latest/dg/lambda-python.html), so the ecosystem has had time to catch up.

**Python 3.13** also runs on Amazon Linux 2023, offers better performance, and has support through June 2029. AWS [announced Python 3.13 support in Lambda](https://aws.amazon.com/blogs/compute/python-3-13-runtime-now-available-in-aws-lambda/) with improvements to the interpreter and reduced memory usage. If you're already testing compatibility, you might as well go to the latest.

### Key Breaking Changes to Watch For

Jumping from Python 3.9 to 3.12 or 3.13 spans several major Python versions. A few things will likely trip you up:

- **Unicode handling in JSON responses** changed in Python 3.12. Functions return Unicode characters directly instead of escaped sequences. If downstream consumers parse your Lambda responses, test for this.
- **Removed modules**: `distutils` was removed in Python 3.12. If your function or its dependencies import `distutils`, they'll break.
- **Container image base**: Python 3.12+ uses Amazon Linux 2023 with `microdnf` as the package manager. If you deploy Lambda functions as container images, update Dockerfiles to use `dnf` instead of `yum`.
- **Type hint syntax**: Python 3.10+ supports `X | Y` union types natively. Not a breaking change, but worth knowing if you're updating type hints.

Test your functions locally before deploying. The [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html) lets you invoke functions with different runtimes against test events.

## How Do I Upgrade Lambda Functions?

### AWS Console (One at a Time)

Open your function in the Lambda console, go to the "Code" tab, select a new runtime from the dropdown. Good for a handful of functions, doesn't scale beyond that.

### AWS CLI (Scriptable)

```bash
aws lambda update-function-configuration \
  --function-name your-function-name \
  --runtime python3.12
```

### Infrastructure as Code (Recommended for Teams)

Update the runtime in your CloudFormation, CDK, Terraform, or SAM templates and deploy through your normal pipeline. This is the right approach if your functions are already managed through IaC - and if they're not, this migration is a good reason to start.

### Track Your Migration Progress

After you start upgrading, use this query to monitor progress across your accounts. Run it weekly and share with your team:

```sql
SELECT
    account_id,
    configuration->>'Runtime' AS runtime,
    COUNT(*) AS function_count,
    ROUND(
        COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY account_id),
        1
    ) AS percentage
FROM
    aws_lambda_functions
WHERE
    configuration->>'Runtime' LIKE 'python%'
GROUP BY
    account_id, configuration->>'Runtime'
ORDER BY
    account_id, runtime;
```

This shows you the ratio of Python 3.9 functions to upgraded functions per account - the kind of data your security team or leadership will ask for.

### Prevent It from Happening Again with Policies

Running these queries once finds today's problems. [CloudQuery Platform Policies](https://www.cloudquery.io/blog/introducing-cloudquery-platform-policies) lets you turn any of these queries into a persistent detective control that runs continuously against your infrastructure. Write a policy in SQL that flags any Lambda function running a deprecated runtime, and get notified in Slack, Jira, or via webhook the moment a new violation appears.

Instead of re-running audit queries before each leadership review, a policy like the runtime audit query above catches violations as they happen - whether someone deploys a new function on `python3.9` through the console or an IaC template that hasn't been updated yet. Combined with [Policy Groups](https://www.cloudquery.io/product/policies), you can bundle runtime checks alongside your other governance rules into a single enforceable standard.

## Key Takeaways: Python 3.9 Lambda Migration

**Security Exposure:**

- Security patches stopped December 15, 2025 - your functions are unpatched now
- Function updates blocked September 30, 2026 - plan ahead
- Python 3.8 functions face the same deadlines

**Discovery:**

- CloudQuery gives you multi-account, multi-region visibility through SQL
- The runtime audit query catches all deprecated runtimes, not only Python 3.9
- The [End-of-Life integration](https://www.cloudquery.io/hub/plugins/source/cloudquery/endoflife/latest/docs) automates deprecation tracking across all runtimes and providers
- Export results to CSV for tracking and reporting

**Prioritization:**

- Tag-based filtering surfaces production functions first
- VPC-attached functions are usually connecting to critical infrastructure
- Memory allocation and recent modification date serve as rough criticality proxies
- The combined priority score query ranks functions for migration order

**Ongoing Governance:**

- [CloudQuery Platform Policies](https://www.cloudquery.io/blog/introducing-cloudquery-platform-policies) turns these queries into continuous detective controls
- Get notified automatically when new functions are deployed on deprecated runtimes
- Bundle runtime checks with other governance rules using Policy Groups

**Remediation:**

- Python 3.12 is the stable choice with support through October 2028
- Python 3.13 has the latest features and support through June 2029
- Test for `distutils` removal, Unicode changes, and container image differences before deploying

## Start Running These Queries Today

Your Python 3.9 Lambda functions have been running without security patches for nearly two months. The longer you wait, the wider the exposure window gets. CloudQuery gives you the visibility to find every affected function across all your AWS accounts, prioritize by actual risk, and track your migration progress.

[Download CloudQuery](https://www.cloudquery.io/download) to start syncing your Lambda data. Check out the [AWS integration documentation](https://www.cloudquery.io/hub/plugins/source/cloudquery/aws/latest/docs) for configuration details, or [join our Community](https://community.cloudquery.io) to connect with other teams running the same migration. If you're dealing with hundreds of accounts, [contact us](https://www.cloudquery.io/contact-us) to see how CloudQuery Platform can help you run these queries across your entire organization.

If you've already upgraded from a previous runtime deprecation, you know the drill. If this is your first one - the queries above will get you from "how many functions do we even have?" to "here's the migration plan" in an afternoon. Don't wait for the update block to force your hand.

## Frequently Asked Questions

### What Is the Python 3.9 End-of-Life Date for AWS Lambda?

AWS ended support for `python3.9` in Lambda on December 15, 2025. After this date, the runtime [no longer receives security patches or updates](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html) and functions lose technical support eligibility.

### Will My Lambda Functions Stop Working After the Deprecation?

No. Your functions continue running on the `python3.9` runtime indefinitely. The deprecation affects security patches (stopped December 15, 2025), function creation (blocked August 31, 2026), and function updates (blocked September 30, 2026). Execution is never blocked.

### How Can I Find All Python 3.9 Lambda Functions Across Multiple AWS Accounts?

CloudQuery syncs Lambda function data into a SQL database. Query the [`aws_lambda_functions`](https://www.cloudquery.io/hub/plugins/source/cloudquery/aws/latest/tables/aws_lambda_functions) table filtering where `configuration->>'Runtime' = 'python3.9'` to find every affected function across all accounts and regions in a single query.

### Should I Upgrade to Python 3.12 or Python 3.13?

Python 3.12 is the stable choice with [Lambda support through October 2028](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html). Python 3.13 offers better performance and support through June 2029. Both run on Amazon Linux 2023. Pick 3.12 for stability or 3.13 if you want the latest features and longest support window.

### What Are the Key Breaking Changes Between Python 3.9 and 3.12?

The most common issues are: `distutils` module removal (Python 3.12), Unicode handling changes in JSON responses, and container image base changes from Amazon Linux 2 to Amazon Linux 2023 with `microdnf`. Test your functions with the [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html) before deploying to production.

### Can I Automate the Runtime Upgrade Across Hundreds of Functions?

Yes. Use CloudQuery to export affected functions to CSV, then use the AWS CLI, CloudFormation, Terraform, or CDK to batch update runtimes. Start with non-production environments, validate, then roll through production accounts. The migration tracking query in this post shows you progress across accounts over time.

### What Happens If I Miss the September 30, 2026 Deadline?

You won't be able to update function code or configuration. Functions continue running, but you're locked into the current version. To make changes, you'd need to create a new function with a supported runtime and redirect triggers.

### Does This Affect Google Cloud Functions or Azure Functions Too?

[Python 3.9 reached community end-of-life on October 5, 2025](https://endoflife.date/python), which affects all cloud providers. Google Cloud Functions and Azure Functions follow their own deprecation schedules. CloudQuery supports [GCP](https://www.cloudquery.io/hub/plugins/source/cloudquery/gcp/latest/docs) and [Azure](https://www.cloudquery.io/hub/plugins/source/cloudquery/azure/latest/docs) plugins, so you can run similar queries against those providers' serverless functions.

Ready to find your affected functions? [Try CloudQuery](https://www.cloudquery.io/docs/cli/getting-started) and run these queries across your AWS infrastructure today.

### Related Resources

- [Introducing CloudQuery Platform Policies](https://www.cloudquery.io/blog/introducing-cloudquery-platform-policies) - turn these queries into continuous detective controls
- [What We Learned Querying Cloud Infra for Expired Dependencies](https://www.cloudquery.io/blog/what-we-learned-querying-cloud-infra-for-expired-dependencies) - automate EOL tracking with the End-of-Life integration
- [Finding AWS Lambda Functions Affected by Node.js 20.x End-of-Life](https://www.cloudquery.io/blog/aws-lambda-nodejs-20-eol) - same approach for Node.js runtime deprecation
- [List Lambdas Across AWS Accounts and Monitor Health Events](https://www.cloudquery.io/blog/list-aws-lambdas-across-accounts) - deeper queries joining Lambda with AWS Health events
- [`aws_lambda_functions` table schema](https://www.cloudquery.io/hub/plugins/source/cloudquery/aws/latest/tables/aws_lambda_functions) - full column reference
- [AWS Lambda runtimes documentation](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html) - official deprecation dates
