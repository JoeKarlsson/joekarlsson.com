---
title: 'Find EOL Docker Images, Missing Licenses, and Stale CODEOWNERS Across Thousands of repos with SQL'
date: 2026-01-04
slug: 'introducing-the-git-source-plugin'
description: 'Query your Dockerfiles, CODEOWNERS, and package.json files across all repos with SQL. No cloning, no custom scripts - just SQL queries that find EOL images, missing licenses, and outdated dependencies in seconds.'
categories: ['Work']
tags: ['Product News']
heroImage: '/images/blog/introducing-the-git-source-plugin/thumbnail.webp'
heroAlt: 'Introducing the CloudQuery Git source plugin'
canonicalUrl: 'https://www.cloudquery.io/blog/introducing-the-git-source-plugin'
contentNotice: 'This post was originally published on CloudQuery blog.'
tldr: 'The Git Source Plugin syncs file content from your repositories into any database. Query Dockerfiles for EOL base images, find repos missing LICENSE files, track React dependencies across your org, or audit CODEOWNERS against your identity provider - all with SQL, no repo cloning required.'
---

![Blog header for introducing the CloudQuery Git source plugin for syncing repository data](/images/blog/introducing-the-git-source-plugin/header.webp)

You need to find which Dockerfiles still use Node 18 (now EOL). Or which repos are missing a LICENSE file. Or maybe you need to audit CODEOWNERS against your actual employee roster. The typical approach: clone hundreds of repos, write bash scripts to parse files, export to spreadsheets, maintain the script as repos change. It's 2025, and we're still doing this.

