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

# The deployed Caddyfile lives in the OpenTofu provision template; this one is a
# reference copy that tests/build-output.test.ts checks iframes against. The
# template only exists on Joe's machine, so CI skips this and deploy.sh runs it.
PROVISION_TEMPLATE="$HOME/claude/opentofu/services/joekarlsson-astro/provision.sh.tpl"
echo "--- Caddyfile matches the deployed provision template ---"
# The whole site block, not just the CSP: a redirect and a 404 fix had drifted
# apart unnoticed (security audit run-1). Comments and blank lines don't count.
caddy_lines() { grep -v '^[[:space:]]*#' | sed 's/[[:space:]]*$//' | grep -v '^[[:space:]]*$'; }
if [ -f "$PROVISION_TEMPLATE" ]; then
  DEPLOYED=$(sed -n "/<< 'CADDYEOF'/,/^CADDYEOF/p" "$PROVISION_TEMPLATE" | sed '1d;$d' | caddy_lines)
  if [ "$DEPLOYED" = "$(caddy_lines < "$CADDYFILE")" ]; then
    echo "OK: Caddyfile matches $PROVISION_TEMPLATE"
  else
    echo "ERROR: Caddyfile differs from $PROVISION_TEMPLATE - update both:"
    diff <(echo "$DEPLOYED") <(caddy_lines < "$CADDYFILE") || true
    ERRORS=$((ERRORS + 1))
  fi
else
  echo "SKIP: $PROVISION_TEMPLATE not found (expected in CI)"
fi
echo ""

echo "=== Summary ==="
echo "Errors: $ERRORS"
echo "Warnings: $WARNINGS"

if [ "$ERRORS" -gt 0 ]; then
  exit 1
fi
