---
title: 'Track React Dependencies Across Your Organization with SQL'
date: 2026-01-04
slug: 'track-react-dependencies-across-repos-with-sql'
description: 'Find every package.json using React across all repositories. Query dependency versions, track upgrades, identify outdated packages - all with SQL.'
categories: ['Work']
tags: ['Product News']
heroImage: '/images/blog/track-react-dependencies-across-repos-with-sql/thumbnail.png'
heroAlt: 'Track React dependencies across repos with SQL'
canonicalUrl: 'https://www.cloudquery.io/blog/track-react-dependencies-across-repos-with-sql'
contentNotice: 'This post was originally published on CloudQuery blog.'
tldr: 'The Git Source Integration syncs package.json files into your database. Parse JSON with SQL to find React versions, track dependencies vs devDependencies, and identify repos needing upgrades.'
---

![Track React dependencies header](/images/blog/track-react-dependencies-across-repos-with-sql/header.png)

You need to upgrade React across 50 repositories. Which repos use React? Which versions? Are they using React 16, 17, or 18? What about `devDependencies` vs `dependencies`? The manual approach: clone repos, grep package.json files, parse JSON, compile spreadsheets, track progress. And that spreadsheet is outdated the moment someone merges a dependency update.

The [Git Source Integration](https://www.cloudquery.io/hub/plugins/source/cloudquery/git) syncs package.json content into your data warehouse. Query React dependencies across all repos with SQL.

## Configuration

Configure the Git source integration to sync package.json files:

```yaml
tables:
  - git_files:
      glob_patterns:
        - '**/package.json'
```

This syncs all package.json files from your repositories into the `git_files` table, where you can parse JSON content with SQL.

## Query React Dependencies

Find all repos using React:

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

The query:

1. Parses package.json content as jsonb
2. Extracts `dependencies` and `devDependencies` separately
3. Flattens nested JSON into rows using LATERAL joins
4. Filters for React packages

## Results

The query returns:

- `repository_url` - Repository containing the package.json
- `package_name` - Package name from package.json
- `dependency_type` - `dependencies` or `devDependencies`
- `dependency_name` - Dependency package name (`react`)
- `dependency_version` - Version specification (`^18.2.0`, `~17.0.2`, etc.)

## Track Specific React Versions

Find repos using React 16:

```sql
SELECT * FROM all_dependencies
WHERE dependency_name = 'react'
  AND dependency_version LIKE '16.%' OR dependency_version LIKE '^16.%' OR dependency_version LIKE '~16.%'
```

Find repos that need React 18 upgrades:

```sql
SELECT * FROM all_dependencies
WHERE dependency_name = 'react'
  AND dependency_version NOT LIKE '18.%'
  AND dependency_version NOT LIKE '^18.%'
  AND dependency_version NOT LIKE '~18.%'
```

## Query Multiple Dependencies

Track React ecosystem packages:

```sql
SELECT * FROM all_dependencies
WHERE dependency_name IN ('react', 'react-dom', 'react-router-dom', '@types/react')
ORDER BY repository_url, dependency_name
```

This shows the full React dependency stack per repository, helping identify version mismatches.

## Dependency Version Analysis

Group by version to see adoption across repos:

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
    'dependencies' AS dependency_type,
    dep_key AS dependency_name,
    package_json->'dependencies'->>dep_key AS dependency_version
  FROM package_data,
  LATERAL jsonb_object_keys(package_json->'dependencies') AS dep_key
  WHERE package_json->'dependencies' IS NOT NULL

  UNION ALL

  SELECT
    repository_url,
    'devDependencies' AS dependency_type,
    dep_key AS dependency_name,
    package_json->'devDependencies'->>dep_key AS dependency_version
  FROM package_data,
  LATERAL jsonb_object_keys(package_json->'devDependencies') AS dep_key
  WHERE package_json->'devDependencies' IS NOT NULL
)
SELECT
  dependency_version,
  COUNT(*) AS repo_count
FROM all_dependencies
WHERE dependency_name = 'react'
GROUP BY dependency_version
ORDER BY repo_count DESC
```

Shows which React versions are most common across your organization.

## Get Started

The Git Source Integration is available on [CloudQuery Hub](https://www.cloudquery.io/hub/plugins/source/cloudquery/git). See the [tables documentation](https://www.cloudquery.io/hub/plugins/source/cloudquery/git/latest/tables) for the full `git_files`, `git_repositories`, and `git_commits` schema. [Download the CloudQuery CLI](https://www.cloudquery.io/download) to start querying package.json files.

**Related:**

- [Git Source Integration overview](https://www.cloudquery.io/blog/introducing-the-git-source-plugin)
- [Query Dockerfiles for EOL images](https://www.cloudquery.io/blog/query-dockerfiles-for-eol-base-images-with-sql)
- [Find repos missing LICENSE files](https://www.cloudquery.io/blog/find-repos-missing-license-files-with-sql)

## FAQ

**What if package.json is in a subdirectory?**

The glob pattern `**/package.json` matches package.json at any directory depth. monorepos often have multiple package.json files in subdirectories, and the query returns all of them with their full paths.

**Can I query other dependency managers like pom.xml or go.mod?**

Yes. Add glob patterns for Maven (`**/pom.xml`), Go (`**/go.mod`), Python (`**/requirements.txt`), or any other dependency manifest. Parse each format using PostgreSQL XML functions, JSON functions, or string parsing.

**How do I handle version ranges like ^18.2.0?**

PostgreSQL string pattern matching works for basic filtering. For precise version comparison, use a version parsing library or extract the base version number with regex and compare numerically.

**Can I track when dependencies were updated?**

The `git_files` table includes last modified timestamp. Track when package.json files change to identify recent dependency updates or repos that haven't updated dependencies in months.

**What if package.json files are malformed?**

The `::jsonb` cast will fail on invalid JSON. Wrap in a TRY-CATCH block or filter for valid JSON first using PostgreSQL's `jsonb_typeof()` function to validate before parsing.

**How do I find repos with security vulnerabilities in dependencies?**

Query for specific package versions with known CVEs. Cross-reference with vulnerability databases or join with tools like Snyk or npm audit results stored in your data warehouse.

**Can I query peer dependencies?**

Yes. package.json includes `peerDependencies`. Add another UNION clause in the query to extract and flatten `peerDependencies` alongside `dependencies` and `devDependencies`.

**Does this work for private npm packages?**

Yes. The query parses package names from package.json content. Private npm packages (e.g., `@yourorg/private-package`) appear in results the same as public packages.
