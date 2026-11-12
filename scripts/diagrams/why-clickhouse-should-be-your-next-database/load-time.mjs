export const alt =
	'Bar chart of the time to load the same dataset, both databases tuned: ClickHouse 507 seconds, PostgreSQL 11,800 seconds, 23 times longer.';

const bars = [
	{ label: 'ClickHouse', value: 507, highlight: true },
	{ label: 'PostgreSQL', value: 11800 },
];
const format = (v) => `${v.toLocaleString('en-US')} s`;

export const desktop = {
	height: 160,
	draw(f) {
		f.note(16, 20, 'Seconds to load the dataset, both tuned. PostgreSQL takes 23x longer.', {
			size: 14,
		});
		f.barChart({
			x: 16,
			y: 40,
			w: 608,
			h: 110,
			bars,
			max: 13500,
			format,
			horizontal: true,
			labelW: 110,
			size: 15,
		});
	},
};

export const phone = {
	height: 180,
	draw(f) {
		f.note(8, 20, 'Seconds to load the dataset, both tuned.', { size: 13 });
		f.note(8, 40, 'PostgreSQL takes 23x longer.', { size: 13 });
		f.barChart({
			x: 8,
			y: 60,
			w: 344,
			h: 110,
			bars,
			max: 13500,
			format,
			horizontal: true,
			labelW: 96,
			size: 14,
		});
	},
};
