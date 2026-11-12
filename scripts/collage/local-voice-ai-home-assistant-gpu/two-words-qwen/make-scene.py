"""Draws the paper pieces of the "two words" scene and writes scene.json.

The model's real reply (quoted in the post) lands as a typed strip, tailor's shears snip it, the
strip falls apart into scraps that pile at the bottom, and a pink slip with the two words that
mattered lands in the middle. The last frame (scraps, slip, label) is the still.

    python3 make-scene.py <dir with JetBrainsMono[wght].ttf and Anton-Regular.ttf>

Both fonts are in github.com/google/fonts (ofl/jetbrainsmono, ofl/anton).
"""
import json, random, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = Path(__file__).parent
OUT = HERE / 'elements'
FONTS = Path(sys.argv[1])
MONO = ImageFont.truetype(str(FONTS / 'JetBrainsMono[wght].ttf'), 40)
MONO.set_variation_by_axes([500])
ANTON = ImageFont.truetype(str(FONTS / 'Anton-Regular.ttf'), 130)
LINES = ["Sure! I've turned on the lights for you in the living room!",
         "Let me know if there's anything else I can help with today!"]
PAPER, PINK, INK, KEY = (246, 241, 230), (255, 79, 216), (20, 20, 20, 255), 6
W, H = 1920, 1080
PAD_X, PAD_Y, LINE_H = 40, 26, 62
rng = random.Random(7)


def torn(w, h):
    """A paper rectangle with all four edges torn."""
    pts = [(x, rng.randint(0, 8)) for x in range(0, w + 1, 14)]
    pts += [(w - rng.randint(0, 8), y) for y in range(0, h + 1, 14)]
    pts += [(x, h - rng.randint(0, 8)) for x in range(w, -1, -14)]
    pts += [(rng.randint(0, 8), y) for y in range(h, -1, -14)]
    return pts


