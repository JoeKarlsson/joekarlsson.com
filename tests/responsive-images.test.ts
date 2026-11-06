import { describe, expect, it } from 'vitest';
import { addSrcsets } from '../src/integrations/responsive-images.mjs';

const widths: Record<string, number> = { '/images/a/hero.webp': 1200, '/images/a/small.webp': 600 };
const widthOf = (src: string) => widths[src];

describe('addSrcsets', () => {
	it('adds the smaller copies and the original to an image that sets sizes', () => {
		const html = '<img src="/images/a/hero.webp" sizes="112px" alt="">';
		expect(addSrcsets(html, widthOf)).toBe(
			'<img srcset="/images/a/hero.400w.webp 400w, /images/a/hero.800w.webp 800w, /images/a/hero.webp 1200w" src="/images/a/hero.webp" sizes="112px" alt="">',
		);
	});

	it('only offers copies narrower than the original', () => {
		const html = '<img src="/images/a/small.webp" sizes="112px">';
		expect(addSrcsets(html, widthOf)).toContain(
			'srcset="/images/a/small.400w.webp 400w, /images/a/small.webp 600w"',
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
