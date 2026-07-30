#!/usr/bin/env bash
# Convert images as they enter a commit, so an oversized original never lands.
#
# Wired into .husky/pre-commit. PNG/JPG staged under public/images become WebP
# (and every reference across src/ is repointed); animated GIFs at or above
# GIF_MIN_KB gain an .mp4 sibling, which src/plugins/rehype-gif-video.mjs
# renders in place of the GIF.
#
# Only staged files are considered, and only the resulting output is staged. A
# reference rewrite landing in a src/ file that already had unstaged edits is
# reported instead of swept into the commit.
#
# Usage:
#   ./scripts/convert-staged-images.sh

set -euo pipefail

# Keep in sync with GIF_MP4_MIN_KB in scripts/validate-images.sh, which fails
# any GIF at or above this size that has no .mp4 sibling.
GIF_MIN_KB=256

PNGS=()
GIFS=()

while IFS= read -r f; do
	[ -n "$f" ] || continue
	# A staged rename or delete can leave a path that is no longer on disk.
	[ -f "$f" ] || continue
	case "$(printf '%s' "$f" | tr '[:upper:]' '[:lower:]')" in
	*.png | *.jpg | *.jpeg) PNGS+=("$f") ;;
	*.gif) GIFS+=("$f") ;;
	esac
done < <(git -c core.quotepath=false diff --cached --name-only --diff-filter=ACM -- public/images)

if [ ${#PNGS[@]} -eq 0 ] && [ ${#GIFS[@]} -eq 0 ]; then
	exit 0
fi

echo "=== Converting staged images ==="

# Files carrying unstaged edits before we touch anything. Rewriting one of
# these and staging it would sweep in changes the commit never asked for.
DIRTY_BEFORE=$(git -c core.quotepath=false diff --name-only -- src || true)

REWRITTEN=()

if [ ${#PNGS[@]} -gt 0 ]; then
	# Captured rather than streamed so the REWROTE lines can be read back.
	WEBP_OUT=$(node scripts/convert-images-to-webp.mjs "${PNGS[@]}")
	printf '%s\n' "$WEBP_OUT"
	while IFS= read -r line; do
		case "$line" in
		"REWROTE "*) REWRITTEN+=("${line#REWROTE }") ;;
		esac
	done <<< "$WEBP_OUT"

	for f in "${PNGS[@]}"; do
		webp="${f%.*}.webp"
		[ -f "$webp" ] && git add -- "$webp"
		# Stages the removal of the original, or leaves it alone if the
		# conversion failed and the file is still there.
		git add -A -- "$f"
	done
fi

if [ ${#GIFS[@]} -gt 0 ]; then
	if command -v ffmpeg > /dev/null 2>&1; then
		./scripts/convert-gifs-to-video.sh --min "$GIF_MIN_KB" "${GIFS[@]}"

		for f in "${GIFS[@]}"; do
			mp4="${f%.*}.mp4"
			[ -f "$mp4" ] && git add -- "$mp4"
			git add -A -- "$f"
		done
	else
		# Not an npm dependency, so a fresh clone will not have it. Warn here
		# and let validate-images.sh at pre-push be the hard gate.
		for f in "${GIFS[@]}"; do
			SIZE_KB=$(($(stat -f%z "$f" 2> /dev/null || stat -c%s "$f") / 1024))
			if [ "$SIZE_KB" -ge "$GIF_MIN_KB" ]; then
				echo "WARNING: $f is ${SIZE_KB}KB and needs an .mp4, but ffmpeg is not installed."
				echo "  Install it (brew install ffmpeg) and re-commit, or pre-push will fail."
			fi
		done
	fi
fi

# Repointed references living in files that were clean are safe to stage; the
# rewrite is the only change in them.
BLOCKED=()
if [ ${#REWRITTEN[@]} -gt 0 ]; then
	for f in "${REWRITTEN[@]}"; do
		if printf '%s\n' "$DIRTY_BEFORE" | grep -qxF -- "$f"; then
			BLOCKED+=("$f")
		else
			git add -- "$f"
		fi
	done
fi

if [ ${#BLOCKED[@]} -gt 0 ]; then
	echo ""
	echo "ERROR: image references were repointed in files that had unstaged edits:"
	printf '  %s\n' "${BLOCKED[@]}"
	echo ""
	echo "  Staging them automatically would pull in unrelated changes. Review each,"
	echo "  then 'git add' it and commit again."
	exit 1
fi
