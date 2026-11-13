// Semicolons per 1,000 words by 25-year period, with commas above for scale. Each dot sinks
// into place left to right; periods with fewer than 20 books are hollow and never quoted.
import {
	COLORS,
	DATA,
	MUTED,
	PANEL,
	easeOutBack,
	label,
	layers,
	n,
	panel,
	pathOf,
	prog,
} from './_chart.mjs';

const P = DATA.by_25yr;
const T0 = 0.3;

export const alt =
	'Two dot charts on one time axis, by 25-year period from 1600 to 1974, medians per 1,000 words. Semicolons fall from 10.1 in 1775-99 to 4.6 in 1900-24 and 1.8 in 1950-74, with the steepest fall after 1825. Commas, above for scale, fall less: from 85.9 to 63.1 over the same periods. Periods before 1775 have fewer than 20 books each and are drawn hollow.';

function chart(f, { W, H, phone }) {
	const L = phone ? 40 : 58;
	const R = W - (phone ? 26 : 70);
	const px = (i) => L + (i * (R - L)) / (P.length - 1);
	const bands = [
		{
			key: 'comma',
			name: 'Commas',
			top: phone ? 92 : 86,
			h: phone ? 92 : 104,
			min: 50,
			max: 100,
			ticks: [50, 75, 100],
			color: COLORS.chalk,
			quote: [7, 14],
		},
		{
			key: 'semicolon',
			name: 'Semicolons',
			top: phone ? 236 : 240,
			h: phone ? 124 : 132,
			min: 0,
			max: 18,
			ticks: [0, 6, 12, 18],
			color: COLORS.pink,
			quote: [7, 12, 14],
		},
	];
	const py = (b, v) => b.top + b.h - ((v - b.min) / (b.max - b.min)) * b.h;
	const axisY = bands[1].top + bands[1].h + 22;
	panel(f, 6, phone ? 46 : 42, W - 12, H - (phone ? 52 : 48));
	f.text(
		phone ? 20 : 16,
		phone ? 18 : 20,
		phone ? 'The semicolon fades out' : 'Semicolons fall from 10 to 2 per 1,000 words',
		{
			font: 'display',
			size: phone ? 19 : 22,
			anchor: 'start',
			upper: true,
		},
	);
	if (phone)
		f.text(12, 37, 'Per 1,000 words, median book', { size: 13, anchor: 'start', color: MUTED });
	bands.forEach((b) => {
		f.text(L, b.top - 18, b.name, {
			font: 'display',
			size: phone ? 16 : 18,
			anchor: 'start',
			upper: true,
			color: b.color,
		});
		b.ticks.forEach((v) => {
			f.line(
				[
					[L, py(b, v)],
					[R, py(b, v)],
				],
				{ color: '#2c2c2c', width: 1 },
			);
			f.text(L - 10, py(b, v), String(v), { size: 13, anchor: 'end', color: MUTED });
		});
	});
	P.forEach((p, i) => {
		const year = Number(p.period.slice(0, 4));
		if (year % (phone ? 100 : 50) === 0)
			f.text(px(i), axisY, String(year), { size: 13, weight: 600, color: COLORS.paper });
	});
	f.text(
		phone ? 20 : 16,
		axisY + 22,
		phone
			? 'Hollow: fewer than 20 books, not quoted'
			: 'Hollow dots: periods with fewer than 20 books, left out of the numbers in the text',
		{
			size: 13,
			anchor: 'start',
			color: MUTED,
		},
	);

	layers(f, true, (el) => {
		const out = [];
		bands.forEach((b, bi) => {
			const land = (i) => (t) => easeOutBack(prog(t, T0 + bi * 0.25 + i * 0.13, 0.5));
			const quoted = P.map((p, i) => [p, i]).filter(([p]) => p.quoted);
			const doneAt = T0 + bi * 0.25 + (P.length - 1) * 0.13 + 0.5;
			out.push(
				el(
					'path',
					{
						d: pathOf(quoted.map(([p, i]) => [px(i), py(b, p[b.key])])),
						fill: 'none',
						stroke: b.color,
						'stroke-width': 3,
						'stroke-linejoin': 'round',
						'stroke-opacity': 0.55,
						class: 'd-flow',
					},
					{
						opacity: (t) => (t >= doneAt ? 1 : 0),
					},
				),
			);
			P.forEach((p, i) => {
				const y = py(b, p[b.key]);
				out.push(
					el(
						'circle',
						p.quoted
							? {
									cx: n(px(i)),
									r: phone ? 4.5 : 5.5,
									fill: b.color,
									stroke: PANEL,
									'stroke-width': 2,
								}
							: { cx: n(px(i)), r: phone ? 4 : 5, fill: PANEL, stroke: MUTED, 'stroke-width': 2 },
						{
							cy: (t) => n(b.top + (y - b.top) * land(i)(t)),
							opacity: (t) => (t >= T0 + bi * 0.25 + i * 0.13 ? 1 : 0),
						},
					),
				);
			});
			// First and last quoted periods get their numbers, plus 1900-24 for the semicolons
			b.quote.forEach((i) => {
				const v = P[i][b.key];
				out.push(
					label(el, px(i), py(b, v) - 15, v.toFixed(1), {
						size: phone ? 13 : 15,
						color: b.color,
						anims: { opacity: (t) => (t >= doneAt ? 1 : 0) },
					}),
				);
			});
		});
		return out.join('');
	});
}

export const desktop = { height: 450, draw: (f) => chart(f, { W: 640, H: 450, phone: false }) };
export const phone = { height: 440, draw: (f) => chart(f, { W: 360, H: 440, phone: true }) };
