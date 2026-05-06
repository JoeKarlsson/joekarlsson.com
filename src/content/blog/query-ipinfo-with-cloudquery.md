---
title: 'How to Query ipinfo.io Data with CloudQuery'
date: 2025-05-01
slug: 'query-ipinfo-with-cloudquery'
description: 'Enrich your CloudQuery cloud asset inventory with ipinfo.io geolocation, ASN, and privacy detection data using SQL joins. Includes working query examples.'
categories: ['Dev Tools']
tags: ['CloudQuery', 'Security', 'SQL', 'Cloud Infrastructure']
canonicalUrl: 'https://www.cloudquery.io/blog/query-ipinfo-with-cloudquery'
tldr: 'ipinfo.io gives you geolocation, ASN, and privacy detection for any IP. Joined against CloudQuery inventory data, you can flag EC2 instances geolocating outside expected regions, IPs routing through unexpected ASNs, and data residency violations - all in plain SQL.'
---

ipinfo.io delivers geolocation, ASN, and privacy detection data for IP addresses. When integrated with CloudQuery's cloud inventory, teams can connect IP intelligence with their infrastructure to identify resources in unexpected geographic locations or those routing through unrecognized VPN nodes and hosting providers.

## Why Enrich Cloud Asset Data with IP Intelligence?

CloudQuery syncs capture IP addresses across many resources: EC2 instances, NAT gateways, load balancers, RDS instances with public endpoints, CloudFront distributions, GKE nodes, and Azure VMs. Large cloud environments contain hundreds of these resources - which are meaningless without context.

**Geographic validation**: An EC2 instance provisioned in `us-east-1` should geolocate to Virginia or the eastern US. Deviations - or IPs routing through unrecognized network organizations - warrant investigation.

**Network context**: ipinfo.io identifies whether an IP associates with a VPN exit node, known proxy service, or a hosting provider other than your cloud vendor. An EC2 instance whose public IP resolves to a different ASN than Amazon's indicates an unusual situation.

**Compliance requirements**: In regulated environments, geolocation data addresses gaps that AWS region labels can't fill. Region indicates where resources were provisioned; geolocation indicates where that IP actually routes - the number that matters for data residency compliance.

CloudQuery inventory provides the "what"; ipinfo.io provides the "where and who."

## Implementation

The workflow: sync cloud infrastructure with CloudQuery to capture all public IPs, query ipinfo.io for each IP, load results into your data warehouse alongside CloudQuery data, then join in SQL.

**Sample schema:**

```sql
CREATE TABLE ipinfo_data (
  ip          TEXT PRIMARY KEY,
  hostname    TEXT,
  city        TEXT,
  region      TEXT,
  country     TEXT,
  org         TEXT,   -- "AS15169 Google LLC"
  timezone    TEXT,
  -- privacy detection (paid tier)
  vpn         BOOLEAN,
  proxy       BOOLEAN,
  tor         BOOLEAN,
  hosting     BOOLEAN,
  enriched_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Basic join:**

```sql
SELECT
  i.instance_id,
  i.instance_type,
  i.region AS aws_region,
  i.public_ip_address,
  ip.country,
  ip.city,
  ip.org AS asn_org,
  ip.hostname
FROM aws_ec2_instances i
LEFT JOIN ipinfo_data ip
  ON i.public_ip_address = ip.ip
WHERE i.public_ip_address IS NOT NULL
ORDER BY ip.country, i.region;
```

## Example: Find Public EC2 Instances with Unexpected Geolocations

```sql
SELECT
  i.instance_id,
  i.region AS aws_region,
  i.public_ip_address,
  ip.country AS geolocated_country,
  ip.city,
  ip.org AS network_org,
  i.tags->>'Environment' AS environment,
  i.tags->>'Owner' AS owner
FROM aws_ec2_instances i
JOIN ipinfo_data ip
  ON i.public_ip_address = ip.ip
WHERE
  i.public_ip_address IS NOT NULL
  AND (
    (i.region LIKE 'us-%' AND ip.country != 'US')
    OR (i.region LIKE 'eu-%' AND ip.country NOT IN ('DE', 'IE', 'SE', 'FR', 'IT', 'ES', 'GB'))
  )
ORDER BY i.region, ip.country;
```

For VPN and proxy detection (paid tier), flag any public-facing resource IP resolving to unexpected hosting networks:

```sql
SELECT
  i.instance_id,
  i.public_ip_address,
  ip.org,
  ip.hosting AS is_hosting_ip,
  ip.country
FROM aws_ec2_instances i
JOIN ipinfo_data ip ON i.public_ip_address = ip.ip
WHERE
  ip.hosting = true
  AND ip.org NOT ILIKE '%amazon%'
  AND ip.org NOT ILIKE '%google%'
  AND ip.org NOT ILIKE '%microsoft%'
  AND i.public_ip_address IS NOT NULL;
```

## Data Residency Compliance Checks

For environments under GDPR, HIPAA, or other data residency requirements, AWS region labels indicate provisioning location - but geolocation reveals where IPs actually route, which can differ for edge-hosted services and CDN configurations.

```sql
SELECT
  i.instance_id,
  i.region AS aws_region,
  i.public_ip_address,
  ip.country AS geolocated_country,
  ip.city,
  ip.org,
  i.tags->>'DataClassification' AS data_classification
FROM aws_ec2_instances i
JOIN ipinfo_data ip ON i.public_ip_address = ip.ip
WHERE
  i.public_ip_address IS NOT NULL
  AND i.tags->>'DataClassification' IN ('PII', 'PHI', 'Confidential')
  AND ip.country NOT IN ('DE', 'IE', 'SE', 'FR', 'NL', 'BE', 'AT', 'DK', 'FI')
ORDER BY ip.country, i.region;
```

## Getting Started

Run a CloudQuery sync to populate your destination database. Extract distinct public IPs and send them to ipinfo.io in batches - the batch endpoint handles up to 1,000 IPs per request. Write results to the `ipinfo_data` table, then run the join queries.

The free tier covers 50,000 requests per month - enough for most cloud environments to run daily enrichment. Privacy detection (VPN, proxy, hosting flags) requires a paid tier; base geolocation and ASN data are free.

Geolocation data for cloud provider IP ranges is stable, so weekly refreshes for existing IPs plus an immediate check on newly discovered IPs is a reasonable operational cadence.
