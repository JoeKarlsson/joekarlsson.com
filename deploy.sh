#!/bin/bash
set -euo pipefail

# Load nvm so npm is available
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

# The main checkout, even when this runs from a worktree: .env and node_modules live there
MAIN_DIR=$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")

# Load environment variables from .env if present
if [[ -f "$MAIN_DIR/.env" ]]; then
    set -a
    source "$MAIN_DIR/.env"
    set +a
fi

# Audiobookshelf and Prometheus are only reachable on the LAN, so this snapshot is
# taken here and baked into the build. A failure stops the deploy rather than
# shipping stale data. SKIP_NOW_REFRESH=1 deploys with the committed snapshot
# instead, for when a source is down or you're off the home network.
if [[ "${SKIP_NOW_REFRESH:-}" == "1" ]]; then
    echo "SKIP_NOW_REFRESH=1: deploying with the committed now-feed snapshot"
else
    echo "Refreshing now-feed snapshot..."
    npm run update:now
    # Commit only the snapshot paths, so anything else staged is left alone.
    # scripts/update-now-feed.mjs filters on this message: change both together.
    NOW_FEED_PATHS=(src/data/now-feed.json public/images/now)
    git add -A -- "${NOW_FEED_PATHS[@]}"
    if ! git diff --cached --quiet -- "${NOW_FEED_PATHS[@]}"; then
        git commit -m "chore: Refresh now-feed snapshot" -- "${NOW_FEED_PATHS[@]}"
    fi
fi

# Build from a clean copy of HEAD, never from the working tree. Other sessions share
# this checkout, and building it shipped whatever they had half-finished on disk
# (2026-11-07). Anything not committed doesn't ship; anything committed but not
# pushed stops the deploy, so the live site never runs ahead of origin. The
# now-feed snapshot commit above is the one exception: it's never pushed.
git fetch --quiet origin main
UNPUSHED=$(git log origin/main..HEAD --format='%h %s' | grep -v ' chore: Refresh now-feed snapshot$' || true)
# The exemption is for the snapshot only: a commit with that subject that touches
# anything else still has to be pushed first (security audit run-1)
for SNAPSHOT_SHA in $(git log origin/main..HEAD --format='%h %s' | grep ' chore: Refresh now-feed snapshot$' | cut -d' ' -f1); do
    if git diff-tree --no-commit-id --name-only -r "$SNAPSHOT_SHA" | grep -qvE '^(src/data/now-feed\.json|public/images/now/)'; then
        UNPUSHED+=$'\n'"$SNAPSHOT_SHA touches files outside the now-feed snapshot"
    fi
done
if [[ -n "$UNPUSHED" ]]; then
    echo "ERROR: these commits aren't on origin/main yet. Push them, then deploy:" >&2
    echo "$UNPUSHED" >&2
    exit 1
fi
# Everything but the local now-feed snapshot is on origin, so the merge base is the
# commit CI tested. A red CI stops the deploy (scripts/wait-for-ci.sh).
bash "$(dirname "$0")/scripts/wait-for-ci.sh" "$(git merge-base HEAD origin/main)"
BUILD_DIR=$(mktemp -d "${TMPDIR:-/tmp}/joekarlsson-deploy.XXXXXX")
git worktree add --quiet --detach "$BUILD_DIR" HEAD
trap 'cd "$MAIN_DIR" && git worktree remove --force "$BUILD_DIR"' EXIT
# The build borrows the main checkout's node_modules, so it must have been installed
# from the lockfile being built, not one another session changed (security audit run-1)
if ! cmp -s "$MAIN_DIR/package-lock.json" "$BUILD_DIR/package-lock.json"; then
    echo "ERROR: the main checkout's package-lock.json differs from HEAD's, so its node_modules may not match what HEAD locks." >&2
    echo "Commit or discard the lockfile change there and run npm ci, then deploy." >&2
    exit 1
