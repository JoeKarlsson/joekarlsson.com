#!/usr/bin/env bash
set -euo pipefail

ERRORS=0
WARNINGS=0
IMAGE_DIR="public/images"

# Anything at or above this fails the build. Ratcheted down as the backlog
# shrinks: 2048 once left room for a 1.9MB image to land silently. The worst
# offender is now 715KB (crop-art/seeds-of-remembrance.webp), so this sits just
# above it. Lower it again as those come down.
MAX_IMAGE_KB=800

# Ratchet on the PNG/JPG backlog: the count may fall but never rise. The
# backlog is now clear, so any PNG or JPG landing under public/images fails.
# Convert with ./scripts/convert-images-to-webp.mjs.
MAX_NON_WEBP=0

# An animation this size or larger with no .mp4 sibling is served as a raw GIF
# or animated WebP, roughly 2-5x the bytes of the h264 version. It sits under
# MAX_IMAGE_KB, so without this check it passes silently and just makes the page
# slow. Keep in sync with GIF_MIN_KB in scripts/convert-staged-images.sh.
GIF_MP4_MIN_KB=256

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

# Step 3: Animations above the threshold must have an .mp4 to render instead.
# Covers animated WebP as well as GIF - five animated WebPs hid here for a long
# time, because the size check saw a .webp and assumed a still. Animation is
# detected from the ANIM chunk in the RIFF header rather than with sharp, since
# the CI image job runs this with no npm install.
echo "--- Checking animations at/over ${GIF_MP4_MIN_KB}KB have an .mp4 sibling ---"
ANIM_NO_MP4=""
ANIM_NO_MP4_COUNT=0
while IFS= read -r anim; do
	[ -f "$anim" ] || continue
	case "$anim" in
		*.webp) head -c 64 "$anim" | grep -qa ANIM || continue ;;
	esac
	SIZE=$(stat -f%z "$anim" 2> /dev/null || stat -c%s "$anim" 2> /dev/null || echo "0")
	SIZE_KB=$((SIZE / 1024))
	if [ "$SIZE_KB" -ge "$GIF_MP4_MIN_KB" ] && [ ! -f "${anim%.*}.mp4" ]; then
		ANIM_NO_MP4="${ANIM_NO_MP4}  ${anim} (${SIZE_KB}KB)\n"
		ANIM_NO_MP4_COUNT=$((ANIM_NO_MP4_COUNT + 1))
	fi
done < <(find "$IMAGE_DIR" -type f \( -name "*.gif" -o -name "*.webp" \) 2> /dev/null)

if [ "$ANIM_NO_MP4_COUNT" -gt 0 ]; then
	echo "ERROR: $ANIM_NO_MP4_COUNT animation(s) at/over ${GIF_MP4_MIN_KB}KB with no .mp4 sibling:"
	echo -e "$ANIM_NO_MP4" || true
	echo "  GIF:           ./scripts/convert-gifs-to-video.sh --min ${GIF_MP4_MIN_KB}"
	echo "  Animated WebP: node scripts/convert-animated-webp-to-video.mjs --min ${GIF_MP4_MIN_KB}"
	ERRORS=$((ERRORS + 1))
else
	echo "OK: every animation at/over ${GIF_MP4_MIN_KB}KB has an .mp4 sibling"
fi
echo ""

# Step 4: Built pages must not reference media that is not in dist
# Catches the stale-Astro-cache case in both directions: a converted GIF whose
# cached render still emits <img src="...gif">, or a deleted MP4 still referenced
# by <video>. Skipped in the CI image job, which has no dist/.
if [ -d dist ]; then
	echo "--- Checking built <img>/<video> references resolve in dist ---"
	DANGLING=""
	DANGLING_COUNT=0
	while IFS= read -r src; do
		[ -n "$src" ] || continue
		if [ ! -f "dist${src}" ]; then
			DANGLING="${DANGLING}  ${src}\n"
			DANGLING_COUNT=$((DANGLING_COUNT + 1))
		fi
	done < <(grep -rho '<\(img\|video\)[^>]*>' dist/ 2> /dev/null |
		grep -o 'src="/[^"]*\.\(webp\|png\|jpe\?g\|gif\|mp4\)"' |
		sed 's/^src="//; s/"$//' | sort -u)

	if [ "$DANGLING_COUNT" -gt 0 ]; then
		echo "ERROR: $DANGLING_COUNT built reference(s) point at files missing from dist:"
		echo -e "$DANGLING" || true
		echo "  If images were just converted, the Astro cache is stale:"
		echo "  rm -rf node_modules/.astro && npm run build"
		ERRORS=$((ERRORS + 1))
	else
		echo "OK: every built <img>/<video> reference resolves in dist"
	fi
	echo ""
fi

# Step 5: Verify heroImage frontmatter references resolve to real files
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