def paper(w, h, color, draw_text):
    """Paper with grain and a white keyline; draw_text(draw, ox, oy) sets the type."""
    img = Image.new('RGBA', (w + 2 * KEY, h + 2 * KEY), (0, 0, 0, 0))
    mask = Image.new('L', img.size, 0)
    ImageDraw.Draw(mask).polygon([(x + KEY, y + KEY) for x, y in torn(w, h)], fill=255)
    img.paste((255, 255, 255, 255), (0, 0), mask.filter(ImageFilter.MaxFilter(2 * KEY + 1)))
    grain = Image.effect_noise(img.size, 10).convert('L')
    face = Image.merge('RGBA', [grain.point(lambda v, c=c: max(0, min(255, c - 8 + v // 16))) for c in color] + [mask])
    img.alpha_composite(face)
    draw_text(ImageDraw.Draw(img), KEY, KEY)
    return img


OUT.mkdir(exist_ok=True)
strip_w = int(max(MONO.getlength(l) for l in LINES) + 2 * PAD_X)
strip_h = PAD_Y * 2 + LINE_H * len(LINES)
strip = paper(strip_w, strip_h, PAPER, lambda d, ox, oy: [
    d.text((ox + PAD_X, oy + PAD_Y + i * LINE_H), l, font=MONO, fill=INK) for i, l in enumerate(LINES)])
strip.save(OUT / 'strip.png')

# The scraps: the same strip cut along ragged vertical lines, so the swap at the snip doesn't move
# a pixel.
cuts = [0, 0.17, 0.36, 0.55, 0.75, 1]
def cut_line(f):
    x0 = f * strip.width
    return [(x0 + rng.randint(-10, 10), y) for y in range(0, strip.height + 1, 12)]
lines = [cut_line(f) for f in cuts]
lines[0] = [(0, y) for _, y in lines[0]]
lines[-1] = [(strip.width, y) for _, y in lines[-1]]
scraps = []
for i in range(len(cuts) - 1):
    m = Image.new('L', strip.size, 0)
    ImageDraw.Draw(m).polygon(lines[i] + lines[i + 1][::-1], fill=255)
    piece = Image.new('RGBA', strip.size, (0, 0, 0, 0))
    piece.paste(strip, (0, 0), m)
    box = piece.getbbox()
    piece.crop(box).save(OUT / f'scrap-{i + 1}.png')
    scraps.append(((box[0] + box[2]) / 2, (box[1] + box[3]) / 2))

slip_w = int(ANTON.getlength('LIGHTS ON.') + 2 * 44)
slip = paper(slip_w, 190, PINK, lambda d, ox, oy: d.text((ox + 44, oy + 12), 'LIGHTS ON.', font=ANTON, fill=INK))
slip.save(OUT / 'slip.png')

T_STRIP, T_SHEARS, CUT, T_SLIP, T_LABEL, END = 0.3, 1.1, 2.0, 3.3, 4.2, 6.4
OFF = 2400  # off the canvas, for a swap
shadow = {'dx': 10, 'dy': 12, 'blur': 12, 'opacity': 0.45}
elements = []
strip_x, strip_y = (W - strip.width) / 2, 470 - strip.height / 2
elements.append({'image': 'elements/strip.png', 'x': W / 2, 'y': 470, 'rotation': -1, 'enter_at': T_STRIP,
                 'enter_from': 'left', 'enter_duration': 0.7, 'shadow': shadow,
                 'moves': [{'at': CUT, 'y': OFF, 'duration': 0.01}]})
# Scraps fall at uneven offsets and pile along the bottom edge, partly off the frame.
rest = [(250, 1010, -14), (640, 1040, 9), (1000, 1000, -5), (1370, 1045, 16), (1720, 1005, -9)]
lag = [0.18, 0.05, 0.27, 0.12, 0.33]
for i, ((cx, cy), (rx, ry, rot), d) in enumerate(zip(scraps, rest, lag)):
    x, y = strip_x + cx, strip_y + cy
    elements.append({'image': f'elements/scrap-{i + 1}.png', 'x': round(x), 'y': round(y), 'rotation': -1,
                     'enter_at': CUT, 'enter_from': 'none', 'enter_duration': 0.01, 'shadow': shadow,
                     'moves': [{'at': CUT + d, 'y': round(y - 30), 'duration': 0.15, 'ease': 'out'},
                               {'at': CUT + d + 0.15, 'x': rx, 'y': ry, 'rotation': rot, 'duration': 0.6, 'ease': 'in'}]})
# Shears come in from the right, blades first, and close on the strip's right end.
shears = {'x': 1540, 'y': 490, 'scale': 0.95, 'rotation': 174}
elements.append({'image': 'elements/shears-open.png', **shears, 'enter_at': T_SHEARS, 'enter_from': 'right',
                 'enter_duration': 0.6, 'shadow': shadow, 'moves': [{'at': CUT, 'y': -OFF, 'duration': 0.01}]})
elements.append({'image': 'elements/shears-closed.png', **shears, 'enter_at': CUT, 'enter_from': 'none',
                 'enter_duration': 0.01, 'shadow': shadow,
                 'moves': [{'at': CUT + 1.1, 'x': W + 600, 'duration': 0.5, 'ease': 'in'}]})
elements.append({'image': 'elements/slip.png', 'x': W / 2, 'y': 520, 'rotation': -2.5, 'enter_at': T_SLIP,
                 'enter_from': 'top', 'enter_duration': 0.6, 'shadow': shadow})

scene = {
    'canvas': {'width': W, 'height': H, 'fps': 24, 'background_hex': '#2B45E0', 'grain': 0.04},
    'cadence': {'hold_frames': 2, 'jitter_px': 1.5, 'jitter_deg': 0.4, 'seed': 11},
    'duration': END,
    'elements': elements,
    'label': {'text': 'TWO WORDS.', 'font_family': 'Anton', 'size': 140, 'color': '#F2EDE4', 'tracking': 4,
              'x': W / 2, 'y': 90, 'enter_at': T_LABEL, 'align': 'center'},
}
(HERE / 'scene.json').write_text(json.dumps(scene, indent='\t') + '\n')
print('wrote', len(elements), 'elements; strip', strip.width, 'x', strip.height)
