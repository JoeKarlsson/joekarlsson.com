"""Draws the pieces of the no-one-will-look scene and writes scene.json.

Ginevra de' Benci lands as a black-and-white print. A magnifier slides over the juniper behind
her and the glass fills with Leonardo's needles in color, the care no one was meant to see.
Then a page of linger's code lands, a black box drops over it, and a second magnifier slides
up over the box and finds only black. It ends on both lenses and the label, the still phones
and reduced motion get.

    python3 make-scene.py <Ginevra jpg> <JetBrains Mono font>

elements/lens.png comes first, from scripts/collage/cutout.mjs (see sources.json).
"""
import json, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageEnhance, ImageFont, ImageOps

HERE = Path(__file__).parent
OUT = HERE / 'elements'
PAPER, KEY = (244, 241, 234), 6
W, H = 1920, 1080

ginevra = Image.open(sys.argv[1]).convert('RGB')
# NEEDLES below is in this download's pixels
assert ginevra.width == 3840, 'pass the 3840 px Commons download (sources.json)'
mono_font = ImageFont.truetype(sys.argv[2], 21)


def mono(img):
    """The cutout.mjs mono tone: grey, contrast up a quarter around the middle."""
    return ImageOps.grayscale(img).point(lambda g: max(0, min(255, round((g - 128) * 1.25 + 128)))).convert('RGB')


def print_of(img):
    """A rectangular print with the paper keyline the cut pieces get."""
    out = Image.new('RGB', (img.width + 2 * KEY, img.height + 2 * KEY), PAPER)
    out.paste(img, (KEY, KEY))
    return out


# Ginevra as a print, 620 wide
PRINT_W = 620
scale = PRINT_W / ginevra.width
print_img = print_of(mono(ginevra.resize((PRINT_W, round(ginevra.height * scale)), Image.LANCZOS)))
print_img.save(OUT / 'ginevra.png')

# The magnifier, 280 wide; its glass is a white disc in the cut
lens = Image.open(OUT / 'lens.png').convert('RGBA')
LENS_W = 280
lens = lens.resize((LENS_W, round(lens.height * LENS_W / lens.width)), Image.LANCZOS)
# Measured on the cut as fractions of its width, so they hold at any --width
GLASS = (LENS_W / 2, 262 / 532 * LENS_W)  # glass centre
GLASS_R = round(232 / 532 * LENS_W)


def lens_with(fill):
    out = lens.copy()
    disc = Image.new('L', (GLASS_R * 2, GLASS_R * 2), 0)
    ImageDraw.Draw(disc).ellipse((0, 0, GLASS_R * 2 - 1, GLASS_R * 2 - 1), fill=255)
    out.paste(fill.resize((GLASS_R * 2, GLASS_R * 2), Image.LANCZOS), (round(GLASS[0] - GLASS_R), round(GLASS[1] - GLASS_R)), disc)
    return out


# Where the glass sits over the print: the juniper beside her right cheek (source pixels)
NEEDLES = (560, 700, 1200, 1340)
lens.save(OUT / 'lens-glass.png')
# Brightened, as if the glass catches the light: at post size Leonardo's dark bush reads as mud
needles = ImageEnhance.Color(ImageEnhance.Brightness(ginevra.crop(NEEDLES)).enhance(1.9)).enhance(1.3)
lens_with(needles).save(OUT / 'lens-needles.png')
lens_with(Image.new('RGB', (8, 8), (12, 12, 12))).save(OUT / 'lens-dark.png')

# A printed page of linger's poem script (github.com/JoeKarlsson/linger, poem.html)
CODE = '''// Tuning, in pixels per second and seconds of stillness.
const FAST = 700;      // above this you are skimming
const STILL = 60;      // below this a line gathers time
const PAUSE_AT = 1.2;  // ^ words bloom
const LINGER_AT = 3.6; // ~ words bloom
const DRAIN = 4;       // skimming drains time faster

const NUMERALS = ["I", "II", "III", "IV", "V", "VI"];
const slug = new URLSearchParams(location.search)
  .get("p");
const index = Math.max(0,
  POEMS.findIndex(p => p.slug === slug));
const poem = POEMS[index];
const next = POEMS[(index + 1) % POEMS.length];

poem.stanzas.forEach((stanza, i) => {
  const section = document.createElement("section");
  section.className = "stanza wrap";
  stanza.forEach(text => {
    const p = document.createElement("p");
    p.className = "line";
    p.dataset.level = "0";
    lines.push({ el: p, dwell: 0, level: 0 });
  });
});'''.split('\n')
# Drawn at the type's natural size, then scaled to the page width
PAGE_W, MARGIN, LINE = 500, 34, 28
natural_w = round(max(mono_font.getlength(l) for l in CODE) + 2 * MARGIN)
natural_h = round(natural_w * 1.3)  # a portrait page
page = Image.new('RGB', (natural_w, natural_h), (250, 249, 245))
draw = ImageDraw.Draw(page)
for i, line in enumerate(CODE):
    draw.text((MARGIN, MARGIN + i * LINE), line, font=mono_font, fill=(25, 25, 25))
