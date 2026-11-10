#!/usr/bin/env python3
"""Stop-motion collage compositor.

Reads a scene.json (schema in references/motion-recipes.md) and renders an
assemble-from-empty stop-motion clip: flat color field, cut-out PNG elements
sliding in from the edges on a stepped timeline with per-pose jitter, soft
drop shadows, and a real-typography label.

Usage:
    python assemble.py scene.json --out clip.mp4
    python assemble.py scene.json --out clip.mp4 --still 9999   # render one pose as PNG

Deps: pillow, ffmpeg on PATH.
"""

import argparse
import json
import math
import random
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


# ---------- easing ----------

def ease_out_back(t: float, overshoot: float = 1.70158) -> float:
    """Snap into place with ~8-10 percent overshoot, then settle."""
    t -= 1.0
    return t * t * ((overshoot + 1) * t + overshoot) + 1.0


def clamp01(x: float) -> float:
    return max(0.0, min(1.0, x))


def bezier(points: list, t: float):
    """De Casteljau evaluation. t past 1.0 extrapolates along the end
    tangent, which lets the easeOutBack overshoot ride the path."""
    pts = [(float(p[0]), float(p[1])) for p in points]
    while len(pts) > 1:
        pts = [(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)
               for a, b in zip(pts, pts[1:])]
    return pts[0]


# ---------- helpers ----------

def hex_to_rgb(h: str):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def make_field(w: int, h: int, hex_color: str, grain: float) -> Image.Image:
    field = Image.new("RGBA", (w, h), hex_to_rgb(hex_color) + (255,))
    if grain and grain > 0:
        noise = Image.effect_noise((w, h), 24).convert("L")
        overlay = Image.merge("RGBA", (noise, noise, noise,
                                       noise.point(lambda p: int(grain * 255))))
        field = Image.alpha_composite(field, overlay)
    return field


def load_element(base: Path, spec: dict) -> Image.Image:
    img = Image.open(base / spec["image"]).convert("RGBA")
    scale = spec.get("scale", 1.0)
    if scale != 1.0:
        img = img.resize((max(1, int(img.width * scale)),
                          max(1, int(img.height * scale))), Image.LANCZOS)
    return img


def shadow_of(img: Image.Image, blur: float, opacity: float) -> Image.Image:
    alpha = img.split()[3].point(lambda p: int(p * opacity))
    sh = Image.new("RGBA", img.size, (0, 0, 0, 0))
    sh.putalpha(alpha)
    pad = int(blur * 3) + 2
    padded = Image.new("RGBA", (img.width + pad * 2, img.height + pad * 2), (0, 0, 0, 0))
    padded.paste(sh, (pad, pad))
    return padded.filter(ImageFilter.GaussianBlur(blur)), pad


def draw_label(canvas: Image.Image, label: dict, base: Path, dy: float, alpha: float):
    font_path = label.get("font")
    size = label.get("size", 80)
    try:
        font = ImageFont.truetype(str(base / font_path) if font_path else None, size)
    except Exception:
        font = ImageFont.load_default(size)
    tracking = label.get("tracking", 0)
    color = hex_to_rgb(label.get("color", "#0A0A0A")) + (int(255 * alpha),)
    layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    x = label.get("x", 80)
    y = label.get("y", canvas.height - 200) + dy
    for ch in label.get("text", ""):
        d.text((x, y), ch, font=font, fill=color)
        x += d.textlength(ch, font=font) + tracking
    canvas.alpha_composite(layer)


# ---------- pose computation ----------

def element_pose(spec: dict, t: float, canvas_w: int, canvas_h: int, img: Image.Image):
    """Return (visible, cx, cy, shadow_scale, progress) for an element at time t seconds."""
    enter_at = spec.get("enter_at", 0.0)
    dur = max(spec.get("enter_duration", 0.5), 1e-6)
    tx, ty = spec["x"], spec["y"]
    if t < enter_at:
        return False, tx, ty, 1.0, 0.0
    p = clamp01((t - enter_at) / dur)
    e = ease_out_back(p)
    path = spec.get("enter_path")
    if path:
        # curved entry: control points in canvas coords, first point is the
        # start (usually offscreen), target position is appended as the end
        cx, cy = bezier(list(path) + [[tx, ty]], e)
    else:
        edge = spec.get("enter_from", "left")
        margin = max(img.width, img.height)
        if edge == "left":
            sx, sy = -margin, ty
        elif edge == "right":
            sx, sy = canvas_w + margin, ty
        elif edge == "top":
            sx, sy = tx, -margin
        elif edge == "bottom":
            sx, sy = tx, canvas_h + margin
        else:  # none: pop in place
            sx, sy = tx, ty
        cx = sx + (tx - sx) * e
        cy = sy + (ty - sy) * e
    # shadow rides wider during flight, settles on landing
    shadow_scale = 1.0 + 0.6 * (1.0 - clamp01(p * 1.2))
    return True, cx, cy, shadow_scale, p


