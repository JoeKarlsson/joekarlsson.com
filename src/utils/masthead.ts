/**
 * A post's masthead title (BlogPost.astro), set big and fitted to the column like a magazine
 * opener: split into one to three lines of similar length, then sized so the longest line
 * fills the column. Anton's capitals average about 0.44em wide; 0.5 leaves room for wide
 * letters (M, W) so a line never runs past the edge.
 */
const CHAR_WIDTH_EM = 0.5;

export function mastheadLines(title: string): string[] {
	// A lone dash ("TL;DR in Tech - Issue #106") stays with the word before it, so no line opens on it
	const words = title
		.split(/\s+/)
		.filter(Boolean)
		.reduce<string[]>((joined, word) => {
			if (/^[-–—]$/.test(word) && joined.length) joined[joined.length - 1] += ` ${word}`;
			else joined.push(word);
			return joined;
		}, []);
	const count = Math.min(words.length, title.length <= 16 ? 1 : title.length <= 34 ? 2 : 3);
	const target = title.length / count;
	const lines: string[] = [];
	let line = '';
	for (const word of words) {
		const longer = line ? `${line} ${word}` : word;
		if (line && longer.length > target * 1.15 && lines.length < count - 1) {
			lines.push(line);
			line = word;
		} else {
			line = longer;
		}
	}
	lines.push(line);
	return lines;
}

/**
 * The font size that fits the longest line to the container's width (cqi), between 2.25rem and
 * 150px, never smaller than a post's h2. The rem ends keep it growing with browser zoom and text size (WCAG 1.4.4), where
 * cqi alone shrinks as zoom narrows the column; a long title wraps to more lines at the floor.
 */
export function mastheadFontSize(lines: string[]): string {
	const longest = Math.max(...lines.map((line) => line.length));
	return `clamp(2.25rem, ${(100 / (longest * CHAR_WIDTH_EM)).toFixed(2)}cqi, 9.375rem)`;
}

/**
 * Anton's left side bearing in em for the characters a title line starts with, read from
 * the font file with fontkitten. Pulling a line left by its first letter's bearing puts the
 * ink, not the glyph box, on the edge the rule, picture and text share (2-6px off before;
 * one fixed nudge overshot on T and Y, which have almost none).
 */
const ANTON_LEFT_BEARING: Record<string, number> = {
	A: 0.015,
	B: 0.038,
	C: 0.031,
	D: 0.038,
	E: 0.038,
	F: 0.038,
	G: 0.031,
	H: 0.038,
	I: 0.03,
	J: 0.019,
	K: 0.038,
	L: 0.038,
	M: 0.038,
	N: 0.038,
	O: 0.031,
	P: 0.038,
	Q: 0.026,
	R: 0.038,
	S: 0.021,
	T: 0.01,
	U: 0.028,
	V: 0.011,
	W: 0.013,
	X: 0.013,
	Y: 0.005,
	Z: 0.016,
	0: 0.02,
	1: 0.012,
	2: 0.028,
	3: 0.019,
	4: 0.009,
	5: 0.022,
	6: 0.026,
	7: 0.034,
	8: 0.022,
	9: 0.026,
	'"': 0.02,
	"'": 0.02,
	'“': 0.026,
	'‘': 0.026,
	'(': 0.024,
	$: 0.017,
	'#': 0.019,
	'&': 0.017,
};

/** The margin that sets a masthead title line's first letter on the edge (CSS, in em). */
export function mastheadLineInset(line: string): string {
	return `-${ANTON_LEFT_BEARING[line.charAt(0).toUpperCase()] ?? 0.03}em`;
}
