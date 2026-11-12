// "I bought a lot more than I use": how full each part of the rack gets.
export const alt =
	'Bar chart of how much of each part of the rack I use, from 30 days of Prometheus data. CPU: 13% busy on average. RAM: 28% in use (72 of 256 GB). Network: the busiest minute used 12% of one 10G link. Quadro RTX 4000: peaks at 59% of its VRAM (4.7 of 8 GB). RTX A4000: peaks at 94% (about 15 of 16 GB) when the 30B coding model loads, and sits close to empty the rest of the day.';

const ROWS = [
	['CPU, average', 'CPU, average', 13],
	['RAM in use', 'RAM in use', 28],
	['10G link, busiest minute', '10G, busiest min', 12],
	['Quadro VRAM, peak', 'Quadro, peak', 59],
	['A4000 VRAM, peak', 'A4000, peak', 94, true],
];
const bars = (phone) =>
	ROWS.map(([wide, short, value, highlight]) => ({
		label: phone ? short : wide,
		value,
		highlight,
	}));
const format = (v) => `${v}%`;

export const desktop = {
	height: 330,
	draw(f) {
		f.heading(16, 24, 'How much of the rack I use', { size: 22 });
		f.note(16, 52, 'Share of each in use, last 30 days', { size: 14 });
		f.barChart({
			x: 16,
			y: 72,
			w: 608,
			h: 210,
			bars: bars(false),
			max: 100,
			format,
			horizontal: true,
			labelW: 200,
			size: 15,
		});
		f.note(
			16,
			308,
			'The A4000 fills up only when the 30B model loads. Most of the day it is close to empty.',
			{ size: 14 },
		);
	},
};

export const phone = {
	height: 360,
	draw(f) {
		f.heading(16, 24, 'How much I use', { size: 20 });
		f.note(16, 50, 'Share in use, last 30 days', { size: 14 });
		f.barChart({
			x: 8,
			y: 66,
			w: 344,
			h: 230,
			bars: bars(true),
			max: 100,
			format,
			horizontal: true,
			labelW: 128,
			size: 13,
		});
		f.note(16, 318, 'The A4000 fills up only when the', { size: 13 });
		f.note(16, 338, '30B model loads, then sits empty.', { size: 13 });
	},
};
