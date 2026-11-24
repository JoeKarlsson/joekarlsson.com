// Shared by this post's charts: the sentence-length post's panel, layers and stepped SMIL
// (one build-in when the chart scrolls into view, then a still frame), with this post's data.
// data.json is exported from the bechdel-test repo's data/screen and data/films.
import { readFileSync } from 'node:fs';

import { MUTED, SANS, n } from '../sentence-length-semicolons-punctuation/_chart.mjs';

export {
	COLORS,
	MUTED,
	SANS,
	easeOut,
	label,
	layers,
	n,
	panel,
	prog,
} from '../sentence-length-semicolons-punctuation/_chart.mjs';

export const DATA = JSON.parse(readFileSync(new URL('./data.json', import.meta.url), 'utf8'));

export const pct = (v) => `${Math.round(v * 100)}%`;
export const escapeXml = (s) =>
	String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

/** A y-axis title, rotated to read bottom to top, centred on (x, y). */
export function yAxisLabel(x, y, text) {
	return `<text transform="rotate(-90 ${n(x)} ${n(y)})" x="${n(x)}" y="${n(y)}" text-anchor="middle" dominant-baseline="central" font-family="${SANS}" font-size="13" fill="${MUTED}">${escapeXml(text)}</text>`;
}

/** A film as found in DATA.films: [title, year, rating, kept]. */
export function film(title) {
	const found = DATA.films.find(([t]) => t === title);
	if (!found) throw new Error(`no film called ${title} in data.json`);
	return found;
}
