// The DVD Screensaver (Nothing But Corners) project page's How it's made figure
// (src/data/projects.ts): how every bounce is aimed at a corner, from path.js in
// JoeKarlsson/nothing-but-corners
export const alt =
	'How Nothing But Corners aims the logo. Mirror the screen across every wall and a bouncing path becomes a straight line through a grid of screens, where every grid point is a screen corner. The logo aims at a corner up to three screens away, along a step with no common factor so the line passes no other corner on the way. Any path that bounces off a wall within a quarter of the screen of a corner is thrown out, so there are no near misses. Folded back into one screen, each grid line the straight line crossed is a bounce: here, three screens across and two up becomes three bounces that end in the opposite corner.';

const GRID = '#a3a3a3';
const PINK = '#ff4fd8';

const STEPS = [
	{ label: 'Unfold', sub: ['mirror it over', 'every wall'] },
	{ label: 'Aim', sub: ['at a corner up', 'to 3 screens'] },
	{ label: 'Reject', sub: ['bounces within', '¼ of a corner'] },
	{ label: 'Fold back', sub: ['each crossing', 'is a bounce'] },
];

// A path from the bottom-left corner, three screens across and two up
function unfolded(f, x, y, cellW, cellH) {
	for (let c = 0; c <= 3; c++)
		f.line(
			[
				[x + c * cellW, y],
				[x + c * cellW, y + 2 * cellH],
			],
			{ color: GRID },
		);
	for (let r = 0; r <= 2; r++)
		f.line(
			[
				[x, y + r * cellH],
				[x + 3 * cellW, y + r * cellH],
			],
			{ color: GRID },
		);
	const start = [x, y + 2 * cellH];
	const end = [x + 3 * cellW, y];
	f.arrow([start, end]);
	// Where the line crosses a wall: x = 1 and 2 screens, y = 1 screen
	for (const t of [1 / 3, 1 / 2, 2 / 3])
		f.dot(start[0] + (end[0] - start[0]) * t, start[1] + (end[1] - start[1]) * t, 5, PINK);
}

// The same path folded into one screen: right wall, top, left wall, corner
function folded(f, x, y, w, h) {
	f.line(
		[
			[x, y],
			[x + w, y],
			[x + w, y + h],
			[x, y + h],
			[x, y],
		],
		{ color: GRID },
	);
	const bounces = [
		[x + w, y + h / 3],
		[x + w / 2, y],
		[x, y + h / 3],
	];
	f.arrow([[x, y + h], ...bounces, [x + w, y + h]]);
	for (const [bx, by] of bounces) f.dot(bx, by, 5, PINK);
}

export const desktop = {
	height: 420,
	draw(f) {
		f.group({ x: 16, y: 40, w: 368, h: 210, label: 'Unfolded' });
		unfolded(f, 40, 64, 106, 80);
		f.group({ x: 404, y: 40, w: 220, h: 210, label: 'Folded back' });
		folded(f, 434, 74, 160, 106);
		f.note(434, 214, '3 bounces, then a corner');
		f.note(40, 234, '3 screens across, 2 up: one straight line');
		const xs = [16, 176, 336, 496];
		STEPS.forEach((s, i) => {
			f.box({
				x: xs[i],
				y: 300,
				w: 128,
				h: 92,
				kind: i === 2 ? 'pink' : 'chalk',
				size: 17,
				subSize: 13,
				...s,
			});
			if (i)
				f.arrow([
					[xs[i] - 30, 346],
					[xs[i] - 4, 346],
				]);
		});
	},
};

export const phone = {
	height: 830,
	draw(f) {
		f.group({ x: 12, y: 36, w: 336, h: 196, label: 'Unfolded' });
		unfolded(f, 30, 56, 100, 66);
		f.note(30, 210, '3 across, 2 up: one straight line');
		f.group({ x: 12, y: 270, w: 336, h: 180, label: 'Folded back' });
		folded(f, 100, 292, 160, 106);
		f.note(30, 428, '3 bounces, then a corner');
		STEPS.forEach((s, i) => {
			const y = 478 + i * 88;
			f.box({
				x: 30,
				y,
				w: 300,
				h: 66,
				kind: i === 2 ? 'pink' : 'chalk',
				size: 16,
				subSize: 13,
				label: s.label,
				sub: s.sub.join(' '),
			});
			if (i)
				f.arrow([
					[180, y - 20],
					[180, y - 2],
				]);
		});
	},
};
