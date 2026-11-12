// One 8.47 GB insert against four of about 2.1 GB: each reads a quarter, total time holds.
export const alt =
	'Bar chart of data read per insert. One insert read 8.47 GB in 22.6 seconds. Split into four by UUID range, each read about a quarter: 2.13 GB in 5.9 s, 2.14 GB in 6.0 s, 2.15 GB in 5.8 s and 2.13 GB in 5.6 s, 23.2 seconds in total run one after another.';

const bars = [
	{ label: ['One insert', '22.6 s'], value: 8.47 },
	{ label: ['Split 1', '5.9 s'], value: 2.13, highlight: true },
	{ label: ['Split 2', '6.0 s'], value: 2.14, highlight: true },
	{ label: ['Split 3', '5.8 s'], value: 2.15, highlight: true },
	{ label: ['Split 4', '5.6 s'], value: 2.13, highlight: true },
];
const format = (v) => `${v} GB`;

export const desktop = {
	height: 320,
	draw(f) {
		f.note(16, 20, 'GB read per insert, and how long it took. 22.6 s in one, 23.2 s in four.', {
			size: 14,
		});
		f.barChart({ x: 16, y: 44, w: 608, h: 266, bars, format, size: 15 });
	},
};

export const phone = {
	height: 330,
	draw(f) {
		f.note(8, 20, 'GB read per insert, and its time.', { size: 13 });
		f.note(8, 40, '22.6 s in one, 23.2 s in four.', { size: 13 });
		f.barChart({ x: 4, y: 60, w: 352, h: 260, bars, format, size: 14 });
	},
};
