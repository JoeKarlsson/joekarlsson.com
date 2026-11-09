// The Best Buy Product Locator's card (src/data/projects.ts): it reads the model number off a
// product page, finds the Best Buy stores within 15 miles, picks the nearest and drops a
// pick-it-up-today banner.
//   node scripts/diagrams/_projects/best-buy-product-locator.mjs <output dir>
import { COLORS, createFigure } from '../draw.mjs';
import { CARD, finish, outDirFromArgs, writeFrames } from './write-frames.mjs';

// The card is graded black-to-pink (scripts/boiling-thumbnail.mjs): chalk is the brightest
const NOW = COLORS.chalk;
const BEFORE = COLORS.muted;
const YOU = { x: 470, y: 176 };
const RADIUS = 108;
// Twin Cities Big Box stores around "you", the nearest first; Richfield is the screenshot's
const STORES = [
	{ name: 'Richfield', dx: -30, dy: 46 },
	{ name: 'St. Louis Park', dx: -86, dy: -30 },
	{ name: 'Roseville', dx: 44, dy: -78 },
	{ name: 'Maplewood', dx: 84, dy: -4 },
];

function circle(cx, cy, r) {
	return [...Array(49).keys()].map((i) => {
		const a = (i / 48) * Math.PI * 2;
		return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
	});
}

// step 0: the page; 1: model number read; 2: stores within 15 miles; 3: nearest picked; 4: banner
function drawFrame(step) {
	const f = createFigure({ id: 'project-best-buy', ...CARD });
	f.group({ x: 20, y: 40, w: 270, h: 216, label: 'Product page' });
	f.logo('tv', 40, 96, 44, 'ink');
	f.text(96, 96, 'Sony 48" TV', { size: 22, anchor: 'start', weight: 700 });
	f.note(40, 150, 'Ships in 2 days', { size: 17 });
	f.text(40, 196, 'Model no.', {
		font: 'mono',
		size: 18,
		anchor: 'start',
		color: step === 1 ? NOW : BEFORE,
		weight: step === 1 ? 700 : 400,
	});
	f.text(40, 226, '████████', {
		font: 'mono',
		size: 18,
		anchor: 'start',
		color: step === 1 ? NOW : '#4a4a4a',
	});
	if (step >= 2) {
		f.line(circle(YOU.x, YOU.y, RADIUS), { color: BEFORE, width: 2 });
		f.note(YOU.x - 46, YOU.y - RADIUS - 16, '15 miles', { size: 15 });
	}
	f.dot(YOU.x, YOU.y, 7, NOW);
	f.note(YOU.x + 12, YOU.y + 2, 'you', { size: 15 });
	if (step >= 2)
		STORES.forEach((store, i) => {
			const picked = i === 0 && step >= 3;
			f.dot(YOU.x + store.dx, YOU.y + store.dy, picked ? 10 : 6, picked ? NOW : COLORS.paper);
			if (picked)
				f.text(YOU.x + store.dx - 16, YOU.y + store.dy + 2, store.name, {
					size: 17,
					anchor: 'end',
					weight: 700,
					color: NOW,
				});
		});
	if (step >= 4)
		f.box({
			x: 20,
			y: 290,
			w: 600,
			h: 56,
			kind: 'chalk',
			label: 'Pick it up today at Best Buy Richfield · $449.99',
			size: 20,
		});
	return finish(
		f,
		step >= 4
			? 'The Best Buy Product Locator: it reads a TV’s model number off the page, finds Best Buy stores within 15 miles and offers pickup today at the nearest'
			: 'The Best Buy Product Locator looking up a TV at nearby Best Buy stores',
	);
}

const frames = [];
for (let step = 0; step <= 4; step++) frames.push(drawFrame(step));
writeFrames(outDirFromArgs('scripts/diagrams/_projects/best-buy-product-locator.mjs'), frames);
