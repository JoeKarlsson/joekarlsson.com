// The check on the main finding: the climb with rating holds inside shooting scripts and inside
// early drafts, so it isn't just famous films having polished scripts online. Three lines draw in.
import { COLORS, DATA, MUTED, easeOut, label, layers, n, panel, pct, prog } from './_chart.mjs';

const LINES = [
	['Shooting scripts', DATA.bandsByDraft.shooting, COLORS.pink],
	['All films', DATA.bands, COLORS.chalk],
	['Early drafts', DATA.bandsByDraft.early, MUTED],
];

export const alt = `Line chart: median share of the script said word for word, by IMDb rating band, for three kinds of script. ${LINES.map(([name, bands]) => `${name}: ${bands.map((b) => `${pct(b.kept)} (${b.label.toLowerCase()})`).join(', ')}`).join('. ')}. Every line climbs with the rating.`;

function chart(f, { W, H, phone }) {
	const L = phone ? 46 : 60;
	const R = W - (phone ? 140 : 160);
	const top = phone ? 80 : 96;
	const bottom = H - 50;
	const x = (i) => L + (i / 3) * (R - L);
	const y = (v) => bottom - (v / 0.6) * (bottom - top);
	panel(f, 6, phone ? 46 : 42, W - 12, H - (phone ? 52 : 48));
	f.text(phone ? 20 : 16, phone ? 18 : 20, phone ? 'Every kind of script climbs' : 'It holds for every kind of script', {
		font: 'display',
		size: phone ? 19 : 22,
		anchor: 'start',
		upper: true,
	});
	if (!phone) f.text(16, 62, 'Median share kept, by IMDb rating', { size: 13, anchor: 'start', color: MUTED });
	[0, 0.2, 0.4, 0.6].forEach((v) => {
		f.line([[L, y(v)], [R, y(v)]], { color: v ? '#2c2c2c' : MUTED, width: v ? 1 : 1.5 });
		f.text(L - 8, y(v), pct(v), { size: 13, color: MUTED, anchor: 'end' });
	});
	DATA.bands.forEach((b, i) => f.text(x(i), bottom + 16, phone ? b.label.replace(' and up', '+').replace(' to ', '–') : b.label, { size: 13, color: MUTED }));

	layers(f, phone, (el) => {
		const out = [];
		LINES.forEach(([name, bands, color], k) => {
			const at = 0.5 + k * 0.5;
			const p = (t) => easeOut(prog(t, at, 1));
			const pts = bands.map((b, i) => [x(i), y(b.kept)]);
			// the line grows from its first point to its last
			const d = (t) => {
				const reach = p(t) * 3;
				const shown = pts.slice(0, Math.floor(reach) + 1);
				const i = Math.floor(reach);
				if (i < 3) {
					const [ax, ay] = pts[i];
					const [bx, by] = pts[i + 1];
					const frac = reach - i;
					shown.push([ax + (bx - ax) * frac, ay + (by - ay) * frac]);
				}
				return 'M' + shown.map(([px, py]) => `${n(px)},${n(py)}`).join(' L');
			};
			out.push(el('path', { fill: 'none', stroke: color, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, { d }));
			const [lx, ly] = pts.at(-1);
			out.push(label(el, lx + 10, ly + [-12, 4, 20][k], `${name} ${pct(bands.at(-1).kept)}`, { size: 13, anchor: 'start', color, anims: { opacity: (t) => (p(t) >= 1 ? 1 : 0) } }));
		});
		return out.join('');
	});
}

export const desktop = { height: 330, draw: (f) => chart(f, { W: 640, H: 330, phone: false }) };
export const phone = { height: 300, draw: (f) => chart(f, { W: 360, H: 300, phone: true }) };
