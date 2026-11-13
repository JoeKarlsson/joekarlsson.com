// Careers: each author's fitted semicolon rate grows from their first dated book to their
// last, over the whole shelf's median by period. Half rise, half fall. The inset is the
// model with both publication year and birth year: each takes about half.
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

const C = [...DATA.careers].sort((a, b) => a.first - b.first);
const SHELF = DATA.by_25yr;
const M = DATA.cohort_model;
const T0 = 0.3;
const EACH = 0.14;
const T_INSET = T0 + C.length * EACH + 0.6;
const NAMED = {
	'Charles Dickens': 'Dickens',
	'Henry James': 'Henry James',
	'Jane Austen': 'Austen',
	'Mark Twain': 'Twain',
};

export const alt =
	'Seventeen authors with five or more dated books spanning 20 or more years, each drawn as a line from the fitted semicolon rate of their first book to their last, over the median book of the whole shelf by 25-year period. Eight fall and nine rise. Dickens falls from 11.8 to 5.6 semicolons per 1,000 words (1836-1870), Henry James from 12.4 to 6.8; Jane Austen rises from 6.0 to 15.5 and Mark Twain from 8.6 to 13.6. In a model of 748 English-original books from 1750 to 1974 with both, publication year accounts for -3.1 semicolons per 1,000 words per century (95% interval -6.2 to -0.02, resampling authors) and author birth year for -3.7 (-6.7 to -0.7). The intervals overlap, so the model cannot say which matters more.';

