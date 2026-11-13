// Authorship from punctuation alone: the 708 books drop, a row at a time, into "named right"
// and "named wrong" piles. Then the two shuffled baselines land on a scale under them.
import { COLORS, DATA, MUTED, easeOut, label, layers, n, panel, prog } from './_chart.mjs';

const A = DATA.authorship;
const T0 = 0.3;
const ROW = 0.07;

export const alt =
	'Punctuation alone names the author of 241 of 708 books (34%), across 132 authors with three or more works: the books drop as dots into a pink pile named right and a larger chalk pile named wrong. Underneath, on a percent scale: with author labels shuffled, the same test gets 0.8% (chance is 1 in 132); with labels shuffled only among books of the same genre, 4.2%. English originals alone get 35%.';

function chart(f, { W, H, phone }) {
	const cols = phone ? 16 : 24;
	const step = phone ? 8 : 9;
	const r = phone ? 3 : 3.4;
	const pileW = cols * step;
	const gap = phone ? 34 : 70;
	const left = (W - (2 * pileW + gap)) / 2;
	const base = phone ? 340 : 300; // piles stand on this line
	const piles = [
		{
			count: A.right,
			x: left,
			color: COLORS.pink,
			name: phone ? 'Named right' : 'Named the right author',
		},
		{
			count: A.books - A.right,
			x: left + pileW + gap,
			color: COLORS.chalk,
			name: 'Named someone else',
		},
	];
	panel(f, 6, phone ? 46 : 42, W - 12, H - (phone ? 52 : 48));
	f.text(
		phone ? 20 : 16,
		phone ? 18 : 20,
		phone
			? 'Punctuation names the author'
			: 'Punctuation alone names the author a third of the time',
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
			? '708 books by 132 authors, one dot each'
			: '708 books by 132 authors, one dot each. Each book is guessed from the other books’ averages.',
		{
			size: 13,
			anchor: 'start',
			color: MUTED,
		},
	);
	piles.forEach((p) => {
		f.line(
			[
				[p.x - 4, base + 6],
				[p.x + pileW, base + 6],
			],
			{ color: MUTED, width: 1.5 },
		);
		f.text(p.x + pileW / 2, base + 22, p.name, { size: 13, weight: 600, color: p.color });
	});

	// The scale under the piles: where the real result and the two shuffles land
	const sTop = base + (phone ? 100 : 98);
	const sL = phone ? 24 : 70;
	const sR = W - (phone ? 24 : 70);
	const sx = (v) => sL + (v / 40) * (sR - sL);
	f.line(
		[
			[sL, sTop],
			[sR, sTop],
		],
		{ color: MUTED, width: 1.5 },
	);
	[0, 10, 20, 30, 40].forEach((v) => f.text(sx(v), sTop + 16, `${v}%`, { size: 13, color: MUTED }));
	f.text(
		phone ? 20 : 16,
		sTop + (phone ? 84 : 76),
		phone ? 'English originals alone: 35%' : 'English originals alone, no translations: 35%',
		{
			size: 13,
			anchor: 'start',
			color: MUTED,
			weight: 600,
		},
	);

	const rowsOf = (p) => Math.ceil(p.count / cols);
	const totalRows = Math.max(...piles.map(rowsOf));
	const T_SCALE = T0 + totalRows * ROW + 0.6;
	const markers = [
		{
			v: A.rate,
			text: phone ? '34% real' : '34%: the real test',
			color: COLORS.pink,
			at: T_SCALE,
			up: true,
		},
		{
			v: A.genre_shuffled_mean,
			text: phone ? '4.2% genre kept' : '4.2%: shuffled within genre',
			color: COLORS.paper,
			at: T_SCALE + 0.5,
			up: false,
		},
		{
			v: A.shuffled_mean,
			text: phone ? '0.8% shuffled' : '0.8%: labels shuffled',
			color: MUTED,
			at: T_SCALE + 1,
			up: true,
		},
	];

	layers(f, true, (el) => {
		const out = [];
		piles.forEach((p) => {
			const rows = rowsOf(p);
			for (let row = 0; row < rows; row++) {
				const inRow = Math.min(cols, p.count - row * cols);
				const y = base - r - row * step;
				const at = T0 + row * ROW;
				const dots = Array.from(
					{ length: inRow },
					(_, c) =>
						`<circle cx="${n(p.x + c * step + r)}" cy="${n(y)}" r="${r}" fill="${p.color}"/>`,
				).join('');
				out.push(
					el(
						'g',
						{},
						{
							translate: (t) => `0 ${n(-(base - 40) * (1 - easeOut(prog(t, at, 0.4))))}`,
							opacity: (t) => (t >= at ? 1 : 0),
						},
						dots,
					),
				);
			}
			out.push(
				label(
					el,
					p.x + pileW / 2,
					base - rows * step - 18,
					p === piles[0] ? `${A.right} of ${A.books}` : '',
					{
						size: phone ? 15 : 17,
						color: p.color,
						anims: { opacity: (t) => (t >= T0 + rows * ROW + 0.3 ? 1 : 0) },
					},
				),
			);
		});
		markers.forEach((m) => {
			const x = sx(m.v);
			const tip = sTop + (m.up ? -6 : 6);
			out.push(
				el(
					'path',
					{ d: `M${n(x)},${tip} l-7,${m.up ? -12 : 12} l14,0 Z`, fill: m.color },
					{
						opacity: (t) => (t >= m.at ? 1 : 0),
					},
				),
				label(el, x + (m.v < 10 ? -4 : 0), sTop + (m.up ? -30 : 38), m.text, {
					size: 13,
					anchor: m.v < 10 ? 'start' : 'middle',
					color: m.color,
					anims: {
						opacity: (t) => (t >= m.at ? 1 : 0),
						'fill-opacity': (t) => n(easeOut(prog(t, m.at, 0.2))),
					},
				}),
			);
		});
		return out.join('');
	});
}

export const desktop = { height: 520, draw: (f) => chart(f, { W: 640, H: 520, phone: false }) };
export const phone = { height: 560, draw: (f) => chart(f, { W: 360, H: 560, phone: true }) };
