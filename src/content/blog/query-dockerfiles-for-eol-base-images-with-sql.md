---
title: 'Query Your Dockerfiles with SQL: Find EOL Node 18 Images Across All repos'
date: 2026-01-04
slug: 'query-dockerfiles-for-eol-base-images-with-sql'
description: 'Node 18 reached end-of-life. Find every Dockerfile using Node 18 base images across your organization with a single SQL query - no cloning repos required.'
categories: ['DevRel', 'Databases']
tags: ['Tutorials', 'Security']
heroImage: '/images/blog/query-dockerfiles-for-eol-base-images-with-sql/thumbnail.png'
heroAlt: 'Query Dockerfiles for EOL base images with SQL'
canonicalUrl: 'https://www.cloudquery.io/blog/query-dockerfiles-for-eol-base-images-with-sql'
contentNotice: 'This post was originally published on CloudQuery blog.'
tldr: 'The Git Source Integration syncs Dockerfile content into your database. Query FROM statements across all repos with SQL to find EOL base images like Node 18, Python 2.7, or Ubuntu 18.04 - no cloning required.'
---

![Blog header for querying Dockerfiles to find end-of-life base images using SQL](/images/blog/query-dockerfiles-for-eol-base-images-with-sql/header.png)

[Node 18 reached end-of-life in April 2025](https://github.com/nodejs/release#release-schedule). You need to find which Dockerfiles across your organization still reference `node:18` base images. The manual approach: clone every repo, grep for Dockerfiles, parse the FROM lines, compile results, email teams, track remediation. Multiply that across hundreds of repos and multiple EOL versions.

The [Git Source Integration](https://www.cloudquery.io/hub/plugins/source/cloudquery/git) syncs Dockerfile content into your data warehouse. Query EOL base images across all repos with SQL.

## Configuration

Configure the Git source integration to sync Dockerfiles:

```yaml
tables:
  - git_files:
      glob_patterns:
        - '**/Dockerfile*'
```

This syncs all files matching the Dockerfile pattern from your repositories into the `git_files` table.

## Query EOL Docker Base Images

Find all Dockerfiles using Node 18:

```sql
WITH Dockerfiles_parsed AS (
  SELECT repository_url, path, name,
         regexp_split_to_table(convert_from(content, 'UTF8'), E'\n') AS line
  FROM git_files
  WHERE name = 'Dockerfile'
),
images AS (
  SELECT repository_url, path, regexp_replace(line, '^FROM\s+', '') AS image
  FROM Dockerfiles_parsed
  WHERE line ~ '^FROM\s+'
)
SELECT * FROM images WHERE image LIKE 'node:18%'
```

The query:

1. Parses Dockerfile content into individual lines
2. Extracts FROM statements using regex
3. Filters for Node 18 base images

## Results

The query returns:

- `repository_url` - Repository containing the Dockerfile
- `path` - Path to the Dockerfile
- `image` - Full base image reference (e.g., `node:18-alpine`, `node:18.16.0`)

Cross-reference results with your GitHub data to identify repo owners and create tracking issues.

## Beyond Node 18

Modify the query to find other EOL images:

**Python 2.7:**

```sql
WHERE image LIKE 'python:2.7%'
```

**Ubuntu 18.04:**

```sql
WHERE image LIKE 'ubuntu:18.04%'
```

**Multiple EOL versions:**

```sql
WHERE image LIKE 'node:18%' OR image LIKE 'node:16%' OR image LIKE 'python:2.7%'
```

## Complete Example

Join with GitHub repository data to identify owners:

```sql
WITH Dockerfiles_parsed AS (
  SELECT repository_url, path, name,
         regexp_split_to_table(convert_from(content, 'UTF8'), E'\n') AS line
  FROM git_files
  WHERE name = 'Dockerfile'
),
images AS (
  SELECT repository_url, path, regexp_replace(line, '^FROM\s+', '') AS image
  FROM Dockerfiles_parsed
  WHERE line ~ '^FROM\s+'
),
eol_images AS (
  SELECT * FROM images WHERE image LIKE 'node:18%'
)
SELECT
  ei.repository_url,
  ei.path,
  ei.image,
  gr.full_name,
  gr.owner
FROM eol_images ei
JOIN git_repositories gr ON gr.url = ei.repository_url
```

This combines file content analysis with repository metadata for actionable results.

## Get Started

The Git Source Integration is available on [CloudQuery Hub](https://www.cloudquery.io/hub/plugins/source/cloudquery/git). See the [tables documentation](https://www.cloudquery.io/hub/plugins/source/cloudquery/git/latest/tables) for the full `git_files`, `git_repositories`, and `git_commits` schema. [Download the CloudQuery CLI](https://www.cloudquery.io/download) to start querying Dockerfiles.

**Related:**

- [Git Source Integration overview](https://www.cloudquery.io/blog/introducing-the-git-source-plugin)
- [Find repos missing LICENSE files](https://www.cloudquery.io/blog/find-repos-missing-license-files-with-sql)
- [Track React dependencies](https://www.cloudquery.io/blog/track-react-dependencies-across-repos-with-sql)

## FAQ

**How does the Git source integration access Dockerfiles?**

The integration fetches file content directly via the Git provider's API. There's no local clone, which means faster syncs and no disk space requirements for repository storage.

**Can I query other Dockerfile patterns beyond FROM statements?**

Yes. The integration syncs raw Dockerfile content. Query for EXPOSE ports, ENV variables, COPY commands, or any other Dockerfile instruction using PostgreSQL string functions and regex.

**Does this work for multi-stage Dockerfiles?**

Yes. Multi-stage Dockerfiles have multiple FROM statements. The query extracts all FROM lines, showing each base image used in the build stages.

**How often should I run this query?**

Depends on your release cycle. Running weekly catches new Dockerfiles with EOL images before they reach production. Combine with CloudQuery's incremental sync to update only changed files.

**What if Dockerfiles use variables for base images?**

Variables like `ARG BASE_IMAGE` won't appear in the FROM statement directly. You'll need to parse ARG statements separately and correlate with FROM statements, or query your CI/CD system for actual resolved image names.

**Can I track when EOL images were introduced?**

The `git_files` table includes commit metadata. Join with commit history to identify when specific Dockerfiles were last modified or when Node 18 references were added.

**Does this work with Dockerfiles in subdirectories?**

Yes. The glob pattern `**/Dockerfile*` matches Dockerfiles at any directory depth, including `Dockerfile.prod`, `Dockerfile.dev`, and files in subdirectories like `docker/Dockerfile`.

**How do I sync Dockerfiles from private repositories?**

Configure the Git source integration with credentials for your Git provider (GitHub token, GitLab token, etc.). The integration authenticates and syncs content from private repos you have access to.
