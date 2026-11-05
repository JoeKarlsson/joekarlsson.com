import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import { DEFAULT_HERO_IMAGE } from '../src/consts';
import { projects } from '../src/data/projects';
import { halftoneHero, halftoneThumbnail } from '../src/utils/thumbnails';

// Each post hero and project image gets a 1120px hero halftone and a 560px list
// thumbnail. With the duotone under the dots they run 5-170KB; busy screenshots
// are the big ones.
const MAX_THUMBNAIL_BYTES = 180 * 1024;

function sourceImages(): string[] {
	const heroes = new Set([DEFAULT_HERO_IMAGE, ...projects.map((p) => p.image)]);
	for (const dir of ['src/content/blog', 'src/content/newsletter']) {
		for (const file of readdirSync(dir).filter((f) => /\.mdx?$/.test(f))) {
			const match = readFileSync(join(dir, file), 'utf8').match(
				/^heroImage:\s*['"]?([^'"\n]+)['"]?\s*$/m,
			);
			if (match && match[1].startsWith('/')) heroes.add(match[1].trim());
		}
	}
	return [...heroes];
}

describe('halftone names', () => {
	it('names both sizes next to their source', () => {
		expect(halftoneHero('/images/blog/x/hero.webp')).toBe('/images/blog/x/hero-halftone.webp');
		expect(halftoneHero('/images/blog/x/a.b.png')).toBe('/images/blog/x/a.b-halftone.webp');
		expect(halftoneThumbnail('/images/blog/x/hero.webp')).toBe(
			'/images/blog/x/hero-halftone-thumb.webp',
		);
	});
});

describe('dithered heroes and thumbnails', () => {
	it('every post hero and project image has both halftones under the size limit (npm run media:thumbnails)', () => {
		const problems = sourceImages().flatMap((image) =>
			[halftoneHero(image), halftoneThumbnail(image)].flatMap((halftone) => {
				const file = join('public', halftone);
				if (!existsSync(file)) return [`${image}: no ${halftone}`];
				const size = statSync(file).size;
				return size > MAX_THUMBNAIL_BYTES ? [`${halftone} is ${Math.round(size / 1024)}KB`] : [];
			}),
		);
		expect(problems).toEqual([]);
	});
});
