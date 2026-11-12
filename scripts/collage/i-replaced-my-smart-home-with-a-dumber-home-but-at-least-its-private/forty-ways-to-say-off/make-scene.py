"""Draws the label-tape strips of the "forty ways to say off" scene and writes scene.json.

Joe's wall switch lands in pink, a label maker lands beside it, and the phrases from the post's
YAML shoot out of it one strip at a time, faster as they pile up, until only a corner of the
switch shows. The tape copies Joe's own label-printer strip (elements/tape-sample.png): pale grey
tape, black sans caps, straight cut ends. The last frame is the still.

    python3 make-scene.py <dir with HankenGrotesk[wght].ttf>

The font is in github.com/google/fonts (ofl/hankengrotesk).
"""
import json, random, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = Path(__file__).parent
OUT = HERE / 'elements'
FONT = ImageFont.truetype(str(Path(sys.argv[1]) / 'HankenGrotesk[wght].ttf'), 52)
FONT.set_variation_by_axes([700])
TAPE, INK, KEY = (207, 203, 195), (17, 17, 17, 255), 5
W, H = 1920, 1080
TAPE_H, PAD = 92, 34
rng = random.Random(9)

# From the post's YAML, in its order; the post says the list continues past forty.
PHRASES = ['kill the lights', 'shut off the lights', 'power down the lights', 'cut the lights',
           'lights out', 'switch off the lights', 'darken the room', 'go dark']


def tape(text):
    text = text.upper()
    w = int(FONT.getlength(text) + 2 * PAD)
    img = Image.new('RGBA', (w + 2 * KEY, TAPE_H + 2 * KEY), (255, 255, 255, 255))
    grain = Image.effect_noise((w, TAPE_H), 8).convert('L')
    face = Image.merge('RGB', [grain.point(lambda v, c=c: max(0, min(255, c - 6 + v // 20))) for c in TAPE])
    img.paste(face, (KEY, KEY))
    d = ImageDraw.Draw(img)
    d.text((KEY + PAD, KEY + TAPE_H / 2), text, font=FONT, fill=INK, anchor='lm')
    return img


OUT.mkdir(exist_ok=True)
for i, p in enumerate(PHRASES):
    tape(p).save(OUT / f'tape-{i + 1}.png')

SWITCH = (980, 570)
MAKER = (500, 690)
NOZZLE = (660, 530)  # where tape leaves the label maker
shadow = {'dx': 10, 'dy': 12, 'blur': 12, 'opacity': 0.4}
tape_shadow = {'dx': 6, 'dy': 8, 'blur': 8, 'opacity': 0.35}
elements = [
    {'image': 'elements/switch.png', 'x': SWITCH[0], 'y': SWITCH[1], 'scale': 0.95, 'enter_at': 0.3,
     'enter_from': 'top', 'enter_duration': 0.6, 'shadow': shadow},
    {'image': 'elements/label-maker.png', 'x': MAKER[0], 'y': MAKER[1], 'scale': 0.62, 'rotation': -10,
     'enter_at': 0.85, 'enter_from': 'left', 'enter_duration': 0.55, 'shadow': shadow},
]
# Where each strip sticks (center, tilt): the switch plate disappears except its top-left corner.
spots = [(1020, 450, -6), (1070, 620, 5), (990, 740, -3), (1170, 370, 8),
         (900, 540, -11), (1050, 830, 4), (1200, 515, -8), (870, 670, 12)]
t = 1.5
gaps = [0.55, 0.45, 0.38, 0.32, 0.27, 0.23, 0.2]
for i, (x, y, rot) in enumerate(spots):
    mid = ((NOZZLE[0] + x) / 2, min(NOZZLE[1], y) - 160)
    elements.append({'image': f'elements/tape-{i + 1}.png', 'x': x, 'y': y, 'rotation': rot,
                     'enter_at': round(t, 2), 'enter_path': [list(NOZZLE), [round(mid[0]), round(mid[1])]],
                     'enter_spin': rng.choice([-14, 10, -8, 16]), 'enter_duration': 0.4, 'shadow': tape_shadow})
    if i < len(gaps):
        t += gaps[i]

scene = {
    'canvas': {'width': W, 'height': H, 'fps': 24, 'background_hex': '#F2EDE4', 'grain': 0.04},
    'cadence': {'hold_frames': 2, 'jitter_px': 1.5, 'jitter_deg': 0.4, 'seed': 31},
    'duration': 6.6,
    'elements': elements,
    'label': {'text': '40 WAYS TO SAY OFF', 'font_family': 'Anton', 'size': 116, 'color': '#0A0A0A',
              'tracking': 4, 'x': W / 2, 'y': 40, 'enter_at': round(t + 0.7, 2), 'align': 'center'},
}
(HERE / 'scene.json').write_text(json.dumps(scene, indent='\t') + '\n')
print('wrote', len(elements), 'elements; last strip at', round(t, 2), 's')
