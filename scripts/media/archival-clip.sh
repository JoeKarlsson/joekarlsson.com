#!/usr/bin/env bash
# A post's header clip from one archival shot (FedFlix via destockd.com, DECISIONS.md 2026-11-25):
# the longest run with no cut, looped between its two most alike frames with a short crossfade
# (no pop at the restart), the pillarbox cropped off to 16:9 at 1440x810, brightness evened out
# (clip-levels.py), plus a webp of its
# first frame for the masthead still (what phones show).
#
# Usage:
#   scripts/media/archival-clip.sh <shot.mp4> <out-basename>   # writes <out>.mp4 and <out>.webp
#
# Exits 2 when the shot has no clean run of 2.9s or more (a loop under ~2.5s once the fade is cut).
set -euo pipefail
if [ $# -lt 2 ]; then sed -n '2,9p' "$0"; exit 1; fi
in=$1 out=$2 fade=0.4
here=$(dirname "$0")
calc() { python3 -c "print(round($1, 3))"; }

dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$in")
# Hard cuts; a scene score over 0.2 is a new shot
read -ra cuts <<<"$(ffmpeg -v info -i "$in" -vf "select='gt(scene,0.2)',showinfo" -f null - 2>&1 |
	grep -oE 'pts_time:[0-9.]+' | cut -d: -f2 | tr '\n' ' ' || true)"
points=(0 "${cuts[@]}" "$dur")
best=0 start=0 end=0
for ((i = 0; i < ${#points[@]} - 1; i++)); do
	len=$(calc "${points[i + 1]} - ${points[i]}")
	if python3 -c "exit(not $len > $best)"; then best=$len start=${points[i]} end=${points[i + 1]}; fi
done
# Stay a few frames clear of each cut
s=$(calc "$start + 0.09") e=$(calc "$end - 0.09")
if python3 -c "exit(not $e - $s >= 3.1)"; then
	read -r s e diff <<<"$(python3 "$here/loop-points.py" "$in" "$s" "$e")"
	echo "loop points $s-$e, end/start difference $diff"
fi
len=$(calc "$e - $s")
if python3 -c "exit(not $len < 2.9)"; then echo "REJECT: longest clean run ${len}s" >&2; exit 2; fi

# Pillarbox only: never crop the height, never narrower than 4:3 (dark footage fools cropdetect;
# FedFlix bars are often dark gray, not black, hence limit=40)
# First line only: some FedFlix files list their picture twice (two streams, or a stream group)
IFS=, read -r fw fh <<<"$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "$in" | sed -n 1p)"
crop=$(ffmpeg -v info -ss "$s" -t 1 -i "$in" -vf cropdetect=limit=40:round=2:reset=0 -f null - 2>&1 |
	grep -o 'crop=[0-9:]*' | tail -1 | cut -d= -f2)
IFS=: read -r cw _ cx _ <<<"${crop:-$fw:$fh:0:0}"
if ((cw < fh * 4 / 3)); then cw=$((fh * 4 / 3)) cx=$(((fw - fh * 4 / 3) / 2)); fi
if ((cw * 9 / 16 > fh)); then h=$fh w=$((fh * 16 / 9)) x=$((cx + (cw - fh * 16 / 9) / 2)) y=0
else w=$cw h=$((cw * 9 / 16)) x=$cx y=$(((fh - cw * 9 / 16) / 2)); fi
w=$((w / 2 * 2)) h=$((h / 2 * 2))

# Even brightness across clips (scripts/media/clip-levels.py)
levels=$(python3 "$here/clip-levels.py" "$in" "$s" "$len" "$w:$h:$x:$y")
ffmpeg -v error -y -ss "$s" -t "$len" -i "$in" -filter_complex \
	"[0]crop=$w:$h:$x:$y,$levels,scale=1440:810:flags=lanczos,fps=24,split[a][b];[a]trim=start=$fade,setpts=PTS-STARTPTS[m];[b]trim=0:$fade,setpts=PTS-STARTPTS[head];[m][head]xfade=transition=fade:duration=$fade:offset=$(calc "$len - 2 * $fade")" \
	-an -c:v libx264 -preset slow -crf 30 -pix_fmt yuv420p -movflags +faststart "$out.mp4"
jumps=$(ffmpeg -v info -i "$out.mp4" -vf "select='gt(scene,0.12)',showinfo" -f null - 2>&1 | grep -c pts_time || true)
ffmpeg -v error -y -i "$out.mp4" -frames:v 1 "$out.png"
cwebp -quiet -q 75 "$out.png" -o "$out.webp"
rm "$out.png"
echo "ok: $s-${e}s of ${dur}s, $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$out.mp4")s loop, $(($(wc -c <"$out.mp4") / 1024)) KB, crop ${w}x$h, jumps left $jumps"
if ((jumps > 0)); then echo "check the frames: a jump is left inside the loop" >&2; exit 3; fi