# ---------- render ----------

def render(scene_path: Path, out_path: Path, still_frame: int | None = None):
    base = scene_path.parent
    scene = json.loads(scene_path.read_text())

    cv = scene["canvas"]
    w, h, fps = cv["width"], cv["height"], cv.get("fps", 24)
    cadence = scene.get("cadence", {})
    hold = max(1, cadence.get("hold_frames", 2))
    jitter_px = cadence.get("jitter_px", 1.5)
    jitter_deg = cadence.get("jitter_deg", 0.4)
    seed = cadence.get("seed", 7)
    duration = scene["duration"]
    total_frames = int(duration * fps)

    field = make_field(w, h, cv.get("background_hex", "#1F3FB0"), cv.get("grain", 0.0))
    elements = [(spec, load_element(base, spec)) for spec in scene.get("elements", [])]
    label = scene.get("label")

    tmp = Path(tempfile.mkdtemp(prefix="collage_"))
    frames_written = []

    for f in range(total_frames):
        pose_index = f // hold
        if f % hold == 0 or not frames_written:
            t = (pose_index * hold) / fps
            rng = random.Random(seed * 100003 + pose_index)
            canvas = field.copy()

            for i, (spec, img) in enumerate(elements):
                visible, cx, cy, sh_scale, prog = element_pose(spec, t, w, h, img)
                if not visible:
                    continue
                jx = rng.uniform(-jitter_px, jitter_px)
                jy = rng.uniform(-jitter_px, jitter_px)
                jr = rng.uniform(-jitter_deg, jitter_deg) + spec.get("rotation", 0)
                # enter_spin: extra rotation that unwinds as the piece lands
                jr += spec.get("enter_spin", 0) * max(0.0, 1.0 - prog)
                piece = img.rotate(jr, expand=True, resample=Image.BICUBIC)
                sh_spec = spec.get("shadow", {})
                if sh_spec:
                    sh, pad = shadow_of(piece,
                                        sh_spec.get("blur", 8) * sh_scale,
                                        sh_spec.get("opacity", 0.3))
                    sdx = sh_spec.get("dx", 6) * sh_scale
                    sdy = sh_spec.get("dy", 6) * sh_scale
                    canvas.alpha_composite(sh, (int(cx - piece.width / 2 + jx + sdx - pad),
                                                int(cy - piece.height / 2 + jy + sdy - pad)))
                canvas.alpha_composite(piece, (int(cx - piece.width / 2 + jx),
                                               int(cy - piece.height / 2 + jy)))

            if label:
                la = label.get("enter_at", 0.0)
                ld = 0.25
                if t >= la:
                    lp = clamp01((t - la) / ld)
                    le = ease_out_back(lp)
                    draw_label(canvas, label, base, dy=(1.0 - le) * 24, alpha=min(1.0, lp * 2))

            current = canvas.convert("RGB")

        if still_frame is not None:
            if f >= min(still_frame, total_frames - 1):
                current.save(out_path)
                print(f"still -> {out_path}")
                shutil.rmtree(tmp, ignore_errors=True)
                return
            continue

        fp = tmp / f"frame{f:05d}.png"
        current.save(fp)
        frames_written.append(fp)

    if still_frame is not None:
        current.save(out_path)
        print(f"still -> {out_path}")
        shutil.rmtree(tmp, ignore_errors=True)
        return

    cmd = ["ffmpeg", "-y", "-framerate", str(fps), "-i", str(tmp / "frame%05d.png"),
           "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", str(out_path)]
    subprocess.run(cmd, check=True, capture_output=True)
    shutil.rmtree(tmp, ignore_errors=True)
    print(f"clip -> {out_path}  ({total_frames} frames @ {fps}fps, on {'twos' if hold == 2 else str(hold)})")


def main():
    ap = argparse.ArgumentParser(description="Render a collage stop-motion scene")
    ap.add_argument("scene", type=Path)
    ap.add_argument("--out", type=Path, required=True)
    ap.add_argument("--still", type=int, default=None,
                    help="Render a single frame (use a large number for the finished pose) as PNG instead of a clip")
    args = ap.parse_args()
    if shutil.which("ffmpeg") is None and args.still is None:
        sys.exit("ffmpeg not found on PATH. Install it, or render a --still instead.")
    render(args.scene, args.out, args.still)


if __name__ == "__main__":
    main()
