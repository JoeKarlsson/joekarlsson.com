"""Flash check for looping video: an automated take on WCAG 2.3.1 (three flashes).

PEAT, the usual tool, runs only on Windows. This applies the same general-flash
rule to each clip so a cut or a re-dithered loop can't strobe:

- A transition is a change in relative luminance of at least 0.1 where the darker
  state is below 0.8. A flash is a pair of opposing transitions.
- More than three flashes in any one second fails.
- Checked over the whole frame and over each quarter and the center, since the
  rule applies to any area of about a quarter of the view, not just the average.

It also fails on saturated red flashing (R / (R + G + B) >= 0.8). The site pink
is about 0.46, well short of that.

Usage: npm run media:flash-check -- clip.mp4 [more.webm ...]
"""

import subprocess
import sys

SIZE = 64  # frames are averaged down to 64x64 before measuring
MIN_CHANGE = 0.1
DARK_LIMIT = 0.8
MAX_FLASHES_PER_SECOND = 3
SATURATED_RED = 0.8


def linear(channel):
    c = channel / 255
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


LINEAR = [linear(v) for v in range(256)]


def probe_fps(path):
    rate = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=avg_frame_rate", "-of", "csv=p=0", path],
        capture_output=True, text=True, check=True,
    ).stdout.strip()
    num, den = rate.split("/")
    return float(num) / float(den)


def frames(path):
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", path, "-vf", f"scale={SIZE}:{SIZE}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
        capture_output=True, check=True,
    ).stdout
    step = SIZE * SIZE * 3
    for start in range(0, len(raw) - step + 1, step):
        yield raw[start : start + step]


REGIONS = {
    "whole frame": (0, 0, SIZE, SIZE),
    "top left": (0, 0, SIZE // 2, SIZE // 2),
    "top right": (SIZE // 2, 0, SIZE, SIZE // 2),
    "bottom left": (0, SIZE // 2, SIZE // 2, SIZE),
    "bottom right": (SIZE // 2, SIZE // 2, SIZE, SIZE),
    "center": (SIZE // 4, SIZE // 4, 3 * SIZE // 4, 3 * SIZE // 4),
}


def measure(frame, box):
    x0, y0, x1, y1 = box
    luminance = red = total = 0.0
    count = 0
    for y in range(y0, y1):
        row = y * SIZE * 3
        for x in range(x0, x1):
            r, g, b = frame[row + x * 3 : row + x * 3 + 3]
            luminance += 0.2126 * LINEAR[r] + 0.7152 * LINEAR[g] + 0.0722 * LINEAR[b]
            red += r
            total += r + g + b
            count += 1
    return luminance / count, (red / total if total else 0)


def flash_times(levels, fps):
    """Times of each completed flash: two opposing qualifying transitions in a row."""
    times, last_direction, extreme = [], 0, levels[0]
    for i, level in enumerate(levels[1:], 1):
        change = level - extreme
        darker = min(level, extreme)
        if abs(change) >= MIN_CHANGE and darker < DARK_LIMIT:
            direction = 1 if change > 0 else -1
            if last_direction and direction != last_direction:
                # The pair is complete: one flash. The next flash needs two fresh changes.
                times.append(i / fps)
                last_direction, extreme = 0, level
            else:
                last_direction, extreme = direction, level
        elif last_direction == 0 or (level - extreme) * last_direction > 0:
            extreme = level  # no change under way, or still moving the same way: track it
    return times


def worst_second(times):
    return max((sum(1 for t in times if start <= t < start + 1) for start in times), default=0)


def check(path):
    fps = probe_fps(path)
    measured = {name: [] for name in REGIONS}
    red_levels = {name: [] for name in REGIONS}
    for frame in frames(path):
        for name, box in REGIONS.items():
            luminance, red = measure(frame, box)
            measured[name].append(luminance)
            red_levels[name].append(red)
    failures = []
    for name in REGIONS:
        worst = worst_second(flash_times(measured[name], fps))
        if worst > MAX_FLASHES_PER_SECOND:
            failures.append(f"{name}: {worst} flashes in one second")
        if max(red_levels[name]) >= SATURATED_RED and worst > MAX_FLASHES_PER_SECOND:
            failures.append(f"{name}: saturated red flashing")
    worst_overall = max(worst_second(flash_times(levels, fps)) for levels in measured.values())
    return failures, worst_overall


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    failed = False
    for path in sys.argv[1:]:
        failures, worst = check(path)
        if failures:
            failed = True
            print(f"FAIL {path}: " + "; ".join(failures))
        else:
            print(f"ok   {path}: at most {worst} flash(es) in any second")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
