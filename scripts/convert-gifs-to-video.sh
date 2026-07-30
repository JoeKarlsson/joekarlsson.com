#!/usr/bin/env bash
# Convert oversized animated GIFs to MP4.
#
# Animated GIFs are enormous - a 30 second screen recording routinely lands at
# 15MB+ where the same clip as h264 is under 500KB. This walks public/images,
# converts anything above the size threshold, and (unless --keep-gifs) removes
# the original.
#
# Rendering is handled by src/plugins/rehype-gif-video.mjs, which swaps any
# <img> pointing at a .gif for a <video> when a sibling .mp4 exists. That means
# markdown keeps referencing the .gif and nothing needs editing by hand.
#
# Usage:
#   ./scripts/convert-gifs-to-video.sh            # convert GIFs over 1MB
#   ./scripts/convert-gifs-to-video.sh --min 500  # ... over 500KB
#   ./scripts/convert-gifs-to-video.sh --dry-run
#   ./scripts/convert-gifs-to-video.sh --keep-gifs

set -euo pipefail

IMAGE_DIR="public/images"
MIN_KB=1024
DRY_RUN=0
KEEP_GIFS=0

while [ $# -gt 0 ]; do
	case "$1" in
	--min)
		MIN_KB="$2"
		shift 2
		;;
	--dry-run)
		DRY_RUN=1
		shift
		;;
	--keep-gifs)
		KEEP_GIFS=1
		shift
		;;
	*)
		echo "unknown option: $1" >&2
		exit 1
		;;
	esac
done

if ! command -v ffmpeg > /dev/null 2>&1; then
	echo "ERROR: ffmpeg is required but not installed (brew install ffmpeg)" >&2
	exit 1
fi

filesize() { stat -f%z "$1" 2> /dev/null || stat -c%s "$1" 2> /dev/null; }

TOTAL_BEFORE=0
TOTAL_AFTER=0
CONVERTED=0
SKIPPED=0
FAILED=0

echo "=== GIF to MP4 conversion (threshold: ${MIN_KB}KB) ==="
echo ""

while IFS= read -r gif; do
	[ -f "$gif" ] || continue

	SIZE=$(filesize "$gif")
	if [ "$SIZE" -lt $((MIN_KB * 1024)) ]; then
		continue
	fi

	mp4="${gif%.gif}.mp4"

	if [ -f "$mp4" ]; then
		# The mp4 is what actually gets served, so a GIF sitting beside one is
		# dead weight. Decode it before removing the original though - one of
		# these was committed truncated at exactly 4MiB and sat broken in the
		# repo for months, unnoticed because nothing rendered it.
		if ! ffprobe -v error -show_entries format=duration -of csv=p=0 "$mp4" > /dev/null 2>&1; then
			echo "BAD   $mp4 does not decode - re-encoding from $gif"
			rm -f "$mp4"
		fi
	fi

	if [ -f "$mp4" ]; then
		if [ "$KEEP_GIFS" -eq 0 ]; then
			if [ "$DRY_RUN" -eq 1 ]; then
				echo "WOULD DROP  $gif ($((SIZE / 1024))KB, mp4 already exists)"
			else
				rm "$gif"
				echo "DROP  $gif ($((SIZE / 1024))KB redundant, mp4 exists)"
				TOTAL_BEFORE=$((TOTAL_BEFORE + SIZE))
			fi
		else
			echo "SKIP  $gif (mp4 already exists)"
		fi
		SKIPPED=$((SKIPPED + 1))
		continue
	fi

	SIZE_KB=$((SIZE / 1024))
	if [ "$DRY_RUN" -eq 1 ]; then
		echo "WOULD CONVERT  $gif (${SIZE_KB}KB)"
		CONVERTED=$((CONVERTED + 1))
		continue
	fi

	# yuv420p and even dimensions are required for playback in Safari and most
	# mobile browsers. faststart moves the moov atom up front so playback can
	# begin before the whole file lands.
	if ffmpeg -nostdin -loglevel error -i "$gif" \
		-movflags faststart \
		-pix_fmt yuv420p \
		-vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" \
		-c:v libx264 -crf 23 -preset slow \
		-an "$mp4" 2> /dev/null && ffprobe -v error -show_entries format=duration -of csv=p=0 "$mp4" > /dev/null 2>&1; then

		NEW_SIZE=$(filesize "$mp4")
		NEW_KB=$((NEW_SIZE / 1024))
		PCT=$(((SIZE - NEW_SIZE) * 100 / SIZE))

		echo "OK    $gif  ${SIZE_KB}KB -> ${NEW_KB}KB  (-${PCT}%)"

		TOTAL_BEFORE=$((TOTAL_BEFORE + SIZE))
		TOTAL_AFTER=$((TOTAL_AFTER + NEW_SIZE))
		CONVERTED=$((CONVERTED + 1))

		if [ "$KEEP_GIFS" -eq 0 ]; then
			rm "$gif"
		fi
	else
		echo "FAIL  $gif (ffmpeg error)"
		rm -f "$mp4"
		FAILED=$((FAILED + 1))
	fi
done < <(find "$IMAGE_DIR" -type f -name "*.gif" 2> /dev/null | sort)

echo ""
echo "=== Summary ==="
echo "Converted: $CONVERTED"
echo "Skipped:   $SKIPPED"
echo "Failed:    $FAILED"

if [ "$TOTAL_BEFORE" -gt 0 ]; then
	SAVED=$((TOTAL_BEFORE - TOTAL_AFTER))
	echo "GIF bytes removed: $((TOTAL_BEFORE / 1048576))MB"
	echo "MP4 bytes added:   $((TOTAL_AFTER / 1048576))MB"
	echo "Net saving:        $((SAVED / 1048576))MB ($((SAVED * 100 / TOTAL_BEFORE))%)"
fi

if [ "$FAILED" -gt 0 ]; then
	exit 1
fi
