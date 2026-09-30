#!/usr/bin/env python3
"""Meme helper for blog posts: audit which formats the blog already uses,
list current ImgFlip templates, and caption a template locally (no API
credentials needed).

    python3 scripts/make-meme.py used                 # format counts + recent posts
    python3 scripts/make-meme.py templates [--limit 100] [--exclude-overused]
    python3 scripts/make-meme.py make --template "Bernie I Am Once Again Asking" \
        --caption "Me, once again asking Claude" --caption "to stage files by path" \
        --out public/images/blog/<slug>/meme-name.webp

Styles for `make`:
  header  (default) caption in a white band above the image; works on any template
  impact  classic white Impact text, first caption on top, last caption on bottom
  --box   place text inside a region given as fractions of the image, e.g.
          --box "0.52,0.03,0.97,0.47=Top-right panel text" (repeatable; for
          multi-panel formats). --box overrides --caption.

The `used` audit only sees formats named in image alt text, so always name the
format in the alt text ("Bernie Sanders meme: ...").
"""
import argparse
import glob
import io
import json
import re
import sys
import urllib.request
from collections import Counter

API = "https://api.imgflip.com/get_memes"
BLOG_GLOB = "src/content/blog/*.md"
OVERUSED_AT = 3  # a format used this many times across the blog is off the table
RECENT_POSTS = 5  # formats used in this many most recent posts are off the table
FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_IMPACT = "/System/Library/Fonts/Supplemental/Impact.ttf"

# Names people write in alt text that differ from ImgFlip's template name
ALIASES = {
    "galaxy brain": "Expanding Brain",
    "expanding-brain": "Expanding Brain",
    "hotline bling": "Drake Hotline Bling",
    "drake": "Drake Hotline Bling",
    "gru": "Gru's Plan",
    "pikachu": "Surprised Pikachu",
    "this is fine": "This Is Fine",
    "one does not simply": "One Does Not Simply",
    "distracted boyfriend": "Distracted Boyfriend",
    "two buttons": "Two Buttons",
    "is this a pigeon": "Is This A Pigeon",
    "change my mind": "Change My Mind",
    "always has been": "Always Has Been",
    "panik": "Panik Kalm Panik",
    "woman yelling": "Woman Yelling At Cat",
    "hide the pain": "Hide the Pain Harold",
    "roll safe": "Roll Safe Think About It",
    "tuxedo": "Tuxedo Winnie The Pooh",
    "waiting skeleton": "Waiting Skeleton",
    "epic handshake": "Epic Handshake",
    "success kid": "Success Kid",
    "bernie": "Bernie I Am Once Again Asking For Your Support",
    "narrator": "Narrator",
    "columbo": "Columbo",
    "sad pablo": "Sad Pablo Escobar",
    "pablo escobar": "Sad Pablo Escobar",
    "no idea what i am doing": "I Have No Idea What I'm Doing",
    "herding cats": "Herding Cats",
    "force quit": "Force Quit",
    "chappelle": "Dave Chappelle",
}


def _get(url):
    # ImgFlip returns 403 to urllib's default User-Agent
    req = urllib.request.Request(url, headers={"User-Agent": "joekarlsson.com-meme-helper/1.0"})
    return urllib.request.urlopen(req, timeout=20)


def fetch_templates():
    with _get(API) as r:
        return json.load(r)["data"]["memes"]


def post_meta(path):
    text = open(path, encoding="utf-8").read()
    m = re.search(r"^date:\s*['\"]?(\d{4}-\d{2}-\d{2})", text, re.M)
    return (m.group(1) if m else "0000-00-00"), text


def formats_in(text, names):
    found = []
    for alt in re.findall(r"!\[([^\]]*)\]", text):
        low = alt.lower()
        hit = {canon for key, canon in ALIASES.items() if key in low}
        hit |= {n for n in names if len(n) > 6 and n.lower() in low}
        if not hit and "meme" in low:
            hit = {"(unnamed format: " + alt[:60] + ")"}
        found.extend(sorted(hit))
    return found


def usage(names):
    counts, by_post = Counter(), []
    for path in glob.glob(BLOG_GLOB):
        date, text = post_meta(path)
        fmts = formats_in(text, names)
        counts.update(fmts)
        if fmts:
            by_post.append((date, path.split("/")[-1], fmts))
    by_post.sort(reverse=True)
    return counts, by_post


def blocked(counts, by_post):
    over = {f for f, c in counts.items() if c >= OVERUSED_AT and not f.startswith("(")}
    recent = {f for _, _, fmts in by_post[:RECENT_POSTS] for f in fmts if not f.startswith("(")}
    return over, recent


def cmd_used(_args):
    names = [t["name"] for t in fetch_templates()]
    counts, by_post = usage(names)
    over, recent = blocked(counts, by_post)
    print(f"Format usage across the blog ({len(by_post)} posts with memes):")
    for f, c in counts.most_common():
        flag = "  OVERUSED" if f in over else ""
        print(f"  {c:3d}  {f}{flag}")
    print(f"\nMost recent {RECENT_POSTS} posts with memes:")
    for date, name, fmts in by_post[:RECENT_POSTS]:
        print(f"  {date}  {name}: {', '.join(fmts)}")
    print("\nOff the table for the next post:")
    for f in sorted(over | recent):
        why = "used %dx" % counts[f] if f in over else "used in a recent post"
        print(f"  - {f} ({why})")


