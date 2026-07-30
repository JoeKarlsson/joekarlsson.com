#!/usr/bin/env bash
set -euo pipefail

ERRORS=0
WARNINGS=0
IMAGE_DIR="public/images"

# Anything at or above this fails the build. Set well above the current worst
# offender so the existing backlog stays a warning, while a new image of the
# 18MB-GIF variety cannot land. Ratchet it down as the backlog shrinks.
MAX_IMAGE_KB=2048

# Ratchet on the PNG/JPG backlog: the count may fall but never rise. The
# backlog is now clear, so any PNG or JPG landing under public/images fails.
# Convert with ./scripts/convert-images-to-webp.mjs.
MAX_NON_WEBP=0

echo "=== Image Validation ==="
echo ""

# Step 1: Check for non-WebP images (PNG/JPG) that should have been converted
echo "--- Checking for non-WebP images (PNG/JPG) ---"
NON_WEBP=$(find "$IMAGE_DIR" -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \) 2>/dev/null || true)
if [ -n "$NON_WEBP" ]; then
  COUNT=$(echo "$NON_WEBP" | wc -l | tr -d ' ')
  echo "WARNING: Found $COUNT non-WebP image(s). These should be converted to WebP:"
  # head closes the pipe early, which trips pipefail via EPIPE - tolerate it
  echo "$NON_WEBP" | head -20 || true
  if [ "$COUNT" -gt 20 ]; then
    echo "  ... and $((COUNT - 20)) more"
  fi
  WARNINGS=$((WARNINGS + 1))

  if [ "$COUNT" -gt "$MAX_NON_WEBP" ]; then
    echo ""
    echo "ERROR: non-WebP count rose from $MAX_NON_WEBP to $COUNT."
    echo "  New images must be WebP. Convert with sharp, or raise MAX_NON_WEBP"
    echo "  in this script if the addition is deliberate."
    ERRORS=$((ERRORS + 1))
  elif [ "$COUNT" -lt "$MAX_NON_WEBP" ]; then
    echo ""
    echo "NOTE: backlog shrank to $COUNT. Lower MAX_NON_WEBP to $COUNT to hold the gain."
  fi
else
  echo "OK: All images are WebP (or GIF)"
fi
echo ""

# Step 2: Check for oversized images (>200KB warns, >MAX_IMAGE_KB fails)
echo "--- Checking image sizes (warn >200KB, fail >${MAX_IMAGE_KB}KB) ---"
LARGE_IMAGES=""
LARGE_COUNT=0
LARGE_BYTES=0
OVER_MAX=""
OVER_MAX_COUNT=0
while IFS= read -r file; do
  if [ -f "$file" ]; then
    SIZE=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo "0")
    if [ "$SIZE" -gt 204800 ]; then
      SIZE_KB=$((SIZE / 1024))
      LARGE_IMAGES="${LARGE_IMAGES}  ${file} (${SIZE_KB}KB)\n"
      LARGE_COUNT=$((LARGE_COUNT + 1))
      LARGE_BYTES=$((LARGE_BYTES + SIZE))
      if [ "$SIZE_KB" -gt "$MAX_IMAGE_KB" ]; then
        OVER_MAX="${OVER_MAX}  ${file} (${SIZE_KB}KB)\n"
        OVER_MAX_COUNT=$((OVER_MAX_COUNT + 1))
      fi
    fi
  fi
done < <(find "$IMAGE_DIR" -type f \( -name "*.webp" -o -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.gif" \) 2>/dev/null)

if [ "$LARGE_COUNT" -gt 0 ]; then
  # Always report the true count - a head-truncated list used to make 136
  # oversized images look like 20.
  echo "WARNING: $LARGE_COUNT image(s) over 200KB, $((LARGE_BYTES / 1048576))MB total"
  echo -e "$LARGE_IMAGES" | sort -t'(' -k2 -rn | head -20 || true
  if [ "$LARGE_COUNT" -gt 20 ]; then
    echo "  ... and $((LARGE_COUNT - 20)) more"
  fi
  WARNINGS=$((WARNINGS + 1))
else
  echo "OK: No images over 200KB"
fi

if [ "$OVER_MAX_COUNT" -gt 0 ]; then
  echo ""
  echo "ERROR: $OVER_MAX_COUNT image(s) exceed the ${MAX_IMAGE_KB}KB hard limit:"
  echo -e "$OVER_MAX" || true
  echo "  Convert animated GIFs with ./scripts/convert-gifs-to-video.sh"
  echo "  Convert stills to WebP, or raise MAX_IMAGE_KB if this is deliberate."
  ERRORS=$((ERRORS + 1))
fi
echo ""

# Step 3: Verify heroImage frontmatter references resolve to real files
echo "--- Checking heroImage references ---"
MISSING_HEROES=0
while IFS= read -r md_file; do
  HERO=$(grep -m1 "^heroImage:" "$md_file" 2>/dev/null | sed 's/heroImage:[[:space:]]*//' | tr -d '"' | tr -d "'" || true)
  if [ -n "$HERO" ]; then
    # Skip external URLs (https://, http://)
    case "$HERO" in
      http://*|https://*) continue ;;
    esac
    # heroImage paths are relative to public/
    HERO_PATH="public${HERO}"
    if [ ! -f "$HERO_PATH" ]; then
      echo "WARNING: Missing heroImage in $md_file"
      echo "  Referenced: $HERO"
      echo "  Expected at: $HERO_PATH"
      MISSING_HEROES=$((MISSING_HEROES + 1))
    elif [ ! -s "$HERO_PATH" ]; then
      echo "ERROR: Empty heroImage file in $md_file"
      echo "  File is 0 bytes: $HERO_PATH"
      MISSING_HEROES=$((MISSING_HEROES + 1))
      ERRORS=$((ERRORS + 1))
    fi
  fi
done < <(find src/content/blog -name "*.md" 2>/dev/null)

if [ "$MISSING_HEROES" -gt 0 ]; then
  echo "WARNING: $MISSING_HEROES heroImage reference(s) point to missing files (WebP migration in progress)"
  WARNINGS=$((WARNINGS + 1))
else
  echo "OK: All heroImage references resolve to real files"
fi
echo ""

# Summary
echo "=== Summary ==="
echo "Errors: $ERRORS"
echo "Warnings: $WARNINGS"

if [ "$ERRORS" -gt 0 ]; then
  exit 1
fi
