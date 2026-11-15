/**
 * A post's masthead title (BlogPost.astro), set big and fitted to the column like a magazine
 * opener: split into one to three lines of similar length, then sized so the longest line
 * fills the column. Anton's capitals average about 0.44em wide; 0.5 leaves room for wide
 * letters (M, W) so a line never runs past the edge.
 */
const CHAR_WIDTH_EM = 0.5;

export function mastheadLines(title: string): string[] {
	const words = title.split(/\s+/).filter(Boolean);
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

/** The font size that fits the longest line to the container's width (cqi), capped at 150px */
export function mastheadFontSize(lines: string[]): string {
	const longest = Math.max(...lines.map((line) => line.length));
	return `min(150px, ${(100 / (longest * CHAR_WIDTH_EM)).toFixed(2)}cqi)`;
}
