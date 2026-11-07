export const alt =
	'Two failure modes behind falling clicks, told apart by position. Failure mode 1: position and impressions up, clicks flat or down, the AI Overview signature. The fix is GEO and CTR work: FAQ schema, quotable definitions, structured data, and title and meta rewrites. Failure mode 2: position and clicks both down, a quality or authority problem. The fix is content quality, internal links, redirect cleanup and backlinks. Most SEO recovery advice only covers failure mode 2.';

const MODE_1 = ['impressions up, clicks flat', 'AI Overviews take the click'];
const MODE_2 = ['position and clicks both down', 'a quality or authority problem'];
const FIX_1 = ['FAQ schema, structured data,', 'quotable definitions,', 'title + meta rewrites'];
const FIX_2 = ['content quality, internal links,', 'redirect cleanup, backlinks'];

const mode = (f, x, y, w, label, sub) =>
	f.box({ x, y, w, h: 82, kind: 'chalk', label, sub, size: 16, subSize: 14 });
const fix = (f, x, y, w, label, sub) =>
	f.box({ x, y, w, h: 110, kind: 'pink', label, sub, size: 16, subSize: 14 });

export const desktop = {
	height: 520,
	draw(f) {
		f.pill({ x: 230, y: 24, w: 180, h: 42, label: 'Clicks down' });
		f.arrow([
			[320, 68],
			[320, 94],
		]);
		f.diamond({ cx: 320, cy: 140, w: 220, h: 88, label: 'Position?' });

		// Left: ranking up
		f.arrow([
			[210, 140],
			[160, 140],
			[160, 196],
		]);
		f.note(172, 128, 'up', { anchor: 'end' });
		mode(f, 24, 200, 272, 'Failure mode 1', MODE_1);
		f.arrow([
			[160, 284],
			[160, 318],
		]);
		fix(f, 24, 322, 272, 'GEO + CTR work', FIX_1);

		// Right: ranking down
		f.arrow([
			[430, 140],
			[480, 140],
			[480, 196],
		]);
		f.note(468, 128, 'down');
		mode(f, 344, 200, 272, 'Failure mode 2', MODE_2);
		f.arrow([
			[480, 284],
			[480, 318],
		]);
		fix(f, 344, 322, 272, 'Quality + authority work', FIX_2);

		// Callout: what most advice covers
		f.note(330, 478, 'Most recovery advice', { size: 15 });
		f.note(330, 498, 'only covers this one.', { size: 15 });
		f.crayonArrow([500, 480], [540, 442], 14);
	},
};

export const phone = {
	height: 800,
	draw(f) {
		const x = 20;
		const w = 320;
		f.pill({ x: 95, y: 24, w: 170, h: 40, label: 'Clicks down' });
		f.arrow([
			[180, 66],
			[180, 88],
		]);
		f.diamond({ cx: 180, cy: 132, w: 200, h: 84, label: 'Position?' });
		f.arrow([
			[180, 174],
			[180, 206],
		]);
		f.note(192, 194, 'up');
		mode(f, x, 210, w, 'Failure mode 1', MODE_1);
		f.arrow([
			[180, 294],
			[180, 318],
		]);
		fix(f, x, 322, w, 'GEO + CTR work', FIX_1);

		// Down: route along the right edge to the second column of boxes
		f.arrow([
			[280, 132],
			[350, 132],
			[350, 452],
			[180, 452],
			[180, 486],
		]);
		f.note(292, 120, 'down');
		mode(f, x, 490, w, 'Failure mode 2', MODE_2);
		f.arrow([
			[180, 574],
			[180, 598],
		]);
		fix(f, x, 602, w, 'Quality + authority work', FIX_2);
		f.note(20, 740, 'Most recovery advice only', { size: 15 });
		f.note(20, 762, 'covers this one.', { size: 15 });
		f.crayonArrow([214, 744], [262, 718], -20);
	},
};
