---
allowed-tools: Read, Bash, WebFetch, Grep, Glob, Edit
description: Analyze Plausible analytics for SEO issues, bounce rates, 404s, and actionable improvements
---

# Site Analytics & SEO Health Check

Analyze joekarlsson.com analytics from Plausible and provide actionable recommendations.

## Setup

Load environment variables:

```bash
source .env
```

Verify API access:

```bash
curl -s "${PLAUSIBLE_BASE_URL}/api/v2/query" \
  -H "Authorization: Bearer ${PLAUSIBLE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"site_id": "'"${PLAUSIBLE_SITE_ID}"'", "metrics": ["visitors"], "date_range": "day"}' | jq .
```

If this fails, check `.env` has the correct `PLAUSIBLE_API_KEY`, `PLAUSIBLE_BASE_URL`, and `PLAUSIBLE_SITE_ID`.

---

## Phase 1: Traffic Overview (7-day and 30-day)

### 1a. Aggregate metrics

```bash
# 7-day summary
curl -s "${PLAUSIBLE_BASE_URL}/api/v2/query" \
  -H "Authorization: Bearer ${PLAUSIBLE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "site_id": "'"${PLAUSIBLE_SITE_ID}"'",
    "metrics": ["visitors", "visits", "pageviews", "bounce_rate", "visit_duration", "views_per_visit"],
    "date_range": "7d"
  }' | jq .

# 30-day summary
curl -s "${PLAUSIBLE_BASE_URL}/api/v2/query" \
  -H "Authorization: Bearer ${PLAUSIBLE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "site_id": "'"${PLAUSIBLE_SITE_ID}"'",
    "metrics": ["visitors", "visits", "pageviews", "bounce_rate", "visit_duration", "views_per_visit"],
    "date_range": "30d"
  }' | jq .
```

### 1b. Daily trend (last 30 days)

```bash
curl -s "${PLAUSIBLE_BASE_URL}/api/v2/query" \
  -H "Authorization: Bearer ${PLAUSIBLE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "site_id": "'"${PLAUSIBLE_SITE_ID}"'",
    "metrics": ["visitors", "pageviews"],
    "date_range": "30d",
    "dimensions": ["time:day"]
  }' | jq '.results | map({date: .dimensions[0], visitors: .metrics[0], pageviews: .metrics[1]})'
```

Present:

- **Visitors**: 7d vs 30d average (trending up/down?)
- **Bounce rate**: Is it healthy (<60%) or concerning (>70%)?
- **Avg visit duration**: Good engagement (>1min) or quick exits (<30s)?
- **Views per visit**: Are people exploring (>1.5) or single-page visits?

---

## Phase 2: Top Pages Analysis

### 2a. Top pages by traffic

```bash
curl -s "${PLAUSIBLE_BASE_URL}/api/v2/query" \
  -H "Authorization: Bearer ${PLAUSIBLE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "site_id": "'"${PLAUSIBLE_SITE_ID}"'",
    "metrics": ["visitors", "pageviews", "bounce_rate", "visit_duration"],
    "date_range": "30d",
    "dimensions": ["event:page"],
    "order_by": [["visitors", "desc"]],
    "limit": 25
  }' | jq '.results | map({page: .dimensions[0], visitors: .metrics[0], pageviews: .metrics[1], bounce_rate: .metrics[2], duration: .metrics[3]})'
```

### 2b. Entry pages (where people land)

```bash
curl -s "${PLAUSIBLE_BASE_URL}/api/v2/query" \
  -H "Authorization: Bearer ${PLAUSIBLE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "site_id": "'"${PLAUSIBLE_SITE_ID}"'",
    "metrics": ["visitors", "bounce_rate"],
    "date_range": "30d",
    "dimensions": ["visit:entry_page"],
    "order_by": [["visitors", "desc"]],
    "limit": 20
  }' | jq '.results | map({entry_page: .dimensions[0], visitors: .metrics[0], bounce_rate: .metrics[1]})'
```

### 2c. Exit pages (where people leave)

```bash
curl -s "${PLAUSIBLE_BASE_URL}/api/v2/query" \
  -H "Authorization: Bearer ${PLAUSIBLE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "site_id": "'"${PLAUSIBLE_SITE_ID}"'",
    "metrics": ["visitors"],
    "date_range": "30d",
    "dimensions": ["visit:exit_page"],
    "order_by": [["visitors", "desc"]],
    "limit": 20
  }' | jq '.results | map({exit_page: .dimensions[0], visitors: .metrics[0]})'
```

Identify:

