import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import { DEFAULT_HERO_IMAGE } from '../src/consts';
import { halftoneThumbnail } from '../src/utils/thumbnails';

// One 1120px halftone serves the homepage thumbnail and the post hero. With the
// duotone under the dots they run 5-170KB; busy screenshots are the big ones.
const MAX_THUMBNAIL_BYTES = 180 * 1024;

function heroImages(): string[] {
	const heroes = new Set([DEFAULT_HERO_IMAGE]);
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

describe('halftoneThumbnail', () => {
	it('names the thumbnail next to its source', () => {
		expect(halftoneThumbnail('/images/blog/x/hero.webp')).toBe('/images/blog/x/hero-halftone.webp');
		expect(halftoneThumbnail('/images/blog/x/a.b.png')).toBe('/images/blog/x/a.b-halftone.webp');
	});
});

describe('dithered post thumbnails', () => {
	it('every hero image has a thumbnail under the size limit (npm run media:thumbnails)', () => {
		const problems = heroImages().flatMap((hero) => {
			const thumbnail = join('public', halftoneThumbnail(hero));
			if (!existsSync(thumbnail)) return [`${hero}: no ${halftoneThumbnail(hero)}`];
			const size = statSync(thumbnail).size;
			return size > MAX_THUMBNAIL_BYTES
				? [`${hero}: thumbnail is ${Math.round(size / 1024)}KB`]
				: [];
		});
		expect(problems).toEqual([]);
	});
});
