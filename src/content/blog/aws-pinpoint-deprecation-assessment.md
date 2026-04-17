---
title: 'AWS Pinpoint Is Being Deprecated: How to Assess Your Migration Scope'
date: 2026-03-24
slug: 'aws-pinpoint-deprecation-assessment'
description: 'AWS Pinpoint reaches end of support October 2026. Query your Pinpoint usage across all accounts to find what needs migrating before the deadline.'
categories: ['Work']
tags: ['Tutorials', 'AWS']
heroImage: '/images/blog/aws-pinpoint-deprecation-assessment/thumbnail.png'
canonicalUrl: 'https://www.cloudquery.io/blog/aws-pinpoint-deprecation-assessment'
contentNotice: 'This post was originally published on CloudQuery blog.'
---

AWS announced that [Amazon Pinpoint is reaching end of support on October 30, 2026](https://docs.aws.amazon.com/pinpoint/latest/userguide/migrate.html). New customers have been locked out since May 2025, and existing customers lose console access after the cutoff. But here's the thing that trips people up: not everything is going away.

![Assess Your AWS Pinpoint Deprecation Exposure with CloudQuery](/images/blog/aws-pinpoint-deprecation-assessment/header.png)

> **TL;DR:** Pinpoint's campaigns, journeys, segments, and templates are being retired in October 2026. Transactional messaging (SMS, push, voice) continues under AWS End User Messaging. This tutorial walks you through how to identify resources that will be impacted by this deprecation so that you can assess your migration scope across your entire AWS Organization.

Transactional messaging - SMS, push notifications, voice, OTP - all continues under the [AWS End User Messaging](https://docs.aws.amazon.com/sms-voice/latest/userguide/what-is-service.html) brand. The engagement and marketing layer is what's being retired: campaigns, journeys, segments, message templates, and the analytics dashboard.

If you're a platform engineer responsible for multiple AWS accounts, the first question isn't "how do we migrate?" It's "what are we actually using?" Some teams adopted Pinpoint years ago and haven't touched it since. Others have active campaigns running across dozens of accounts. The migration effort is wildly different depending on the answer, and you can't get that answer by clicking through the Pinpoint console one project at a time.

This tutorial shows you how to use CloudQuery to sync your Pinpoint resources into SQL, build a visual assessment report in CloudQuery Platform, and run queries that tell you exactly where your exposure is.

## What's Being Retired vs. What Stays

Before running any queries, it helps to know which Pinpoint capabilities map to which bucket.

| Capability                     | Status    | Migration Target                                                                                                   |
| ------------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------ |
| Campaigns and Journeys         | Retiring  | [Amazon Connect Outbound Campaigns](https://docs.aws.amazon.com/connect/latest/adminguide/outbound-campaigns.html) |
| Segments and Endpoints         | Retiring  | [Amazon Connect Customer Profiles](https://docs.aws.amazon.com/customerprofiles/latest/APIReference/Welcome.html)  |
| Message Templates              | Retiring  | Amazon Connect                                                                                                     |
| Marketing Analytics            | Retiring  | [Amazon Kinesis](https://docs.aws.amazon.com/kinesis/)                                                             |
| Email via Pinpoint             | Retiring  | [Amazon SES](https://docs.aws.amazon.com/ses/latest/dg/Welcome.html)                                               |
| SMS, MMS, Voice                | Continues | AWS End User Messaging (no action needed)                                                                          |
| Push Notifications (FCM, APNS) | Continues | AWS End User Messaging (no action needed)                                                                          |
| OTP and Phone Validation       | Continues | AWS End User Messaging (no action needed)                                                                          |

If your team only uses Pinpoint for sending SMS or push notifications, you might not need to migrate anything. The queries below will help you confirm that.

## Prerequisites

You'll need:

- A [CloudQuery Platform](https://www.cloudquery.io) account or [CloudQuery CLI](https://www.cloudquery.io/docs/cli) installed
- The [AWS Source plugin](https://www.cloudquery.io/hub/plugins/source/cloudquery/aws/latest/docs) configured for your organization
- IAM permissions for Pinpoint APIs: `mobiletargeting:GetApps`, `mobiletargeting:GetCampaigns`, `mobiletargeting:GetSegments`, `mobiletargeting:ListTemplates`, `mobiletargeting:GetExportJobs`, `mobiletargeting:GetImportJobs`, `mobiletargeting:GetRecommenderConfigurations`, `mobiletargeting:ListTemplateVersions`, and `ec2:DescribeRegions` (used to determine enabled regions)

If you're using an existing CloudQuery AWS role, you can add these permissions with a policy like:

```json
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Effect": "Allow",
			"Action": [
				"mobiletargeting:GetApps",
				"mobiletargeting:GetCampaigns",
				"mobiletargeting:GetCampaignVersions",
				"mobiletargeting:GetSegments",
				"mobiletargeting:ListTemplates",
				"mobiletargeting:ListTemplateVersions",
				"mobiletargeting:GetExportJobs",
				"mobiletargeting:GetImportJobs",
				"mobiletargeting:GetRecommenderConfigurations",
				"ec2:DescribeRegions"
			],
			"Resource": "*"
		}
	]
}
```

## Step 1: Configure CloudQuery to Sync Pinpoint Tables

Add the Pinpoint tables to your AWS source configuration file. Here's a minimal configuration file that targets the tables you need for this assessment:

```yaml
kind: source
spec:
  name: aws
  path: cloudquery/aws
  registry: cloudquery
  version: 'VERSION_SOURCE_AWS'
  tables:
    - aws_pinpoint_apps
    - aws_pinpoint_campaigns
    - aws_pinpoint_campaign_versions
    - aws_pinpoint_segments
    - aws_pinpoint_templates
    - aws_pinpoint_template_versions
    - aws_pinpoint_export_jobs
    - aws_pinpoint_import_jobs
    - aws_pinpoint_recommender_configurations
  destinations: ['postgresql']
```

Here's what each table captures:

> **Pinpoint Tables Reference:**
>
> - `aws_pinpoint_apps` - Pinpoint projects (applications) across your accounts
> - `aws_pinpoint_campaigns` - Campaign definitions including message configuration and scheduling
> - `aws_pinpoint_campaign_versions` - Historical versions of each campaign
> - `aws_pinpoint_segments` - Audience segment definitions (imported and dynamic)
> - `aws_pinpoint_templates` - Message templates (email, SMS, push, voice)
> - `aws_pinpoint_template_versions` - Version history for each template
> - `aws_pinpoint_export_jobs` - Data export job history and status
> - `aws_pinpoint_import_jobs` - Data import job history and status
> - `aws_pinpoint_recommender_configurations` - ML recommender model integrations

Run the sync to pull your Pinpoint data:

```bash
cloudquery sync aws.yml
```

If you're using CloudQuery Platform, the sync runs automatically on your configured schedule. Once it completes, all your Pinpoint resources are queryable in SQL.

> **Note:** The SQL examples below use ClickHouse syntax, which is what CloudQuery Platform uses. If you're running against PostgreSQL or another destination, you can adapt the queries to your SQL dialect - the table and column names are the same regardless of destination.

## Step 2: Build a Pinpoint Migration Assessment Report

CloudQuery Platform's [Reports feature](https://www.cloudquery.io/docs/platform/features/reports) lets you turn these assessment queries into a shareable dashboard with charts, tables, and filters. Instead of running queries one at a time, you can build a single report that gives your team a complete picture of your Pinpoint exposure.

To create the report, go to **Reports** in the CloudQuery Platform, click **Create Report**, select **From Scratch**, and paste the full report YAML (shown below) into the report editor. Here's what the report includes:

**Headline metrics** at the top use `label` widgets to show your total Pinpoint projects, active campaigns, segments, and templates at a glance:

```yaml
widgets:
  - title: Total Pinpoint Projects
    display:
      type: label
    query: |
      SELECT count(*) FROM aws_pinpoint_apps
      WHERE 1=1 AND account_id = '?'
  - title: Active Campaigns
    display:
      type: label
    query: |
      SELECT count(*)
      FROM aws_pinpoint_campaigns AS c
      JOIN aws_pinpoint_apps AS a ON c.application_id = a.id
      WHERE c.is_paused = false AND 1=1 AND a.account_id = '?'
```

**A migration complexity pie chart** rates each project as High, Medium, or Low based on campaign volume, data pipeline dependencies, and ML recommender usage. This is the widget your team will look at first to understand the overall scope.

**Collapsible groups** break the assessment into sections - Pinpoint Projects, Active Campaigns, Segments, Templates, Data Pipelines, ML Recommenders, and a final Migration Impact Summary table. Each group contains the relevant charts and detail tables. For example, the Active Campaigns group pairs a bar chart of campaigns by account with a detail table showing which messaging channels each campaign uses (email, SMS, push, custom).

**An Account filter** at the top lets you drill into specific AWS accounts using a multi-select dropdown that auto-populates from your data.

The report uses the `1=1 AND account_id = '?'` filter pattern throughout so that widgets show all data by default, then narrow when you select specific accounts. For more on how report filters work, see the [Reports YAML documentation](https://www.cloudquery.io/docs/platform/features/reports/reports-yaml-documentation-with-examples).

Once you've created the report, you can share it with your team, bookmark it, and re-run it as you migrate resources to track progress.

## Running Individual Queries

If you prefer to run queries individually - either in the CloudQuery Platform's SQL editor or against your own database - here are the assessment queries broken down by area. These are the same queries used in the report above, so you can use them standalone or adapt them for other SQL dialects.

### Find All Pinpoint Projects

Start with the broadest question: where is Pinpoint actually being used?

```sql
SELECT
    account_id,
    region,
    name,
    arn,
    id
FROM aws_pinpoint_apps
ORDER BY account_id, region;
```

If this returns zero rows, congratulations - you're not using Pinpoint and the deprecation doesn't affect you. If it returns results, keep going.

### Identify Active Campaigns and Their Channels

Campaigns are the core of Pinpoint's engagement features and the most likely reason you'll need to migrate. This query finds active campaigns and shows what messaging channels they use:

```sql
SELECT
    a.account_id,
    a.name AS project_name,
    c.name AS campaign_name,
    JSONExtractString(c.state, 'CampaignStatus') AS status,
    multiIf(
        JSONHas(c.message_configuration, 'EmailMessage'), 'Yes',
        'No'
    ) AS uses_email,
    multiIf(
        JSONHas(c.message_configuration, 'SMSMessage'), 'Yes',
        'No'
    ) AS uses_sms,
    multiIf(
        JSONHas(c.message_configuration, 'GCMMessage')
        OR JSONHas(c.message_configuration, 'APNSMessage'), 'Yes',
        'No'
    ) AS uses_push,
    multiIf(
        JSONHas(c.message_configuration, 'CustomMessage'), 'Yes',
        'No'
    ) AS uses_custom_channel,
    c.schedule
FROM aws_pinpoint_campaigns AS c
JOIN aws_pinpoint_apps AS a ON c.application_id = a.id
WHERE c.is_paused = false
ORDER BY a.account_id, a.name;
```

Pay attention to the channel columns. If a campaign uses SMS or push, the messaging part continues under AWS End User Messaging - but the campaign orchestration (scheduling, targeting, A/B testing) still needs to be migrated to [Amazon Connect Outbound Campaigns](https://docs.aws.amazon.com/connect/latest/adminguide/outbound-campaigns.html). That distinction matters when you're scoping the work.

### Audit Your Segments and Audience Data

Segments define your audiences. They're foundational to how Pinpoint targets messages, and they need to be migrated to [Amazon Connect Customer Profiles](https://docs.aws.amazon.com/customerprofiles/latest/APIReference/Welcome.html).

```sql
SELECT
    a.account_id,
    a.name AS project_name,
    s.name AS segment_name,
    s.segment_type,
    s.import_definition != '{}' AND s.import_definition != '' AS has_import_definition,
    s.dimensions != '{}' AND s.dimensions != '' AS has_dynamic_filters
FROM aws_pinpoint_segments AS s
JOIN aws_pinpoint_apps AS a ON s.application_id = a.id
ORDER BY a.account_id, a.name;
```

Two things to look for here. Segments with `segment_type = 'IMPORT'` or `has_import_definition = true` mean an external system is pushing audience data into Pinpoint - there's a data pipeline you'll need to redirect. Segments with dynamic filters mean you're using Pinpoint's audience builder, and those filter definitions need to be recreated in Connect.

### Check Your Template Investment

Templates represent reusable messaging assets. The more templates you have (and the more versions of each), the more migration work you're looking at.

```sql
SELECT
    t.template_type,
    COUNT(DISTINCT t.template_name) AS template_count,
    COUNT(tv.version) AS total_versions
FROM aws_pinpoint_templates AS t
LEFT JOIN aws_pinpoint_template_versions AS tv
    ON t.template_name = tv.template_name AND t.template_type = tv.template_type
GROUP BY t.template_type
ORDER BY template_count DESC;
```

A high version count means your team has been actively iterating on templates. Amazon Connect uses a similar Handlebars templating engine, but the placeholder syntax changes. AWS has [migration guidance for templates](https://docs.aws.amazon.com/pinpoint/latest/userguide/migrate.html) that covers the syntax differences - worth reading before you estimate effort.

### Look for Data Pipeline Dependencies

Import and export jobs are the integration points teams tend to forget about. An active import job means something is pushing endpoint data into Pinpoint. An active export job means a downstream system is consuming Pinpoint data.

```sql
SELECT
    a.account_id,
    a.name AS project_name,
    'import' AS job_type,
    ij.job_status AS status,
    ij.completion_date,
    ij.total_processed,
    ij.total_failures,
    ij.definition
FROM aws_pinpoint_import_jobs AS ij
JOIN aws_pinpoint_apps AS a ON ij.application_id = a.id

UNION ALL

SELECT
    a.account_id,
    a.name AS project_name,
    'export' AS job_type,
    ej.job_status AS status,
    ej.completion_date,
    ej.total_processed,
    ej.total_failures,
    ej.definition
FROM aws_pinpoint_export_jobs AS ej
JOIN aws_pinpoint_apps AS a ON ej.application_id = a.id

ORDER BY completion_date DESC;
```

Recent jobs (completed in the last 30-90 days) indicate active integrations that will break when Pinpoint goes away. These are the dependencies you want to surface early in migration planning, especially since the systems on either end of those pipelines may be owned by different teams.

### Check for ML Recommender Configurations

This one is quick but important. Recommender configurations indicate you're using Amazon Personalize or a custom ML model to personalize Pinpoint messages. If present, this is the most complex part of any Pinpoint migration.

```sql
SELECT
    account_id,
    region,
    name,
    recommendation_provider_uri,
    recommendations_per_message,
    attributes
FROM aws_pinpoint_recommender_configurations;
```

If this returns results, plan extra time. You'll need to re-integrate those ML models with whatever replaces your Pinpoint campaigns.

### Build Your Migration Impact Summary

Now pull it all together into a single view that rates each project's migration complexity:

```sql
WITH project_stats AS (
    SELECT
        a.account_id,
        a.name AS project_name,
        a.id AS app_id,
        countIf(c.is_paused = false) AS active_campaigns,
        COUNT(DISTINCT s.id) AS segment_count,
        COUNT(DISTINCT ej.id) AS export_jobs,
        COUNT(DISTINCT ij.id) AS import_jobs
    FROM aws_pinpoint_apps AS a
    LEFT JOIN aws_pinpoint_campaigns AS c ON c.application_id = a.id
    LEFT JOIN aws_pinpoint_segments AS s ON s.application_id = a.id
    LEFT JOIN aws_pinpoint_export_jobs AS ej ON ej.application_id = a.id
    LEFT JOIN aws_pinpoint_import_jobs AS ij ON ij.application_id = a.id
    GROUP BY a.account_id, a.name, a.id
),
template_stats AS (
    SELECT COUNT(*) AS total_templates FROM aws_pinpoint_templates
),
recommender_stats AS (
    SELECT COUNT(*) AS total_recommenders FROM aws_pinpoint_recommender_configurations
)
SELECT
    ps.account_id,
    ps.project_name,
    ps.active_campaigns,
    ps.segment_count,
    ts.total_templates,
    ps.export_jobs + ps.import_jobs AS data_pipeline_jobs,
    rs.total_recommenders,
    multiIf(
        rs.total_recommenders > 0 OR ps.active_campaigns > 10, 'high',
        ps.active_campaigns > 0 OR ts.total_templates > 5 OR ps.export_jobs + ps.import_jobs > 0, 'medium',
        'low'
    ) AS migration_complexity
FROM project_stats AS ps
CROSS JOIN template_stats AS ts
CROSS JOIN recommender_stats AS rs
ORDER BY
    multiIf(
        rs.total_recommenders > 0 OR ps.active_campaigns > 10, 1,
        ps.active_campaigns > 0 OR ts.total_templates > 5 OR ps.export_jobs + ps.import_jobs > 0, 2,
        3
    ),
    ps.account_id;
```

This gives you a prioritized list you can take to your next planning meeting. Projects rated `high` have ML integrations or heavy campaign usage and should be the first ones your team investigates. Projects rated `medium` have active campaigns, templates, or data pipelines that need migrating. Projects rated `low` may only need minimal cleanup or no action at all.

## From Assessment to Action

Once you have your report built - or the output from the individual queries - you know three things: which accounts use Pinpoint, what features they depend on, and how much work each migration represents. That's the foundation for a migration plan.

AWS recommends migrating engagement features to [Amazon Connect](https://docs.aws.amazon.com/connect/latest/adminguide/what-is-amazon-connect.html), email to [Amazon SES](https://docs.aws.amazon.com/ses/latest/dg/Welcome.html), and analytics to [Amazon Kinesis](https://docs.aws.amazon.com/kinesis/). One gap worth flagging: Journey support in Amazon Connect is still limited, so if your team relies heavily on multi-step journey workflows, factor that into your timeline.

With CloudQuery Platform, you can share the assessment report with your team and re-run it as migration progresses. As teams decommission campaigns and segments, the numbers in your dashboard will drop, giving everyone a clear, visual measure of how much work remains.

## FAQ

### When is AWS Pinpoint being deprecated?

Amazon Pinpoint reaches end of support on October 30, 2026. After that date, you lose access to the Pinpoint console and all Pinpoint resources. New customers have been blocked since May 20, 2025.

### What parts of Pinpoint are NOT being deprecated?

Transactional messaging capabilities continue under [AWS End User Messaging](https://docs.aws.amazon.com/sms-voice/latest/userguide/what-is-service.html): SMS, MMS, voice messaging, push notifications (FCM, APNS), WhatsApp messaging, OTP APIs, and phone number validation. These were rebranded in 2024 and require no migration.

### What replaces AWS Pinpoint campaigns and journeys?

AWS recommends [Amazon Connect Outbound Campaigns](https://docs.aws.amazon.com/connect/latest/adminguide/outbound-campaigns.html) for campaign and journey functionality. Segments and endpoints migrate to [Amazon Connect Customer Profiles](https://docs.aws.amazon.com/customerprofiles/latest/APIReference/Welcome.html). Email sending moves to [Amazon SES](https://docs.aws.amazon.com/ses/latest/dg/Welcome.html).

### Do I need to migrate if I only use Pinpoint for SMS?

If you only use Pinpoint's transactional SMS APIs, those continue as AWS End User Messaging with no migration required. But if you use Pinpoint _campaigns_ to orchestrate SMS sends (scheduling, audience targeting, A/B testing), the campaign layer needs to be migrated even though SMS delivery itself continues.

### What CloudQuery tables are available for AWS Pinpoint?

CloudQuery provides eight Pinpoint tables: `aws_pinpoint_apps`, `aws_pinpoint_campaigns`, `aws_pinpoint_campaign_versions`, `aws_pinpoint_segments`, `aws_pinpoint_templates`, `aws_pinpoint_template_versions`, `aws_pinpoint_export_jobs`, `aws_pinpoint_import_jobs`, and `aws_pinpoint_recommender_configurations`.

### What AWS IAM permissions do I need to query Pinpoint resources?

You need `mobiletargeting:GetApps`, `mobiletargeting:GetCampaigns`, `mobiletargeting:GetCampaignVersions`, `mobiletargeting:GetSegments`, `mobiletargeting:ListTemplates`, `mobiletargeting:ListTemplateVersions`, `mobiletargeting:GetExportJobs`, `mobiletargeting:GetImportJobs`, and `mobiletargeting:GetRecommenderConfigurations`.

### Can I run this assessment across multiple AWS accounts?

Yes. CloudQuery's [AWS Source plugin supports multi-account and AWS Organizations configurations](https://www.cloudquery.io/hub/plugins/source/cloudquery/aws/latest/docs). Once configured, the sync pulls Pinpoint data from all accounts, and every query in this tutorial returns results tagged with `account_id` so you can see the full cross-account picture.

### Where should I migrate my Pinpoint segments?

AWS recommends migrating segments to [Amazon Connect Customer Profiles](https://docs.aws.amazon.com/customerprofiles/latest/APIReference/Welcome.html). AWS provides a Python script for converting Pinpoint endpoint data into the Connect Customer Profiles format. Check the [official migration guide](https://docs.aws.amazon.com/pinpoint/latest/userguide/migrate.html) for details.
