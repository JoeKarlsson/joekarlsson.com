// Makes the dithered thumbnail for every post hero image (and the default hero):
// a pink halftone WebP next to the original, named by halftoneThumbnail() in
// src/utils/thumbnails.ts. Skips thumbnails newer than their source.
//
// Usage: npm run media:thumbnails
import { execFile } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { promisify } from 'node:util';

const run = promisify(execFile);
const CONTENT_DIRS = ['src/content/blog', 'src/content/newsletter'];
const DEFAULT_HERO = '/images/og-default.webp'; // DEFAULT_HERO_IMAGE in src/consts.ts
// Working width; the halftone comes out twice this, sharp at the homepage's 300px slot
const WIDTH = 300;
// Finer than the video's 3: at thumbnail size, coarser dots turn diagrams and
// screenshots to mush
const CELL = 1.5;
const PARALLEL = 8;

const halftoneThumbnail = (image) => image.replace(/\.[a-z0-9]+$/i, '-halftone.webp');

function heroImages() {
	const heroes = new Set([DEFAULT_HERO]);
	for (const dir of CONTENT_DIRS) {
		for (const file of readdirSync(dir).filter((f) => /\.mdx?$/.test(f))) {
			const match = readFileSync(join(dir, file), 'utf8').match(
				/^heroImage:\s*['"]?([^'"\n]+)['"]?\s*$/m,
			);
			if (match && match[1].startsWith('/')) heroes.add(match[1].trim());
		}
	}
	return [...heroes];
}

const todo = heroImages().filter((hero) => {
	const source = join('public', hero);
	const thumbnail = join('public', halftoneThumbnail(hero));
	if (!existsSync(source)) throw new Error(`Hero image ${hero} is missing from public/`);
	return !existsSync(thumbnail) || statSync(thumbnail).mtimeMs < statSync(source).mtimeMs;
});

let done = 0;
async function worker() {
	while (todo.length) {
		const hero = todo.pop();
		await run('python3', [
			'scripts/media/halftone.py',
			join('public', hero),
			join('public', halftoneThumbnail(hero)),
			'--width',
			String(WIDTH),
			'--cell',
			String(CELL),
			'--invert-light',
		]);
		done++;
	}
}
await Promise.all(Array.from({ length: PARALLEL }, worker));
console.log(`Dithered ${done} thumbnail(s).`);
