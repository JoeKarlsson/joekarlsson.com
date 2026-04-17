---
title: 'Find Commits by Departed Employees Across All Repos with SQL'
date: 2026-01-04
slug: 'find-commits-by-departed-employees-with-sql'
description: 'Identify code changes made by employees who left your organization. Cross-reference git commit authors against your identity provider to find commits needing review.'
categories: ['Work']
tags: ['Tutorials', 'Security']
heroImage: '/images/blog/find-commits-by-departed-employees-with-sql/thumbnail.png'
heroAlt: 'Find commits by departed employees with SQL'
canonicalUrl: 'https://www.cloudquery.io/blog/find-commits-by-departed-employees-with-sql'
contentNotice: 'This post was originally published on CloudQuery blog.'
tldr: 'The Git Source Integration syncs commit history. Join with Okta or Azure AD to identify commits by former employees for compliance audits and security reviews.'
---

![Find commits by departed employees header](/images/blog/find-commits-by-departed-employees-with-sql/header.png)

An engineer leaves your company. Their access gets revoked, their laptop returned. But their commits remain across dozens of repositories. For compliance audits, security reviews, or simply understanding code ownership, you need to identify which code was authored by former employees. The manual approach: export HR data, clone repos, run `git log`, correlate email addresses, compile spreadsheets. Repeat quarterly.