fi
ln -s "$MAIN_DIR/node_modules" "$BUILD_DIR/node_modules"
if [[ -f "$MAIN_DIR/.env" ]]; then cp "$MAIN_DIR/.env" "$BUILD_DIR/.env"; fi
# Astro caches rendered markdown without tracking the diagram SVGs it inlines, so a
# warm cache can ship old diagrams: build cold
rm -rf "$MAIN_DIR/node_modules/.astro"
cd "$BUILD_DIR"
echo "Building a clean copy of $(git rev-parse --short HEAD)..."
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

# A hash of every built file, so the next deploy purges only what changed
# (scripts/purge-urls.mjs). Written before the content hash, which then covers it.
SITE_URL="https://www.joekarlsson.com"
node scripts/purge-urls.mjs write-manifest dist

# What to purge after the push: compare with the manifest the live site serves. A
# query string sends the request past Cloudflare's cache to the origin, so this is
# the build actually deployed. No live manifest (the first deploy with one, or the
# fetch failed) means the list says EVERYTHING.
PURGE_LIST="$BUILD_DIR/purge-list.txt"
LIVE_MANIFEST="$BUILD_DIR/live-manifest.json"
curl -sf --max-time 20 "$SITE_URL/deploy-manifest.json?deploy=$(date +%s)" -o "$LIVE_MANIFEST" || rm -f "$LIVE_MANIFEST"
node scripts/purge-urls.mjs urls "$SITE_URL" dist "$LIVE_MANIFEST" > "$PURGE_LIST"
echo "Files to purge after the push: $(grep -c . "$PURGE_LIST" || true) URL(s) ($(head -1 "$PURGE_LIST"))"

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
# Without purge credentials, removed or retracted pages stay at the Cloudflare edge,
# so the deploy stops here instead of warning after the fact (security audit run-1)
if [[ -z "${CLOUDFLARE_ZONE_ID:-}" || -z "${CLOUDFLARE_API_TOKEN:-}" ]]; then
    echo "ERROR: CLOUDFLARE_ZONE_ID and CLOUDFLARE_API_TOKEN must be set (in .env) to purge after deploying." >&2
    echo "  CLOUDFLARE_ZONE_ID: Cloudflare Dashboard → joekarlsson.com → Overview → Zone ID" >&2
    echo "  CLOUDFLARE_API_TOKEN: My Profile → API Tokens, with Zone.Cache Purge permission" >&2
    exit 1
fi
# This script purges just the changed files below; tell tofu's purge_cache step
# (cloudflare-purge.sh) not to purge the whole zone first
export CF_PURGE_HANDLED_BY_DEPLOY=1
# A content deploy ships content only. Plan first, and stop if the plan would change
# anything besides the content push and purge: provision.sh.tpl, the NPM proxy host
# and the container are infra changes, applied on purpose from $TOFU_DIR, never
# swept along unreviewed (security audit run-1)
TOFU_PLAN="$BUILD_DIR/content.tfplan"
tofu -chdir="$TOFU_DIR" plan -input=false -var-file=terraform.tfvars -var "site_dist_path=$BUILD_DIR/dist" -out="$TOFU_PLAN" >/dev/null
INFRA_CHANGES=$(tofu -chdir="$TOFU_DIR" show -json "$TOFU_PLAN" |
    jq -r '.resource_changes[]? | select(.mode == "managed" and .change.actions != ["no-op"]) | .address' |
    grep -vxE 'null_resource\.(push_content|purge_cache)' || true)
if [[ -n "$INFRA_CHANGES" ]]; then
    echo "ERROR: this deploy would also change infrastructure. Review and apply it from $TOFU_DIR first:" >&2
    echo "$INFRA_CHANGES" >&2
    exit 1
fi
# terraform.tfvars loads again at apply time, so pass the same dist path the plan used
tofu -chdir="$TOFU_DIR" apply -input=false -var-file=terraform.tfvars -var "site_dist_path=$BUILD_DIR/dist" "$TOFU_PLAN"

