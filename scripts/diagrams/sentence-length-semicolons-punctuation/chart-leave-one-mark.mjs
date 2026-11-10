// Leave one mark out: every bar starts at the full fingerprint's 34% and dips to what the test
// gets without that mark. None falls far; the period costs the most.
import {
	COLORS,
	DATA,
	MUTED,
	SANS,
	easeOutBack,
	label,
	layers,
	n,
	panel,
	prog,
} from './_chart.mjs';

const LO = DATA.leave_one_mark_out;
const NAMES = {
	',': 'comma',
	'.': 'period',
	'"': 'double quote',
	"'": 'apostrophe',
	';': 'semicolon',
	':': 'colon',
	'-': 'dash',
	'?': 'question mark',
	'!': 'exclamation mark',
	'(': 'parentheses',
};
const ROWS = Object.entries(LO.without).sort((a, b) => a[1] - b[1]);
const T0 = 0.6;
const EACH = 0.15;

export const alt =
	'Bar chart: how often punctuation alone names the author when one of the ten tracked marks is left out of the fingerprint, against 34% with all ten. Without the period: 30.9%. Without the comma or the colon: 31.4%. Without the apostrophe or question mark: 32.1%. Without the semicolon, dash or parentheses: 32.3%. Without the exclamation mark: 32.6%. Without the double quote: 33.8%. No single mark carries the signature.';

function chart(f, { W, H, phone }) {
	const L = phone ? 160 : 210;
	const R = W - (phone ? 24 : 70);
	const top = phone ? 104 : 112;
	const rowH = phone ? 28 : 30;
	const x = (v) => L + (v / 40) * (R - L);
	const bottom = top + ROWS.length * rowH;
	panel(f, 6, phone ? 46 : 42, W - 12, H - (phone ? 52 : 48));
	f.text(
		phone ? 20 : 16,
		phone ? 18 : 20,
		phone ? 'No single mark carries it' : 'No single mark carries the author’s signature',
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
			? 'Authors named, with one mark left out'
			: 'Share of books matched to the right author, with one mark left out of the fingerprint',
		{
			size: 13,
			anchor: 'start',
			color: MUTED,
		},
	);
	[0, 10, 20, 30, 40].forEach((v) => {
		f.line(
			[
				[x(v), top - 10],
				[x(v), bottom],
			],
			{ color: v ? '#2c2c2c' : MUTED, width: v ? 1 : 1.5 },
		);
		f.text(x(v), bottom + 16, `${v}%`, { size: 13, color: MUTED });
	});
	ROWS.forEach(([mark], i) => {
		const cy = top + i * rowH + rowH / 2;
		f.text(L - 14, cy, `no ${NAMES[mark]}`, {
			size: 13,
			anchor: 'end',
			weight: 600,
			color: mark === '.' ? COLORS.pink : COLORS.paper,
		});
	});

	layers(f, phone, (el) => {
		const out = [];
		ROWS.forEach(([mark, v], i) => {
			const cy = top + i * rowH + rowH / 2;
			const at = T0 + i * EACH;
			const p = (t) => easeOutBack(prog(t, at, 0.5));
			const w = (t) => n(x(LO.none + (v - LO.none) * p(t)) - x(0));
			out.push(
				el(
					'rect',
					{ x: n(x(0)), y: n(cy - 8), height: 16, fill: mark === '.' ? COLORS.pink : COLORS.chalk },
					{ width: w },
				),
				el(
					'text',
					{
						x: n(x(0) + 8),
						y: n(cy + 1),
						'font-family': SANS,
						'font-size': 15,
						'font-weight': 700,
						fill: '#151515',
						'dominant-baseline': 'central',
					},
					{},
					mark === '"' ? '&quot;' : mark,
				),
				// inside the bar's end, so it never sits on the dashed 34% line
				label(el, x(v) - 6, cy, `${v}%`, {
					size: 13,
					anchor: 'end',
					color: '#151515',
					anims: { opacity: (t) => (t >= at + 0.5 ? 1 : 0) },
				}),
			);
		});
		// The all-ten line, there from the start: every bar begins at it
		out.push(
			el('line', {
				x1: n(x(LO.none)),
				x2: n(x(LO.none)),
				y1: top - 14,
				y2: bottom + 2,
				stroke: COLORS.pink,
				'stroke-width': 2.5,
				'stroke-dasharray': '6 5',
			}),
			label(el, x(LO.none), top - 24, phone ? 'all ten: 34%' : 'all ten marks: 34%', {
				size: 13,
				color: COLORS.pink,
			}),
		);
		return out.join('');
	});
}

export const desktop = { height: 466, draw: (f) => chart(f, { W: 640, H: 466, phone: false }) };
export const phone = { height: 436, draw: (f) => chart(f, { W: 360, H: 436, phone: true }) };
