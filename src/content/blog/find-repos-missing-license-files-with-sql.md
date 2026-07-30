---
title: 'Find Every repo Missing a LICENSE File with One SQL Query'
date: 2026-01-04
slug: 'find-repos-missing-license-files-with-sql'
description: 'Identify repositories without LICENSE files across your organization using SQL. No cloning required, no scripts to maintain - just query your git file data.'
categories: ['Work']
tags: ['Tutorials', 'Security']
heroImage: '/images/blog/find-repos-missing-license-files-with-sql/thumbnail.webp'
heroAlt: 'Find repositories missing LICENSE files with SQL'
canonicalUrl: 'https://www.cloudquery.io/blog/find-repos-missing-license-files-with-sql'
contentNotice: 'This post was originally published on CloudQuery blog.'
tldr: 'The Git Source Integration syncs LICENSE files into your database. Find repos missing licenses, classify license types (MIT, Apache, GPL), and check compliance - all with SQL.'
---

![Blog header for finding GitHub repositories missing LICENSE files using SQL queries](/images/blog/find-repos-missing-license-files-with-sql/header.webp)

Your legal team needs a list of repositories without LICENSE files. The GitHub UI shows license status one repo at a time. The API requires pagination and filtering. Writing a script means handling authentication, rate limits, and data aggregation. And you'll need to maintain that script every time requirements change.

The [Git Source Integration](https://www.cloudquery.io/hub/plugins/source/cloudquery/git) syncs file content and metadata into your data warehouse. Query missing LICENSE files across all repositories with SQL.

## Configuration

Configure the Git source integration to sync LICENSE files:

```yaml
tables:
  - git_files:
      glob_patterns:
        - '**/LICENSE*'
```

This syncs all LICENSE files (including variations like `LICENSE.txt`, `LICENSE.md`) into the `git_files` table alongside repository metadata in `git_repositories`.

## Query repos Without LICENSE Files

Find repositories missing a LICENSE file:

```sql
WITH repos_with_license AS (
  SELECT gf.repository_url FROM git_files gf WHERE gf.name = 'LICENSE'
)
SELECT gr.url, gr.owner, gr.full_name FROM git_repositories gr
LEFT OUTER JOIN repos_with_license rl ON rl.repository_url = gr.url
WHERE rl.repository_url IS NULL
```

The query:

1. Creates a CTE of repositories that have a LICENSE file
2. Left joins all repositories against repos with licenses
3. Filters for NULL matches (repos missing LICENSE)

## Results

The query returns:

- `url` - Repository URL
- `owner` - Repository owner (organization or user)
- `full_name` - Full repository name (owner/repo)

Export results to CSV and send to your legal team. Or join with GitHub organization data to identify which team owns each unlicensed repo.

## License Type Analysis

Query specific license types:

```sql
WITH license_files AS (
  SELECT
    repository_url,
    name,
    convert_from(content, 'UTF8') AS license_text
  FROM git_files
  WHERE name LIKE 'LICENSE%'
)
SELECT
  repository_url,
  name,
  CASE
    WHEN license_text LIKE '%MIT License%' THEN 'MIT'
    WHEN license_text LIKE '%Apache License%' THEN 'Apache-2.0'
    WHEN license_text LIKE '%GNU General Public License%' THEN 'GPL'
    WHEN license_text LIKE '%BSD%' THEN 'BSD'
    ELSE 'Other'
  END AS license_type
FROM license_files
```

This parses LICENSE file content to classify license types across your organization.

## License Compliance Check

Find repos using incompatible licenses:

```sql
WITH license_files AS (
  SELECT
    repository_url,
    name,
    convert_from(content, 'UTF8') AS license_text
  FROM git_files
  WHERE name LIKE 'LICENSE%'
)
SELECT
  lf.repository_url,
  gr.full_name,
  gr.owner,
  lf.name
FROM license_files lf
JOIN git_repositories gr ON gr.url = lf.repository_url
WHERE lf.license_text LIKE '%GNU General Public License%'
  AND gr.owner = 'your-org'
```

Modify the WHERE clause to match your organization's license policy requirements.

## Get Started

The Git Source Integration is available on [CloudQuery Hub](https://www.cloudquery.io/hub/plugins/source/cloudquery/git). See the [tables documentation](https://www.cloudquery.io/hub/plugins/source/cloudquery/git/latest/tables) for the full `git_files`, `git_repositories`, and `git_commits` schema. [Download the CloudQuery CLI](https://www.cloudquery.io/download) to start querying LICENSE files.

**Related:**

- [Git Source Integration overview](https://www.cloudquery.io/blog/introducing-the-git-source-plugin)
- [Query Dockerfiles for EOL images](https://www.cloudquery.io/blog/query-dockerfiles-for-eol-base-images-with-sql)
- [Track React dependencies](https://www.cloudquery.io/blog/track-react-dependencies-across-repos-with-sql)

## FAQ

**What if LICENSE files have different names?**

The glob pattern `**/LICENSE*` matches common variations: `LICENSE`, `LICENSE.txt`, `LICENSE.md`, `LICENCE` (British spelling), `LICENSE-MIT`, etc. Check the `name` column in results to see exact filename.

**How do I find repos without any license-related files?**

Modify the query to check for NULL matches after querying all license variations. The glob pattern `**/LICENSE*` already captures most variations, but you can add additional patterns like `**/COPYING` if needed.

**Can I export results to a spreadsheet?**

Yes. Most SQL clients support CSV export. Or use CloudQuery's PostgreSQL destination and connect with Excel, Google Sheets, or any tool that reads from PostgreSQL.

**How often should I run this audit?**

Running monthly catches new repos created without LICENSE files. Combine with GitHub webhooks or scheduled CloudQuery syncs to automate the audit process.

**What if repos have license information in README instead of LICENSE file?**

Sync README files with the glob pattern `**/README*` and query README content for license mentions. Join README data with the LICENSE query to find repos with license info but no dedicated LICENSE file.

**Can I check LICENSE files in subdirectories?**

Yes. The glob pattern `**/LICENSE*` matches LICENSE files at any directory depth. Some monorepos include separate LICENSE files per package or module.

**How do I identify when LICENSE files were added or modified?**

The `git_files` table includes last modified timestamp. Query the timestamp column to track when LICENSE files were added, updated, or removed.

**Does this work for private repositories?**

Yes. Configure the Git source integration with credentials for your Git provider (GitHub token, GitLab token, etc.). The integration syncs LICENSE files from private repos you have access to.