- **High-traffic pages with high bounce**: These need better CTAs or internal links
- **Top entry pages**: Are they optimized for first impressions?
- **Common exit pages**: Where are we losing people? Can we add related content?

---

## Phase 3: Traffic Sources

### 3a. Source breakdown

```bash
curl -s "${PLAUSIBLE_BASE_URL}/api/v2/query" \
  -H "Authorization: Bearer ${PLAUSIBLE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "site_id": "'"${PLAUSIBLE_SITE_ID}"'",
    "metrics": ["visitors", "bounce_rate", "visit_duration"],
    "date_range": "30d",
    "dimensions": ["visit:source"],
    "order_by": [["visitors", "desc"]],
    "limit": 20
  }' | jq '.results | map({source: .dimensions[0], visitors: .metrics[0], bounce_rate: .metrics[1], duration: .metrics[2]})'
```

### 3b. Referrer details

```bash
curl -s "${PLAUSIBLE_BASE_URL}/api/v2/query" \
  -H "Authorization: Bearer ${PLAUSIBLE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "site_id": "'"${PLAUSIBLE_SITE_ID}"'",
    "metrics": ["visitors"],
    "date_range": "30d",
    "dimensions": ["visit:referrer"],
    "order_by": [["visitors", "desc"]],
    "limit": 20
  }' | jq '.results | map({referrer: .dimensions[0], visitors: .metrics[0]})'
```

### 3c. UTM campaigns (if any)

```bash
curl -s "${PLAUSIBLE_BASE_URL}/api/v2/query" \
  -H "Authorization: Bearer ${PLAUSIBLE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "site_id": "'"${PLAUSIBLE_SITE_ID}"'",
    "metrics": ["visitors", "bounce_rate"],
    "date_range": "30d",
    "dimensions": ["visit:utm_source", "visit:utm_campaign"],
    "order_by": [["visitors", "desc"]],
    "limit": 15
  }' | jq '.results | map({utm_source: .dimensions[0], utm_campaign: .dimensions[1], visitors: .metrics[0], bounce_rate: .metrics[1]})'
```

Analyze:

- **Direct vs Search vs Social**: Is organic search working?
- **High-bounce sources**: Some referrers may send low-quality traffic
- **Best-converting sources**: Which sources have lowest bounce and longest duration?

---

## Phase 4: Problem Detection

### 4a. 404 errors (if tracked via custom events)

```bash
curl -s "${PLAUSIBLE_BASE_URL}/api/v2/query" \
  -H "Authorization: Bearer ${PLAUSIBLE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "site_id": "'"${PLAUSIBLE_SITE_ID}"'",
    "metrics": ["visitors"],
    "date_range": "30d",
    "dimensions": ["event:page"],
    "filters": [["contains", "event:page", ["404"]]]
  }' | jq .
```

Also check server logs if accessible, or look for pages with unusually high bounce + low duration.

### 4b. High-bounce pages (>80% bounce rate with decent traffic)

From the top pages data, filter for:

- Bounce rate > 80%
- At least 50 visitors in 30 days

These are **priority fixes** - people are finding these pages but immediately leaving.

### 4c. Short-duration pages (avg < 15 seconds)

Pages where visit duration is under 15 seconds suggest:

- Content doesn't match search intent
- Poor above-the-fold content
- Slow loading or broken layout

### 4d. Outbound link clicks (if tracked)

```bash
curl -s "${PLAUSIBLE_BASE_URL}/api/v2/query" \
  -H "Authorization: Bearer ${PLAUSIBLE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "site_id": "'"${PLAUSIBLE_SITE_ID}"'",
    "metrics": ["visitors"],
    "date_range": "30d",
    "dimensions": ["event:props:url"],
    "filters": [["is", "event:name", ["Outbound Link: Click"]]]
  }' | jq '.results | map({url: .dimensions[0], clicks: .metrics[0]}) | sort_by(-.clicks) | .[0:15]'
```

---

## Phase 5: SEO & Content Gaps

### 5a. Search queries (if Google Search Console integrated)

Check if any search query data is available through Plausible or note that GSC should be checked separately.

### 5b. Device breakdown

```bash
curl -s "${PLAUSIBLE_BASE_URL}/api/v2/query" \
  -H "Authorization: Bearer ${PLAUSIBLE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "site_id": "'"${PLAUSIBLE_SITE_ID}"'",
    "metrics": ["visitors", "bounce_rate"],
    "date_range": "30d",
    "dimensions": ["visit:device"]
  }' | jq '.results | map({device: .dimensions[0], visitors: .metrics[0], bounce_rate: .metrics[1]})'
```

