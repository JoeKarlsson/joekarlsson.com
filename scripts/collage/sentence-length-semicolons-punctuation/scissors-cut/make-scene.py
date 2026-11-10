"""Draws the printed pieces of the scissors scene and writes scene.json.

Adam Smith, The Wealth of Nations (1776), book V, chapter 1: one sentence, punctuated as the
first edition prints it, set as a three-line printed slip with a clause per line. The scissors cut it at the two semicolons: each semicolon's top dot and tail
fall away and leave its bottom dot as a period, and a pasted capital starts each new sentence.
It ends on the three strips: the last frame is the still phones and reduced motion get.
The whole slip and its three strips are drawn from the same layout, so the swap at the first
cut doesn't move a pixel.

    python3 make-scene.py <IM Fell English .ttf>
"""
import json, random, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = Path(__file__).parent
OUT = HERE / 'elements'
FONT = ImageFont.truetype(sys.argv[1], 56)
LINES = ['A shepherd has a great deal of leisure;',
         'a husbandman, in the rude state of husbandry, has some;',
         'an artificer or manufacturer has none at all.']
PAPER, INK, KEY = (246, 241, 230, 255), (20, 20, 20, 255), 6
W, H = 1920, 1080
PAD_X, LINE_H, TOP = 46, 90, 320  # slip margins, line pitch, slip top on the canvas
rng = random.Random(4)

text_w = max(FONT.getlength(l) for l in LINES)
SLIP_W = int(text_w + 2 * PAD_X)
SLIP_X = (W - SLIP_W) // 2


def torn(w, h, top=True, bottom=True):
    """A paper rectangle, torn along the edges asked for and cut straight on the others."""
    pts = []
    for x in range(0, w + 1, 14):
        pts.append((x, rng.randint(0, 9) if top else 0))
    for y in range(0, h + 1, 14):
        pts.append((w - rng.randint(0, 9), y))
    for x in range(w, -1, -14):
        pts.append((x, h - (rng.randint(0, 9) if bottom else 0)))
    for y in range(h, -1, -14):
        pts.append((rng.randint(0, 9), y))
    return pts


