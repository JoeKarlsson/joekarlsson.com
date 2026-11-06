export const alt =
	'Search impressions at my previous job, indexed to the prior all-time high: the prior record week is 1.0x and the peak week is 4.9x.';

const BARS = [
	{ label: ['Prior', 'all-time high'], value: 1 },
	{ label: 'Peak week', value: 4.9, highlight: true },
];
const format = (v) => `${v.toFixed(1)}x`;

export const desktop = {
	height: 360,
	draw(f) {
		f.heading(16, 24, 'Peak week vs. the prior all-time high', { size: 22 });
		f.note(16, 52, 'Search impressions, indexed to the prior record week', { size: 14 });
		f.barChart({ x: 120, y: 72, w: 400, h: 270, bars: BARS, format, size: 16 });
	},
};

export const phone = {
	height: 360,
	draw(f) {
		f.heading(16, 24, 'Peak week vs. the record', { size: 20 });
		f.note(16, 52, 'Search impressions, indexed', { size: 14 });
		f.barChart({ x: 16, y: 72, w: 328, h: 270, bars: BARS, format, size: 15 });
	},
};
