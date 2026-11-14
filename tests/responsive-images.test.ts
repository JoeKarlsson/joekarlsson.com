import { describe, expect, it } from 'vitest';
import { addSrcsets } from '../src/integrations/responsive-images.mjs';

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

	it('leaves images without sizes, with a srcset, or outside /images alone', () => {
		const untouched = [
			'<img src="/images/a/hero.webp" alt="">',
			'<img src="/images/a/hero.webp" srcset="x 1x" sizes="112px">',
			'<img src="https://img.youtube.com/vi/x/mqdefault.jpg" sizes="120px">',
			'<img src="/images/a/unknown.webp" sizes="112px">',
		].join('');
		expect(addSrcsets(untouched, widthOf)).toBe(untouched);
	});
});