function chart(f, { W, H, phone }) {
	const L = phone ? 40 : 56;
	const R = W - (phone ? 20 : 30);
	const T = phone ? 102 : 92;
	const B = phone ? 470 : 330;
	const x = (yr) => L + ((yr - 1590) / (1975 - 1590)) * (R - L);
	const y = (v) => B - (v / 18) * (B - T);
	panel(f, 6, phone ? 46 : 42, W - 12, H - (phone ? 52 : 48));
	f.text(
		phone ? 20 : 16,
		phone ? 18 : 20,
		phone ? "Writers don't drop them" : "Writers don't drop semicolons over a career",
		{
			font: 'display',
			size: phone ? 19 : 22,
			anchor: 'start',
			upper: true,
		},
	);
	f.text(
		phone ? 20 : 16,
		phone ? 37 : 62,
		phone
			? 'Semicolons per 1,000 words, first book to last'
			: 'Semicolons per 1,000 words, fitted from each author’s first dated book to their last',
		{
			size: 13,
			anchor: 'start',
			color: MUTED,
		},
	);
	// A phone is too narrow for 17 careers on a time axis: one row each, first book to last
	const ROWS = [...C].sort((a, b) => a.slope_per_decade - b.slope_per_decade);
	const rowTop = 104;
	const rowH = 20;
	const tL = 132;
	const tR = R - 4;
	const tx = (v) => tL + (v / 18) * (tR - tL);
	const ry = (i) => rowTop + i * rowH;
	const short = (a) => (a === 'Arthur Conan Doyle' ? 'Conan Doyle' : a.split(' ').slice(-1)[0]);
	if (phone) {
		[0, 6, 12, 18].forEach((v) => {
			f.line(
				[
					[tx(v), rowTop - 10],
					[tx(v), ry(ROWS.length - 1) + 10],
				],
				{ color: '#2c2c2c', width: 1 },
			);
			f.text(tx(v), ry(ROWS.length - 1) + 26, String(v), { size: 13, color: MUTED });
		});
		ROWS.forEach((c, i) =>
			f.text(tL - 10, ry(i), short(c.author), {
				size: 13,
				anchor: 'end',
				weight: 600,
				color: c.slope_per_decade < 0 ? COLORS.chalk : COLORS.pink,
			}),
		);
	} else {
		[0, 6, 12, 18].forEach((v) => {
			f.line(
				[
					[L, y(v)],
					[R, y(v)],
				],
				{ color: v ? '#2c2c2c' : MUTED, width: v ? 1 : 1.5 },
			);
			f.text(L - 10, y(v), String(v), { size: 13, anchor: 'end', color: MUTED });
		});
		[1600, 1650, 1700, 1750, 1800, 1850, 1900, 1950].forEach((yr) =>
			f.text(x(yr), B + 18, String(yr), { size: 13, weight: 600, color: COLORS.paper }),
		);
	}

	// The inset: one model, two bars running left from zero
	const iTop = B + (phone ? 50 : 58);
	const iL = phone ? 142 : 180;
	const iR = R - (phone ? 40 : 70);
	const ix = (v) => iR + (v / 7) * (iR - iL);
	f.text(
		phone ? 20 : 16,
		iTop - 16,
		phone
			? 'One model, both at once (per century)'
			: 'Both in one model: change per century, 748 English-original books, 1750-1974',
		{
			size: 13,
			anchor: 'start',
			color: MUTED,
			weight: 600,
		},
	);
	const bars = [
		['Publication year', M.publication_year_per_century, M.pub_ci],
		['Author birth year', M.birth_year_per_century, M.birth_ci],
	];
	bars.forEach(([name], i) =>
		f.text(iL - 12, iTop + 14 + i * 30, name, { size: 13, anchor: 'end', weight: 600 }),
	);
	f.line(
		[
			[ix(0), iTop],
			[ix(0), iTop + 58],
		],
		{ color: MUTED, width: 1.5 },
	);
	f.text(ix(0), iTop + 70, '0', { size: 13, color: MUTED });
	f.text(ix(-6), iTop + 70, '-6', { size: 13, color: MUTED });

	// Where each named career's label sits, clear of the crowd between 1850 and 1930
	const PLACE = {
		'Charles Dickens': (c) => [x(c.last) - 6, y(c.fit_last) + 13, 'end'],
		'Henry James': (c) => [x(c.first) - 6, y(c.fit_first) - 10, 'end'],
		'Jane Austen': (c) => [x(c.last) + 6, y(c.fit_last) - 8, 'start'],
		'Mark Twain': (c) => [x(c.last) + 6, y(c.fit_last) - 8, 'start'],
	};
	const grow = (k) => (t) => easeOut(prog(t, T0 + k * EACH, 0.5));
	const quoted = SHELF.map((p) => [Number(p.period.slice(0, 4)) + 12, p.semicolon, p.quoted]);
	const firstQuoted = quoted.findIndex((q) => q[2]);

	layers(f, true, (el) => {
		if (phone) return phoneRows(el).join('');
		const out = [
			// The shelf's median book: dotted while periods have fewer than 20 books, solid after
			el('path', {
				d: pathOf(quoted.slice(0, firstQuoted + 1).map(([yr, v]) => [x(yr), y(v)])),
				fill: 'none',
				stroke: COLORS.chalk,
				'stroke-width': 2,
				'stroke-opacity': 0.35,
				'stroke-dasharray': '3 5',
			}),
			el('path', {
				d: pathOf(quoted.slice(firstQuoted).map(([yr, v]) => [x(yr), y(v)])),
				fill: 'none',
				stroke: COLORS.chalk,
				'stroke-width': 3,
				'stroke-opacity': 0.35,
				'stroke-linejoin': 'round',
			}),
			label(el, x(1660), y(8.5), 'whole shelf, median book', {
				size: 13,
				color: MUTED,
				weight: 600,
			}),
		];
		C.forEach((c, k) => {
			const color = c.slope_per_decade < 0 ? COLORS.chalk : COLORS.pink;
			const g = grow(k);
			out.push(
				el(
					'line',
					{
						x1: n(x(c.first)),
						y1: n(y(c.fit_first)),
						stroke: color,
						'stroke-width': 3.5,
						'stroke-linecap': 'round',
						'stroke-opacity': NAMED[c.author] ? 1 : 0.5,
					},
					{
						x2: (t) => n(x(c.first + (c.last - c.first) * g(t))),
						y2: (t) => n(y(c.fit_first + (c.fit_last - c.fit_first) * g(t))),
						opacity: (t) => (t >= T0 + k * EACH ? 1 : 0),
					},
				),
				el(
					'circle',
					{
						cx: n(x(c.first)),
						cy: n(y(c.fit_first)),
						r: 4,
						fill: color,
						stroke: PANEL,
						'stroke-width': 1.5,
					},
					{
						opacity: (t) => (t >= T0 + k * EACH ? 1 : 0),
					},
				),
			);
			if (NAMED[c.author]) {
				const [lx, ly, anchor] = PLACE[c.author](c);
				out.push(
					label(el, lx, ly, NAMED[c.author], {
						size: 13,
						anchor,
						color,
						weight: 700,
						anims: { opacity: (t) => (g(t) >= 1 ? 1 : 0) },
					}),
				);
			}
		});
		out.push(...counts(el), ...inset(el));
		return out.join('');
	});

	function counts(el) {
		const at = phone ? rowTop - 26 : T - 8;
		return [
			label(el, R, at, '8 fall', {
				size: 14,
				anchor: 'end',
				color: COLORS.chalk,
				anims: { opacity: (t) => (t >= T_INSET - 0.4 ? 1 : 0) },
			}),
			label(el, R - (phone ? 52 : 58), at, '9 rise', {
				size: 14,
				anchor: 'end',
				color: COLORS.pink,
				anims: { opacity: (t) => (t >= T_INSET - 0.4 ? 1 : 0) },
			}),
		];
	}

	function phoneRows(el) {
		const out = ROWS.flatMap((c, i) => {
			const color = c.slope_per_decade < 0 ? COLORS.chalk : COLORS.pink;
			return [
				el('line', {
					x1: n(tx(c.fit_first)),
					x2: n(tx(c.fit_last)),
					y1: ry(i),
					y2: ry(i),
					stroke: color,
					'stroke-width': 3,
					'stroke-linecap': 'round',
				}),
				el('circle', {
					cx: n(tx(c.fit_first)),
					cy: ry(i),
					r: 3.5,
					fill: PANEL,
					stroke: color,
					'stroke-width': 2,
				}),
				el('circle', { cx: n(tx(c.fit_last)), cy: ry(i), r: 4.5, fill: color }),
			];
		});
		out.push(
			label(el, 12, rowTop - 26, 'hollow: first book', {
				size: 13,
				anchor: 'start',
				color: MUTED,
				weight: 600,
			}),
		);
		return [...out, ...counts(el), ...inset(el)];
	}

	function inset(el) {
		const out = [];
		bars.forEach(([, v, ci], i) => {
			const cy = iTop + 14 + i * 30;
			const g = (t) => easeOut(prog(t, T_INSET + i * 0.3, 0.5));
			out.push(
				el(
					'rect',
					{ y: cy - 9, height: 18, width: 0, fill: i ? COLORS.pink : COLORS.chalk, x: n(ix(0)) },
					{
						x: (t) => n(ix(v * g(t))),
						width: (t) => n(ix(0) - ix(v * g(t))),
					},
				),
				el(
					'line',
					{
						x1: n(ix(ci[0])),
						x2: n(ix(ci[1])),
						y1: cy,
						y2: cy,
						stroke: COLORS.paper,
						'stroke-width': 2,
					},
					{ opacity: (t) => (g(t) >= 1 ? 1 : 0) },
				),
				label(el, ix(0) + 8, cy, v.toFixed(1), {
					size: 14,
					anchor: 'start',
					color: i ? COLORS.pink : COLORS.chalk,
					anims: { opacity: (t) => (g(t) >= 1 ? 1 : 0) },
				}),
			);
		});
		return out;
	}
}

export const desktop = { height: 470, draw: (f) => chart(f, { W: 640, H: 470, phone: false }) };
export const phone = { height: 620, draw: (f) => chart(f, { W: 360, H: 620, phone: true }) };
