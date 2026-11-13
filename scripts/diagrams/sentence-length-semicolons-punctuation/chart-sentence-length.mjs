// The hero chart: words between periods draws left to right, then semicolons and colons
// start counting as stops and the second line drops out of the first. The gap that opens
// is the glued sentences.
import {
	COLORS,
	DATA,
	MUTED,
	easeOut,
	easeOutBack,
	label,
	layers,
	n,
	panel,
	pathOf,
	prog,
} from './_chart.mjs';

const P = DATA.sentence_length_50yr;

export const alt =
	'Line chart of median sentence length in 954 dated Project Gutenberg books, by 50-year period from 1600 to 1974. Counting only periods, question marks and exclamation marks as sentence ends, sentences peak at 30.3 words in 1700-49 and fall to 14.5 in 1900-49 and 12.5 in 1950-74. Counting semicolons and colons as stops too, the second line runs from 21.6 in 1700-49 to 13.3 in 1900-49, and the two lines meet at 12.4 in 1950-74. The gap between them, the glued sentences, is widest before 1800.';

const T_DRAW = 0.3;
const DRAW = 1.6;
const T_DROP = 2.2;
const T_LABELS = 3.4;

function chart(f, { W, H, phone }) {
	const L = phone ? 76 : 76;
	const R = W - (phone ? 26 : 40);
	const T = phone ? 92 : 78;
	const B = H - (phone ? 70 : 74);
	const px = (i) => L + (i * (R - L)) / (P.length - 1);
	const py = (v) => B - (v / 32) * (B - T);
	const size = 13;

	panel(f, 6, phone ? 48 : 44, W - 12, H - (phone ? 54 : 50));
	f.text(
		phone ? 20 : 16,
		phone ? 18 : 20,
		phone ? 'Words between periods' : 'Words between periods vs words between stops',
		{
			font: 'display',
			size: phone ? 19 : 22,
			anchor: 'start',
			upper: true,
		},
	);
	if (phone)
		f.text(12, 38, 'vs words between stops', {
			font: 'display',
			size: 19,
			anchor: 'start',
			upper: true,
		});
	[0, 10, 20, 30].forEach((v) => {
		f.line(
			[
				[L, py(v)],
				[R, py(v)],
			],
			{ color: v ? '#303030' : MUTED, width: v ? 1 : 1.5 },
		);
		f.text(L - 10, py(v), String(v), { size, anchor: 'end', color: MUTED });
	});
	P.forEach((p, i) => {
		f.text(
			px(i),
			B + 20,
			phone ? p.period.slice(0, 4) : p.period.replace(/^(\d{4})-\d\d(\d\d)$/, '$1-$2'),
			{
				size,
				color: COLORS.paper,
				weight: 600,
			},
		);
		f.text(px(i), B + 40, String(p.n), { size, color: MUTED });
	});
	f.text(phone ? 20 : 14, B + 40, 'books', { size, anchor: 'start', color: MUTED });
	f.text(
		phone ? 20 : 14,
		B + 58,
		phone ? 'Medians of per-book values' : 'Medians of per-book values. Words per sentence.',
		{
			size,
			anchor: 'start',
			color: MUTED,
		},
	);

	const drawn = (t) => easeOut(prog(t, T_DRAW, DRAW));
	const dropOf = (i, t) => easeOutBack(prog(t, T_DROP + i * 0.12, 0.6));
	const stopsY = (i, t) =>
		py(P[i].between_periods + (P[i].between_stops - P[i].between_periods) * dropOf(i, t));
	const periodsPts = P.map((p, i) => [px(i), py(p.between_periods)]);
	const stopsPts = (t) => P.map((_, i) => [px(i), stopsY(i, t)]);
	const shown = (start) => (t) => (t >= start ? 1 : 0);
	const keyY = phone ? T - 14 : T + 4;
	const keyX = phone ? 14 : R - 236;

	layers(f, true, (el) =>
		[
			el(
				'path',
				{ fill: COLORS.pink, 'fill-opacity': 0.32, class: 'd-paper' },
				{
					d: (t) => pathOf([...periodsPts, ...stopsPts(t).reverse()]) + ' Z',
				},
			),
			el(
				'path',
				{
					d: pathOf(periodsPts),
					fill: 'none',
					stroke: COLORS.pink,
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
			...periodsPts.map(([x, y], i) =>
				el(
					'circle',
					{ cx: n(x), cy: n(y), r: 5.5, fill: COLORS.pink },
					{
						opacity: (t) => (drawn(t) * (P.length - 1) >= i - 0.01 ? 1 : 0),
					},
				),
			),
			el(
				'path',
				{
					fill: 'none',
					stroke: COLORS.chalk,
					'stroke-width': 4,
					'stroke-linejoin': 'round',
					'stroke-linecap': 'round',
					class: 'd-flow',
				},
				{
					d: (t) => pathOf(stopsPts(t)),
					opacity: shown(T_DROP),
				},
			),
			...P.map((_, i) =>
				el(
					'circle',
					{ cx: n(px(i)), r: 5.5, fill: COLORS.chalk, stroke: '#151515', 'stroke-width': 2 },
					{
						cy: (t) => n(stopsY(i, t)),
						opacity: shown(T_DROP),
					},
				),
			),
			// On a phone the gap is narrow: two short lines fit where one long one hits the line
			...(phone
				? [
						['GLUED', 25.6],
						['SENTENCES', 23.6],
					]
				: [['GLUED SENTENCES', 24.4]]
			).map(([word, v]) =>
				label(el, phone ? px(2.5) : (px(2) + px(3)) / 2, py(v), word, {
					font: 'display',
					size: phone ? 13 : 16,
					color: COLORS.paper,
					anims: { opacity: shown(T_LABELS) },
				}),
			),
			label(el, px(2), py(30.3) - 15, '30.3', {
				size: phone ? 14 : 16,
				color: COLORS.pink,
				anims: { opacity: shown(T_DRAW + DRAW * 0.3) },
			}),
			label(el, px(6), py(14.5) - 15, '14.5', {
				size: phone ? 14 : 16,
				color: COLORS.pink,
				anims: { opacity: shown(T_DRAW + DRAW * 0.9) },
			}),
			label(el, px(2), py(21.6) + 17, '21.6', {
				size: phone ? 14 : 16,
				color: COLORS.chalk,
				anims: { opacity: shown(T_LABELS) },
			}),
			label(el, px(6), py(13.3) + 17, '13.3', {
				size: phone ? 14 : 16,
				color: COLORS.chalk,
				anims: { opacity: shown(T_LABELS) },
			}),
			el('line', {
				x1: n(keyX),
				x2: n(keyX + 22),
				y1: n(keyY),
				y2: n(keyY),
				stroke: COLORS.pink,
				'stroke-width': 4,
				'stroke-linecap': 'round',
			}),
			label(el, keyX + 30, keyY, phone ? 'periods' : 'words between periods (. ? !)', {
				size: phone ? 13 : 14,
				anchor: 'start',
				weight: 600,
			}),
			el(
				'line',
				{
					x1: n(keyX + (phone ? 110 : 0)),
					x2: n(keyX + (phone ? 132 : 22)),
					y1: n(keyY + (phone ? 0 : 22)),
					y2: n(keyY + (phone ? 0 : 22)),
					stroke: COLORS.chalk,
					'stroke-width': 4,
					'stroke-linecap': 'round',
				},
				{ opacity: shown(T_DROP) },
			),
			label(
				el,
				keyX + (phone ? 140 : 30),
				keyY + (phone ? 0 : 22),
				phone ? 'stops (adds ; :)' : 'words between stops (. ? ! ; :)',
				{ size: phone ? 13 : 14, anchor: 'start', weight: 600, anims: { opacity: shown(T_DROP) } },
			),
		].join(''),
	);
}

export const desktop = { height: 430, draw: (f) => chart(f, { W: 640, H: 430, phone: false }) };
export const phone = { height: 420, draw: (f) => chart(f, { W: 360, H: 420, phone: true }) };
