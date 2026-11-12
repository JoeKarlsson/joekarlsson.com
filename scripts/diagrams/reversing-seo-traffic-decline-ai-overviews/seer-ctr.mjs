// Seer Interactive's CTR numbers: an AI Overview cuts organic CTR by 61%, and being cited
// in it wins back only a little.
export const alt =
	"Bar chart of organic click-through rate from Seer Interactive's study of 3,119 search terms: 1.76% on queries with no AI Overview, 0.70% when an AI Overview cites you, 0.61% with an AI Overview overall, and 0.52% when it does not cite you.";

const bars = [
	{ label: 'No AI Overview', value: 1.76 },
	{ label: 'AI Overview, you are cited', value: 0.7, highlight: true },
	{ label: 'AI Overview, overall', value: 0.61, highlight: true },
	{ label: 'AI Overview, not cited', value: 0.52, highlight: true },
];
const phoneBars = bars.map((b) => ({
	...b,
	label: b.label.replace('AI Overview, you are', 'AIO,').replace('AI Overview,', 'AIO,'),
}));
const format = (v) => `${v.toFixed(2)}%`;

export const desktop = {
	height: 250,
	draw(f) {
		f.note(16, 20, 'Organic click-through rate. Source: Seer Interactive, September 2025', {
			size: 14,
		});
		f.barChart({
			x: 16,
			y: 40,
			w: 608,
			h: 200,
			bars,
			format,
			horizontal: true,
			labelW: 210,
			size: 15,
		});
	},
};

export const phone = {
	height: 290,
	draw(f) {
		f.note(8, 20, 'Organic click-through rate', { size: 13 });
		f.note(8, 40, 'Source: Seer Interactive, Sept 2025', { size: 13 });
		f.barChart({
			x: 8,
			y: 60,
			w: 344,
			h: 200,
			bars: phoneBars,
			format,
			horizontal: true,
			labelW: 136,
			size: 14,
		});
		f.note(8, 276, 'AIO: AI Overview', { size: 13 });
	},
};
