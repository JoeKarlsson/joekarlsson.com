---
title: 'AWS Lambda Node.js 20 End of Life: Upgrade to Node.js 22 Before April 2026'
date: 2025-11-24
slug: 'aws-lambda-nodejs-20-eol'
description: 'Node.js 20 on AWS Lambda hits EOL April 30, 2026. Find every affected function across all accounts, fix breaking changes, and upgrade with this step-by-step guide.'
categories: ['Work']
tags: ['AWS', 'Tutorials', 'Cloud Infrastructure']
heroImage: '/images/blog/aws-lambda-nodejs-20-eol/thumbnail.png'
canonicalUrl: 'https://www.cloudquery.io/blog/aws-lambda-nodejs-20-eol'
contentNotice: 'This post was originally published on CloudQuery blog.'
---

![Blog header for finding AWS Lambda functions running end-of-life Node.js 20 runtime](/images/blog/aws-lambda-nodejs-20-eol/header.png)

> **TL;DR:** AWS Lambda Node.js 20.x reaches end-of-life on April 30, 2026, after which security patches stop and you progressively lose the ability to create or update functions on this runtime. Upgrade to Node.js 22, test for import assertion syntax changes, native module ABI mismatches, and CA certificate configuration, and use CloudQuery Platform to find every affected function across all your AWS accounts with a single SQL query.

You probably got an AWS Health notification titled "[Action Required] AWS Lambda Node.js 20.x end-of-life" and need to know exactly what to do, when to do it, and what breaks along the way. With Lambda functions scattered across multiple AWS accounts and regions, tracking down every instance using the `nodejs20.x` runtime and upgrading them before the deadline is a real project.

This guide covers the full deprecation timeline, a step-by-step migration path from Node.js 20 to Node.js 22, breaking changes to watch for, Infrastructure as Code examples for SAM/CDK/Terraform, and how to find every affected function across all your AWS accounts using CloudQuery Platform.

## What Is the Node.js 20 End-of-Life Timeline for AWS Lambda?

