"""Turn a still into the site's pink-on-black halftone (or a photocopy look).

Usage:
    npm run media:dither -- in.jpg out.webp [--width 800] [--mode dots|xerox]

Defaults follow the redesign spec in docs/redesign/PLAN.md: hot pink dots,
cell size 3, contrast 1.15. The output is twice --width wide, so dots stay
crisp on high-density screens.
"""

import argparse
import math
import random

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageOps, ImageStat

PINK = "#ff4fd8"
# Mean gray level (0-255) above which --invert-light treats an image as light
LIGHT_IMAGE_MEAN = 140


def hex_to_rgb(color):
    color = color.lstrip("#")
    return tuple(int(color[i : i + 2], 16) for i in (0, 2, 4))


def halftone_dots(im, ink, cell, seed):
    """Round dots on a 45-degree grid, sized by brightness, drawn at 3x then downsampled."""
    width, height = im.size
    scale = 3
    big = Image.new("RGB", (width * scale, height * scale), (0, 0, 0))
    draw = ImageDraw.Draw(big)
    cos45, sin45 = math.cos(math.radians(45)), math.sin(math.radians(45))
    reach = int(math.hypot(width, height))
    rng = random.Random(seed)
    offset_x, offset_y = rng.uniform(0, cell), rng.uniform(0, cell)
    steps = int(2 * reach / cell)
    for row in range(steps):
        grid_y = -reach + row * cell
        for col in range(steps):
            grid_x = -reach + col * cell
            x = grid_x * cos45 - grid_y * sin45 + width / 2 + offset_x
            y = grid_x * sin45 + grid_y * cos45 + height / 2 + offset_y
            if not (0 <= x < width and 0 <= y < height):
                continue
            brightness = min(1, max(0, im.getpixel((int(x), int(y))) / 255 + rng.gauss(0, 0.05)))
            radius = (cell / 2) * 1.25 * math.sqrt(brightness)
            if radius > 0.4:
                box = [(x - radius) * scale, (y - radius) * scale, (x + radius) * scale, (y + radius) * scale]
                draw.ellipse(box, fill=ink)
    return big.resize((width * 2, height * 2), Image.LANCZOS)


def photocopy(im, ink, seed):
    """Noisy hard threshold with toner speckle."""
    rng = random.Random(seed)
    im = im.filter(ImageFilter.UnsharpMask(2, 200, 3))
    pixels = im.load()
    width, height = im.size
    for y in range(height):
        for x in range(width):
            pixels[x, y] = 255 if pixels[x, y] + rng.gauss(0, 28) > 128 else 0
    mask = im.resize((width * 2, height * 2), Image.NEAREST)
    out = Image.new("RGB", mask.size, (0, 0, 0))
    out.paste(Image.new("RGB", mask.size, ink), mask=mask)
    return out


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("src")
    parser.add_argument("out")
    parser.add_argument("--color", default=PINK)
    parser.add_argument("--mode", choices=["dots", "xerox"], default="dots")
    parser.add_argument("--width", type=int, default=800, help="working width; output is twice this")
    parser.add_argument("--cell", type=float, default=3, help="dot grid size in working pixels")
    parser.add_argument("--contrast", type=float, default=1.15)
    parser.add_argument("--seed", type=int, default=4, help="vary per frame to make a living photocopy")
    parser.add_argument(
        "--invert-light",
        action="store_true",
        help="flip mostly-light images (diagrams on white) so the ground stays black",
    )
    args = parser.parse_args()

    im = Image.open(args.src).convert("L")
    # A white background would become solid pink dots and bury the subject
    if args.invert_light and ImageStat.Stat(im).mean[0] > LIGHT_IMAGE_MEAN:
        im = ImageOps.invert(im)
    im = im.resize((args.width, round(im.height * args.width / im.width)))
    im = ImageOps.autocontrast(im, cutoff=2)
    im = ImageEnhance.Contrast(im).enhance(args.contrast)
    ink = hex_to_rgb(args.color)
    if args.mode == "dots":
        out = halftone_dots(im, ink, args.cell, args.seed)
    else:
        out = photocopy(im, ink, args.seed)
    if args.out.lower().endswith(".webp"):
        # Two flat colors plus anti-aliased dot edges: four palette colors keep the
        # dots crisp, and lossless WebP of that is about a fifth of lossy WebP's size
        out = out.quantize(colors=4, method=Image.Quantize.FASTOCTREE).convert("RGB")
        out.save(args.out, lossless=True, method=6)
    else:
        out.save(args.out, quality=82)


if __name__ == "__main__":
    main()
