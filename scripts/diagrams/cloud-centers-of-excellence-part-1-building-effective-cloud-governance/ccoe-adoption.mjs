export const alt =
	'The share of enterprises with a Cloud Center of Excellence, 2018 to 2025: 30% in 2018, 45% in 2019, 60% in 2020, 75% in 2021, 80% in 2022, 85% in 2023, 88% in 2024 and 90% in 2025.';

const DATA = [
	[2018, 30],
	[2019, 45],
	[2020, 60],
	[2021, 75],
	[2022, 80],
	[2023, 85],
	[2024, 88],
	[2025, 90],
];

/** The line, a dot and a printed value at every year. */
function adoption(f, { x, y, w, h, size, every }) {
	f.lineChart({
		x,
		y,
		w,
		h,
		series: [{ name: '', points: DATA, highlight: true }],
		xMin: 2018,
		xMax: 2025,
		yMin: 0,
		yMax: 100,
		xTicks: DATA.filter((_, i) => i % every === 0).map(([yr]) => [yr, String(yr)]),
		yTicks: [
			[0, '0%'],
			[50, '50%'],
			[100, '100%'],
		],
		size,
		nameW: 16,
	});
	const plotW = w - 44 - 16;
	DATA.forEach(([yr, v]) => {
		const px = x + 44 + ((yr - 2018) / 7) * plotW;
		const py = y + h - 22 - (v / 100) * (h - 34);
		f.dot(px, py, 4, '#ff4fd8');
		f.text(px, py - 16, `${v}%`, { size, weight: 700, color: '#ededed' });
	});
}

export const desktop = {
	height: 360,
	draw(f) {
		f.heading(16, 24, 'Enterprises with a CCOE', { size: 22 });
		f.note(16, 52, 'Percent of enterprises, 2018 to 2025', { size: 14 });
		adoption(f, { x: 16, y: 80, w: 608, h: 240, size: 14, every: 1 });
		f.note(
			16,
			344,
			'2021 (75%): Flexera State of the Cloud. Chart values as CloudQuery published them.',
			{ size: 13 },
		);
	},
};

export const phone = {
	height: 360,
	draw(f) {
		f.heading(16, 24, 'Enterprises with a CCOE', { size: 20 });
		f.note(16, 52, 'Percent of enterprises, 2018 to 2025', { size: 14 });
		adoption(f, { x: 8, y: 80, w: 344, h: 220, size: 13, every: 2 });
		f.note(16, 324, '2021 (75%): Flexera State of the Cloud.', { size: 13 });
		f.note(16, 344, 'Chart values as CloudQuery published them.', { size: 13 });
	},
};
