export const alt =
	'Bar chart of the disk space the same dataset takes, both databases tuned: ClickHouse 14.08 GiB, PostgreSQL 120.02 GiB, 8.5 times more.';

const bars = [
	{ label: 'ClickHouse', value: 14.08, highlight: true },
	{ label: 'PostgreSQL', value: 120.02 },
];
const format = (v) => `${v.toFixed(2)} GiB`;

export const desktop = {
	height: 160,
	draw(f) {
		f.note(16, 20, 'Disk space for the same dataset, both tuned. PostgreSQL uses 8.5x more.', {
			size: 14,
		});
		f.barChart({
			x: 16,
			y: 40,
			w: 608,
			h: 110,
			bars,
			max: 140,
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
		f.note(8, 20, 'Disk space for the same dataset, both', { size: 13 });
		f.note(8, 40, 'tuned. PostgreSQL uses 8.5x more.', { size: 13 });
		f.barChart({
			x: 8,
			y: 60,
			w: 344,
			h: 110,
			bars,
			max: 140,
			format,
			horizontal: true,
			labelW: 96,
			size: 14,
		});
	},
};
