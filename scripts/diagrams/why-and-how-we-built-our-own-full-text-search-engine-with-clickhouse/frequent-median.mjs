export const alt =
	'Median query time on the basic-frequent benchmark, where the search matched about 72% of rows: ungrouped-limited about 385 ms, ungrouped about 2,730 ms, naive about 3,820 ms and sumIf about 3,810 ms.';

const BARS = [
	{ label: 'ungrouped-limited', value: 385, highlight: true },
	{ label: 'ungrouped', value: 2730 },
	{ label: 'naive', value: 3820 },
	{ label: 'sumIf', value: 3810 },
];
const fmt = (v) => `${v.toLocaleString('en-US')} ms`;

export const desktop = {
	height: 270,
	draw(f) {
		f.text(16, 20, 'Basic-frequent: median query time', { size: 17, anchor: 'start', weight: 700 });
		f.note(16, 42, 'lower is faster; the search matched about 72% of rows', { size: 13 });
		f.barChart({
			x: 16,
			y: 58,
			w: 608,
			h: 190,
			bars: BARS,
			format: fmt,
			horizontal: true,
			labelW: 150,
			size: 15,
		});
	},
};

export const phone = {
	height: 270,
	draw(f) {
		f.text(8, 18, 'Basic-frequent: median time', { size: 15, anchor: 'start', weight: 700 });
		f.note(8, 38, 'lower is faster', { size: 13 });
		f.barChart({
			x: 8,
			y: 52,
			w: 344,
			h: 200,
			bars: BARS,
			format: fmt,
			horizontal: true,
			labelW: 132,
			size: 13,
		});
	},
};
