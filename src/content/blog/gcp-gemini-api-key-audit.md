---
title: 'Did Gemini Just Make Your Google API Keys a Security Risk?'
date: 2026-03-06
slug: gcp-gemini-api-key-audit
description: Google API keys safe to embed publicly now authenticate to Gemini. Here's how to audit your GCP projects with CloudQuery to find the exposure.
categories: ['Work']
tags: ['Cloud Security', 'GCP', 'API Security', 'Google Cloud']
heroImage: /images/blog/gcp-gemini-api-key-audit/thumbnail.webp
heroAlt: 'Gemini Google API Key Security Risk Audit'
canonicalUrl: https://www.cloudquery.io/blog/gcp-gemini-api-key-audit
contentNotice: 'This post was originally published on CloudQuery blog.'
---

Google spent years telling developers that API keys aren't secrets - you could embed them in client-side JavaScript, ship them in mobile apps, commit them to public repos. That was the design. Keys for services like Google Maps have always been intended for public environments, scoped only by referrer restrictions or usage quotas.

That assumption no longer holds.

In February 2026, researchers at Truffle Security published a finding that changes the calculus for anyone running GCP: Google's `AIza*` format API keys - the same ones developers have embedded in production code for a decade - now authenticate to the Gemini API when that service is enabled on a project. No new key required. No warning that the access model changed. No email to inform you. A Maps key you deployed in 2019 might today grant an attacker access to your Gemini file storage, cached prompts, and the ability to run AI inference charges against your account.

