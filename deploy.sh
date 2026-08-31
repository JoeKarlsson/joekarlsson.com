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
# Hash all HTML files so any page change (not just index.html) triggers a push.
# Without this, tofu sees no trigger change and skips push_content entirely.
NEW_HASH=$(find dist -name "*.html" | sort | xargs sha256sum | sha256sum | cut -d' ' -f1)
sed -i '' "s/^site_content_hash = .*/site_content_hash = \"$NEW_HASH\"/" "$TOFU_DIR/terraform.tfvars"
echo "Content hash updated: $NEW_HASH"

echo "Deploying to CT 165 via OpenTofu..."
tofu -chdir="$TOFU_DIR" apply -var-file=terraform.tfvars -auto-approve

echo "Deployed to origin server"

# Purge Cloudflare cache to ensure HTML and CSS are in sync
# Requires CLOUDFLARE_ZONE_ID and CLOUDFLARE_API_TOKEN environment variables
if [[ -n "${CLOUDFLARE_ZONE_ID:-}" && -n "${CLOUDFLARE_API_TOKEN:-}" ]]; then
    echo "Purging Cloudflare cache..."
    curl -s -X POST "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache" \
        -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
        -H "Content-Type: application/json" \
        --data '{"purge_everything":true}' \
        | jq -r '.success // "failed"' | xargs -I {} echo "Cache purge: {}"
    echo "Cache purged"
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

# Verify the deploy actually landed rather than just reporting success.
# Astro fingerprints its CSS, so the hashed filename from the local build
# appearing in the live HTML proves the new build is being served - a plain
# 200 would pass against the previous deploy just as happily.
SITE_URL="https://www.joekarlsson.com"
FINGERPRINT=$(grep -oE '/_astro/[A-Za-z0-9_.-]+\.css' dist/index.html | head -1)

if [[ -z "$FINGERPRINT" ]]; then
    echo "WARNING: no hashed CSS found in dist/index.html; skipping verification"
else
    echo "Verifying deploy (looking for $FINGERPRINT)..."
    VERIFIED=0
    for attempt in $(seq 1 12); do
        LIVE_HTML=$(curl -sL --max-time 20 "$SITE_URL/?cachebust=$(date +%s)-$attempt" || true)
        if grep -qF "$FINGERPRINT" <<< "$LIVE_HTML"; then
            echo "  new build is live (after ${attempt} attempt(s))"
            VERIFIED=1
            break
        fi
        sleep 5
    done

    if [[ "$VERIFIED" -ne 1 ]]; then
        echo "ERROR: $SITE_URL is not serving the build just deployed." >&2
        echo "  Expected asset: $FINGERPRINT" >&2
        echo "  The origin may have failed to update, or the CDN is still stale." >&2
        exit 1
    fi

    # Spot-check representative routes so a broken render is not reported as success
    FAILED=0
    for path in "/" "/blog/" "/about/" "/rss.xml" "$FINGERPRINT"; do
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
fi

echo "Done! Site available at $SITE_URL"
