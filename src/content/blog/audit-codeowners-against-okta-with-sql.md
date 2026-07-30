---
title: 'Audit CODEOWNERS Against Okta to Find Orphaned Code Ownership with SQL'
date: 2026-01-04
slug: 'audit-codeowners-against-okta-with-sql'
description: 'Find CODEOWNERS entries for employees who left the company by joining Git file content with your identity provider data. No scripts, just SQL.'
categories: ['Work']
tags: ['Tutorials', 'Security']
heroImage: '/images/blog/audit-codeowners-against-okta-with-sql/thumbnail.webp'
heroAlt: 'Audit CODEOWNERS against Okta with SQL'
canonicalUrl: 'https://www.cloudquery.io/blog/audit-codeowners-against-okta-with-sql'
contentNotice: 'This post was originally published on CloudQuery blog.'
tldr: 'The Git Source Integration syncs CODEOWNERS files. Join with Okta and GitHub data to find orphaned code ownership - accounts that left the company but remain in CODEOWNERS.'
---

![Blog header for auditing GitHub CODEOWNERS files against Okta user directory with SQL](/images/blog/audit-codeowners-against-okta-with-sql/header.webp)

CODEOWNERS files assign code responsibility to specific GitHub users. When engineers leave the company, their GitHub handles remain in CODEOWNERS files. Pull requests still notify non-existent accounts. Code ownership documentation decays. Tracking this manually means comparing CODEOWNERS files across hundreds of repos against your identity provider, then creating tickets to update each stale entry.

The [Git Source Integration](https://www.cloudquery.io/hub/plugins/source/cloudquery/git) syncs CODEOWNERS content. Combined with the [Okta Source Integration](https://www.cloudquery.io/hub/plugins/source/cloudquery/okta) and [GitHub Source Integration](https://www.cloudquery.io/hub/plugins/source/cloudquery/github), you can query orphaned code ownership with SQL.

## Required Plugins

This use case requires three CloudQuery source integrations:

1. [Git Source Integration](https://www.cloudquery.io/hub/plugins/source/cloudquery/git) - Syncs CODEOWNERS file content
2. [GitHub Source Integration](https://www.cloudquery.io/hub/plugins/source/cloudquery/github) - Maps GitHub handles to email addresses
3. [Okta Source Integration](https://www.cloudquery.io/hub/plugins/source/cloudquery/okta) - Provides employee status from your identity provider

## Configuration

Configure the Git source integration to sync CODEOWNERS files:

```yaml
tables:
  - git_files:
      glob_patterns:
        - '**/CODEOWNERS'
```

Configure GitHub and Okta plugins per their documentation to sync organization members and user data.

## Query Orphaned CODEOWNERS

Find CODEOWNERS entries for inactive Okta accounts:

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

The query:

1. Parses CODEOWNERS content to extract GitHub handles using regex
2. Excludes team handles (format: `@org/team-name`)
3. Joins GitHub handles with organization member emails
4. Joins GitHub emails with Okta user status
5. Filters for missing or inactive accounts

## Results

The query returns:

- `repository_url` - Repository with stale CODEOWNERS entry
- `github_handle` - GitHub username in CODEOWNERS
- `github_email` - Email from GitHub profile (may be NULL)
- `okta_status` - `ACTIVE`, `DEPROVISIONED`, `SUSPENDED`, or `NOT_FOUND`

Create tracking issues for repos with inactive owners. Assign code ownership to active team members.

## Team Ownership Analysis

Find repos owned by specific teams:

```sql
WITH codeowners_parsed AS (
  SELECT
    gf.repository_url,
    regexp_matches(
      convert_from(gf.content, 'UTF8'),
      '(?:^|\s)@([a-zA-Z0-9_-]+/[a-zA-Z0-9_-]+)',
      'gm'
    ) AS team_handle_match
  FROM git_files gf
  WHERE gf.name = 'CODEOWNERS'
),
teams_flat AS (
  SELECT DISTINCT
    repository_url,
    team_handle_match[1] AS team_handle
  FROM codeowners_parsed
)
SELECT
  repository_url,
  team_handle
FROM teams_flat
WHERE team_handle = 'your-org/platform-team'
ORDER BY repository_url
```

This identifies all repos with specific team ownership assignments.

## Missing CODEOWNERS Files

Find repositories without CODEOWNERS:

```sql
WITH repos_with_codeowners AS (
  SELECT repository_url FROM git_files WHERE name = 'CODEOWNERS'
)
SELECT gr.url, gr.owner, gr.full_name
FROM git_repositories gr
LEFT JOIN repos_with_codeowners rc ON rc.repository_url = gr.url
WHERE rc.repository_url IS NULL
```

Repos without CODEOWNERS files have undefined code ownership, making it difficult to route reviews and assign responsibility.

## Get Started

The [Git Source Integration](https://www.cloudquery.io/hub/plugins/source/cloudquery/git), [GitHub Source Integration](https://www.cloudquery.io/hub/plugins/source/cloudquery/github), and [Okta Source Integration](https://www.cloudquery.io/hub/plugins/source/cloudquery/okta) are available on [CloudQuery Hub](https://www.cloudquery.io/hub/). See the [Git tables documentation](https://www.cloudquery.io/hub/plugins/source/cloudquery/git/latest/tables) for the full schema. [Download the CloudQuery CLI](https://www.cloudquery.io/download) to start auditing code ownership.

**Related:**

- [Git Source Integration overview](https://www.cloudquery.io/blog/introducing-the-git-source-plugin)
- [Query Dockerfiles for EOL images](https://www.cloudquery.io/blog/query-dockerfiles-for-eol-base-images-with-sql)
- [Find repos missing LICENSE files](https://www.cloudquery.io/blog/find-repos-missing-license-files-with-sql)

## FAQ

**What if GitHub handles in CODEOWNERS don't have public emails?**

GitHub users can hide email addresses. The query returns NULL for `github_email` when emails are private. You'll need to manually verify these accounts or use GitHub Enterprise with required email visibility.

**How do I handle CODEOWNERS entries for external contributors?**

External contributors won't appear in your Okta directory. Filter the query to exclude known external collaborator emails or GitHub handles, or flag them separately for manual review.

**Can I audit CODEOWNERS against other identity providers?**

Yes. Replace the Okta plugin with [Entra ID](https://www.cloudquery.io/hub/plugins/source/cloudquery/entraid), [Google Workspace](https://www.cloudquery.io/hub/plugins/source/cloudquery/googleworkspace), or any identity provider CloudQuery supports. The SQL pattern remains the same.

**What if CODEOWNERS uses email addresses instead of GitHub handles?**

Modify the regex pattern to extract email addresses. Some CODEOWNERS files use emails directly rather than `@username` handles. Parse both patterns and union the results.

**How often should I run this audit?**

Running monthly catches recently departed employees whose accounts were removed from active status. Combine with CloudQuery scheduled syncs to automate the audit and generate monthly reports.

**Can I check CODEOWNERS in subdirectories?**

Yes. The glob pattern `**/CODEOWNERS` matches CODEOWNERS files at any directory depth. monorepos often include CODEOWNERS files in subdirectories for per-package ownership.

**What if the same person appears in multiple CODEOWNERS files?**

The query returns one row per repository-handle combination. Aggregate by `github_handle` to see all repos where a specific inactive user is listed as an owner.

**How do I automate remediation?**

Export query results and use GitHub API or git automation to create pull requests removing stale entries. Or integrate with Jira/Linear to create tracking issues for each affected repo.
