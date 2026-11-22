import { DESKTOP, PHONE, doc, id } from './_doc.mjs';

export const alt =
	'Many-to-many: in the users collection, Kate Monster\'s user document holds a tasks array of three ObjectIds, each pointing to a task document in the tasks collection. The first task, "Write blog post about MongoDB schema design", holds an owners array of two ObjectIds pointing back to two user documents: Kate Monster and a second user. Each side keeps an array of the other side\'s ids.';

const U2 = [`_id: ${id('0302')}`, '…'];
const kate = (to) => [
	`_id: ${id('0301')}`,
	'name: "Kate Monster"',
	'tasks: [',
	{ chip: id('0401'), to },
	{ chip: id('0402'), to },
	{ chip: id('0403'), to },
	']',
];
const T1 = [
	`_id: ${id('0401')}`,
	'description: "Write…"',
	'owners: [',
	{ chip: id('0301'), to: 'left' },
	{ chip: id('0302'), to: 'left' },
	']',
];
const T2 = [`_id: ${id('0402')}`, '…'];
const T3 = [`_id: ${id('0403')}`, '…'];

export const desktop = {
	height: 440,
	draw(f) {
		const s = DESKTOP;
		f.group({ x: 16, y: 50, w: 250, h: 314, label: 'users' });
		const u2 = doc(f, { x: 26, y: 60, w: 230, rows: U2, s });
		const k = doc(f, { x: 26, y: 140, w: 230, rows: kate('right'), s });
		f.group({ x: 374, y: 50, w: 250, h: 374, label: 'tasks' });
		const t1 = doc(f, { x: 384, y: 70, w: 230, rows: T1, s });
		const t2 = doc(f, { x: 384, y: 262, w: 230, rows: T2, s });
		const t3 = doc(f, { x: 384, y: 346, w: 230, rows: T3, s });
		const [k1, k2, k3] = k.chips;
		f.arrow([
			[k1.edge, k1.y],
			[t1.x - 2, k1.y],
		]);
		f.arrow([
			[k2.edge, k2.y],
			[350, k2.y],
			[350, t2.idY],
			[t2.x - 2, t2.idY],
		]);
		f.arrow([
			[k3.edge, k3.y],
			[320, k3.y],
			[320, t3.idY],
			[t3.x - 2, t3.idY],
		]);
		const [o1, o2] = t1.chips;
		f.arrow([
			[o1.edge, o1.y],
			[k.right + 2, o1.y],
		]);
		f.arrow([
			[o2.edge, o2.y],
			[300, o2.y],
			[300, u2.idY],
			[u2.right + 2, u2.idY],
		]);
	},
};

export const phone = {
	height: 730,
	draw(f) {
		const s = PHONE;
		f.group({ x: 28, y: 40, w: 304, h: 294, label: 'users' });
		const u2 = doc(f, { x: 38, y: 50, w: 284, rows: U2, s });
		const k = doc(f, { x: 38, y: 124, w: 284, rows: kate('right'), s });
		f.group({ x: 28, y: 380, w: 304, h: 336, label: 'tasks' });
		const t1 = doc(f, { x: 38, y: 390, w: 284, rows: T1, s });
		const t2 = doc(f, { x: 38, y: 570, w: 284, rows: T2, s });
		const t3 = doc(f, { x: 38, y: 644, w: 284, rows: T3, s });
		// Task ids run down the right edge, owner ids up the left
		[t1, t2, t3].forEach((t, i) => {
			const chip = k.chips[i];
			f.arrow([
				[chip.edge, chip.y],
				[344, chip.y],
				[344, t.idY],
				[t.right + 2, t.idY],
			]);
		});
		const [o1, o2] = t1.chips;
		f.arrow([
			[o1.edge, o1.y],
			[22, o1.y],
			[22, k.idY],
			[k.x - 2, k.idY],
		]);
		f.arrow([
			[o2.edge, o2.y],
			[12, o2.y],
			[12, u2.idY],
			[u2.x - 2, u2.idY],
		]);
	},
};
