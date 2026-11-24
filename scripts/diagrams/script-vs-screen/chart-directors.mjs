// Six directors, one row each, a dot per film: the writer-directors bunch up, the directors who
// shoot other people's scripts spread out. Each dot has a hover title; the row's median is pink.
import { COLORS, DATA, MUTED, easeOut, escapeXml, label, layers, n, panel, pct, prog } from './_chart.mjs';

const median = (xs) => {
	const a = [...xs].sort((p, q) => p - q);
	const m = a.length >> 1;
	return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
};
const ROWS = DATA.directors.map((d) => ({ ...d, median: median(d.films.map((film) => film[2])) }));

export const alt = `Dot chart: the share of each film's script said word for word on screen, for six directors. ${ROWS.map((d) => `${d.name}, ${d.films.length} films: median ${pct(d.median)}, from ${d.films.at(-1)[0]} at ${pct(d.films.at(-1)[2])} to ${d.films[0][0]} at ${pct(d.films[0][2])}.`).join(' ')}`;

function chart(f, { W, H, phone }) {
	const L = phone ? 20 : 170;
	const R = W - (phone ? 20 : 30);
	const top = phone ? 96 : 96;
	const rowH = phone ? 62 : 50;
	const x = (v) => L + v * (R - L);
	panel(f, 6, phone ? 46 : 42, W - 12, H - (phone ? 52 : 48));
	f.text(phone ? 20 : 16, phone ? 18 : 20, phone ? 'Who sticks to the page' : 'Who sticks to the page', {
		font: 'display',
		size: phone ? 19 : 22,
		anchor: 'start',
		upper: true,
	});
	f.text(phone ? 20 : 16, phone ? 37 : 62, phone ? 'Each dot is one of their films' : 'Each dot is one of their films: how much of its script was said word for word', {
		size: 13,
		anchor: 'start',
		color: MUTED,
	});
	const bottom = top + ROWS.length * rowH - 10;
	[0, 0.5, 1].forEach((v) => {
		f.line([[x(v), top - 14], [x(v), bottom]], { color: '#2c2c2c', width: 1 });
		f.text(x(v), bottom + 16, pct(v), { size: 13, color: MUTED });
	});

	layers(f, phone, (el) => {
		const out = [];
		ROWS.forEach((d, i) => {
			const cy = top + i * rowH + (phone ? 22 : 10);
			const at = 0.5 + i * 0.35;
			const nameY = phone ? cy - 22 : cy;
			out.push(label(el, phone ? L : L - 14, nameY, `${d.name} (${d.films.length})`, { size: 13, anchor: phone ? 'start' : 'end', weight: 700 }));
			d.films.forEach(([title, year, kept], j) => {
				// each dot drops from above its row onto its value, a few frames apart
				const p = (t) => easeOut(prog(t, at + j * 0.03, 0.4));
				out.push(
					el('circle', { cx: n(x(kept)), r: phone ? 5 : 6, fill: COLORS.chalk, 'fill-opacity': 0.8, class: 'chart-dot' }, { cy: (t) => n(cy - 16 * (1 - p(t))), opacity: (t) => (p(t) > 0 ? 1 : 0) },
						`<title>${escapeXml(`${title} (${year}): ${pct(kept)}`)}</title>`),
				);
			});
			const shown = (t) => (t >= at + 0.9 ? 1 : 0);
			out.push(
				el('rect', { x: n(x(d.median) - 1.5), y: n(cy - 12), width: 3, height: 24, fill: COLORS.pink }, { opacity: shown }),
			);
		});
		return out.join('');
	});
}

export const desktop = { height: 420, draw: (f) => chart(f, { W: 640, H: 420, phone: false }) };
export const phone = { height: 500, draw: (f) => chart(f, { W: 360, H: 500, phone: true }) };
