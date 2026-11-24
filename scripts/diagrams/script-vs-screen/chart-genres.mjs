// Genres ranked by how much of the script survives: animation at the top, the action-adjacent
// genres at the bottom, comedy in the middle. Bars grow in from zero, top to bottom.
import { COLORS, DATA, MUTED, easeOut, label, layers, n, panel, pct, prog } from './_chart.mjs';

const ROWS = DATA.genres;
const LOUD = new Set(['Animation', 'Comedy', 'Action']);

export const alt = `Bar chart: median share of the script said word for word on screen, by IMDb genre (genres with 30 or more films). ${ROWS.map((g) => `${g.genre} ${pct(g.kept)} (${g.n} films)`).join(', ')}.`;

function chart(f, { W, H, phone }) {
	const L = phone ? 100 : 130;
	const R = W - (phone ? 46 : 60);
	const top = phone ? 76 : 96;
	const rowH = phone ? 21 : 22;
	const x = (v) => L + v * (R - L);
	panel(f, 6, phone ? 46 : 42, W - 12, H - (phone ? 52 : 48));
	f.text(
		phone ? 20 : 16,
		phone ? 18 : 20,
		phone ? 'Action rewrites most' : 'Action movies rewrite the most, cartoons the least',
		{
			font: 'display',
			size: phone ? 19 : 22,
			anchor: 'start',
			upper: true,
		},
	);
	ROWS.forEach((g, i) => {
		const cy = top + i * rowH + rowH / 2;
		f.text(L - 10, cy, g.genre, {
			size: 13,
			anchor: 'end',
			weight: LOUD.has(g.genre) ? 700 : 400,
			color: LOUD.has(g.genre) ? COLORS.paper : MUTED,
		});
	});
	f.text((L + R) / 2, top + ROWS.length * rowH + 18, 'Median script kept word for word (%)', {
		size: 13,
		color: MUTED,
	});
	layers(f, phone, (el) => {
		const out = [];
		ROWS.forEach((g, i) => {
			const cy = top + i * rowH + rowH / 2;
			const at = 0.4 + i * 0.06;
			const p = (t) => easeOut(prog(t, at, 0.6));
			out.push(
				el(
					'rect',
					{
						x: n(x(0)),
						y: n(cy - 7),
						height: 14,
						fill: LOUD.has(g.genre) ? COLORS.pink : COLORS.chalk,
					},
					{ width: (t) => n((x(g.kept) - x(0)) * p(t)) },
				),
				label(el, x(g.kept) + 6, cy, pct(g.kept), {
					size: 13,
					anchor: 'start',
					color: MUTED,
					anims: { opacity: (t) => (p(t) >= 1 ? 1 : 0) },
				}),
			);
		});
		return out.join('');
	});
}

const rows = ROWS.length;
export const desktop = {
	height: 96 + rows * 22 + 50,
	draw: (f) => chart(f, { W: 640, H: 96 + rows * 22 + 50, phone: false }),
};
export const phone = {
	height: 76 + rows * 21 + 46,
	draw: (f) => chart(f, { W: 360, H: 76 + rows * 21 + 46, phone: true }),
};