The [Git Source Integration](https://www.cloudquery.io/hub/plugins/source/cloudquery/git) syncs commit history into your data warehouse. Combined with identity provider data from [Okta](https://www.cloudquery.io/hub/plugins/source/cloudquery/okta) or [Entra ID](https://www.cloudquery.io/hub/plugins/source/cloudquery/entraid), you can query commits by employment status with SQL.

## Required Plugins

This use case requires two CloudQuery source integrations:

1. [Git Source Integration](https://www.cloudquery.io/hub/plugins/source/cloudquery/git) - Syncs commit history
2. [Okta Source Integration](https://www.cloudquery.io/hub/plugins/source/cloudquery/okta) (or Azure AD) - Provides employee status

## Configuration

Configure the Git source integration to sync commits:

```yaml
kind: source
spec:
  name: git
  path: cloudquery/git
  version: 'v1.0.0'
  tables:
    - git_commits
    - git_repositories
  destinations:
    - postgresql
```

## Query Commits by Departed Employees

Find commits authored by inactive Okta users:

```sql
SELECT
  gc.sha,
  gc.repository_url,
  gc.author_name,
  gc.author_email,
  gc.author_date,
  gc.message,
  COALESCE(u.status, 'NOT_FOUND') AS okta_status
FROM git_commits gc
LEFT JOIN okta_users u ON lower(gc.author_email) = lower(u.email)
WHERE u.status IS NULL           -- No matching Okta account
   OR u.status != 'ACTIVE'       -- Okta account inactive
ORDER BY gc.author_date DESC
```

The query:

1. Joins commit authors with Okta user records by email
2. Filters for missing or inactive accounts
3. Returns recent commits first for prioritization

## Results

The query returns:

- `sha` - Commit hash for reference
- `repository_url` - Repository containing the commit
- `author_name`, `author_email` - Who made the commit
- `author_date` - When the commit was made
- `message` - Commit message for context
- `okta_status` - `ACTIVE`, `DEPROVISIONED`, `SUSPENDED`, or `NOT_FOUND`

## Aggregate by Author

See which former employees have the most commits:

```sql
SELECT
  gc.author_email,
  gc.author_name,
  COUNT(*) AS commit_count,
  MIN(gc.author_date) AS first_commit,
  MAX(gc.author_date) AS last_commit,
  COUNT(DISTINCT gc.repository_url) AS repos_touched
FROM git_commits gc
LEFT JOIN okta_users u ON lower(gc.author_email) = lower(u.email)
WHERE u.status IS NULL OR u.status != 'ACTIVE'
GROUP BY gc.author_email, gc.author_name
ORDER BY commit_count DESC
```

Prioritize review for authors with high commit counts or recent activity.

## Recent Commits Only

Focus on commits from the past 90 days:

```sql
SELECT
  gc.sha,
  gc.repository_url,
  gc.author_name,
  gc.author_email,
  gc.author_date,
  gc.message
FROM git_commits gc
LEFT JOIN okta_users u ON lower(gc.author_email) = lower(u.email)
WHERE (u.status IS NULL OR u.status != 'ACTIVE')
  AND gc.author_date > NOW() - INTERVAL '90 days'
ORDER BY gc.author_date DESC
```

Recent commits from departed employees may indicate timing issues with offboarding or warrant immediate security review.

## Compliance Reporting

Generate a report for SOC 2 or security audits:

```sql
SELECT
  gr.full_name AS repository,
  gc.author_name,
  gc.author_email,
  gc.author_date,
  gc.sha,
  LEFT(gc.message, 100) AS commit_summary,
  CASE
    WHEN u.status = 'DEPROVISIONED' THEN 'Former Employee'
    WHEN u.status = 'SUSPENDED' THEN 'Suspended Account'
    WHEN u.status IS NULL THEN 'Unknown - Not in IdP'
    ELSE u.status
  END AS employee_status
FROM git_commits gc
JOIN git_repositories gr ON gr.url = gc.repository_url
LEFT JOIN okta_users u ON lower(gc.author_email) = lower(u.email)
WHERE u.status IS NULL OR u.status != 'ACTIVE'
ORDER BY gr.full_name, gc.author_date DESC
```

Export to CSV for audit documentation or import into your GRC platform.

## Get Started

The [Git Source Integration](https://www.cloudquery.io/hub/plugins/source/cloudquery/git) and [Okta Source Integration](https://www.cloudquery.io/hub/plugins/source/cloudquery/okta) are available on [CloudQuery Hub](https://www.cloudquery.io/hub/). See the [Git tables documentation](https://www.cloudquery.io/hub/plugins/source/cloudquery/git/latest/tables) for the full schema. [Download the CloudQuery CLI](https://www.cloudquery.io/download) to start auditing commit history.

**Related:**

- [Git Source Integration overview](https://www.cloudquery.io/blog/introducing-the-git-source-plugin)
- [Audit CODEOWNERS against Okta](https://www.cloudquery.io/blog/audit-codeowners-against-okta-with-sql)
- [Query Dockerfiles for EOL images](https://www.cloudquery.io/blog/query-dockerfiles-for-eol-base-images-with-sql)

## FAQ

**What if employees use personal email addresses for commits?**

Commits with personal emails won't match Okta records. Query for commits where `author_email` doesn't match your corporate domain pattern, then correlate manually or maintain an email alias mapping table.

**Can I use Azure AD instead of Okta?**

Yes. Replace the Okta plugin with [Entra ID](https://www.cloudquery.io/hub/plugins/source/cloudquery/entraid) and join on the appropriate user email field. The SQL pattern remains the same.

**How do I handle contractors and external contributors?**

External contributors won't appear in your IdP. Filter by email domain first, or maintain a separate table of known external contributors to exclude from the audit.

**How often should I run this audit?**

Running monthly catches recently departed employees. For compliance, align with your audit schedule (quarterly for SOC 2, annually for some frameworks). Automate with scheduled CloudQuery syncs.

**What about commits made before the employee joined?**

The query returns all commits by email, regardless of employment dates. Join with HR data containing hire/termination dates for more precise filtering.

**Can I track commits by both author and committer?**

Yes. Git distinguishes between author (who wrote the code) and committer (who applied the commit). Query both `author_email` and `committer_email` columns if your workflow includes commit rebasing or cherry-picking.

**How do I identify commits that need code review?**

Join with the GitHub Source Integration to check if commits are part of merged PRs that had reviews. Commits pushed directly to main without PR review are higher risk.

**What if the same person has multiple email addresses?**

Create an email alias mapping table or use SQL pattern matching. Many organizations have historical email format changes (<first.last@company.com> vs <flast@company.com>).
