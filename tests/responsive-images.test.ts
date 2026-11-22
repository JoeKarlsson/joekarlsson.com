import { mkdtempSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { addSrcsets, cacheIsFresh, hashFile } from '../src/integrations/responsive-images.mjs';

const widths: Record<string, number> = {
	'/images/a/hero.webp': 1200,
	'/images/a/small.webp': 600,
	'/images/a/photo.webp': 1920,
};
const widthOf = (src: string) => widths[src];

describe('addSrcsets', () => {
	it('adds the smaller copies and the original to an image that sets sizes', () => {
		const html = '<img src="/images/a/hero.webp" sizes="112px" alt="">';
		expect(addSrcsets(html, widthOf)).toBe(
			'<img srcset="/images/a/hero.100w.webp 100w, /images/a/hero.400w.webp 400w, /images/a/hero.800w.webp 800w, /images/a/hero.webp 1200w" src="/images/a/hero.webp" sizes="112px" alt="">',
		);
	});

	it('only offers copies narrower than the original', () => {
		const html = '<img src="/images/a/small.webp" sizes="112px">';
		expect(addSrcsets(html, widthOf)).toContain(
			'srcset="/images/a/small.100w.webp 100w, /images/a/small.400w.webp 400w, /images/a/small.webp 600w"',
		);
	});

	it('offers a 1200px copy of a full-width photo, for phones at 2-3x', () => {
		const html = '<img src="/images/a/photo.webp" sizes="100vw">';
		expect(addSrcsets(html, widthOf)).toContain(
			'srcset="/images/a/photo.100w.webp 100w, /images/a/photo.400w.webp 400w, /images/a/photo.800w.webp 800w, /images/a/photo.1200w.webp 1200w, /images/a/photo.webp 1920w"',
		);
	});

	it("offers copies of a paper's figure under /papers", () => {
		const html = '<img src="/papers/p/figure1.webp" sizes="100vw">';
		expect(
			addSrcsets(html, (src: string) => (src === '/papers/p/figure1.webp' ? 1950 : undefined)),
		).toContain(
			'srcset="/papers/p/figure1.100w.webp 100w, /papers/p/figure1.400w.webp 400w, /papers/p/figure1.800w.webp 800w, /papers/p/figure1.1200w.webp 1200w, /papers/p/figure1.webp 1950w"',
		);
	});

	it('leaves images without sizes, with a srcset, or outside /images and /papers alone', () => {
		const untouched = [
			'<img src="/images/a/hero.webp" alt="">',
			'<img src="/images/a/hero.webp" srcset="x 1x" sizes="112px">',
			'<img src="https://img.youtube.com/vi/x/mqdefault.jpg" sizes="120px">',
			'<img src="/images/a/unknown.webp" sizes="112px">',
		].join('');
		expect(addSrcsets(untouched, widthOf)).toBe(untouched);
	});
});

describe('cacheIsFresh', () => {
	it('keeps a variant made from the same bytes, even when the source looks newer, and remakes it when the bytes change', () => {
		const dir = mkdtempSync(join(tmpdir(), 'responsive-images-'));
		const source = join(dir, 'poster.jpg');
		const cached = join(dir, 'poster-400.webp');
		writeFileSync(source, 'original bytes');
		writeFileSync(cached, 'variant');
		expect(cacheIsFresh(cached, hashFile(source))).toBe(false); // no sidecar yet
		writeFileSync(`${cached}.src`, hashFile(source));
		// A CI checkout: same bytes, brand-new file time
		const later = new Date(Date.now() + 60_000);
		utimesSync(source, later, later);
		expect(cacheIsFresh(cached, hashFile(source))).toBe(true);
		writeFileSync(source, 'edited bytes');
		expect(cacheIsFresh(cached, hashFile(source))).toBe(false);
	});
});
