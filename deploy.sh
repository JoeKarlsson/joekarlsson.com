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

echo "Deploying to CT 165 via OpenTofu..."
(cd "$TOFU_DIR" && tofu apply -var-file=terraform.tfvars -auto-approve)

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

echo "Done! Site available at https://www.joekarlsson.com"