[Node.js 20 reaches end-of-life on April 30, 2026](https://nodejs.org/en/about/previous-releases), when the Node.js project stops providing security patches and bug fixes. AWS Lambda follows this schedule with a [three-phase deprecation](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html):

**Phase 1 (April 30, 2026): Security patches stop.** Lambda stops applying security patches to the `nodejs20.x` runtime. Functions using this runtime lose technical support eligibility. The runtime disappears from the AWS Console, though you can still create and update functions via the AWS CLI, CloudFormation, SAM, or CDK.

**Phase 2 (August 31, 2026): Function creation blocked.** You can no longer create new Lambda functions using the `nodejs20.x` runtime through any method.

**Phase 3 (September 30, 2026): Function updates blocked.** You can no longer update existing functions using the `nodejs20.x` runtime. This is the hard deadline for migration.

Your functions continue to run and can be invoked after all three phases. AWS [does not block invocations of functions that use a deprecated runtime](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html). But running unpatched code in production creates security and compliance risk you should not accept.

## What Is the Full Lambda Node.js Runtime Deprecation Schedule?

This table shows the deprecation timeline for every Node.js runtime on Lambda, based on the [AWS Lambda runtimes documentation](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html) as of February 2026:

| Runtime      | Node.js EOL                                   | Lambda Phase 1 (Patches Stop) | Lambda Phase 2 (Block Create) | Lambda Phase 3 (Block Update) |
| ------------ | --------------------------------------------- | ----------------------------- | ----------------------------- | ----------------------------- |
| `nodejs16.x` | Sep 11, 2023                                  | Jun 12, 2024                  | Aug 31, 2026                  | Sep 30, 2026                  |
| `nodejs18.x` | Apr 30, 2025                                  | Sep 1, 2025                   | Aug 31, 2026                  | Sep 30, 2026                  |
| `nodejs20.x` | [Apr 30, 2026](https://endoflife.date/nodejs) | Apr 30, 2026                  | Aug 31, 2026                  | Sep 30, 2026                  |
| `nodejs22.x` | [Apr 30, 2027](https://endoflife.date/nodejs) | Apr 30, 2027                  | Jun 1, 2027                   | Jul 1, 2027                   |
| `nodejs24.x` | [Apr 30, 2028](https://endoflife.date/nodejs) | Apr 30, 2028                  | Jun 1, 2028                   | Jul 1, 2028                   |

If you are still running `nodejs16.x` or `nodejs18.x` functions, those runtimes are already deprecated and should be upgraded immediately.

## How Do I Find All Lambda Functions Using Node.js 20 Across Multiple Accounts?

The AWS CLI requires you to query each region separately:

```bash
aws lambda list-functions \
  --region us-east-1 \
  --query "Functions[?Runtime=='nodejs20.x'].[FunctionName,Runtime]" \
  --output table
```

When you manage dozens of accounts across multiple regions, this does not scale. CloudQuery Platform syncs your Lambda function data into a SQL database, letting you query across all accounts and regions at once.

### Setup

[Get started with CloudQuery Platform](https://www.cloudquery.io/docs/cli/getting-started) and create a configuration file:

```yaml
kind: source
spec:
  name: aws
  path: cloudquery/aws
  registry: cloudquery
  version: 'v33.8.1'
  tables: ['aws_lambda_functions']
  destinations: ['postgresql']
---
kind: destination
spec:
  name: postgresql
  path: cloudquery/postgresql
  registry: cloudquery
  version: 'v8.14.1'
  spec:
    connection_string: ${PG_CONNECTION_STRING}
```

Run the sync:

```bash
cloudquery sync config.yml
```

CloudQuery Platform calls the AWS Lambda [`ListFunctions` API](https://docs.aws.amazon.com/lambda/latest/APIReference/API_ListFunctions.html) across all configured accounts and regions, extracting configuration data including the `Runtime` field.

### Query for All Affected Functions

After syncing, query for functions using any end-of-life or soon-to-be-deprecated runtime:

```sql
SELECT
    account_id,
    region,
    configuration->>'FunctionName' AS function_name,
    configuration->>'Runtime' AS runtime,
    arn
FROM
    aws_lambda_functions
WHERE
    configuration->>'Runtime' IN ('nodejs16.x', 'nodejs18.x', 'nodejs20.x')
ORDER BY
    configuration->>'Runtime', account_id, region;
```

### Count Affected Functions by Account and Runtime

```sql
SELECT
    account_id,
    configuration->>'Runtime' AS runtime,
    COUNT(*) AS affected_functions
FROM
    aws_lambda_functions
WHERE
    configuration->>'Runtime' IN ('nodejs16.x', 'nodejs18.x', 'nodejs20.x')
GROUP BY
    account_id, configuration->>'Runtime'
ORDER BY
    account_id, runtime;
```

Export the results to CSV for tracking or create a dashboard to monitor remediation progress.

## How Do I Track Migration Progress Over Time?

Run CloudQuery Platform syncs on a schedule (daily or weekly) and compare results over time. Because CloudQuery stores point-in-time snapshots in your database, you can track how many `nodejs20.x` functions remain in each account and region:

```sql
SELECT
    DATE(cq_sync_time) AS sync_date,
    COUNT(*) AS nodejs20_functions
FROM
    aws_lambda_functions
WHERE
    configuration->>'Runtime' = 'nodejs20.x'
GROUP BY
    DATE(cq_sync_time)
ORDER BY
    sync_date;
```

This gives your team a clear burn-down chart of remaining migrations.

## Should I Upgrade to Node.js 22 or Node.js 24?

**Node.js 22 is the recommended target for most teams.** It entered [LTS (Long-Term Support) status in October 2024](https://nodejs.org/en/blog/release/v22.11.0) and has been [available in Lambda since November 2024](https://aws.amazon.com/about-aws/whats-new/2024/11/aws-lambda-support-nodejs-22/). Its Lambda deprecation date is April 30, 2027, giving you a full year of support after the Node.js 20 deadline.

[Node.js 24 became available in Lambda in November 2025](https://aws.amazon.com/about-aws/whats-new/2025/11/aws-lambda-nodejs-24/) and has a deprecation date of April 30, 2028. However, Node.js 24 introduces a significant Lambda-specific change: [callback-based function handlers are no longer supported](https://aws.amazon.com/blogs/compute/node-js-24-runtime-now-available-in-aws-lambda/). If your functions use the `callback` parameter (e.g., `exports.handler = function(event, context, callback) {...}`), they will not work on Node.js 24 without rewriting them to use `async/await`. The `context.callbackWaitsForEmptyEventLoop`, `context.succeed`, `context.fail`, and `context.done` methods are also removed.

|                          | Node.js 22                | Node.js 24                   |
| ------------------------ | ------------------------- | ---------------------------- |
| Lambda deprecation       | Apr 30, 2027              | Apr 30, 2028                 |
| Callback handlers        | Supported                 | Not supported                |
| Migration effort from 20 | Moderate                  | Higher                       |
| LTS status               | Maintenance LTS           | Active LTS                   |
| Recommended for          | Most production workloads | New projects, early adopters |

For this guide, we focus on the Node.js 20 to 22 upgrade path.

## What Breaks When Upgrading From Node.js 20 to 22?

Before upgrading, review these breaking changes documented in the [Node.js v20 to v22 migration guide](https://nodejs.org/en/blog/migrations/v20-to-v22):

### Import Assertions Removed

The `import ... assert` syntax was removed in Node.js 22 and replaced with `import ... with` attributes. If your code imports JSON modules like this:

```javascript
// Node.js 20 (no longer works in 22)
import config from './config.json' assert { type: 'json' };
```

Change it to:

```javascript
// Node.js 22
import config from './config.json' with { type: 'json' };
```

A codemod is available to automate this:

```bash
npx codemod run @nodejs/import-assertions-to-attributes
```

### Native Module ABI Mismatch

The V8 engine upgrade in Node.js 22 changes the [ABI (Application Binary Interface)](https://nodejs.org/en/blog/migrations/v20-to-v22) for native addons. Packages like `sharp`, `bcrypt`, and `better-sqlite3` that include prebuilt binaries compiled against Node.js 20 may crash at runtime with a `NODE_MODULE_VERSION` mismatch error. After switching Node versions, rebuild native modules:

```bash
npm rebuild
```

Or if using a specific package:

```bash
npm rebuild sharp
```

### CA Certificate Loading

This is not new to Node.js 22, but it remains a common migration pitfall. Starting with Node.js 20, Lambda [no longer loads additional CA certificates by default](https://docs.aws.amazon.com/lambda/latest/dg/lambda-nodejs.html). If your function connects to Amazon RDS or other services that require Amazon-specific CA certificates, set the `NODE_EXTRA_CA_CERTS` environment variable:

```bash
NODE_EXTRA_CA_CERTS=/var/runtime/ca-cert.pem
```

For better cold-start performance, [bundle only the specific certificates you need](https://docs.aws.amazon.com/lambda/latest/dg/lambda-nodejs.html) with your deployment package instead of loading the full certificate chain.

### Streams Default High Water Mark

Node.js 22 [increased the default high water mark for streams from 16 KB to 64 KB](https://nodejs.org/en/blog/announcements/v22-release-announce). This improves throughput for most use cases but may affect memory-constrained Lambda functions processing many concurrent streams.

### Buffer API Changes

Negative indices in `Buffer.toString()` now throw a `RangeError` instead of returning unexpected results. If your code passes negative values to `Buffer.toString()`, update it to use explicit lengths or omit the `end` parameter.

## Step-by-Step Migration Guide: Node.js 20 to 22

### Step 1: Find All Affected Functions

Before changing anything, get a full inventory of every Lambda function running `nodejs20.x`. See the [detection section above](#how-do-i-find-all-lambda-functions-using-nodejs-20-across-multiple-accounts) for both the AWS CLI approach (single account) and CloudQuery Platform (multi-account).

### Step 2: Test Locally With Node.js 22

Install Node.js 22 locally (the latest LTS release is [v22.22.0](https://nodejs.org/en/blog/release/v22.22.0) as of February 2026) and run your function's test suite:

```bash
nvm install 22
nvm use 22
npm rebuild        # Recompile native modules
npm test
```

If you use [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html), test locally with the Node.js 22 runtime:

```bash
sam build --use-container
sam local invoke --env-vars env.json MyFunction
```

### Step 3: Check for Breaking Changes in Dependencies

Review your `package.json` for packages with native bindings. Common ones to check:

- `sharp` (image processing) - requires v0.33+ for Node.js 22
- `bcrypt` - requires v5.1+ for Node.js 22
- `better-sqlite3` - requires v11+ for Node.js 22
- `canvas` - check for Node.js 22 support in your version

Run your dependency audit:

```bash
npm outdated
npm audit
```

### Step 4: Update the Runtime

Choose the method that matches your deployment workflow:

**AWS Console:**
Open your function in the Lambda console, go to the "Code" tab, scroll to "Runtime settings", click "Edit", and change the runtime to "Node.js 22.x".

**AWS CLI:**

```bash
aws lambda update-function-configuration \
  --function-name my-function \
  --runtime nodejs22.x
```

**AWS SAM (template.yaml):**

```yaml
Resources:
  MyFunction:
    Type: AWS::Serverless::Function
    Properties:
      Runtime: nodejs22.x
      Handler: index.handler
      CodeUri: src/
```

Then deploy:

```bash
sam build && sam deploy
```

**AWS CDK (TypeScript):**

```typescript
import * as lambda from 'aws-cdk-lib/aws-lambda';

const fn = new lambda.Function(this, 'MyFunction', {
	runtime: lambda.Runtime.NODEJS_22_X,
	handler: 'index.handler',
	code: lambda.Code.fromAsset('lambda'),
});
```

Then deploy:

```bash
cdk deploy
```

**Terraform:**

```hcl
resource "aws_lambda_function" "my_function" {
  function_name = "my-function"
  runtime       = "nodejs22.x"
  handler       = "index.handler"
  filename      = "lambda.zip"
  role          = aws_iam_role.lambda_role.arn
}
```

Then apply:

```bash
terraform plan && terraform apply
```

### Step 5: Set Environment Variables

If your function connects to RDS or uses Amazon-specific CA certificates, add the environment variable:

**AWS CLI:**

```bash
aws lambda update-function-configuration \
  --function-name my-function \
  --environment "Variables={NODE_EXTRA_CA_CERTS=/var/runtime/ca-cert.pem}"
```

**SAM (template.yaml):**

```yaml
Environment:
  Variables:
    NODE_EXTRA_CA_CERTS: /var/runtime/ca-cert.pem
```

### Step 6: Verify in Production

After deploying, invoke your function with test events and monitor [CloudWatch Logs](https://docs.aws.amazon.com/lambda/latest/dg/monitoring-cloudwatchlogs.html) for errors. Pay attention to:

- `NODE_MODULE_VERSION` mismatch errors (native module rebuild needed)
- TLS/certificate errors (CA certificate configuration needed)
- Import errors from `assert` to `with` syntax changes
- Memory usage changes from the streams high water mark increase

### Step 7: Repeat for Remaining Functions

Work through your inventory from the [detection section above](#how-do-i-find-all-lambda-functions-using-nodejs-20-across-multiple-accounts), prioritizing production functions first, then staging and development environments.

## The Migration Path Forward

- **April 30, 2026** is the Phase 1 deadline: security patches stop for `nodejs20.x` on Lambda ([source](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html))
- **September 30, 2026** is the hard deadline: function updates are blocked after this date
- **Node.js 22** is the recommended upgrade target for most teams ([source](https://aws.amazon.com/about-aws/whats-new/2024/11/aws-lambda-support-nodejs-22/))
- Test for [import assertion syntax changes](https://nodejs.org/en/blog/migrations/v20-to-v22), native module ABI mismatches, and CA certificate configuration before deploying
- Use CloudQuery Platform to [find every affected function](https://www.cloudquery.io/docs/cli/getting-started) across all AWS accounts and regions with a single SQL query

## Frequently Asked Questions

### Will My Lambda Functions Stop Working After April 30, 2026?

No. Your functions continue running and can be invoked indefinitely. AWS [does not block invocations of functions that use a deprecated runtime](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html). However, they run without security patches, and you lose the ability to create or update them on the dates listed in the deprecation schedule above.

### How Long Does the Runtime Upgrade Take?

The runtime change itself takes seconds via the AWS Console or CLI. The real time investment is in testing: checking your code and dependencies for compatibility with Node.js 22. Functions with no native modules may need zero code changes. Functions with native bindings, JSON import assertions, or CA certificate dependencies will need testing and possibly code updates.

### Can I Skip Node.js 22 and Go Straight to Node.js 24?

You can, but be aware that [Node.js 24 removes support for callback-based Lambda handlers](https://aws.amazon.com/blogs/compute/node-js-24-runtime-now-available-in-aws-lambda/). If your functions use the `callback` parameter pattern, you will need to rewrite them to use `async/await`. For most teams, upgrading to Node.js 22 first is the lower-risk path.

### How Can I Find All Lambda Functions Using Node.js 20 Across Multiple AWS Accounts?

CloudQuery Platform syncs Lambda function data into a SQL database, letting you query all accounts and regions with a single SQL statement. The query filters the `aws_lambda_functions` table where `Runtime` equals `nodejs20.x`. See the [detection section](#how-do-i-find-all-lambda-functions-using-nodejs-20-across-multiple-accounts) above for the full setup and queries.

### Do I Need to Redeploy My Lambda Function Code When Changing the Runtime?

No. Changing the runtime version is a configuration update, not a code deployment. Your existing deployment package stays the same. However, you should test your function afterward because the new runtime may expose compatibility issues with native modules or changed Node.js APIs.

### What Are the Main Breaking Changes Between Node.js 20 and 22?

The key breaking changes are: [import assertions replaced with import attributes](https://nodejs.org/en/blog/migrations/v20-to-v22) (`assert` becomes `with`), native module ABI mismatches requiring `npm rebuild`, and the [streams default high water mark increase from 16 KB to 64 KB](https://nodejs.org/en/blog/announcements/v22-release-announce). CA certificate loading behavior, while not new to Node.js 22, remains a common pitfall during migration.

### How Do I Monitor Migration Progress Across Multiple Accounts?

Run CloudQuery Platform syncs on a schedule (daily or weekly) and query the results over time. Because CloudQuery stores point-in-time snapshots in your database, you can track how many `nodejs20.x` functions remain across each account and region using SQL queries grouped by sync date.

### Does the Node.js 20 EOL Affect Lambda Layers Too?

Lambda Layers themselves don't have a runtime setting, but they do contain code that runs under whatever runtime the function uses. If a Layer includes native modules compiled for Node.js 20, those binaries will need to be recompiled for Node.js 22. Rebuild and republish any Layers with native dependencies after upgrading.

Ready to identify your affected Lambda functions? [Get started with CloudQuery Platform](https://www.cloudquery.io/docs/cli/getting-started) to get visibility across your AWS infrastructure. [Contact us](https://www.cloudquery.io/contact-us) or [join our community](https://community.cloudquery.io) to connect with other users.
