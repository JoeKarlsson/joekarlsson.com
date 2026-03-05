#!/usr/bin/env bash
set -euo pipefail

ERRORS=0
WARNINGS=0
IMAGE_DIR="public/images"

echo "=== Image Validation ==="
echo ""

# Step 1: Check for non-WebP images (PNG/JPG) that should have been converted
echo "--- Checking for non-WebP images (PNG/JPG) ---"
NON_WEBP=$(find "$IMAGE_DIR" -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \) 2>/dev/null || true)
if [ -n "$NON_WEBP" ]; then
  COUNT=$(echo "$NON_WEBP" | wc -l | tr -d ' ')
  echo "WARNING: Found $COUNT non-WebP image(s). These should be converted to WebP:"
  echo "$NON_WEBP" | head -20
  if [ "$COUNT" -gt 20 ]; then
    echo "  ... and $((COUNT - 20)) more"
  fi
  WARNINGS=$((WARNINGS + 1))
else
  echo "OK: All images are WebP (or GIF)"
fi
echo ""

# Step 2: Check for oversized images (>200KB)
echo "--- Checking for images over 200KB ---"
LARGE_IMAGES=""
while IFS= read -r file; do
  if [ -f "$file" ]; then
    SIZE=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo "0")
    if [ "$SIZE" -gt 204800 ]; then
      SIZE_KB=$((SIZE / 1024))
      LARGE_IMAGES="${LARGE_IMAGES}  ${file} (${SIZE_KB}KB)\n"
    fi
  fi
done < <(find "$IMAGE_DIR" -type f \( -name "*.webp" -o -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.gif" \) 2>/dev/null)

if [ -n "$LARGE_IMAGES" ]; then
  echo "WARNING: Found images over 200KB:"
  echo -e "$LARGE_IMAGES" | head -20
  WARNINGS=$((WARNINGS + 1))
else
  echo "OK: No oversized images found"
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
      echo "ERROR: Missing heroImage in $md_file"
      echo "  Referenced: $HERO"
      echo "  Expected at: $HERO_PATH"
      MISSING_HEROES=$((MISSING_HEROES + 1))
    fi
  fi
done < <(find src/content/blog -name "*.md" 2>/dev/null)

if [ "$MISSING_HEROES" -gt 0 ]; then
  echo "ERROR: $MISSING_HEROES heroImage reference(s) point to missing files"
  ERRORS=$((ERRORS + 1))
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
