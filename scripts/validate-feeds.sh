#!/usr/bin/env bash
set -euo pipefail

ERRORS=0

echo "=== RSS & Sitemap Validation ==="
echo ""

# Step 1: Validate RSS feed
echo "--- Validating RSS feed ---"
if [ -f "dist/rss.xml" ]; then
  if xmllint --noout "dist/rss.xml" 2>/dev/null; then
    echo "OK: rss.xml is well-formed XML"
  else
    echo "ERROR: rss.xml is not valid XML"
    ERRORS=$((ERRORS + 1))
  fi
else
  echo "ERROR: dist/rss.xml not found"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# Step 2: Validate sitemap
echo "--- Validating sitemap ---"
SITEMAP=""
if [ -f "dist/sitemap-index.xml" ]; then
  SITEMAP="dist/sitemap-index.xml"
elif [ -f "dist/sitemap-0.xml" ]; then
  SITEMAP="dist/sitemap-0.xml"
fi

if [ -n "$SITEMAP" ]; then
  if xmllint --noout "$SITEMAP" 2>/dev/null; then
    echo "OK: $SITEMAP is well-formed XML"
  else
    echo "ERROR: $SITEMAP is not valid XML"
    ERRORS=$((ERRORS + 1))
  fi
else
  echo "ERROR: No sitemap file found in dist/"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# Step 3: Check sitemap URL count vs blog post count
echo "--- Checking sitemap URL coverage ---"
BLOG_COUNT=$(find src/content/blog -name "*.md" | wc -l | tr -d ' ')
if [ -n "$SITEMAP" ]; then
  SITEMAP_URLS=$(grep -c "<loc>" "$SITEMAP" 2>/dev/null || echo "0")
  echo "Blog posts: $BLOG_COUNT"
  echo "Sitemap URLs: $SITEMAP_URLS"
  if [ "$SITEMAP_URLS" -lt "$BLOG_COUNT" ]; then
    echo "WARNING: Sitemap has fewer URLs than blog posts (some may be in sub-sitemaps)"
  else
    echo "OK: Sitemap URL count looks reasonable"
  fi
else
  echo "SKIP: No sitemap to count URLs in"
fi
echo ""

echo "=== Summary ==="
echo "Errors: $ERRORS"

if [ "$ERRORS" -gt 0 ]; then
  exit 1
fi
