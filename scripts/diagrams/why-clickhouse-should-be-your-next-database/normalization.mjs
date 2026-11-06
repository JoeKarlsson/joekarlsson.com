export const alt =
	'Normalization versus denormalization, using a student’s grades. Normalized (OLTP): the student links to separate rows for each subject, Science B, English A, History B and Maths C, which suits looking up one grade. Denormalized (OLAP): all the grades sit together on one report card, History B, Maths C, English A and Science B, which suits analyzing many grades at once, the way ClickHouse works.';

const GRADES = [
	['Science', 'B'],
	['English', 'A'],
	['History', 'B'],
	['Maths', 'C'],
];

function normalized(f, { x, y, w }) {
	f.group({ x, y, w, h: 260, label: 'Normalized, OLTP' });
	const cx = x + w / 2;
	f.box({ x: cx - 70, y: y + 18, w: 140, h: 52, label: 'Student', icon: 'user', size: 14 });
	const cw = (w - 24 - 8) / 2;
	GRADES.forEach(([subject, grade], i) => {
		const bx = x + 12 + (i % 2) * (cw + 8);
		const by = y + 110 + Math.floor(i / 2) * 70;
		f.box({ x: bx, y: by, w: cw, h: 56, label: subject, sub: grade, size: 14, subSize: 14 });
	});
	f.arrow(
		[
			[cx, y + 72],
			[cx, y + 92],
			[x + 12 + cw / 2, y + 92],
			[x + 12 + cw / 2, y + 108],
		],
		{ heads: 'none' },
	);
	f.arrow(
		[
			[cx, y + 92],
			[x + 20 + cw * 1.5, y + 92],
			[x + 20 + cw * 1.5, y + 108],
		],
		{ heads: 'none' },
	);
}

function denormalized(f, { x, y, w }) {
	f.group({ x, y, w, h: 260, label: 'Denormalized, OLAP' });
	f.box({ x: x + 12, y: y + 18, w: w - 24, h: 226, kind: 'chalk' });
	f.text(x + 28, y + 42, 'Report card', {
		font: 'display',
		size: 18,
		anchor: 'start',
		upper: true,
		color: '#000000',
	});
	GRADES.forEach(([subject, grade], i) => {
		const ry = y + 82 + i * 40;
		f.text(x + 28, ry, subject, { size: 15, anchor: 'start', weight: 700, color: '#000000' });
		f.text(x + w - 30, ry, grade, { font: 'display', size: 20, anchor: 'end', color: '#000000' });
	});
}

export const desktop = {
	height: 340,
	draw(f) {
		normalized(f, { x: 16, y: 40, w: 296 });
		denormalized(f, { x: 328, y: 40, w: 296 });
		f.note(
			16,
			326,
			'Look up one grade: normalized. Analyze every grade: denormalized, like ClickHouse.',
			{ size: 13 },
		);
	},
};

export const phone = {
	height: 660,
	draw(f) {
		normalized(f, { x: 8, y: 40, w: 344 });
		denormalized(f, { x: 8, y: 350, w: 344 });
		f.note(8, 638, 'Analyzing every grade at once suits ClickHouse.', { size: 13 });
	},
};
