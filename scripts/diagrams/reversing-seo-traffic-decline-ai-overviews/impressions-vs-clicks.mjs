// Impressions grew more than five times as fast as clicks: the AI Overview gap.
export const alt =
	'Bar chart of growth over the first four weeks: search impressions up 316%, organic traffic up 57%. Impressions grew more than five times as fast as clicks.';

const bars = [
	{ label: 'Impressions', value: 316, highlight: true },
	{ label: 'Organic traffic', value: 57 },
];
const format = (v) => `+${v}%`;

export const desktop = {
	height: 160,
	draw(f) {
		f.note(16, 20, 'Change over the first four weeks (Ahrefs)', { size: 14 });
		f.barChart({
			x: 16,
			y: 40,
			w: 608,
			h: 110,
			bars,
			format,
			horizontal: true,
			labelW: 140,
			size: 15,
		});
	},
};

export const phone = {
	height: 160,
	draw(f) {
		f.note(8, 20, 'Change over four weeks (Ahrefs)', { size: 13 });
		f.barChart({
			x: 8,
			y: 40,
			w: 344,
			h: 110,
			bars,
			format,
			horizontal: true,
			labelW: 124,
			size: 14,
		});
	},
};