If mobile bounce rate is significantly higher than desktop, there may be mobile UX issues.

### 5c. Browser breakdown

```bash
curl -s "${PLAUSIBLE_BASE_URL}/api/v2/query" \
  -H "Authorization: Bearer ${PLAUSIBLE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "site_id": "'"${PLAUSIBLE_SITE_ID}"'",
    "metrics": ["visitors", "bounce_rate"],
    "date_range": "30d",
    "dimensions": ["visit:browser"]
  }' | jq '.results | map({browser: .dimensions[0], visitors: .metrics[0], bounce_rate: .metrics[1]})'
```

### 5d. Country breakdown

```bash
curl -s "${PLAUSIBLE_BASE_URL}/api/v2/query" \
  -H "Authorization: Bearer ${PLAUSIBLE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "site_id": "'"${PLAUSIBLE_SITE_ID}"'",
    "metrics": ["visitors"],
    "date_range": "30d",
    "dimensions": ["visit:country"],
    "order_by": [["visitors", "desc"]],
    "limit": 15
  }' | jq '.results | map({country: .dimensions[0], visitors: .metrics[0]})'
```

---

## Phase 6: Conversions & Goals (if configured)

### 6a. Custom events/goals

```bash
curl -s "${PLAUSIBLE_BASE_URL}/api/v2/query" \
  -H "Authorization: Bearer ${PLAUSIBLE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "site_id": "'"${PLAUSIBLE_SITE_ID}"'",
    "metrics": ["visitors"],
    "date_range": "30d",
    "dimensions": ["event:name"],
    "filters": [["is_not", "event:name", ["pageview"]]]
  }' | jq '.results | map({event: .dimensions[0], count: .metrics[0]})'
```

### 6b. File downloads (if tracked)

```bash
curl -s "${PLAUSIBLE_BASE_URL}/api/v2/query" \
  -H "Authorization: Bearer ${PLAUSIBLE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "site_id": "'"${PLAUSIBLE_SITE_ID}"'",
    "metrics": ["visitors"],
    "date_range": "30d",
    "dimensions": ["event:props:url"],
    "filters": [["is", "event:name", ["File Download"]]]
  }' | jq '.results | map({file: .dimensions[0], downloads: .metrics[0]})'
```

---

## Phase 7: Action Report

After collecting all data, generate a structured report:

### Summary Dashboard

```
ANALYTICS HEALTH CHECK - joekarlsson.com
=========================================
Period: Last 30 days
Report generated: [date]

TRAFFIC OVERVIEW
----------------
Visitors (30d):     [X]
Visitors (7d):      [X] ([trend] vs prev 7d)
Bounce Rate:        [X]% [HEALTHY/WARNING/CRITICAL]
Avg Duration:       [X]s [GOOD/NEEDS WORK]
Pages per Visit:    [X]

TOP PERFORMERS
--------------
1. [page] - [X] visitors
2. [page] - [X] visitors
3. [page] - [X] visitors

PROBLEM PAGES (high bounce, low engagement)
-------------------------------------------
1. [page] - [X]% bounce, [X]s duration
   ACTION: [specific recommendation]
2. ...

TRAFFIC SOURCES
---------------
1. [source] - [X] visitors ([X]% of total)
2. ...

ISSUES FOUND
------------
[ ] 404 errors detected: [list URLs]
[ ] Mobile bounce rate [X]% higher than desktop
[ ] [X] pages have >80% bounce rate
[ ] [specific issue]

ACTIONABLE RECOMMENDATIONS
==========================
Priority 1 (Quick Wins):
- [ ] [specific action with file path if applicable]
- [ ] [specific action]

Priority 2 (Content Improvements):
- [ ] [specific action]

Priority 3 (Technical Fixes):
- [ ] [specific action]

IMPOSSIBLE TO FIX (external factors):
- [explanation of things outside our control]
```

### Implementation Details

For each actionable recommendation, provide:

1. **What to fix**: Specific page or issue
2. **Why it matters**: Impact on traffic/engagement
3. **How to fix it**: Exact steps, file paths, code changes if applicable
4. **Expected outcome**: What improvement to expect

### Cross-reference with codebase

For pages identified as problems, read the actual content:

```bash
# Find the markdown file for a problematic page
ls src/content/blog/*slug*.md
```

Then provide specific content suggestions:

- Better opening hook
- Missing internal links
- CTAs to add
- Images or visual breaks needed
- Meta description improvements

---

## Usage

Run this skill anytime to get a current snapshot:

- `/analytics` - Full report
- Review monthly to track trends
- Run after publishing new content to see initial performance
