export const alt =
	'Percentage change over four weeks after I changed what I measured, at my previous job: docs traffic up 440%, search impressions up 316%, estimated traffic value up 99%, weekly visitors up 76% and organic traffic up 57%.';

const BARS = [
	{ label: 'Docs traffic', value: 440, highlight: true },
	{ label: 'Search impressions', value: 316, highlight: true },
	{ label: 'Traffic value', value: 99 },
	{ label: 'Weekly visitors', value: 76 },
	{ label: 'Organic traffic', value: 57 },
];
const format = (v) => `+${v}%`;

export const desktop = {
	height: 330,
	draw(f) {
		f.heading(16, 24, 'Four weeks after changing what I measured', { size: 22 });
		f.note(16, 52, 'Percentage change, at my previous job', { size: 14 });
		f.barChart({
			x: 16,
			y: 72,
			w: 608,
			h: 240,
			bars: BARS,
			format,
			horizontal: true,
			labelW: 170,
			size: 15,
		});
	},
};

export const phone = {
	height: 380,
	draw(f) {
		f.heading(16, 24, 'Four weeks later', { size: 22 });
		f.note(16, 52, 'Percentage change, at my previous job', { size: 14 });
		f.barChart({
			x: 8,
			y: 72,
			w: 344,
			h: 290,
			bars: BARS,
			format,
			horizontal: true,
			labelW: 140,
			size: 14,
		});
	},
};
