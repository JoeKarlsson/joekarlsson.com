// The Digital Graffiti Wall's card (src/data/projects.ts): the 32x32 LED wall lighting up
// as people in the audience draw on their phones.
//   node scripts/diagrams/_projects/digital-graffiti-wall.mjs <output dir>
import { COLORS, createFigure } from '../draw.mjs';
import { CARD, finish, outDirFromArgs, writeFrames } from './write-frames.mjs';

const GRID = 32;
const PITCH = 9;
// The first LED's centre
const LEFT = 28;
const TOP = 54;
// The card is graded black-to-pink (scripts/boiling-thumbnail.mjs): chalk is the brightest
const LIT = COLORS.chalk;
const DARK = '#5a5a5a';

// What people draw, as strokes in drawing order on a 16x16 grid of [column, row]; each of
// those is a 2x2 block of LEDs, so the drawings read at card size
const range = (from, to) => [...Array(to - from + 1).keys()].map((i) => from + i);
const heart = [
	[4, 2],
	[3, 1],
	[2, 1],
	[1, 2],
	[1, 3],
	[2, 4],
	[3, 5],
	[4, 6],
	[5, 5],
	[6, 4],
	[7, 3],
	[7, 2],
	[6, 1],
	[5, 1],
];
const smile = [
	[10, 2],
	[10, 3],
	[13, 2],
	[13, 3],
	[9, 5],
	[10, 6],
	[11, 6],
	[12, 6],
	[13, 6],
	[14, 5],
];
// HI, in block letters
const word = [
	...range(9, 14).map((r) => [1, r]),
	[2, 11],
	[3, 11],
	...range(9, 14).map((r) => [4, r]),
	...range(9, 14).map((r) => [6, r]),
];
const squiggle = range(8, 15).map((c, i) => [c, 11 + Math.round(1.5 * Math.sin(i / 1.3))]);
const STROKES = [heart, smile, word, squiggle].map((stroke) =>
	stroke.flatMap(([c, r]) => [
		[c * 2, r * 2],
		[c * 2 + 1, r * 2],
		[c * 2, r * 2 + 1],
		[c * 2 + 1, r * 2 + 1],
	]),
);
const STEPS = 8;

function drawFrame(step) {
	const f = createFigure({ id: 'project-graffiti', ...CARD });
	f.group({ x: 12, y: 38, w: GRID * PITCH + 24, h: GRID * PITCH + 24, label: 'LED wall' });
	// Each stroke is drawn over two steps, the strokes overlapping like people drawing at once
	const lit = new Set();
	const newest = new Set();
	STROKES.forEach((stroke, s) => {
		const start = s * 1.5;
		const done = Math.max(0, Math.min(1, (step - start) / 2));
		const count = Math.round(stroke.length * done);
		const before = Math.round(stroke.length * Math.max(0, Math.min(1, (step - 1 - start) / 2)));
		stroke.slice(0, count).forEach(([c, r], i) => {
			lit.add(r * GRID + c);
			if (i >= before) newest.add(r * GRID + c);
		});
	});
	for (let r = 0; r < GRID; r++)
		for (let c = 0; c < GRID; c++) {
			const on = lit.has(r * GRID + c);
			f.dot(
				LEFT + c * PITCH,
				TOP + r * PITCH,
				on ? 4.2 : 2.4,
				on ? (newest.has(r * GRID + c) ? LIT : COLORS.paper) : DARK,
			);
		}
	f.text(388, 92, 'Live', { font: 'display', size: 44, anchor: 'start', upper: true, color: LIT });
	f.text(388, 156, `${lit.size} / 1,024`, { font: 'mono', size: 34, anchor: 'start', color: LIT });
	f.note(388, 192, 'pixels drawn', { size: 17 });
	f.note(388, 290, 'Phones in the audience', { size: 17 });
	f.note(388, 314, 'MongoDB Realm sync', { size: 17 });
	return finish(f, `A 32 by 32 LED wall lighting up as people draw on it: ${lit.size} pixels lit`);
}

const frames = [];
for (let step = 0; step <= STEPS; step++) frames.push(drawFrame(step));
writeFrames(outDirFromArgs('scripts/diagrams/_projects/digital-graffiti-wall.mjs'), frames);
