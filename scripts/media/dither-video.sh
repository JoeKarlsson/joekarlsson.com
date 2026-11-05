#!/usr/bin/env bash
# Dither a video clip frame by frame into the site's pink halftone, at 8 fps.
#
# Usage:
#   npm run media:dither:video -- in.mov out.mp4 START DURATION [WIDTH] [MODE] [EXTRA_VF]
#
#   START, DURATION  seconds into the source, and clip length
#   WIDTH            working width (default 480; output is twice this)
#   MODE             dots (default) or xerox
#   EXTRA_VF         ffmpeg filters run before scaling, e.g. "crop=720:720:300:0"
set -euo pipefail
if [ $# -lt 4 ]; then sed -n '2,10p' "$0"; exit 1; fi
src=$1 out=$2 start=$3 duration=$4 width=${5:-480} mode=${6:-dots} extra_vf=${7:-}
here=$(dirname "$0")
frames=$(mktemp -d)
trap 'rm -rf "$frames"' EXIT

ffmpeg -v error -ss "$start" -t "$duration" -i "$src" -vf "fps=8,${extra_vf:+$extra_vf,}scale=$width:-2" "$frames/f%03d.png"
n=0
for frame in "$frames"/f*.png; do
	n=$((n + 1))
	python3 "$here/halftone.py" "$frame" "${frame%.png}.jpg" --mode "$mode" --width "$width" --seed "$n" &
	if ((n % 8 == 0)); then wait; fi
done
wait
ffmpeg -v error -y -framerate 8 -i "$frames/f%03d.jpg" -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" \
	-c:v libx264 -crf 26 -pix_fmt yuv420p -an -movflags +faststart "$out"
