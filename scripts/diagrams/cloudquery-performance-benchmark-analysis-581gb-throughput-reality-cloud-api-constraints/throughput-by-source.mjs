export const alt =
	'CloudQuery throughput by data source on an Apple M4 Pro, in GB per hour: file 581.6, Azure 91.2, GCP 49.7 and AWS 7.1. Cloud sources are held back by provider API rate limits.';

const BARS = [
	{ label: 'File', value: 581.6, highlight: true },
	{ label: 'Azure', value: 91.2 },
	{ label: 'GCP', value: 49.7 },
	{ label: 'AWS', value: 7.1 },
];

export const desktop = {
	height: 330,
	draw(f) {
		f.heading(16, 24, 'CloudQuery throughput by source', { size: 22 });
		f.note(16, 52, 'GB per hour on an Apple M4 Pro', { size: 14 });
		f.barChart({
			x: 16,
			y: 72,
			w: 608,
			h: 210,
			bars: BARS,
			horizontal: true,
			labelW: 90,
			size: 15,
		});
		f.note(
			16,
			306,
			'Cloud sources are capped by each provider’s API rate limits; local files are not.',
			{ size: 13 },
		);
	},
};

export const phone = {
	height: 330,
	draw(f) {
		f.heading(16, 24, 'Throughput by source', { size: 20 });
		f.note(16, 52, 'GB per hour on an Apple M4 Pro', { size: 14 });
		f.barChart({ x: 8, y: 72, w: 344, h: 200, bars: BARS, horizontal: true, labelW: 70, size: 14 });
		f.note(16, 292, 'Cloud sources are capped by provider', { size: 13 });
		f.note(16, 312, 'API rate limits; local files are not.', { size: 13 });
	},
};