The [Git Source Plugin](https://www.cloudquery.io/hub/plugins/source/cloudquery/git) syncs file content and metadata directly into your data warehouse. Query any file type across all repos with standard SQL. No local clones, no custom parsing scripts, no maintenance overhead.

## Why Querying Repository Files Is Still Painful

Getting answers to straightforward questions about your repositories is surprisingly painful:

- Which repos don't have a CODEOWNERS file?
- Which Dockerfiles still reference `node:18` (now EOL)?
- What Jira team owns this service according to our `about.yaml`?
- Which repos have React as a dependency?

Today, answering any of these means cloning hundreds (or thousands) of repos, writing parsing logic, and maintaining that infrastructure. Most teams just... don't bother.

## SQL Queries vs Custom Scripts

| Task                            | Manual Approach                            | Git Source Plugin         |
| ------------------------------- | ------------------------------------------ | ------------------------- |
| Find repos missing LICENSE      | Clone all repos, write bash script, grep   | Single SQL query          |
| Track dependency versions       | Clone, parse package.json, maintain script | JOIN with version data    |
| Audit Dockerfile base images    | Clone, parse FROM lines, handle edge cases | SQL with string functions |
| Keep data current               | Re-run script, manage cron jobs            | Incremental sync          |
| Cross-reference with other data | Export to CSV, manual joins                | SQL JOINs across tables   |

## Configuration and Tables

The plugin syncs three tables:

- `git_repositories` - Repository metadata (URL, owner, default branch)
- `git_files` - File content and metadata matching your glob patterns
- `git_commits` - Commit history (author, committer, message, SHA)

**Full configuration example:**

```yaml
kind: source
spec:
  name: git
  path: cloudquery/git
  version: 'v1.0.0'
  tables:
    - git_repositories
    - git_files:
        glob_patterns:
          - '**/Dockerfile*'
          - '**/pom.xml'
          - '.buildkite/**/pipeline.yml'
          - '**/CODEOWNERS'
          - '**/package.json'
          - '**/go.mod'
          - '**/.github/workflows/*.yml'
    - git_commits
  destinations:
    - postgresql
  spec:
    # Repository filtering
    repositories:
      - 'https://github.com/your-org/*'
    # Authentication
    token: '${GIT_TOKEN}'
```

Configure `glob_patterns` to sync only the files you need. Common patterns for platform engineers:

| Pattern                      | Use Case                      |
| ---------------------------- | ----------------------------- |
| `**/Dockerfile*`             | Container image auditing      |
| `**/CODEOWNERS`              | Code ownership tracking       |
| `**/package.json`            | Dependency management         |
| `**/.github/workflows/*.yml` | CI/CD pipeline analysis       |
| `**/go.mod`, `**/pom.xml`    | Backend dependency tracking   |
| `**/*.tf`                    | Infrastructure as Code review |

## Example Queries

These examples use [PostgreSQL](https://www.cloudquery.io/hub/plugins/destination/cloudquery/postgresql) as the destination, but the Git Source Plugin works with any CloudQuery destination.

The queries below demonstrate common use cases for the Git Source Plugin. For detailed, step-by-step tutorials on each scenario, check out our focused posts on [querying Dockerfiles for EOL images](https://www.cloudquery.io/blog/query-dockerfiles-for-eol-base-images-with-sql), [finding repos missing LICENSE files](https://www.cloudquery.io/blog/find-repos-missing-license-files-with-sql), [tracking dependencies across your organization](https://www.cloudquery.io/blog/track-react-dependencies-across-repos-with-sql), [auditing CODEOWNERS against your identity provider](https://www.cloudquery.io/blog/audit-codeowners-against-okta-with-sql), and [finding commits by departed employees](https://www.cloudquery.io/blog/find-commits-by-departed-employees-with-sql).

**Find repos missing a LICENSE file:**

```sql
WITH repos_with_license AS (
  SELECT gf.repository_url FROM git_files gf WHERE gf.name = 'LICENSE'
)
SELECT gr.url, gr.owner, gr.full_name FROM git_repositories gr
LEFT OUTER JOIN repos_with_license rl ON rl.repository_url = gr.url
WHERE rl.repository_url IS NULL
```

**Find all Dockerfiles running EOL Node 18:**

```sql
WITH dockerfiles_parsed AS (
  SELECT repository_url, path, name,
         regexp_split_to_table(convert_from(content, 'UTF8'), E'\n') AS line
  FROM git_files
  WHERE name = 'Dockerfile'
),
images AS (
  SELECT repository_url, path, regexp_replace(line, '^FROM\s+', '') AS image
  FROM dockerfiles_parsed
  WHERE line ~ '^FROM\s+'
)
SELECT * FROM images WHERE image LIKE 'node:18%'
```

**List all repos with React as a dependency:**

```sql
WITH package_data AS (
  SELECT
    repository_url,
    path,
    convert_from(content, 'UTF8')::jsonb AS package_json
  FROM git_files
  WHERE name = 'package.json' AND content IS NOT NULL
),
all_dependencies AS (
  SELECT
    repository_url,
    package_json->>'name' AS package_name,
    'dependencies' AS dependency_type,
    dep_key AS dependency_name,
    package_json->'dependencies'->>dep_key AS dependency_version
  FROM package_data,
  LATERAL jsonb_object_keys(package_json->'dependencies') AS dep_key
  WHERE package_json->'dependencies' IS NOT NULL

  UNION ALL

  SELECT
    repository_url,
    package_json->>'name' AS package_name,
    'devDependencies' AS dependency_type,
    dep_key AS dependency_name,
    package_json->'devDependencies'->>dep_key AS dependency_version
  FROM package_data,
  LATERAL jsonb_object_keys(package_json->'devDependencies') AS dep_key
  WHERE package_json->'devDependencies' IS NOT NULL
)
SELECT * FROM all_dependencies WHERE dependency_name = 'react'
```

## Git Source vs GitHub Source

The [Git Source Plugin](https://www.cloudquery.io/hub/plugins/source/cloudquery/git) and [GitHub Source Plugin](https://www.cloudquery.io/hub/plugins/source/cloudquery/github) serve different purposes:

| Use Case                                              | Git Source | GitHub Source |
| ----------------------------------------------------- | ---------- | ------------- |
| File contents (Dockerfiles, package.json, CODEOWNERS) | Yes        | No            |
| Repository metadata                                   | Basic      | Comprehensive |
| Pull requests, issues, reviews                        | No         | Yes           |
| Branch protection rules                               | No         | Yes           |
| Commit history                                        | Yes        | Yes           |
| Works with non-GitHub repos                           | Yes        | No            |

**Use Git Source when** you need to query file contents across repos - configuration files, dependency manifests, or any files matching glob patterns.

**Use GitHub Source when** you need GitHub-specific data like [pull requests merged without review](https://www.cloudquery.io/blog/how-to-use-the-github-plugin-to-find-pull-requests-that-were-merged-without-review), [unprotected branches](https://www.cloudquery.io/blog/github-find-all-repos-with-unprotected-default-branches), issues, or organization settings.

**Use both together** for complete visibility. Join `git_files` with `github_repositories` to correlate file contents with GitHub metadata.

## Cross-Plugin Joins

The Git Source Plugin becomes more powerful when combined with other CloudQuery integrations. Here are three scenarios we keep hearing from teams.

### Example: Verify Code Ownership Against Okta

Every CODEOWNERS file makes a promise: _these people are responsible for this code_. But when engineers leave, CODEOWNERS files don't update themselves. This query finds ownership gaps by joining Git file content with identity data from your IdP.

CODEOWNERS files use GitHub handles (`@username`). To verify ownership against [**Okta**](https://www.cloudquery.io/hub/plugins/source/cloudquery/okta), you need to translate those handles to emails first using the [**GitHub Source Plugin**](https://www.cloudquery.io/hub/plugins/source/cloudquery/github).

```sql
WITH codeowners_parsed AS (
  SELECT
    gf.repository_url,
    regexp_matches(
      convert_from(gf.content, 'UTF8'),
      '(?:^|\s)@([a-zA-Z0-9_-]+(?:/[a-zA-Z0-9_-]+)?)',
      'gm'
    ) AS owner_handle_match
  FROM git_files gf
  WHERE gf.name = 'CODEOWNERS'
),
owners_flat AS (
  SELECT DISTINCT
    repository_url,
    owner_handle_match[1] AS github_handle
  FROM codeowners_parsed
  WHERE owner_handle_match[1] NOT LIKE '%/%'  -- Exclude team handles like org/team
),
owners_with_email AS (
  SELECT
    o.repository_url,
    o.github_handle,
    gm.email AS github_email
  FROM owners_flat o
  LEFT JOIN github_organization_members gm ON lower(o.github_handle) = lower(gm.login)
)
SELECT
  owe.repository_url,
  owe.github_handle,
  owe.github_email,
  COALESCE(u.status, 'NOT_FOUND') AS okta_status
FROM owners_with_email owe
LEFT JOIN okta_users u ON lower(owe.github_email) = lower(u.email)
WHERE owe.github_email IS NULL  -- GitHub user not found or has no public email
   OR u.status IS NULL          -- No matching Okta account
   OR u.status != 'ACTIVE'      -- Okta account inactive
ORDER BY owe.repository_url
```

## Platform Engineering Workflows

The Git Source Plugin fits into broader platform engineering workflows. Here's how teams are using it:

**Compliance and Auditing**

Schedule daily syncs and run compliance queries automatically. Export results to your GRC platform or generate reports for SOC 2 audits. The `git_commits` table helps track code changes by employment status for access reviews.

**Incident Response**

During security incidents, quickly identify which repos contain affected dependencies or configurations. Join with vulnerability databases to find repos running CVE-affected versions.

**Developer Experience**

Build internal dashboards showing dependency freshness, missing documentation, or configuration drift across repos. Connect to Grafana or Metabase for visualization.

**Automation**

Trigger alerts when new repos are created without required files (LICENSE, CODEOWNERS, security policies). Integrate with Slack or PagerDuty for real-time notifications.

```yaml
# Example: Scheduled sync with GitHub Actions
name: Sync Git Data
on:
  schedule:
    - cron: '0 6 * * *' # Daily at 6am UTC
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Sync git data
        run: cloudquery sync config.yml
        env:
          GIT_TOKEN: ${{ secrets.GIT_TOKEN }}
```

## Get Started

The Git Source Plugin is available now on [CloudQuery Hub](https://www.cloudquery.io/hub/plugins/source/cloudquery/git). See the [tables documentation](https://www.cloudquery.io/hub/plugins/source/cloudquery/git/latest/tables) for the full schema reference. [Download the CloudQuery CLI](https://www.cloudquery.io/download) and start syncing your repository files in minutes.

**Use Case Tutorials:**

- [Query Dockerfiles for EOL Base Images with SQL](https://www.cloudquery.io/blog/query-dockerfiles-for-eol-base-images-with-sql)
- [Find repos Missing LICENSE Files with SQL](https://www.cloudquery.io/blog/find-repos-missing-license-files-with-sql)
- [Track React Dependencies Across repos with SQL](https://www.cloudquery.io/blog/track-react-dependencies-across-repos-with-sql)
- [Audit CODEOWNERS Against Okta with SQL](https://www.cloudquery.io/blog/audit-codeowners-against-okta-with-sql)
- [Find Commits by Departed Employees with SQL](https://www.cloudquery.io/blog/find-commits-by-departed-employees-with-sql)

**Related reading:**

- [Find Pull Requests Merged Without Review](https://www.cloudquery.io/blog/how-to-use-the-github-plugin-to-find-pull-requests-that-were-merged-without-review)
- [Find Repositories with Unprotected Default Branches](https://www.cloudquery.io/blog/github-find-all-repos-with-unprotected-default-branches)
- [GitHub Source Plugin Documentation](https://www.cloudquery.io/hub/plugins/source/cloudquery/github)

## FAQ

**What file types can the Git Source Plugin sync?**

Any file type. The plugin syncs raw file content as binary data, so you can query text files directly or process binary files as needed. Common use cases include configuration files (YAML, JSON, TOML), dependency manifests (package.json, pom.xml, go.mod), Dockerfiles, and documentation (README, CODEOWNERS).

**Does the Git Source Plugin clone repositories locally?**

No. The plugin fetches file content directly via the Git provider's API. There's no local clone, which means faster syncs and no disk space requirements for repository storage.

**How does incremental syncing work?**

The plugin tracks file SHA hashes. On subsequent syncs, it only fetches files that have changed since the last sync. This reduces API calls and sync time significantly for large organizations.

**Can I use the Git Source Plugin with GitLab or Bitbucket?**

The plugin currently supports GitHub. Support for additional Git providers is on the roadmap.

**What's the difference between Git Source and GitHub Source plugins?**

Git Source syncs file contents from repositories. GitHub Source syncs GitHub-specific metadata like pull requests, issues, branch protection rules, and organization settings. Use Git Source for querying files, GitHub Source for platform data, or both together for complete visibility.

**How do I filter which files to sync?**

Use glob patterns in the configuration. You can specify patterns like `**/Dockerfile*`, `**/*.json`, or `.github/**/*.yml` to sync only the files you need.
