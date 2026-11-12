import { describe, it, expect } from 'vitest';
import { execFileSync } from 'child_process';

// Runs make-meme.py's pool logic on canned API data (no network) and returns what it computed.
const PROBE = `
import importlib.util, json, random
spec = importlib.util.spec_from_file_location("mm", "scripts/make-meme.py")
mm = importlib.util.module_from_spec(spec); spec.loader.exec_module(mm)
memegen = [
    {"id": "drake", "name": "Drakeposting", "lines": 2, "blank": "https://memegen/drake.jpg", "source": "kym/drake"},
    {"id": "grumpycat", "name": "Grumpy Cat", "lines": 2, "blank": "https://memegen/grumpy.jpg"},
    {"id": "exit", "name": "Left Exit 12 Off Ramp", "lines": 3, "blank": "https://memegen/exit.jpg"},
]
imgflip = [
    {"id": "181913649", "name": "Drake Hotline Bling", "box_count": 2, "url": "https://imgflip/drake.jpg"},
    {"id": "131087935", "name": "Running Away Balloon", "box_count": 5, "url": "https://imgflip/balloon.jpg"},
]
pool = mm.merge_pool(memegen, imgflip)
drake = [t for t in pool if t["imgflip"] == "181913649"]
sampled = mm.sample_pool(pool, {"Drake Hotline Bling", "Gru's Plan"}, 99, random.Random(1))
boxes = mm.panel_boxes({"text": [{"anchor_x": 0.1, "anchor_y": 0.2, "scale_x": 0.5, "scale_y": 0.25, "angle": -12.0}]}, 200, 100)
from PIL import Image
stripes = Image.new("L", (40, 40), 230)
for x in range(0, 40, 8): stripes.paste(60, (x, 0, x + 4, 40))
styles = {k: mm.caption_style(im) for k, im in {
    "plain_white": Image.new("RGB", (40, 40), "white"),
    "dark": Image.new("RGB", (40, 40), (30, 30, 30)),
    "busy_light": stripes.convert("RGB"),
}.items()}
print(json.dumps({"size": len(pool), "drake": drake, "sampled": sorted(t["name"] for t in sampled), "boxes": boxes, "styles": styles}))
`;

describe('make-meme template pool', () => {
	const result = JSON.parse(execFileSync('python3', ['-c', PROBE], { encoding: 'utf8' }));

	it('merges a format listed on both sources into one entry: ImgFlip name, memegen image and panels', () => {
		expect(result.size).toBe(4);
		expect(result.drake).toEqual([
			{
				name: 'Drake Hotline Bling',
				image: 'https://memegen/drake.jpg',
				slots: 2,
				memegen: 'drake',
				imgflip: '181913649',
				about: 'kym/drake',
			},
		]);
	});

	it('leaves off-the-table formats out of the sample under any source name, without catching look-alikes', () => {
		// Drakeposting is Drake; Grumpy Cat must not match the "gru" alias for Gru's Plan
		expect(result.sampled).toEqual(['Grumpy Cat', 'Left Exit 12 Off Ramp', 'Running Away Balloon']);
	});

	it("turns memegen's fractional text areas into pixel boxes with their tilt", () => {
		expect(result.boxes).toEqual([[[20, 20, 120, 45], -12]]);
	});

	it('outlines captions in white on dark or busy backgrounds, plain black only on a plain light one', () => {
		expect(result.styles).toEqual({
			plain_white: ['black', false],
			dark: ['white', true],
			busy_light: ['white', true],
		});
	});
});
