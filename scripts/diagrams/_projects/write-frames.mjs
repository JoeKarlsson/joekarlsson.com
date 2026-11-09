// Writes an animated card's frames, one SVG each in name order, for
// scripts/boiling-thumbnail.mjs to turn into a boiling, animated 16:9 thumbnail.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/** Every project card is drawn 640x360, a 16:9 card at the post column's width */
export const CARD = { width: 640, height: 360 };

/** The output dir from argv, or exit with usage naming the calling script */
export function outDirFromArgs(script) {
	const outDir = process.argv[2];
	if (!outDir) {
		console.error(`Usage: node ${script} <output dir>`);
		process.exit(2);
	}
	return outDir;
}

/** Throws on any text overflow or arrow collision the figure found, else returns its SVG */
export function finish(figure, label) {
	const svg = figure.toString(label);
	if (figure.issues.length) throw new Error(figure.issues.join('\n'));
	return svg;
}

export function writeFrames(outDir, frames) {
	mkdirSync(outDir, { recursive: true });
	frames.forEach((svg, i) =>
		writeFileSync(join(outDir, `frame-${String(i).padStart(3, '0')}.svg`), svg),
	);
	console.log(`Wrote ${frames.length} frames to ${outDir}`);
}
