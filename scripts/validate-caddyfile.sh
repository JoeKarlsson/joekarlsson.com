#!/usr/bin/env bash
set -euo pipefail

ERRORS=0
WARNINGS=0
CADDYFILE="Caddyfile"

echo "=== Caddyfile Security Headers Check ==="
echo ""

if [ ! -f "$CADDYFILE" ]; then
  echo "ERROR: Caddyfile not found"
  exit 1
fi

# Required headers (fail if missing)
REQUIRED_HEADERS=(
  "X-Content-Type-Options"
  "X-Frame-Options"
  "Referrer-Policy"
  "Permissions-Policy"
)

echo "--- Required Headers ---"
for header in "${REQUIRED_HEADERS[@]}"; do
  if grep -q "$header" "$CADDYFILE"; then
    echo "OK: $header is configured"
  else
    echo "ERROR: $header is NOT configured"
    ERRORS=$((ERRORS + 1))
  fi
done
echo ""

# Recommended headers (warn if missing)
RECOMMENDED_HEADERS=(
  "Strict-Transport-Security"
  "Content-Security-Policy"
)

echo "--- Recommended Headers (warnings only) ---"
for header in "${RECOMMENDED_HEADERS[@]}"; do
  if grep -q "$header" "$CADDYFILE"; then
    echo "OK: $header is configured"
  else
    echo "WARNING: $header is not configured (recommended)"
    WARNINGS=$((WARNINGS + 1))
  fi
done
echo ""

echo "=== Summary ==="
echo "Errors: $ERRORS"
echo "Warnings: $WARNINGS"

if [ "$ERRORS" -gt 0 ]; then
  exit 1
fi