Truffle Security [scanned millions of websites](https://trufflesecurity.com/blog/google-api-keys-werent-secrets-but-then-gemini-changed-the-rules) and found 2,863 live Google API keys already exposed to this vector - including keys from financial institutions, security companies, and Google's own infrastructure. Google themselves had old public API keys that Truffle Security could use to access Google's internal Gemini. A March 2026 [report in The Register][theregister-gemini] documented a developer who received an $82,314 bill after a Gemini key was stolen. That number is not a typo.

## Why Did This Happen?

The root cause is how GCP handles API key scoping. API keys are project-level credentials that authenticate to any service enabled on that project - unless you've explicitly configured API restrictions to limit which services a key can call. Historically, for services like Maps, developers never needed those restrictions. The key could only call Maps APIs anyway, so leaving it unrestricted felt harmless.

When Gemini gets enabled on a project - either because a team started using it, or because Google enables it by default on certain project types - every unrestricted key in that project silently gains the ability to authenticate to Gemini endpoints. [Google's documentation for API keys][gcp-api-restrictions-docs] describes API restrictions as optional, which is technically accurate. But "optional" lands differently when skipping them means your Maps key is also a Gemini credential.

Google initially classified Truffle Security's November 2025 disclosure as a "Customer Issue" - intended behavior. After researchers demonstrated the problem using Google's own infrastructure, Google reclassified it as a "Bug" in December 2025. The coordinated disclosure period ran 90 days before the report went public.

## What Can an Attacker Do With Your Key?

A leaked unrestricted key in a Gemini-enabled project opens a few different paths. The attacker can access files uploaded to that project's Gemini file storage. They can read cached content from the Gemini API. They can run AI inference billed to your account, and they can exhaust your project quotas to degrade service for your own workloads.

The file storage access is the one that concerns me most. If your teams are uploading internal documents, proprietary data, or user content to Gemini for processing, that content is accessible to anyone who holds one of your project's unrestricted API keys - including keys embedded in your frontend code or mobile app binaries. A separate analysis found that roughly 39.5% of 250,000 mobile apps contained hardcoded credentials. That's a lot of keys to worry about.

## How Do You Know If You're Affected?

Two conditions must both be true for a project to be at risk: the project has the Gemini API enabled, and it has at least one API key with no API-level restrictions. You need to verify both - independently, and then together.

[CloudQuery's GCP integration](https://www.cloudquery.io/hub/plugins/source/cloudquery/gcp/latest) syncs GCP infrastructure data into SQL tables you can query directly. After syncing your GCP data, `gcp_apikeys_keys` and `gcp_serviceusage_services` give you exactly what you need to run this audit across every project at once - instead of clicking through the GCP Console per-project. This is the same approach used for [writing cloud security posture checks in SQL](https://www.cloudquery.io/blog/cloud-operations-playbook-part-08-cloud-security-posture-sql) across other GCP and AWS resources.

### Step 1: Find Unrestricted API Keys

The `gcp_apikeys_keys` table ([CloudQuery Hub](https://www.cloudquery.io/hub/plugins/source/cloudquery/gcp/latest/tables/gcp_apikeys_keys)) stores one row per API key, with a `restrictions` JSON column. When a key has API-level restrictions configured, `restrictions` will contain an `apiTargets` array specifying which services the key can call. When that field is absent or null, the key is unrestricted.

```sql
SELECT
  project_id,
  name,
  display_name,
  create_time,
  restrictions
FROM gcp_apikeys_keys
WHERE restrictions IS NULL
   OR restrictions::text = '{}'
   OR restrictions->>'apiTargets' IS NULL;
```

This returns every API key across your GCP estate that can call any enabled service on its project.

### Step 2: Find Projects With Gemini Enabled

The `gcp_serviceusage_services` table ([CloudQuery Hub](https://www.cloudquery.io/hub/plugins/source/cloudquery/gcp/latest/tables/gcp_serviceusage_services)) tracks every GCP service per project, including its `state` (`ENABLED` or `DISABLED`). The Gemini API registers as `generativelanguage.googleapis.com`.

```sql
SELECT project_id, name, state
FROM gcp_serviceusage_services
WHERE name LIKE '%generativelanguage%'
  AND state = 'ENABLED';
```

If this returns rows, those projects are running Gemini and any unrestricted keys in them are exposure points.

### Step 3: Find the High-Risk Combinations

The query that actually matters joins both tables to surface keys where both conditions are true simultaneously.

```sql
SELECT DISTINCT
  k.project_id,
  k.name AS key_name,
  k.display_name,
  k.create_time
FROM gcp_apikeys_keys k
JOIN gcp_serviceusage_services s ON k.project_id = s.project_id
WHERE (k.restrictions IS NULL OR k.restrictions->>'apiTargets' IS NULL)
  AND s.name LIKE '%generativelanguage%'
  AND s.state = 'ENABLED';
```

This is your prioritized list: keys in Gemini-enabled projects with no API restrictions. Start here.

## What Should You Do About It?

For keys that appear in the query above, remediation comes in two parts.

**Add API restrictions to each key.** In the GCP Console under APIs & Services > Credentials, you can edit any key and specify exactly which APIs it's allowed to call. A Maps key should be restricted to the Maps JavaScript API. A Firebase key should only call the APIs it actually uses. Once the restriction is in place, even if the key leaks, it cannot authenticate to Gemini. [The GCP documentation][gcp-api-restrictions-docs] walks through how to do this via the Console or the API Keys API.

**Rotate keys that have been in public code.** For any key that has been embedded in a mobile app binary, frontend JavaScript, or a public repository - add API restrictions, and also generate a new restricted key to replace it. The old key should be treated as potentially compromised regardless of what restrictions you add now.

One distinction worth understanding clearly before you start:

| Restriction Type         | What It Limits                       | Protects Against Gemini Access? |
| ------------------------ | ------------------------------------ | ------------------------------- |
| API restrictions         | Which GCP services the key can call  | Yes                             |
| Application restrictions | Which apps/referrers can use the key | No                              |

HTTP referrer restrictions or IP restrictions limit _where_ a key can be used from - not _which APIs_ it can access. A key restricted to `yourdomain.com` with no API restrictions can still call Gemini from your domain. Both restriction types serve a purpose, but only API restrictions address this specific exposure.

## Keeping This Clean Going Forward

Running the audit once gets you to a safe state. Keeping it clean requires ongoing visibility. I'd recommend setting up a [CloudQuery Policy](https://www.cloudquery.io/blog/introducing-cloudquery-platform-policies) that flags any API key without API restrictions in a project where Gemini is enabled - that way you catch drift before it becomes exposure. A new key a team creates without thinking, or a project that gets Gemini enabled six months from now, both show up automatically.

The queries above work directly as policy conditions. The fix is not complicated; the problem is that most teams don't have a way to ask this question across all their projects simultaneously without cobbling together GCP Console sessions per-project. That's what [a unified cloud data layer](https://www.cloudquery.io/blog/security-teams-stop-hunting-threats) is for.

---

_Want to audit your GCP API key coverage and set up ongoing drift detection? [Schedule a demo](https://www.cloudquery.io/contact-us) to see how CloudQuery Platform can give you continuous visibility across your entire GCP estate._

---

## Frequently Asked Questions

**What is an API restriction on a Google Cloud API key?**

An API restriction limits which GCP services a key is allowed to call. Without one, a key can authenticate to any service enabled on its project. [Google's documentation][gcp-api-restrictions-docs] covers how to add them via the Console or the API Keys API.

**Does this affect every GCP project?**

No. A project is only at risk if it has both the Gemini API (`generativelanguage.googleapis.com`) enabled AND at least one API key without API restrictions. Projects that don't use Gemini are not affected by this specific vector.

**What is the difference between API restrictions and application restrictions on a GCP API key?**

API restrictions scope which GCP services a key can call. Application restrictions scope where a request using the key can originate - specific HTTP referrers, IP addresses, Android apps, or iOS apps. They're configured independently. Setting application restrictions does not prevent a key from calling Gemini; you need API restrictions for that.

**Can I tell if my keys were already abused?**

Check your GCP project's billing for unexpected Generative Language API charges. You can also review Cloud Audit Logs for `GenerativeLanguage` API calls made with your API keys. If you see calls you didn't initiate, assume the key was used externally and rotate it.

**What if I have hundreds of GCP projects?**

The JOIN query above runs across your entire synced GCP estate in one pass regardless of project count. Manual per-project auditing through the GCP Console doesn't scale past a handful of projects. This is the primary reason to have your GCP data normalized in SQL - see the [CloudQuery GCP integration](https://www.cloudquery.io/hub/plugins/source/cloudquery/gcp/latest) for setup details.

**Are service account keys affected the same way?**

No. Service account keys are a different credential type and authenticate differently. This issue is specific to API keys (the `AIza*` format). Service account key management has its own set of security considerations, which the `gcp_iam_service_account_keys` table can help you audit separately.

**Should I delete old API keys I'm not sure are still in use?**

If you can confirm a key isn't used, deleting it is cleaner than restricting it. The `create_time` and `update_time` fields in `gcp_apikeys_keys` can help identify keys that haven't been touched in years. For keys you're genuinely unsure about, add API restrictions first, monitor for breakage, then delete if nothing complains.

**What about API keys in mobile apps that have already shipped?**

Adding API restrictions in GCP takes effect immediately server-side - you don't need to ship an app update for the restriction to apply to an existing key. That said, if the key has been in a distributed binary, treat it as potentially compromised. Generate a new restricted key, include it in your next app release, then revoke the old one once adoption has reached a reasonable threshold.

[theregister-gemini]: https://www.theregister.com/2026/03/03/gemini_api_key_82314_dollar_charge/
[gcp-api-restrictions-docs]: https://docs.cloud.google.com/api-keys/docs/add-restrictions-api-keys
