// Narration alone, dialogue removed, against all the text: both fall together, so the
// shorter sentence isn't just dialogue.
import {
	COLORS,
	DATA,
	MUTED,
	PANEL,
	easeOut,
	label,
	layers,
	n,
	panel,
	pathOf,
	prog,
} from './_chart.mjs';

const P = DATA.narration.filter((p) => Number(p.period.slice(0, 4)) >= 1700);
const T0 = 0.3;
const DRAW = 2;

export const alt =
	'Line chart of median words between stops (periods, question marks, exclamation marks, semicolons and colons), by 50-year period from 1700-49 to 1950-74. Narration alone, with every quoted word removed, falls from 21.9 words in 1700-49 to 14.5 in 1900-49 and 13.0 in 1950-74. All the text falls from 21.6 to 13.3 and 12.4. The two lines fall together, so sentences got shorter outside dialogue too. The 1700-49 period has only 18 books.';

function chart(f, { W, H, phone }) {
	const L = phone ? 64 : 60;
	const R = W - (phone ? 22 : 40);
	const T = phone ? 112 : 100;
	const B = H - (phone ? 62 : 64);
	const px = (i) => L + (i * (R - L)) / (P.length - 1);
	const py = (v) => B - ((v - 10) / 14) * (B - T);
	panel(f, 6, phone ? 46 : 42, W - 12, H - (phone ? 52 : 48));
	f.text(
		phone ? 20 : 16,
		phone ? 18 : 20,
		phone ? 'Narration got shorter too' : 'Take the dialogue out, and sentences still got shorter',
		{
			font: 'display',
			size: phone ? 19 : 22,
			anchor: 'start',
			upper: true,
		},
	);
	if (phone)
		f.text(12, 37, 'Words between stops, dialogue removed', {
			size: 13,
			anchor: 'start',
			color: MUTED,
		});
	[10, 15, 20].forEach((v) => {
		f.line(
			[
				[L, py(v)],
				[R, py(v)],
			],
			{ color: v === 10 ? MUTED : '#303030', width: v === 10 ? 1.5 : 1 },
		);
		f.text(L - 10, py(v), String(v), { size: 13, anchor: 'end', color: MUTED });
	});
	P.forEach((p, i) => {
		f.text(
			px(i),
			B + 20,
			phone ? p.period.slice(0, 4) : p.period.replace(/^(\d{4})-\d\d(\d\d)$/, '$1-$2'),
			{
				size: 13,
				weight: 600,
				color: p.n < 20 ? MUTED : COLORS.paper,
			},
		);
		f.text(px(i), B + 38, phone ? String(p.n) : `${p.n} books`, { size: 13, color: MUTED });
	});
	if (phone) f.text(12, B + 38, 'books', { size: 13, anchor: 'start', color: MUTED });

	const drawn = (t) => easeOut(prog(t, T0, DRAW));
	const reached = (i) => (t) => (drawn(t) * (P.length - 1) >= i - 0.01 ? 1 : 0);
	const series = [
		{ key: 'all_between_stops', color: COLORS.chalk, below: true },
		{ key: 'narration_between_stops', color: COLORS.pink, below: false },
	];
	const keyY = phone ? 70 : 72;

	layers(f, phone, (el) => {
		const out = [];
		series.forEach((s) => {
			const pts = P.map((p, i) => [px(i), py(p[s.key])]);
			out.push(
				el(
					'path',
					{
						d: pathOf(pts),
						fill: 'none',
						stroke: s.color,
						'stroke-width': 4,
						'stroke-linejoin': 'round',
						'stroke-linecap': 'round',
						pathLength: 1,
						'stroke-dasharray': 1,
						class: 'd-flow',
					},
					{
						'stroke-dashoffset': (t) => n(1 - drawn(t)),
					},
				),
				...pts.map(([x, y], i) =>
					el(
						'circle',
						P[i].n < 20
							? { cx: n(x), cy: n(y), r: 5, fill: PANEL, stroke: s.color, 'stroke-width': 2 }
							: { cx: n(x), cy: n(y), r: 5.5, fill: s.color, stroke: PANEL, 'stroke-width': 2 },
						{ opacity: reached(i) },
					),
				),
			);
			// on a phone the chalk 21.6 lands on its own falling line; the pink 21.9 beside it says enough
			[phone && s.below ? -1 : 0, P.findIndex((p) => p.period.startsWith('1900'))]
				.filter((i) => i >= 0)
				.forEach((i) =>
					out.push(
						// the first pair sits right of its dots, clear of the axis labels
						label(
							el,
							px(i) + (i ? 0 : 10),
							py(P[i][s.key]) + (s.below ? 18 : -16),
							P[i][s.key].toFixed(1),
							{
								size: phone ? 14 : 15,
								color: s.color,
								anchor: i ? 'middle' : 'start',
								anims: { opacity: reached(i) },
							},
						),
					),
				);
		});
		const kx = phone ? 14 : L;
		const items = [
			[COLORS.pink, phone ? 'narration (dialogue removed)' : 'narration only, dialogue removed'],
			[COLORS.chalk, 'all the text'],
		];
		items.forEach(([color, text], i) => {
			const x = kx + (phone ? 0 : i * 290);
			const y = keyY + (phone ? i * 20 : 0);
			out.push(
				el('line', {
					x1: x,
					x2: x + 22,
					y1: y,
					y2: y,
					stroke: color,
					'stroke-width': 4,
					'stroke-linecap': 'round',
				}),
				label(el, x + 30, y, text, { size: phone ? 13 : 14, anchor: 'start', weight: 600 }),
			);
		});
		return out.join('');
	});
}

export const desktop = { height: 380, draw: (f) => chart(f, { W: 640, H: 380, phone: false }) };
export const phone = { height: 400, draw: (f) => chart(f, { W: 360, H: 400, phone: true }) };
