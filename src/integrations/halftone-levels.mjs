// The pink tone (global.css, "Pink pictures") is a CSS filter: grayscale, then each picture's
// own levels stretched to black and full pink, inverted when it's mostly white. This measures
// those levels from each picture's file at build time and writes them on its tag, so the
// picture paints pink on the first frame with no script. A video is measured from its poster.
// The dev server skips this, so there every picture is pink at its plain levels.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const SAMPLE_SIZE = 32;
// Ignore the darkest and brightest 2% when finding a picture's range
const LEVELS_CUTOFF = 0.02;
// A range narrower than this (a flat color) is left as it is
const MIN_RANGE = 0.1;
// Mean brightness above which a picture is inverted, so the ground stays black
const LIGHT_IMAGE_MEAN = 140 / 255;

/** A picture's mean brightness and its darkest and brightest tones, 0-1. Transparent
 * pixels count as the black page under them. */
export async function measureLevels(file) {
	const { data } = await sharp(file, { animated: false })
		.flatten({ background: '#000' })
		.resize(SAMPLE_SIZE, SAMPLE_SIZE, { fit: 'fill' })
		.raw()
		.toBuffer({ resolveWithObject: true });
	// The levels stretch the gray CSS grayscale() draws (Rec. 709 weights). Measured on the
	// old shader's Rec. 601 gray, saturated pictures came out up to 76/255 off and lost
	// their black ground. Which pictures invert still goes by the 601 mean, as before.
	const values = [];
	let mean601 = 0;
	for (let i = 0; i < data.length; i += 3) {
		const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
		values.push((0.2126 * r + 0.7152 * g + 0.0722 * b) / 255);
		mean601 += (0.299 * r + 0.587 * g + 0.114 * b) / 255;
	}
	values.sort((a, b) => a - b);
	const mean = mean601 / values.length;
	const low = values[Math.floor(values.length * LEVELS_CUTOFF)];
	const high = values[Math.ceil(values.length * (1 - LEVELS_CUTOFF)) - 1];
	return high - low < MIN_RANGE ? { mean, low: 0, high: 1 } : { mean, low, high };
}

/** The CSS for a picture's levels: brightness then contrast is the straight-line stretch
 * of low..high to 0..1 (contrast pivots on 0.5, so b = 1/(high+low), c = (high+low)/(high-low)) */
export function levelsStyle({ low, high }) {
	const round = (n) => Math.round(n * 1000) / 1000;
	return `--halftone-b:${round(1 / (high + low))};--halftone-c:${round((high + low) / (high - low))}`;
}

const PICTURE = /<(?:img|video)\b(?:[^>"]|"[^"]*")*\sdata-halftone\b(?:[^>"]|"[^"]*")*>/g;

/** The page with each pink picture's levels on its tag. `levelsFor(src)` gives a still's
 * levels, or null for a video with no poster (it keeps its plain levels). */
export async function withHalftoneLevels(html, levelsFor) {
	const tags = [...html.matchAll(PICTURE)].map(([tag]) => tag);
	if (tags.length === 0) return html;
	const replacements = new Map();
	for (const tag of new Set(tags)) {
		const attribute = (name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
		const still = tag.startsWith('<img')
			? attribute('src')
			: (attribute('poster') ?? attribute('data-poster'));
		const levels = still ? await levelsFor(still) : null;
		if (!levels) continue;
		// A clip with controls is never inverted: the filter paints the browser's controls
		// too, and inverted they turned into an unreadable pink band
		const invert =
			levels.mean > LIGHT_IMAGE_MEAN &&
			!/\sdata-halftone-no-invert\b/.test(tag) &&
			!/^<video\b(?:[^>"]|"[^"]*")*\scontrols\b/.test(tag)
				? ' data-halftone-invert'
				: '';
		const style = levelsStyle(levels);
		const existing = attribute('style');
		const withStyle =
			existing === undefined
				? tag.replace(/^<(img|video)/, `<$1 style="${style}"`)
				: tag.replace(` style="${existing}"`, ` style="${existing.replace(/;?$/, ';')}${style}"`);
		replacements.set(tag, withStyle.replace(/^<(img|video)/, `<$1${invert}`));
	}
	return html.replace(PICTURE, (tag) => replacements.get(tag) ?? tag);
}

function htmlFiles(dir) {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) return htmlFiles(path);
		return entry.name.endsWith('.html') ? [path] : [];
	});
}

export default function halftoneLevels() {
	return {
		name: 'halftone-levels',
		hooks: {
			'astro:build:done': async ({ dir, logger }) => {
				const root = fileURLToPath(dir);
				const cache = new Map();
				const levelsFor = (src) => {
					if (!src.startsWith('/')) throw new Error(`Pink picture not on this site: ${src}`);
					const file = join(root, decodeURIComponent(src.split(/[?#]/)[0]));
					if (!cache.has(file)) cache.set(file, measureLevels(file));
					return cache.get(file);
				};
				let pages = 0;
				for (const file of htmlFiles(root)) {
					const html = readFileSync(file, 'utf8');
					const leveled = await withHalftoneLevels(html, levelsFor);
					if (leveled !== html) {
						writeFileSync(file, leveled);
						pages++;
					}
				}
				logger.info(`Pink levels for ${cache.size} pictures on ${pages} pages`);
			},
		},
	};
}
