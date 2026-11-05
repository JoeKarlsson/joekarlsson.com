#!/usr/bin/env bash
# Make a "living photocopy" loop from a still: four re-dithered frames at 6 fps.
#
# Usage:
#   npm run media:loop -- still.webp out.mp4 [MODE] [WIDTH]
#
#   MODE   dots (default) or xerox
#   WIDTH  working width (default 480; output is twice this)
set -euo pipefail
if [ $# -lt 2 ]; then sed -n '2,8p' "$0"; exit 1; fi
src=$1 out=$2 mode=${3:-dots} width=${4:-480}
here=$(dirname "$0")
frames=$(mktemp -d)
trap 'rm -rf "$frames"' EXIT

for i in 1 2 3 4; do
	python3 "$here/halftone.py" "$src" "$frames/f00$i.jpg" --mode "$mode" --width "$width" --seed $((i * 17))
done
ffmpeg -v error -y -stream_loop 5 -framerate 6 -i "$frames/f%03d.jpg" -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" \
	-c:v libx264 -pix_fmt yuv420p -an -movflags +faststart "$out"
