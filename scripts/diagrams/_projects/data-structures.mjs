// The Data Structures project's card (src/data/projects.ts): three of the structures
// the repo implements, drawn 16:9 for a card and boiled by scripts/boiling-thumbnail.mjs.
//   node scripts/diagrams/_projects/data-structures.mjs <out.svg>
import { writeFileSync } from 'node:fs';
import { createFigure } from '../draw.mjs';

const WIDTH = 640;
const HEIGHT = 360;
const PANEL = { y: 40, w: 192, h: 304 };
const COLUMNS = [16, 224, 432];

const f = createFigure({ id: 'project-data-structures', width: WIDTH, height: HEIGHT });

// A linked list: each node points at the next, the last at nothing
{
	const x = COLUMNS[0];
	f.group({ x, y: PANEL.y, w: PANEL.w, h: PANEL.h, label: 'Linked list' });
	const values = ['head 3', '7', '1'];
	values.forEach((label, i) => {
		const y = 70 + i * 78;
		f.box({
			x: x + 36,
			y,
			w: 120,
			h: 44,
			kind: i === 0 ? 'pink' : 'chalk',
			label,
			font: 'mono',
			size: 17,
		});
		f.arrow([
			[x + 96, y + 46],
			[x + 96, y + 76],
		]);
	});
	f.text(x + 96, 318, 'null', { font: 'mono', size: 16, color: '#a3a3a3' });
}

// A binary search tree: smaller to the left, bigger to the right
{
	const x = COLUMNS[1];
	f.group({ x, y: PANEL.y, w: PANEL.w, h: PANEL.h, label: 'Binary tree' });
	const node = (cx, cy, label, kind = 'chalk') =>
		f.box({ x: cx - 21, y: cy - 21, w: 42, h: 42, kind, label, font: 'mono', size: 17 });
	const root = [x + 96, 100];
	const kids = [
		[x + 50, 190],
		[x + 142, 190],
	];
	const leaves = [
		[x + 26, 280],
		[x + 74, 280],
		[x + 118, 280],
		[x + 166, 280],
	];
	node(...root, '8', 'pink');
	node(...kids[0], '3');
	node(...kids[1], '10');
	['1', '6', '9', '14'].forEach((label, i) => node(...leaves[i], label));
	kids.forEach(([cx, cy]) =>
		f.arrow([
			[root[0] + (cx < root[0] ? -14 : 14), root[1] + 22],
			[cx, cy - 23],
		]),
	);
	leaves.forEach(([cx, cy], i) => {
		const [px, py] = kids[i < 2 ? 0 : 1];
		f.arrow([
			[px + (cx < px ? -10 : 10), py + 22],
			[cx, cy - 23],
		]);
	});
}

// A stack: last in, first out
{
	const x = COLUMNS[2];
	f.group({ x, y: PANEL.y, w: PANEL.w, h: PANEL.h, label: 'Stack' });
	['push(5)', '2', '9', '4'].forEach((label, i) => {
		const y = 134 + i * 50;
		f.box({
			x: x + 46,
			y,
			w: 100,
			h: 42,
			kind: i === 0 ? 'pink' : 'chalk',
			label,
			font: 'mono',
			size: 17,
		});
	});
	f.arrow([
		[x + 96, 78],
		[x + 96, 128],
	]);
}

const svg = f.toString(
	'Three data structures: a linked list of 3, 7 and 1 ending in null, a binary search tree with 8 at the root, and a stack with 5 being pushed on top',
);
if (f.issues.length) {
	console.error(f.issues.join('\n'));
	process.exit(1);
}
writeFileSync(process.argv[2], svg);
console.log(`Wrote ${process.argv[2]}`);