echo "Deployed to origin server"

# Purge what this deploy changed from Cloudflare, so HTML and CSS stay in sync
# while unchanged images keep their cache (scripts/purge-urls.mjs)
# Requires CLOUDFLARE_ZONE_ID and CLOUDFLARE_API_TOKEN environment variables
purge_cloudflare_cache() {
    echo "Purging Cloudflare cache..."
    node scripts/purge-urls.mjs purge "$PURGE_LIST"
}
# Checked before the apply, so the credentials are there. A failed purge exits here
# (set -e), loudly, rather than leaving stale pages cached.
CAN_PURGE=1
purge_cloudflare_cache

# Verify the deploy actually landed rather than just reporting success: the
# homepage visitors get must carry exactly the <body> just built. Two earlier
# versions of this check passed against a stale site:
#   - a hashed CSS filename: unchanged by most edits, so the old page matched
#   - a ?cachebust= URL: a separate cache key, so it always reached the origin
#     and never saw the cached homepage (2026-10-28: Cloudflare re-cached the
#     old homepage right after the purge, and the deploy reported success)
# Only <body> is compared because Cloudflare Fonts rewrites <head>. The homepage
# is used because it has no email addresses, which Cloudflare also rewrites.
page_body_hash() {
    tr '\n' ' ' | sed -E 's/.*(<body[ >].*<\/body>).*/\1/' | shasum -a 256 | cut -d' ' -f1
}
EXPECTED_BODY=$(page_body_hash < dist/index.html)
# Cloudflare caches phones separately (cache by device type), so check the copy an
# iPhone gets too: on 2026-11-09 desktops got the new build while phones kept one
# from hours earlier, because the purge only cleared the desktop copy.
IPHONE_UA='Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'

echo "Verifying the homepage desktops and phones get matches this build..."
VERIFIED=0
for attempt in $(seq 1 12); do
    LIVE_BODY=$(curl -s --max-time 20 "$SITE_URL/" | page_body_hash || true)
    PHONE_BODY=$(curl -s --max-time 20 -A "$IPHONE_UA" "$SITE_URL/" | page_body_hash || true)
    if [[ "$LIVE_BODY" == "$EXPECTED_BODY" && "$PHONE_BODY" == "$EXPECTED_BODY" ]]; then
        echo "  new build is live on desktop and phone (after ${attempt} attempt(s))"
        VERIFIED=1
        break
    fi
    # A stale copy can be re-cached after the purge, and it then stays until
    # its TTL, so waiting alone would not clear it: purge again.
    if [[ "$CAN_PURGE" -eq 1 && $((attempt % 3)) -eq 0 ]]; then
        [[ "$LIVE_BODY" != "$EXPECTED_BODY" ]] && echo "  desktop copy still stale after ${attempt} attempt(s)"
        [[ "$PHONE_BODY" != "$EXPECTED_BODY" ]] && echo "  phone copy still stale after ${attempt} attempt(s)"
        purge_cloudflare_cache
    fi
    sleep 5
done

if [[ "$VERIFIED" -ne 1 ]]; then
    echo "ERROR: $SITE_URL/ is not serving the build just deployed to both desktops and phones." >&2
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

# Load the heaviest pages as an iPhone in WebKit: catches crashes, reload loops,
# script errors and desktop-only games loading on a phone (scripts/smoke-phone.mjs)
# A burst of simultaneous origin requests, as a cold-cache /work/ makes: fails if a
# rate limit in front of the site comes back (scripts/smoke-burst.mjs)
echo "Checking the site takes a burst of requests..."
node scripts/smoke-burst.mjs "$SITE_URL"

echo "Checking the site on an iPhone..."
node scripts/smoke-phone.mjs "$SITE_URL"

echo "Done! Site available at $SITE_URL"
