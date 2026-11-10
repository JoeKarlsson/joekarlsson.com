"""Draws the pieces of the words-leave scene and writes scene.json.

A page of Alice's Adventures in Wonderland (the Gutenberg text Punc shows) lands whole. The
words tear away in clumps, the marks turn pink where they stood, the blank paper drops out,
and only the punctuation is left: Punc's erasure, done by hand. The whole page, its torn
clumps and the marks come from one layout, so the swap when the tearing starts doesn't move a
pixel. It ends on the marks alone, the still phones and reduced motion get.

    python3 make-scene.py <IM Fell English .ttf>
"""
import json, random, sys
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

HERE = Path(__file__).parent
OUT = HERE / 'elements'
FONT = ImageFont.truetype(sys.argv[1], 64)
TEXT = ('“Well!” thought Alice to herself, “after such a fall as this, I shall think nothing of '
        'tumbling down stairs! How brave they’ll all think me at home! Why, I wouldn’t say anything '
        'about it, even if I fell off the top of the house!” (Which was very likely true.)')
MARKS = set(',.;:!?"\'()-“”‘’—')
PAPER, INK, PINK, KEY = (246, 241, 230), (20, 20, 20, 255), (255, 79, 216, 255), 6
W, H = 1920, 1080
PAGE_W, PAD, LINE_H = 1400, 70, 84
rng = random.Random(9)


def x_at(line, k):
    """x of character k: the sum of each glyph's own advance, so a pair the font would join
    (the ff in "off") is spaced the way it's drawn, one glyph at a time."""
    return sum(FONT.getlength(c) for c in line[:k])


def wrap(text, width):
    lines, line = [], ''
    for word in text.split(' '):
        trial = f'{line} {word}'.strip()
        if x_at(trial, len(trial)) > width and line:
            lines.append(line)
            line = word
        else:
            line = trial
    return lines + [line]


def torn(w, h, step=12, depth=8):
    pts = [(x, rng.randint(0, depth)) for x in range(0, w + 1, step)]
    pts += [(w - rng.randint(0, depth), y) for y in range(0, h + 1, step)]
    pts += [(x, h - rng.randint(0, depth)) for x in range(w, -1, -step)]
    pts += [(rng.randint(0, depth), y) for y in range(h, -1, -step)]
    return pts


def paper(w, h):
    """Torn paper with a white keyline, transparent around it."""
    img = Image.new('RGBA', (w + 2 * KEY, h + 2 * KEY), (0, 0, 0, 0))
    mask = Image.new('L', img.size, 0)
    ImageDraw.Draw(mask).polygon([(x + KEY, y + KEY) for x, y in torn(w, h)], fill=255)
    img.paste((255, 255, 255, 255), (0, 0), mask.filter(ImageFilter.MaxFilter(2 * KEY + 1)))
    img.paste(PAPER + (255,), (0, 0), mask)
    return img


lines = wrap(TEXT, PAGE_W - 2 * PAD)
PAGE_H = 2 * PAD + LINE_H * len(lines)
OX, OY = (W - PAGE_W) // 2, (H - PAGE_H) // 2 - 70  # page's top left on the canvas; room for the label

# Every glyph's place on the page, so words and marks can be drawn apart and still line up.
glyphs = []  # (char, x, y) in page coordinates
for i, line in enumerate(lines):
    y = PAD + i * LINE_H
    for k, ch in enumerate(line):
        glyphs.append((ch, PAD + x_at(line, k), y))


