// Makes the dithered versions of every post hero image (and the default hero) and
// every project image: pink halftone WebPs next to the original, named by
// halftoneHero() and halftoneThumbnail() in src/utils/thumbnails.ts. Each image gets
// two sizes so the dots stay big and visible where it's shown. Skips files newer
// than their source.
//
// Usage: npm run media:thumbnails
import { execFile } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { projects } from '../../src/data/projects.ts';

const run = promisify(execFile);
const CONTENT_DIRS = ['src/content/blog', 'src/content/newsletter'];
const DEFAULT_HERO = '/images/og-default.webp'; // DEFAULT_HERO_IMAGE in src/consts.ts
const PARALLEL = 8;

// width: working width (the file comes out twice this). cell: dot spacing in
// working pixels. Both aim for dots about 4 CSS pixels apart where the image is
// shown: the hero around 700px wide, the list thumbnail around 280px.
const SIZES = [
	{ suffix: '-halftone.webp', width: 560, cell: 3.5 },
	{ suffix: '-halftone-thumb.webp', width: 280, cell: 4 },
];

const halftoneName = (image, suffix) => image.replace(/\.[a-z0-9]+$/i, suffix);

function sourceImages() {
	const images = new Set([DEFAULT_HERO, ...projects.map((p) => p.image)]);
	for (const dir of CONTENT_DIRS) {
		for (const file of readdirSync(dir).filter((f) => /\.mdx?$/.test(f))) {
			const match = readFileSync(join(dir, file), 'utf8').match(
				/^heroImage:\s*['"]?([^'"\n]+)['"]?\s*$/m,
			);
			if (match && match[1].startsWith('/')) images.add(match[1].trim());
		}
	}
	return [...images];
}

const todo = sourceImages().flatMap((image) => {
	const source = join('public', image);
	if (!existsSync(source)) throw new Error(`Image ${image} is missing from public/`);
	return SIZES.map((size) => ({
		source,
		out: join('public', halftoneName(image, size.suffix)),
		size,
	})).filter(({ out }) => !existsSync(out) || statSync(out).mtimeMs < statSync(source).mtimeMs);
});

let done = 0;
async function worker() {
	while (todo.length) {
		const { source, out, size } = todo.pop();
		await run('python3', [
			'scripts/media/halftone.py',
			source,
			out,
			'--width',
			String(size.width),
			'--cell',
			String(size.cell),
			'--invert-light',
			'--duotone',
		]);
		done++;
	}
}
await Promise.all(Array.from({ length: PARALLEL }, worker));
console.log(`Dithered ${done} image(s).`);