def paper_piece(w, h, top, bottom, lines):
    """Paper with a white keyline, the lines of type drawn on it. lines: [(text, y)]."""
    img = Image.new('RGBA', (w + 2 * KEY, h + 2 * KEY), (0, 0, 0, 0))
    mask = Image.new('L', img.size, 0)
    ImageDraw.Draw(mask).polygon([(x + KEY, y + KEY) for x, y in torn(w, h, top, bottom)], fill=255)
    key = mask.filter(ImageFilter.MaxFilter(2 * KEY + 1))
    img.paste((255, 255, 255, 255), (0, 0), key)
    grain = Image.effect_noise(img.size, 10).convert('L')
    paper = Image.merge('RGBA', [g.point(lambda v, c=c: max(0, min(255, c - 8 + v // 16))) for g, c in zip([grain] * 3, PAPER[:3])] + [mask])
    img.alpha_composite(paper)
    d = ImageDraw.Draw(img)
    for text, y in lines:
        d.text((KEY + PAD_X, KEY + y), text, font=FONT, fill=INK)
    return img


def save(name, img):
    img.save(OUT / f'{name}.png')
    return img


OUT.mkdir(exist_ok=True)
strip_h = LINE_H
slip_h = strip_h * 3
baseline_off = 17  # type sits this far into each strip

# The whole slip with its semicolons, and the three strips with periods where they were.
save('slip-whole', paper_piece(SLIP_W, slip_h, True, True, [(l, baseline_off + i * LINE_H) for i, l in enumerate(LINES)]))
as_periods = [l.replace(';', '.') for l in LINES]
for i, l in enumerate(as_periods):
    save(f'strip-{i + 1}', paper_piece(SLIP_W, strip_h, i == 0, i == 2, [(l, baseline_off)]))

elements = []
def place(name, cx, cy, **spec):
    elements.append({'image': f'elements/{name}.png', 'x': round(cx), 'y': round(cy), **spec})

shadow = {'dx': 6, 'dy': 7, 'blur': 9, 'opacity': 0.28}
small_shadow = {'dx': 3, 'dy': 4, 'blur': 4, 'opacity': 0.3}
slip_cx = SLIP_X + (SLIP_W + 2 * KEY) / 2
strip_cy = [TOP + KEY + strip_h / 2 + i * strip_h for i in range(3)]

# Semicolon minus period: the top dot and the tail, cut from the glyph itself so they line up.
def glyph(ch):
    img = Image.new('L', (120, 160), 0)
    ImageDraw.Draw(img).text((20, 0), ch, font=FONT, fill=255)
    return img
semi, dot = glyph(';'), glyph('.')
rest = Image.composite(Image.new('L', semi.size, 0), semi, dot.point(lambda v: 255 if v > 40 else 0))
bbox_dot = dot.getbbox()
mid = bbox_dot[1] - 2  # everything above the period's top is the top dot
for part, box in (('top', (0, 0, 120, mid)), ('tail', (0, bbox_dot[3] - 4, 120, 160))):
    m = rest.crop(box)
    b = m.getbbox()
    piece = Image.new('RGBA', (b[2] - b[0], b[3] - b[1]), INK)
    piece.putalpha(m.crop(b))
    save(f'semicolon-{part}', piece)
    for i in (0, 1):
        x = SLIP_X + KEY + PAD_X + FONT.getlength(LINES[i][:-1]) - 20 + box[0] + b[0]
        y = TOP + KEY + i * strip_h + baseline_off + box[1] + b[1]
        elements.append({'_part': part, '_line': i, 'x': x + piece.width / 2, 'y': y + piece.height / 2, 'w': piece.width})

# Pasted capitals: a scrap with "A" over "a" and "An" over "an".
caps = []
for i, ch in ((1, 'A'), (2, 'An')):
    cw = int(FONT.getlength(ch)) + 14
    scrap = Image.new('RGBA', (cw + 2 * KEY, 104 + 2 * KEY), (0, 0, 0, 0))
    m = Image.new('L', scrap.size, 0)
    ImageDraw.Draw(m).polygon([(x + KEY, y + KEY) for x, y in torn(cw, 104)], fill=255)
    scrap.paste((255, 255, 255, 255), (0, 0), m.filter(ImageFilter.MaxFilter(2 * KEY + 1)))
    scrap.paste((250, 246, 238, 255), (0, 0), m)
    ImageDraw.Draw(scrap).text((KEY + 7, KEY + baseline_off), ch, font=FONT, fill=INK)
    save(f'cap-{ch}', scrap)
    left = SLIP_X + KEY + PAD_X  # where the line's first word starts
    word = LINES[i].split()[0]
    # no wider than the word and half the space after it, so the next word stays whole
    right = left + FONT.getlength(word) + FONT.getlength(' ') / 2
    caps.append((i, ch, min(left + FONT.getlength(word) / 2 + 4, right - (cw + 2 * KEY) / 2)))

semis = [e for e in elements if '_part' in e]
elements = []

T_SLIP, T_SHEARS, CUT1, CUT2, T_CAPS, T_LABEL, END = 0.3, 1.2, 2.2, 3.4, 4.6, 5.3, 9.5
OFF = 2400  # off the canvas, for a swap
cut_y = [TOP + KEY + strip_h, TOP + KEY + 2 * strip_h]
SHEARS_SCALE = 0.5
# whole pair in frame, its blade tips 200px over the slip's right end
shears_x = SLIP_X + SLIP_W + 2 * KEY - 200 + 912 * SHEARS_SCALE / 2

place('slip-whole', slip_cx, TOP + KEY + slip_h / 2, enter_at=T_SLIP, enter_from='left', enter_duration=0.7, shadow=shadow,
      moves=[{'at': CUT1, 'y': OFF, 'duration': 0.01}])
# After the cuts: strip 1 lifts, strip 3 drops, each tilts.
spread = [(-46, -1.6, CUT1), (0, 0.8, CUT1), (52, -1.2, CUT2)]
for i, (dy, rot, at) in enumerate(spread):
    place(f'strip-{i + 1}', slip_cx, strip_cy[i], enter_at=CUT1, enter_from='none', enter_duration=0.01, shadow=shadow,
          moves=[{'at': at + 0.15, 'y': strip_cy[i] + dy, 'rotation': rot, 'duration': 0.45}])
for s in semis:
    cut = (CUT1, CUT2)[s['_line']]
    fall = 140 if s['_part'] == 'top' else 90
    place(f"semicolon-{s['_part']}", s['x'], s['y'], enter_at=CUT1, enter_from='none', enter_duration=0.01,
          # hop off the line first so the eye catches it, then fall out of frame
          moves=[{'at': cut + 0.05, 'y': s['y'] - 44, 'duration': 0.2, 'ease': 'out'},
                 {'at': cut + 0.25, 'x': s['x'] + (8 if s['_part'] == 'tail' else -6), 'y': H + fall, 'rotation': 40 if s['_part'] == 'tail' else -25, 'duration': 0.8, 'ease': 'in'}])
for i, ch, cx in caps:
    y = strip_cy[i] + spread[i][0]
    place(f'cap-{ch}', cx, y, rotation=-4 if ch == 'A' else 3, enter_at=T_CAPS + (0 if ch == 'A' else 0.45),
          enter_from='top', enter_duration=0.4, shadow=small_shadow)
place('shears-open', shears_x, cut_y[0] + 10, scale=SHEARS_SCALE, rotation=180, enter_at=T_SHEARS, enter_from='right', enter_duration=0.6, shadow=shadow,
      moves=[{'at': CUT1, 'y': -OFF, 'duration': 0.01}, {'at': CUT1 + 0.7, 'y': cut_y[1] + 10, 'duration': 0.01},
             {'at': CUT2, 'y': -OFF, 'duration': 0.01}])
place('shears-closed', shears_x, cut_y[0] + 10, scale=SHEARS_SCALE, rotation=180, enter_at=CUT1, enter_from='none', enter_duration=0.01, shadow=shadow,
      moves=[{'at': CUT1 + 0.7, 'y': -OFF, 'duration': 0.01}, {'at': CUT2, 'y': cut_y[1] + 10, 'duration': 0.01},
             {'at': CUT2 + 0.6, 'x': W + 700, 'duration': 0.6, 'ease': 'in'}])

scene = {
    'canvas': {'width': W, 'height': H, 'fps': 24, 'background_hex': '#FF4FD8', 'grain': 0.04},
    'cadence': {'hold_frames': 2, 'jitter_px': 1.5, 'jitter_deg': 0.4, 'seed': 17},
    'duration': END,
    'elements': elements,
    'label': {'text': 'SAME WORDS. THREE SENTENCES.', 'font_family': 'Anton', 'size': 92, 'color': '#0B0B0B',
              'tracking': 3, 'x': W / 2, 'align': 'center', 'y': 800, 'enter_at': T_LABEL},
}
(HERE / 'scene.json').write_text(json.dumps(scene, indent='\t') + '\n')
print('wrote', len(elements), 'elements; slip', SLIP_W, 'wide')