def ink(only, fill, size, stroke=0):
    layer = Image.new('RGBA', size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for ch, x, y in glyphs:
        if only(ch):
            d.text((KEY + x, KEY + y), ch, font=FONT, fill=fill, stroke_width=stroke, stroke_fill=fill)
    return layer


OUT.mkdir(exist_ok=True)
whole = paper(PAGE_W, PAGE_H)
whole.alpha_composite(ink(lambda c: c != ' ', INK, whole.size))
whole.save(OUT / 'page-whole.png')
paper(PAGE_W, PAGE_H).save(OUT / 'page-blank.png')
words = ink(lambda c: c not in MARKS and c != ' ', INK, whole.size)
marks = ink(lambda c: c in MARKS, PINK, whole.size, stroke=2)  # a touch heavier, so they hold up on a phone
mb = marks.getbbox()
marks.crop(mb).save(OUT / 'marks.png')

elements, shadow = [], {'dx': 6, 'dy': 7, 'blur': 9, 'opacity': 0.35}
def place(name, cx, cy, **spec):
    elements.append({'image': f'elements/{name}.png', 'x': round(cx), 'y': round(cy), **spec})

T_PAGE, T_TEAR, T_PAPER, T_LABEL, END = 0.3, 1.6, 4.4, 5.2, 9.5
page_cx, page_cy = OX + whole.width / 2, OY + whole.height / 2
place('page-whole', page_cx, page_cy, enter_at=T_PAGE, enter_from='bottom', enter_duration=0.7, shadow=shadow,
      moves=[{'at': T_TEAR, 'y': -3000, 'duration': 0.01}])
place('page-blank', page_cx, page_cy, enter_at=T_TEAR, enter_from='none', enter_duration=0.01, shadow=shadow,
      moves=[{'at': T_PAPER, 'y': H + 900, 'rotation': 6, 'duration': 0.7, 'ease': 'in'}])

# Torn clumps of two or three words, top line first, each flung up and out of frame.
n = 0
for i, line in enumerate(lines):
    spans, k = [], 0
    for word in line.split(' '):
        spans.append((k, k + len(word)))
        k += len(word) + 1
    groups = []
    while spans:
        take = rng.choice((2, 3)) if len(spans) > 3 else len(spans)
        groups.append((spans[0][0], spans[take - 1][1]))
        spans = spans[take:]
    for a, b in groups:
        x0 = PAD + x_at(line, a) - 10
        x1 = PAD + x_at(line, b) + 10
        y0 = PAD + i * LINE_H - 6
        clump = paper(int(x1 - x0), LINE_H)
        clump.alpha_composite(words.crop((int(x0), int(y0), int(x0) + clump.width, int(y0) + clump.height)))
        name = f'clump-{n:02d}'
        clump.save(OUT / f'{name}.png')
        cx, cy = OX + x0 + clump.width / 2, OY + y0 + clump.height / 2
        at = T_TEAR + 0.12 * n + rng.uniform(0, 0.08)
        place(name, cx, cy, enter_at=T_TEAR, enter_from='none', enter_duration=0.01, shadow=shadow,
              moves=[{'at': at, 'x': cx + rng.uniform(-260, 520), 'y': -260, 'rotation': rng.uniform(-40, 40),
                      'duration': rng.uniform(0.55, 0.8), 'ease': 'in'}])
        n += 1

place('marks', OX + mb[0] + (mb[2] - mb[0]) / 2, OY + mb[1] + (mb[3] - mb[1]) / 2, enter_at=T_TEAR,
      enter_from='none', enter_duration=0.01)

scene = {
    'canvas': {'width': W, 'height': H, 'fps': 24, 'background_hex': '#0B0B0B', 'grain': 0.03},
    'cadence': {'hold_frames': 2, 'jitter_px': 1.5, 'jitter_deg': 0.4, 'seed': 23},
    'duration': END,
    'elements': elements,
    'label': {'text': 'ONLY THE INSTRUCTIONS.', 'font_family': 'Anton', 'size': 92, 'color': '#F2EEE6',
              'tracking': 3, 'x': W / 2, 'align': 'center', 'y': OY + PAGE_H + 60, 'enter_at': T_LABEL},
}
(HERE / 'scene.json').write_text(json.dumps(scene, indent='\t') + '\n')
print('wrote', len(elements), 'elements,', len(lines), 'lines,', n, 'clumps')
