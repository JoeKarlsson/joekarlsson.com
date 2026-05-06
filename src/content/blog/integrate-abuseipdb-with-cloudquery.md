---
title: 'Integrate AbuseIPDB Threat Intelligence with CloudQuery'
date: 2025-05-01
slug: 'integrate-abuseipdb-with-cloudquery'
description: 'Check your cloud public IPs against AbuseIPDB abuse scores using CloudQuery inventory data and SQL joins. Includes working query examples.'
categories: ['Dev Tools']
tags: ['CloudQuery', 'Security', 'SQL', 'Cloud Infrastructure']
canonicalUrl: 'https://www.cloudquery.io/blog/integrate-abuseipdb-with-cloudquery'
tldr: 'AbuseIPDB scores IPs for abuse history. By joining it with CloudQuery cloud inventory data, you can find which of your public cloud resources have flagged IPs - before attackers or blocklists do.'
---

AbuseIPDB is a crowdsourced repository where users report IP addresses engaged in malicious behavior such as port scanning, brute force attempts, spam, and DDoS activity. Security professionals submit incident reports, which aggregate into confidence scores indicating abuse likelihood.

For cloud security teams, this integration addresses a fundamental concern: whether public cloud infrastructure appears in known abuse databases. This matters in both directions - your resources could be targets or compromised sources.

## Why Check Your Cloud IPs Against AbuseIPDB?

Attackers continuously scan load balancers, EC2 instances, RDS endpoints, and Kubernetes servers. Comparing your public IPs against AbuseIPDB distinguishes routine internet background activity from targeted attacks.

The outbound scenario is equally critical. Compromised cloud resources frequently generate abuse through vulnerable applications, exposed credentials, or misconfigured services. These instances join botnet operations, send spam, or scan external networks - resulting in AbuseIPDB listings. Identifying your public IPs appearing there signals compromise requiring investigation.

Business implications extend beyond security. IPs with elevated confidence scores land on commercial blocklists. When your application server IP gets blocklisted, legitimate users lose access, outbound email gets rejected, and partner integrations fail. Compliance frameworks like SOC 2 increasingly mandate documented monitoring of internet-exposed infrastructure.

## Integration Architecture

The implementation uses three components: CloudQuery syncs build your IP inventory, AbuseIPDB API queries check each address, and SQL joins correlate results to specific resources.

AbuseIPDB's Check endpoint examines individual IPs, returning abuse confidence scores (0-100), report counts, dates, usage classification, ISP details, and country information.

Store API responses in an `abuseipdb_scores` table in your CloudQuery destination database:

```sql
CREATE TABLE abuseipdb_scores (
  ip_address          TEXT PRIMARY KEY,
  abuse_confidence    INTEGER,
  total_reports       INTEGER,
  last_reported_at    TIMESTAMPTZ,
  isp                 TEXT,
  usage_type          TEXT,
  country_code        TEXT,
  checked_at          TIMESTAMPTZ DEFAULT NOW()
);
```

## Example: Find Public IPs with High Abuse Confidence Scores

This query identifies cloud resources with flagged IPs:

```sql
SELECT
  'ec2_instance' AS resource_type,
  i.instance_id AS resource_id,
  i.region,
  i.public_ip_address AS ip_address,
  a.abuse_confidence,
  a.total_reports,
  a.last_reported_at,
  a.isp,
  a.usage_type,
  i.tags->>'Owner' AS owner,
  i.tags->>'Environment' AS environment
FROM aws_ec2_instances i
JOIN abuseipdb_scores a
  ON i.public_ip_address = a.ip_address
WHERE
  i.public_ip_address IS NOT NULL
  AND a.abuse_confidence > 25
ORDER BY a.abuse_confidence DESC, a.total_reports DESC;
```

To check across multiple resource types at once:

```sql
WITH public_ips AS (
  SELECT instance_id AS resource_id, 'ec2_instance' AS resource_type,
         public_ip_address AS ip, region, tags
  FROM aws_ec2_instances
  WHERE public_ip_address IS NOT NULL

  UNION ALL

  SELECT allocation_id AS resource_id, 'elastic_ip' AS resource_type,
         public_ip AS ip, region, tags
  FROM aws_ec2_eips
  WHERE public_ip IS NOT NULL
)
SELECT
  p.resource_type,
  p.resource_id,
  p.ip,
  p.region,
  a.abuse_confidence,
  a.total_reports,
  a.last_reported_at,
  p.tags->>'Owner' AS owner
FROM public_ips p
JOIN abuseipdb_scores a ON p.ip = a.ip_address
WHERE a.abuse_confidence > 25
ORDER BY a.abuse_confidence DESC;
```

## Setting Up the Integration

**Step 1: Sync with CloudQuery**

Configure source plugins for AWS, GCP, or Azure, then run a sync to populate your destination database with public IP data.

**Step 2: Extract Public IPs**

```sql
SELECT DISTINCT public_ip_address AS ip
FROM aws_ec2_instances
WHERE public_ip_address IS NOT NULL
UNION
SELECT DISTINCT public_ip
FROM aws_ec2_eips
WHERE public_ip IS NOT NULL;
```

**Step 3: Query AbuseIPDB**

```bash
curl -G https://api.abuseipdb.com/api/v2/check \
  --data-urlencode "ipAddress=1.2.3.4" \
  -d maxAgeInDays=90 \
  -H "Key: $ABUSEIPDB_API_KEY" \
  -H "Accept: application/json"
```

**Step 4: Run enrichment queries**

Scores above 25 warrant review. Scores above 50 in production require investigation. IPs scoring 100 are actively malicious addresses.

**Step 5: Schedule regular refreshes**

Configure daily jobs to re-check all current public IPs. AbuseIPDB scores evolve continuously as new reports arrive and older entries age out.

## API Rate Limits

The free tier allows 1,000 daily checks. Most environments with 200-500 public IPs operate well within this. Larger deployments should batch requests across multiple days, prioritize production resources, or upgrade to a paid tier.

AbuseIPDB complements other IP intelligence platforms. Pair it with ipinfo.io for geolocation and network context alongside abuse history - both datasets join on IP address to your CloudQuery inventory using the same pattern.
