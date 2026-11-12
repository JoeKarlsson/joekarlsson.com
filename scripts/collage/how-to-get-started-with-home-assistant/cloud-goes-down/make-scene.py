"""Draws the paper pieces of the "still on" scene and writes scene.json.

Joe's R730 (where his Home Assistant VM runs) lands, a lamp stands on it, a paper cloud lands
with a cord down to the lamp, the lamp comes on, then the cloud tips and falls out of frame,
snapping the cord. The lamp stays lit. The last frame (server, lit lamp, cord stub, label) is
the still.

    python3 make-scene.py

Draws cloud.png, cord-top.png, cord-stub.png and lamp-on.png (lamp.png with its shade in yellow).
"""
import json, math, random
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageFilter

HERE = Path(__file__).parent
OUT = HERE / 'elements'
W, H, KEY = 1920, 1080, 6
PAPER, INK, YELLOW = (236, 233, 226), (22, 22, 22), (255, 216, 79)
KEYLINE = (244, 241, 234)  # cutout.mjs's keyline color
rng = random.Random(3)


def keylined(mask, fill):
    """A paper piece from a mask: fill with grain, a white keyline grown around it."""
    pad = KEY + 2
    mask = mask.crop(mask.getbbox())
    big = Image.new('L', (mask.width + 2 * pad, mask.height + 2 * pad), 0)
    big.paste(mask, (pad, pad))
    img = Image.new('RGBA', big.size, (0, 0, 0, 0))
    img.paste((255, 255, 255, 255), (0, 0), big.filter(ImageFilter.MaxFilter(2 * KEY + 1)))
    grain = Image.effect_noise(big.size, 10).convert('L')
    face = Image.merge('RGBA', [grain.point(lambda v, c=c: max(0, min(255, c - 8 + v // 16))) for c in fill] + [big])
    img.alpha_composite(face)
    return img


def torn_edge(mask):
    """Roughen a mask's edge like torn paper: blur it, add noise, threshold."""
    soft = mask.filter(ImageFilter.GaussianBlur(7))
    noise = Image.effect_noise(mask.size, 140).convert('L').filter(ImageFilter.GaussianBlur(2.2))
    return ImageChops.add(soft, noise, scale=1, offset=-128).point(lambda v: 255 if v > 127 else 0)


OUT.mkdir(exist_ok=True)

# The cloud: overlapping puffs on a flat base, torn out of grey-white paper.
cm = Image.new('L', (640, 320), 0)
d = ImageDraw.Draw(cm)
for cx, cy, r in [(150, 200, 95), (265, 140, 120), (395, 125, 110), (500, 190, 90), (330, 215, 100)]:
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=255)
d.rectangle((70, 210, 575, 290), fill=255)
d.ellipse((40, 205, 140, 290), fill=255)
d.ellipse((520, 200, 610, 290), fill=255)
cloud = keylined(torn_edge(cm), PAPER)
cloud.save(OUT / 'cloud.png')

# The cord: one hanging curve from under the cloud to the lamp's foot, split where it snaps.
A, C, B = (1395, 300), (1250, 860), (1012, 722)
pts = [((1 - t) ** 2 * A[0] + 2 * (1 - t) * t * C[0] + t * t * B[0],
        (1 - t) ** 2 * A[1] + 2 * (1 - t) * t * C[1] + t * t * B[1]) for t in [i / 80 for i in range(81)]]
SNAP = 44  # the point the cord breaks at
cords = {}
for name, seg in (('cord-top', pts[:SNAP + 1]), ('cord-stub', pts[SNAP:])):
    m = Image.new('L', (W, H), 0)
    ImageDraw.Draw(m).line(seg, fill=255, width=13, joint='curve')
    # a frayed end at the break
    bx, by = pts[SNAP]
    ImageDraw.Draw(m).polygon([(bx + rng.randint(-10, 10), by + rng.randint(-10, 10)) for _ in range(5)], fill=255)
    box = m.getbbox()
    piece = keylined(m, INK)
    piece.save(OUT / f'{name}.png')
    cords[name] = ((box[0] + box[2]) / 2, (box[1] + box[3]) / 2)

# The lamp, lit: the shade (rows above where the lamp narrows to its stem) toned yellow.
lamp = Image.open(OUT / 'lamp.png').convert('RGBA')
alpha = lamp.getchannel('A')
widths = [sum(1 for x in range(lamp.width) if alpha.getpixel((x, y)) > 0) for y in range(lamp.height)]
shade_end = next(y for y in range(int(lamp.height * 0.15), lamp.height) if widths[y] < max(widths) * 0.3)
lit = lamp.copy()
px = lit.load()
for y in range(shade_end):
    for x in range(lit.width):
        r, g, b, a = px[x, y]
        if a and (r, g, b) != KEYLINE:
            v = 0.62 + 0.38 * r / 255  # keep the shade's folds, but lit
            px[x, y] = (round(YELLOW[0] * v), round(YELLOW[1] * v), round(YELLOW[2] * v), a)
lit.save(OUT / 'lamp-on.png')

T_SERVER, T_LAMP, T_CLOUD, T_CORD, T_ON, FALL, T_LABEL, END = 0.3, 0.9, 1.5, 2.15, 2.75, 3.6, 4.9, 7.0
OFF = 2400
shadow = {'dx': 10, 'dy': 12, 'blur': 12, 'opacity': 0.5}
LAMP = {'x': 960, 'y': 462, 'scale': 0.4}
elements = [
    {'image': 'elements/server.png', 'x': 960, 'y': 858, 'enter_at': T_SERVER, 'enter_from': 'bottom',
     'enter_duration': 0.6, 'shadow': shadow},
    {'image': 'elements/lamp.png', **LAMP, 'enter_at': T_LAMP, 'enter_from': 'top', 'enter_duration': 0.55,
     'shadow': shadow, 'moves': [{'at': T_ON, 'y': -OFF, 'duration': 0.01}]},
    {'image': 'elements/lamp-on.png', **LAMP, 'enter_at': T_ON, 'enter_from': 'none', 'enter_duration': 0.01,
     'shadow': shadow},
]
cx, cy = cords['cord-stub']
elements.append({'image': 'elements/cord-stub.png', 'x': round(cx), 'y': round(cy), 'enter_at': T_CORD,
                 'enter_from': 'none', 'enter_duration': 0.01, 'shadow': shadow,
                 # the jolt when the top half tears away
                 'moves': [{'at': FALL + 0.3, 'y': round(cy) + 10, 'rotation': -3, 'duration': 0.25, 'ease': 'out'},
                           {'at': FALL + 0.55, 'y': round(cy) + 6, 'rotation': -1.5, 'duration': 0.4}]})
cx, cy = cords['cord-top']
elements.append({'image': 'elements/cord-top.png', 'x': round(cx), 'y': round(cy), 'enter_at': T_CORD,
                 'enter_from': 'none', 'enter_duration': 0.01, 'shadow': shadow,
                 'moves': [{'at': FALL + 0.3, 'x': round(cx) + 650, 'y': H + 600, 'rotation': 35, 'duration': 0.8, 'ease': 'in'}]})
elements.append({'image': 'elements/cloud.png', 'x': 1480, 'y': 200, 'rotation': 2, 'enter_at': T_CLOUD,
                 'enter_from': 'right', 'enter_duration': 0.6, 'shadow': shadow,
                 'moves': [{'at': FALL, 'rotation': 16, 'y': 215, 'duration': 0.3, 'ease': 'out'},
                           {'at': FALL + 0.3, 'x': W + 500, 'y': H + 500, 'rotation': 45, 'duration': 0.8, 'ease': 'in'}]})

scene = {
    'canvas': {'width': W, 'height': H, 'fps': 24, 'background_hex': '#1F2E6E', 'grain': 0.05},
    'cadence': {'hold_frames': 2, 'jitter_px': 1.5, 'jitter_deg': 0.4, 'seed': 23},
    'duration': END,
    'elements': elements,
    'label': {'text': 'STILL ON.', 'font_family': 'Anton', 'size': 116, 'color': '#F2EDE4', 'tracking': 4,
              'x': W / 2, 'y': 34, 'enter_at': T_LABEL, 'align': 'center'},
}
(HERE / 'scene.json').write_text(json.dumps(scene, indent='\t') + '\n')
print('wrote', len(elements), 'elements; shade ends at row', shade_end, 'of', lamp.height)
