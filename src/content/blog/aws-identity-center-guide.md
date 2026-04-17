---
title: 'AWS IAM Identity Center (Formerly AWS SSO): The Complete 2026 Guide'
date: 2026-04-06
slug: 'aws-identity-center-guide'
description: 'AWS IAM Identity Center replaced AWS SSO in 2022. Learn how to set it up, configure permission sets, use the AWS CLI, and audit access with CloudQuery.'
categories: ['DevRel', 'Databases']
tags: ['Security', 'AWS', 'Tutorials']
heroImage: '/images/blog/aws-identity-center-guide/thumbnail.png'
canonicalUrl: 'https://www.cloudquery.io/blog/aws-identity-center-guide'
contentNotice: 'This post was originally published on CloudQuery blog.'
---

![Header Image: AWS IAM Identity Center Guide](/images/blog/aws-identity-center-guide/header.png?priority=true)

> **TL;DR:** AWS IAM Identity Center is the recommended way to manage human access to multiple AWS accounts without static access keys. It connects to your identity provider (Okta, Entra ID, Google Workspace), handles token refresh automatically, and has no additional AWS charge. This guide covers setup from scratch, CLI configuration, permission sets, and auditing access across all your accounts with SQL.

AWS renamed AWS Single Sign-On (AWS SSO) to [AWS IAM Identity Center](https://aws.amazon.com/about-aws/whats-new/2022/07/aws-single-sign-on-aws-sso-now-aws-iam-identity-center/) on July 26, 2022 - but the old name shows up everywhere: documentation links, blog posts, and Stack Overflow answers. If you're searching for `aws sso`, `aws configure sso`, or "how to set up AWS SSO", this is the right guide.

AWS IAM Identity Center is the recommended way to manage human access to AWS accounts and applications at scale. This guide covers what it is, how to set it up from scratch, how to configure the AWS CLI, and how to audit your Identity Center configuration with SQL using CloudQuery.

**In this article:**

- [What Is AWS IAM Identity Center?](#what-is-aws-iam-identity-center)
- [AWS IAM Identity Center vs. IAM Users: When to Use Each](#aws-iam-identity-center-vs-iam-users-when-to-use-each)
- [How Do You Set Up AWS IAM Identity Center?](#how-do-you-set-up-aws-iam-identity-center)
- [Permission Sets: How Access Actually Works](#permission-sets-how-access-actually-works)
- [How Do You Configure the AWS CLI with Identity Center?](#how-do-you-configure-the-aws-cli-with-identity-center)
- [How Do You Audit Identity Center Access with CloudQuery?](#how-do-you-audit-identity-center-access-with-cloudquery)
- [Troubleshooting Common Errors](#troubleshooting-common-errors)
- [FAQ](#faq)

## What Is AWS IAM Identity Center?

**AWS IAM Identity Center is AWS's centralized identity management service for assigning human users access to multiple AWS accounts and cloud applications from a single place.**

Before Identity Center, the standard approach was creating IAM users in each account with their own credentials. With 5 accounts that's manageable. With 50 accounts and 100 engineers, it's unworkable: separate passwords, separate MFA devices, separate access key rotations, and no centralized view of who has access to what.

Identity Center solves this by centralizing identity:

- Users log in once (via AWS or an external identity provider like Okta, Azure AD, or Google Workspace)
- Access assignments define which accounts and applications each user or group can access
- Permission sets define what IAM permissions users get in each account
- All access is temporary - users get time-limited credentials, not standing IAM keys

The practical effect: instead of 50 IAM users per account, you have one Identity Center configuration, one MFA enrollment, and one place to see and revoke access across the entire organization.

IAM Identity Center has no additional AWS charge. The identity management layer itself is free - you pay normal service rates for the resources you access, but not for Identity Center.

## AWS IAM Identity Center vs. IAM Users: When to Use Each

|                          | IAM Users                                              | IAM Identity Center                      |
| ------------------------ | ------------------------------------------------------ | ---------------------------------------- |
| **Best for**             | Service accounts, CI/CD pipelines, programmatic access | Human users accessing AWS accounts       |
| **Credentials**          | Long-lived access keys (manual rotation)               | Temporary credentials (auto-refreshed)   |
| **MFA**                  | Per-user, per-account configuration                    | Centralized, enforced by policy          |
| **Multi-account access** | Requires duplicate users or cross-account roles        | Native - one user, multiple accounts     |
| **Access revocation**    | Delete user or rotate keys per-account                 | Remove assignment centrally              |
| **Audit trail**          | CloudTrail per-account                                 | CloudTrail + Identity Center access logs |
| **AWS recommendation**   | Legacy; new services prefer Identity Center            | AWS recommends for all human access      |

AWS [explicitly recommends](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users.html) against creating IAM users for human access when Identity Center is an option. The security rationale is temporary credentials: when a session expires, access stops. There are no access keys to rotate, lose, or accidentally commit to a GitHub repository.

IAM users still make sense for service accounts (applications that need programmatic AWS access without human interaction). For those, the right pattern is IAM roles with instance profiles or OIDC federation - not long-lived IAM user keys.

## How Do You Set Up AWS IAM Identity Center?

Identity Center is enabled at the AWS Organizations level and requires root or management account access to configure initially.

**Step 1: Enable Identity Center**

In the AWS Management Console, search for "IAM Identity Center" and choose **Enable**. You'll be prompted to select an instance type:

- **Organization instance** (recommended): manages access across all accounts in your AWS Organization
- **Account instance**: single-account only, used for specific application integrations

Choose Organization instance for multi-account setups.

**Step 2: Choose your identity source**

Identity Center needs to know where your users come from:

- **Identity Center directory** (default): AWS manages your users and groups directly. Simple to start, no external IdP required.
- **Active Directory**: sync from AWS Managed Microsoft AD or self-managed AD via AD Connector
- **External identity provider**: federate with Okta, Azure AD, Google Workspace, or any SAML 2.0 provider via automatic provisioning (SCIM) or manual user sync

For teams already using an IdP, external federation is the right choice - users use the same credentials they use everywhere else, and de-provisioning happens automatically when you remove the user in your IdP.

**Step 3: Create permission sets**

Permission sets define what IAM permissions users get in an account. Before assigning anyone access, create at least:

- **ReadOnly**: `ReadOnlyAccess` managed policy - for engineers who need visibility without write access
- **PowerUser**: `PowerUserAccess` managed policy - for engineers who deploy infrastructure
- **AdministratorAccess**: `AdministratorAccess` managed policy - for account owners and on-call engineers

Permission sets appear in the IAM Identity Center console under **Permission sets**. Attach AWS managed policies, customer managed policies, or inline policy documents.

**Step 4: Assign accounts and users**

In the Identity Center console, go to **AWS accounts**, select an account, and choose **Assign users or groups**. Select the users or groups, select the permission sets, and choose **Submit**.

Identity Center creates the corresponding IAM roles in the target account automatically. The role name format is `AWSReservedSSO_{PermissionSetName}_{RandomSuffix}`.

## Permission Sets: How Access Actually Works

Permission sets are the key concept that distinguishes Identity Center from traditional IAM.

A permission set is a **template** that specifies IAM permissions. When you assign a permission set to a user for a specific account, Identity Center creates an IAM role in that account with those permissions. The user can then assume that role via Identity Center - they never need to know the role ARN directly.

This architecture matters for multi-account organizations: instead of creating the same IAM role in 50 accounts manually, you create one permission set in Identity Center and assign it across all 50 accounts in one operation.

Permission sets support:

- **AWS managed policies**: pre-built by AWS (AdministratorAccess, ReadOnlyAccess, PowerUserAccess, etc.)
- **Customer managed policies**: custom policies you've created in IAM - referenced by name, exists in each target account
- **Inline policies**: JSON attached directly to the permission set
- **Permissions boundaries**: limits on the maximum permissions a role can have

For details on the IAM concepts behind permission sets, see the [AWS IAM Identity Center permission sets documentation](https://docs.aws.amazon.com/singlesignon/latest/userguide/permissionsetsconcept.html).

## How Do You Configure the AWS CLI with Identity Center?

AWS CLI v2 has native Identity Center support via `aws configure sso`. For a full step-by-step walkthrough of CLI configuration, SSO sessions, and profile switching, see our dedicated guide: [Set Up AWS CLI with SSO (IAM Identity Center) - Step by Step](https://www.cloudquery.io/blog/how-to-setup-aws-cli-with-aws-sso).

**Quick reference - the essential commands:**

Configure a new SSO session and profile:

```bash
aws configure sso
```

The interactive wizard prompts for your SSO start URL (e.g., `https://your-org.awsapps.com/start`), SSO region, account, and permission set.

Log in and cache credentials:

```bash
aws sso login --profile your-profile-name
```

Use a specific profile for a command:

```bash
aws s3 ls --profile your-profile-name
```

Set a default profile for the session:

```bash
export AWS_PROFILE=your-profile-name
```

**SSO sessions (AWS CLI v2 recommended):**

The modern approach uses SSO sessions for automatic token refresh:

```bash
aws configure sso-session
```

This creates a named session in `~/.aws/config` that multiple profiles can share. When the token expires, `aws sso login --sso-session your-session-name` refreshes it for all profiles using that session simultaneously.

## How Do You Audit Identity Center Access with CloudQuery?

Once Identity Center is set up, auditing who has access to what becomes an ongoing problem. The Identity Center console shows you assignments per account, but getting the full picture across 20 or 50 accounts requires something more systematic - clicking through each account individually is how access reviews get skipped. The CloudQuery Platform syncs Identity Center configuration from your AWS accounts into SQL, making access reviews queryable rather than requiring account-by-account console navigation.

**Find all IAM roles provisioned by Identity Center across accounts (these are the roles users assume via Identity Center):**

```sql
SELECT
  account_id,
  role_name,
  arn,
  create_date
FROM aws_iam_roles
WHERE role_name LIKE 'AWSReservedSSO_%'
ORDER BY account_id, role_name;
```

**Find IAM users (legacy) that still have console access - these should be migrated to Identity Center:**

```sql
SELECT
  account_id,
  user_name,
  arn,
  create_date,
  password_last_used
FROM aws_iam_users
WHERE password_enabled = true
ORDER BY account_id, create_date;
```

**Find IAM users with active access keys - sign of credentials that should be replaced by Identity Center temporary credentials:**

```sql
SELECT
  u.account_id,
  u.user_name,
  k.access_key_id,
  k.last_rotated,
  k.last_used
FROM aws_iam_users u
JOIN aws_iam_user_access_keys k
  ON u.id = k.user_id
ORDER BY k.last_rotated ASC;
```

These queries form the basis of access reviews - a common [SOC 2](https://www.cloudquery.io/blog/what-is-soc2-compliance) and [CIS AWS Foundations Benchmark](https://docs.aws.amazon.com/securityhub/latest/userguide/cis-aws-foundations-benchmark.html) requirement. Run them as [CloudQuery Policies](https://www.cloudquery.io/docs/platform/features/policies) on a schedule and you have continuous access governance rather than quarterly manual exports.

For deeper IAM auditing patterns, see our guide to [continuous AWS IAM security](https://www.cloudquery.io/blog/continuous-aws-iam-security-best-practices).

## Troubleshooting Common Errors

**`Error: The SSO session has expired or is invalid`**

Your cached credentials have expired. Run `aws sso login --profile your-profile-name` to refresh. If you're using SSO sessions, run `aws sso login --sso-session your-session-name`.

**`Error: Profile "your-profile" is not configured with an SSO session`**

Your `~/.aws/config` profile was created with the old (pre-SSO session) format. You have two options: run `aws configure sso` to recreate the profile with the new format, or manually update `~/.aws/config` to add an `sso_session` reference.

**`Error: Failed to get credentials for profile (expired or invalid SSO credentials)`**

Often happens when running scripts without first logging in interactively. Add `aws sso login --sso-session your-session` to your script's initialization, or use a service role / OIDC federation for automated workflows instead of SSO credentials.

**`Error: An error occurred (AccessDeniedException) when calling ...`**

Your permission set doesn't include the permissions needed for that action. Check the permission set in the Identity Center console, review which managed policies are attached, and verify you're using the correct profile (right account, right permission set).

**Identity Center not showing in an account's IAM console**

Identity Center roles appear in IAM as roles named `AWSReservedSSO_*`. If you don't see them, the account may not have any permission set assignments yet. Go to the Identity Center console, select **AWS accounts**, find the account, and confirm assignments are configured.

**Unexpected access failures after account migration**

If you've recently moved AWS accounts between organizations, you may see access errors that don't match any of the above. Moving an account between AWS organizations doesn't transfer Identity Center assignments - you need to reconfigure assignments in the destination organization's Identity Center. The migrated account may also still reference the source organization's Identity Center instance. Check the account's IAM console for stale `AWSReservedSSO_*` roles pointing to the old organization. Affected engineers may need temporary IAM user access while the new Identity Center configuration is rebuilt.

## FAQ

### What Is AWS IAM Identity Center?

AWS IAM Identity Center is AWS's centralized identity management service for granting human users single sign-on (SSO) access to multiple AWS accounts and cloud applications through one login. It connects to external identity providers (Okta, Microsoft Entra ID, Google Workspace, or Active Directory), manages permission sets that define what users can do in each account, and issues short-lived temporary credentials automatically. It is the recommended replacement for per-account IAM users for any organization managing access across more than one AWS account. Formerly known as AWS Single Sign-On (AWS SSO), it was renamed in July 2022.

### What is the difference between AWS SSO and AWS IAM Identity Center?

They are the same service. AWS renamed AWS Single Sign-On (AWS SSO) to AWS IAM Identity Center on [July 26, 2022](https://aws.amazon.com/about-aws/whats-new/2022/07/aws-single-sign-on-aws-sso-now-aws-iam-identity-center/). The functionality is identical - the name change reflects a repositioning from "single sign-on tool" to a broader identity management service. CLI commands and API calls using the old `sso` namespace still work.

### Do I need AWS Organizations to use Identity Center?

For the recommended Organization instance (which covers all AWS accounts), yes - you need AWS Organizations enabled. A single-account instance is available without Organizations but has limited functionality and is intended for specific application integrations rather than multi-account access management.

### What happens to existing IAM users when I set up Identity Center?

Nothing automatically. Identity Center runs in parallel with existing IAM users. You should migrate human users to Identity Center over time and remove their IAM user credentials once they're using Identity Center successfully. AWS recommends against having both long-lived IAM user credentials and Identity Center access active for the same person.

### How does Identity Center interact with MFA?

MFA for Identity Center users is managed centrally. If using the Identity Center directory as your identity source, you configure MFA policy in the Identity Center console - requiring MFA for all users or specific contexts. If using an external IdP (Okta, Azure AD), MFA is managed by that IdP. Users don't enroll MFA separately per AWS account.

### Can I use Identity Center with the AWS CLI for scripts and automation?

For interactive use, yes - `aws sso login` handles authentication. For unattended automation (CI/CD pipelines, scheduled scripts), Identity Center is not the right tool because it requires interactive browser-based authentication. Use IAM roles with OIDC federation (GitHub Actions, GitLab CI), EC2 instance profiles, or ECS task roles for automated workloads.

### Does Identity Center work with on-premises Active Directory?

Yes. AWS Directory Service AD Connector lets Identity Center use your on-premises Active Directory as its identity source. Users authenticate with their existing AD credentials, and group memberships from AD map to Identity Center permission sets. This is the common path for enterprises that can't move all user management to an external IdP: keep Active Directory as the source of truth and route federation through AD Connector. Note that AD Connector adds a dependency on your on-premises network connectivity - if the AD Connector goes down or the network link to your data center fails, Identity Center authentication fails with it. For this reason, some teams prefer migrating to an external IdP like Okta or Azure AD rather than maintaining the on-premises dependency.