def cmd_templates(args):
    templates = fetch_templates()
    skip = set()
    if args.exclude_overused:
        counts, by_post = usage([t["name"] for t in templates])
        over, recent = blocked(counts, by_post)
        skip = over | recent
    shown = 0
    for t in templates:
        if t["name"] in skip:
            continue
        print(f'{t["id"]:>10}  {t["box_count"]} boxes  {t["name"]}')
        shown += 1
        if shown >= args.limit:
            break


def load_template(ref):
    from PIL import Image

    templates = fetch_templates()
    match = [t for t in templates if t["id"] == ref or t["name"].lower() == ref.lower()]
    if not match:
        match = [t for t in templates if ref.lower() in t["name"].lower()]
    if not match:
        sys.exit(f"No ImgFlip template matches {ref!r}. Try: make-meme.py templates")
    t = match[0]
    with _get(t["url"]) as r:
        img = Image.open(io.BytesIO(r.read())).convert("RGB")
    print(f'Using template: {t["name"]} ({t["id"]})', file=sys.stderr)
    return img


def trim_white_top(img):
    """Drop blank white rows some templates ship with, so the header band isn't doubled."""
    gray = img.convert("L")
    w, h = gray.size
    top = 0
    while top < h * 0.6 and gray.crop((0, top, w, top + 1)).getextrema()[0] > 235:
        top += 1
    return img.crop((0, top, w, h)) if top > h * 0.03 else img


def wrap_to_width(draw, text, font, width):
    words, lines, line = text.split(), [], ""
    for w in words:
        trial = (line + " " + w).strip()
        if draw.textlength(trial, font=font) <= width or not line:
            line = trial
        else:
            lines.append(line)
            line = w
    if line:
        lines.append(line)
    return lines


def draw_in_box(draw, text, box, font_path, fill="black", stroke=0, max_size=120):
    from PIL import ImageFont

    x0, y0, x1, y1 = box
    for size in range(max_size, 10, -2):
        font = ImageFont.truetype(font_path, size)
        lines = wrap_to_width(draw, text, font, x1 - x0)
        lh = size * 1.18
        if len(lines) * lh <= y1 - y0 and all(draw.textlength(l, font=font) <= x1 - x0 for l in lines):
            y = y0 + ((y1 - y0) - len(lines) * lh) / 2
            for l in lines:
                x = x0 + ((x1 - x0) - draw.textlength(l, font=font)) / 2
                draw.text((x, y), l, font=font, fill=fill, stroke_width=stroke, stroke_fill="black")
                y += lh
            return
    sys.exit(f"Caption too long to fit: {text!r}")


def cmd_make(args):
    from PIL import Image, ImageDraw, ImageFont, ImageStat

    img = load_template(args.template)
    w, h = img.size
    if args.box:
        d = ImageDraw.Draw(img)
        for spec in args.box:
            coords, text = spec.split("=", 1)
            fx0, fy0, fx1, fy1 = (float(v) for v in coords.split(","))
            box = (fx0 * w, fy0 * h, fx1 * w, fy1 * h)
            # Pick text color for contrast with what's behind the box
            region = img.crop(tuple(int(v) for v in box)).convert("L")
            dark = ImageStat.Stat(region).mean[0] < 128
            fill, stroke = ("white", max(2, w // 300)) if dark else ("black", 0)
            draw_in_box(d, text, box, FONT_BOLD, fill, stroke, max_size=int(h / 8))
        out = img
    elif args.style == "impact":
        d = ImageDraw.Draw(img)
        caps = args.caption
        stroke = max(2, w // 250)
        draw_in_box(d, caps[0].upper(), (w * 0.04, h * 0.02, w * 0.96, h * 0.22), FONT_IMPACT, "white", stroke, int(h / 7))
        if len(caps) > 1:
            draw_in_box(d, caps[-1].upper(), (w * 0.04, h * 0.78, w * 0.96, h * 0.98), FONT_IMPACT, "white", stroke, int(h / 7))
        out = img
    else:
        img = trim_white_top(img)
        w, h = img.size
        pad = int(w * 0.04)
        font = ImageFont.truetype(FONT_BOLD, max(24, w // 22))
        probe = ImageDraw.Draw(img)
        blocks = [wrap_to_width(probe, c, font, w - 2 * pad) for c in args.caption]
        lh = int(font.size * 1.2)
        band = pad + sum(len(b) * lh + pad // 2 for b in blocks) + pad // 2
        out = Image.new("RGB", (w, h + band), "white")
        out.paste(img, (0, band))
        d = ImageDraw.Draw(out)
        y = pad
        for b in blocks:
            for line in b:
                d.text((pad, y), line, font=font, fill="black")
                y += lh
            y += pad // 2
    out.thumbnail((args.max_width, 10_000))
    out.save(args.out, "WEBP", quality=82)
    print(f"Wrote {args.out} ({out.width}x{out.height})")


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)
    sub.add_parser("used", help="audit meme formats already used on the blog")
    t = sub.add_parser("templates", help="list current ImgFlip templates")
    t.add_argument("--limit", type=int, default=100)
    t.add_argument("--exclude-overused", action="store_true")
    m = sub.add_parser("make", help="caption a template locally")
    m.add_argument("--template", required=True, help="ImgFlip template name or id")
    m.add_argument("--caption", action="append", default=[])
    m.add_argument("--box", action="append", help="x0,y0,x1,y1=text with fractional coords")
    m.add_argument("--style", choices=["header", "impact"], default="header")
    m.add_argument("--out", required=True)
    m.add_argument("--max-width", type=int, default=800)
    args = p.parse_args()
    if args.cmd == "make" and not (args.caption or args.box):
        p.error("make needs --caption or --box")
    {"used": cmd_used, "templates": cmd_templates, "make": cmd_make}[args.cmd](args)


if __name__ == "__main__":
    main()
