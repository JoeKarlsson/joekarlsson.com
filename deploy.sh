#!/bin/bash
set -euo pipefail

# Load nvm so npm is available
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

# Load environment variables from .env if present
if [[ -f .env ]]; then
    set -a
    source .env
    set +a
fi

echo "Building site..."
npm run build

# The pre-push hook runs the full npm test, but deploying does not have to go
# through a push - and a warm Astro cache can render a converted image as an
# <img> pointing at a file that no longer exists. Validate what is about to ship.
echo "Validating build output..."
npm run test:images
npm run test:caddyfile

# CT 165 is immutable — managed by OpenTofu.
# Direct SSH/rsync/scp to the container is forbidden.
# tofu apply detects dist/index.html has changed and pushes content via push_content resource.
#
# To update the Caddyfile: edit ~/claude/opentofu/services/joekarlsson-astro/provision.sh.tpl
# and run tofu apply from that directory — do NOT scp Caddyfile directly.
TOFU_DIR="$HOME/claude/opentofu/services/joekarlsson-astro"
if [[ ! -f "$TOFU_DIR/terraform.tfvars" ]]; then
    echo "ERROR: $TOFU_DIR/terraform.tfvars not found"
    exit 1
fi

# Update site_content_hash in terraform.tfvars so tofu detects the new build.
# Hash every built file so any change (pages, images, video) triggers a push.
# Without this, tofu sees no trigger change and skips push_content entirely;
# hashing only HTML once let an image-only change "deploy" without shipping.
NEW_HASH=$(find dist -type f -print0 | sort -z | xargs -0 sha256sum | sha256sum | cut -d' ' -f1)
# Tolerate `tofu fmt` column alignment ("site_content_hash       = ..."). A
# pattern that misses leaves the old hash in place and tofu skips the push.
sed -i '' -E "s/^(site_content_hash[[:space:]]*=[[:space:]]*).*/\1\"$NEW_HASH\"/" "$TOFU_DIR/terraform.tfvars"
if ! grep -qE "^site_content_hash[[:space:]]*=[[:space:]]*\"$NEW_HASH\"" "$TOFU_DIR/terraform.tfvars"; then
    echo "ERROR: could not write site_content_hash to $TOFU_DIR/terraform.tfvars"
    exit 1
fi
echo "Content hash updated: $NEW_HASH"

echo "Deploying to CT 165 via OpenTofu..."
tofu -chdir="$TOFU_DIR" apply -var-file=terraform.tfvars -auto-approve

echo "Deployed to origin server"

# Purge Cloudflare cache to ensure HTML and CSS are in sync
# Requires CLOUDFLARE_ZONE_ID and CLOUDFLARE_API_TOKEN environment variables
purge_cloudflare_cache() {
    echo "Purging Cloudflare cache..."
    curl -s -X POST "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache" \
        -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
        -H "Content-Type: application/json" \
        --data '{"purge_everything":true}' \
        | jq -r '.success // "failed"' | xargs -I {} echo "Cache purge: {}"
}
CAN_PURGE=0
if [[ -n "${CLOUDFLARE_ZONE_ID:-}" && -n "${CLOUDFLARE_API_TOKEN:-}" ]]; then
    CAN_PURGE=1
    purge_cloudflare_cache
else
    echo ""
    echo "WARNING: Cloudflare cache not purged!"
    echo "Set CLOUDFLARE_ZONE_ID and CLOUDFLARE_API_TOKEN to enable automatic cache purging."
    echo "Without this, users may see unstyled pages until the CDN cache expires."
    echo ""
    echo "To get these values:"
    echo "  1. CLOUDFLARE_ZONE_ID: Cloudflare Dashboard → joekarlsson.com → Overview → Zone ID"
    echo "  2. CLOUDFLARE_API_TOKEN: Cloudflare Dashboard → My Profile → API Tokens → Create Token"
    echo "     Use template: 'Edit zone DNS' or create custom with 'Zone.Cache Purge' permission"
fi

# Verify the deploy actually landed rather than just reporting success: the
# homepage visitors get must carry exactly the <body> just built. Two earlier
# versions of this check passed against a stale site:
#   - a hashed CSS filename: unchanged by most edits, so the old page matched
#   - a ?cachebust= URL: a separate cache key, so it always reached the origin
#     and never saw the cached homepage (2026-10-28: Cloudflare re-cached the
#     old homepage right after the purge, and the deploy reported success)
# Only <body> is compared because Cloudflare Fonts rewrites <head>. The homepage
# is used because it has no email addresses, which Cloudflare also rewrites.
SITE_URL="https://www.joekarlsson.com"
page_body_hash() {
    tr '\n' ' ' | sed -E 's/.*(<body[ >].*<\/body>).*/\1/' | shasum -a 256 | cut -d' ' -f1
}
EXPECTED_BODY=$(page_body_hash < dist/index.html)

echo "Verifying the homepage visitors get matches this build..."
VERIFIED=0
for attempt in $(seq 1 12); do
    LIVE_BODY=$(curl -s --max-time 20 "$SITE_URL/" | page_body_hash || true)
    if [[ "$LIVE_BODY" == "$EXPECTED_BODY" ]]; then
        echo "  new build is live (after ${attempt} attempt(s))"
        VERIFIED=1
        break
    fi
    # A stale copy can be re-cached after the purge, and it then stays until
    # its TTL, so waiting alone would not clear it: purge again.
    if [[ "$CAN_PURGE" -eq 1 && $((attempt % 3)) -eq 0 ]]; then
        echo "  still stale after ${attempt} attempt(s)"
        purge_cloudflare_cache
    fi
    sleep 5
done

if [[ "$VERIFIED" -ne 1 ]]; then
    echo "ERROR: $SITE_URL/ is not serving the build just deployed." >&2
    echo "  The origin may have failed to update, or the CDN is still stale." >&2
    echo "  If the homepage gained an email address, Cloudflare's email obfuscation" >&2
    echo "  rewrites it in <body> and this comparison needs a different page." >&2
    exit 1
fi

# Spot-check representative routes so a broken render is not reported as success
FINGERPRINT=$(grep -oE '/_astro/[A-Za-z0-9_.-]+\.css' dist/index.html | head -1)
FAILED=0
for path in "/" "/blog/" "/about/" "/rss.xml" ${FINGERPRINT:+"$FINGERPRINT"}; do
    CODE=$(curl -sL --max-time 20 -o /dev/null -w "%{http_code}" "$SITE_URL$path" || echo "000")
    if [[ "$CODE" != "200" ]]; then
        echo "ERROR: $path returned $CODE" >&2
        FAILED=1
    fi
done

if [[ "$FAILED" -ne 0 ]]; then
    echo "ERROR: post-deploy checks failed." >&2
    exit 1
fi
echo "  all smoke checks passed"

echo "Done! Site available at $SITE_URL"