page = page.resize((PAGE_W, round(natural_h * PAGE_W / natural_w)), Image.LANCZOS)
PAGE_H = page.height
print_of(page).save(OUT / 'code.png')

# The box: black card stock, a little bigger than the page
print_of(Image.new('RGB', (PAGE_W + 50, PAGE_H + 50), (12, 12, 12))).save(OUT / 'box.png')

# Layout (x, y are centres)
PRINT_C = (620, 440)
PAGE_C = (1310, 440)
top_left = (PRINT_C[0] - print_img.width / 2, PRINT_C[1] - print_img.height / 2)
juniper = (top_left[0] + KEY + (NEEDLES[0] + NEEDLES[2]) / 2 * scale,
           top_left[1] + KEY + (NEEDLES[1] + NEEDLES[3]) / 2 * scale)
glass_to_centre = lens.height / 2 - GLASS[1]
over_juniper = (round(juniper[0]), round(juniper[1] + glass_to_centre))
over_box = (PAGE_C[0], round(PAGE_C[1] - 40 + glass_to_centre))
HIDE = 2600
LOW = {'dx': 6, 'dy': 7, 'blur': 9, 'opacity': 0.28}
HIGH = {'dx': 12, 'dy': 14, 'blur': 16, 'opacity': 0.3}


def piece(image, at, enter_at, enter_from, duration, shadow, moves=None, rotation=0):
    p = {'image': f'elements/{image}', 'x': at[0], 'y': at[1], 'enter_at': enter_at,
         'enter_from': enter_from, 'enter_duration': duration, 'shadow': shadow}
    if rotation:
        p['rotation'] = rotation
    if moves:
        p['moves'] = moves
    return p


def hide(at):
    return {'at': at, 'y': HIDE, 'duration': 0.01}


SWAP = 2.1
scene = {
    'canvas': {'width': W, 'height': H, 'fps': 24, 'background_hex': '#FF4FD8', 'grain': 0.04},
    'cadence': {'hold_frames': 2, 'jitter_px': 1.5, 'jitter_deg': 0.4, 'seed': 23},
    'duration': 9.6,
    'elements': [
        piece('ginevra.png', PRINT_C, 0.3, 'left', 0.7, LOW, rotation=-1.5),
        piece('code.png', PAGE_C, 3.1, 'right', 0.6, LOW, rotation=1.2),
        # Heavy: it falls and slams (ease in, no bounce that would show the page again), after the
        # page has had a moment to be read. Starts above the canvas, rotated corners included.
        piece('box.png', (PAGE_C[0], -380), 4.6, 'none', 0.01, LOW, rotation=1.2,
              moves=[{'at': 4.6, 'y': PAGE_C[1], 'duration': 0.5, 'ease': 'in'}]),
        # The plain glass lands and gives way to the needles, which stay: the still (phones,
        # reduced motion) has to show the colour next to the black
        piece('lens-glass.png', over_juniper, 1.2, 'bottom', 0.6, HIGH, rotation=-8, moves=[hide(SWAP)]),
        piece('lens-needles.png', over_juniper, SWAP, 'none', 0.01, HIGH, rotation=-8),
        piece('lens-dark.png', over_box, 5.6, 'bottom', 0.7, HIGH, rotation=6),
    ],
    # Ink, not cream: cream on this pink is 2.47:1
    'label': {'text': 'NO ONE WILL LOOK.', 'font_family': 'Anton', 'size': 92, 'color': '#0B0B0B',
              'tracking': 3, 'x': 960.0, 'align': 'center', 'y': 900, 'enter_at': 6.9},
}
(HERE / 'scene.json').write_text(json.dumps(scene, indent='\t') + '\n')
print('juniper', juniper, 'lens over juniper', over_juniper, 'over box', over_box)
