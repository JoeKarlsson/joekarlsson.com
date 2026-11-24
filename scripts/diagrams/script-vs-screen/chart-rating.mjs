// Every film as a dot, IMDb rating against how much of its script was said on screen. The
// dots are drawn once, outside the motion layers (2,112 of them twice would double the page);
// the build-in is a cover that wipes off left to right, then the pink medians land.
import {
	COLORS,
	DATA,
	MUTED,
	easeOut,
	escapeXml,
	film,
	label,
	layers,
	n,
	panel,
	pct,
	prog,
	yAxisLabel,
} from './_chart.mjs';

const LO = 2.4;
const HI = 9.5;
// Films named on the chart: [title, dx, dy, anchor] for the label's offset from its dot
const NAMED = {
	desktop: [
		['Battlefield Earth', 8, -12, 'start'],
		['Inspector Gadget', 8, 10, 'start'],
		['Bridesmaids', 0, 16, 'middle'],
		['Interstellar', -8, 12, 'end'],
		['Apocalypse Now', -8, 0, 'end'],
		['The Princess Bride', -8, 0, 'end'],
		['The Dark Knight', -8, -10, 'end'],
		['The Shawshank Redemption', -8, 12, 'end'],
	],
	phone: [
		['Battlefield Earth', 8, -12, 'start'],
		['Bridesmaids', 0, 16, 'middle'],
		['Interstellar', -2, -14, 'end'],
		['The Princess Bride', -8, 0, 'end'],
	],
};
// IMDb ratings come in tenths, which stacks the dots in columns; a fixed spread within the
// tenth breaks them up without moving any film out of its rating
const spread = (i) => (((i * 2654435761) >>> 0) / 4294967296 - 0.5) * 0.09;

export const alt = `Scatter chart of ${DATA.films.length.toLocaleString()} films: IMDb rating against the share of the script's dialogue said word for word on screen. The median rises with the rating: ${DATA.bands.map((b) => `${pct(b.kept)} for films rated ${b.label.toLowerCase()}`).join(', ')}. There are big exceptions both ways, like Interstellar (rated 8.7, 9% kept) and Bridesmaids (6.8, 6%).`;

function chart(f, { W, H, phone }) {
	const L = phone ? 64 : 78;
	const R = W - (phone ? 16 : 24);
	const top = phone ? 92 : 96;
	const bottom = H - 48;
	const x = (rating) => L + ((rating - LO) / (HI - LO)) * (R - L);
	const y = (kept) => bottom - kept * (bottom - top);

	panel(f, 6, phone ? 46 : 42, W - 12, H - (phone ? 52 : 48));
	f.text(
		phone ? 20 : 16,
		phone ? 18 : 20,
		phone ? 'Better movies kept more' : 'Better-rated movies kept more of their scripts',
		{
			font: 'display',
			size: phone ? 19 : 22,
			anchor: 'start',
			upper: true,
		},
	);
	[0, 0.25, 0.5, 0.75, 1].forEach((v) => {
		f.line(
			[
				[L, y(v)],
				[R, y(v)],
			],
			{ color: v ? '#2c2c2c' : MUTED, width: v ? 1 : 1.5 },
		);
		f.text(L - 8, y(v), pct(v), { size: 13, color: MUTED, anchor: 'end' });
	});
	[3, 4, 5, 6, 7, 8, 9].forEach((r) =>
		f.text(x(r), bottom + 16, String(r), { size: 13, color: MUTED }),
	);
	f.text((L + R) / 2, bottom + 34, 'IMDb rating (out of 10)', { size: 13, color: MUTED });
	f.raw(yAxisLabel(phone ? 20 : 24, (top + bottom) / 2, 'Script kept word for word (%)'), 'groups');

	// The dots, still, under everything that moves. data-tips feeds the hover card
	// (src/scripts/chart-tips.ts): one "title|year|rating|kept" line per dot, in order
	const r = phone ? 1.6 : 2;
	const tips = DATA.films
		.map(([title, year, rating, kept]) => `${title}|${year}|${rating}|${Math.round(kept * 100)}`)
		.join('\n');
	f.raw(
		`<g fill="${COLORS.chalk}" fill-opacity="0.42" data-tips="${escapeXml(tips).replace(/\n/g, '&#10;')}">${DATA.films.map(([, , rating, kept], i) => `<circle cx="${n(x(rating + spread(i)))}" cy="${Math.round(y(kept))}" r="${r}"/>`).join('')}</g>`,
		'groups',
	);

	layers(f, phone, (el) => {
		const out = [];
		// The cover wipes off left to right over the first 1.6 s
		const wipe = (t) => easeOut(prog(t, 0.3, 1.6));
		out.push(
			el(
				'rect',
				{ y: top - 8, height: bottom - top + 12, fill: '#151515' },
				{
					x: (t) => n(L - 6 + (R - L + 12) * wipe(t)),
					width: (t) => n((R - L + 12) * (1 - wipe(t))),
				},
			),
		);
		// The median of each rating band, as a pink step that drops in after the wipe
		const edges = [LO, 6, 7, 8, HI];
		DATA.bands.forEach((b, i) => {
			const at = 2 + i * 0.25;
			const shown = (t) => (t >= at ? 1 : 0);
			const x0 = x(edges[i]) + 3;
			const x1 = x(edges[i + 1]) - 3;
			out.push(
				el(
					'rect',
					{ x: n(x0), y: n(y(b.kept) - 2), width: n(x1 - x0), height: 4, fill: COLORS.pink },
					{ opacity: shown },
				),
				label(el, (x0 + x1) / 2, y(b.kept) - 13, pct(b.kept), {
					size: 14,
					color: COLORS.pink,
					anims: { opacity: shown },
				}),
			);
		});
		// Named films: a bigger dot and its name, after the medians
		NAMED[phone ? 'phone' : 'desktop'].forEach(([title, dx, dy, anchor]) => {
			const [, , rating, kept] = film(title);
			const shown = (t) => (t >= 3.2 ? 1 : 0);
			out.push(
				el(
					'circle',
					{
						cx: n(x(rating)),
						cy: n(y(kept)),
						r: 4.5,
						fill: COLORS.paper,
						stroke: '#151515',
						'stroke-width': 1.5,
					},
					{ opacity: shown },
				),
				label(el, x(rating) + dx, y(kept) + dy, title, {
					size: 13,
					anchor,
					weight: 600,
					anims: { opacity: shown },
				}),
			);
		});
		return out.join('');
	});
}

export const desktop = { height: 470, draw: (f) => chart(f, { W: 640, H: 470, phone: false }) };
export const phone = { height: 420, draw: (f) => chart(f, { W: 360, H: 420, phone: true }) };
