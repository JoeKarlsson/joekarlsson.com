#!/bin/bash
set -euo pipefail

echo "Building site..."
npm run build

echo "Deploying to CT 165..."
rsync -avz --delete dist/ root@192.168.0.165:/var/www/joekarlsson.com/

echo "Updating Caddyfile..."
scp Caddyfile root@192.168.0.165:/etc/caddy/Caddyfile

echo "Reloading Caddy..."
ssh root@192.168.0.165 "systemctl reload caddy"

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
