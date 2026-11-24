// Shared by this post's charts: the sentence-length post's panel, layers and stepped SMIL
// (one build-in when the chart scrolls into view, then a still frame), with this post's data.
// data.json is exported from the bechdel-test repo's data/screen and data/films.
import { readFileSync } from 'node:fs';

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

/** A film as found in DATA.films: [title, year, rating, kept]. */
export function film(title) {
	const found = DATA.films.find(([t]) => t === title);
	if (!found) throw new Error(`no film called ${title} in data.json`);
	return found;
}
