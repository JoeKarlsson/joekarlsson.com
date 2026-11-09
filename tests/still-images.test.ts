// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { addStills, stillPath } from '../src/integrations/responsive-images.mjs';
import { showStills } from '../src/scripts/still-images';

describe('addStills', () => {
	it('names the still on an animated thumbnail and leaves other images alone', () => {
		const stillOf = (src: string) =>
			src === '/images/a/thumb-1234abcd.webp' ? stillPath(src) : undefined;
		const html =
			'<img src="/images/a/thumb-1234abcd.webp" alt="x"><img src="/images/a/photo.webp" alt="y">';
		expect(addStills(html, stillOf)).toBe(
			'<img data-still="/images/a/thumb-1234abcd.still.webp" src="/images/a/thumb-1234abcd.webp" alt="x"><img src="/images/a/photo.webp" alt="y">',
		);
	});
});

describe('showStills', () => {
	it('swaps an animated card for its still and back, srcset included', () => {
		document.body.innerHTML =
			'<img data-still="/a/thumb.still.webp" srcset="/a/thumb.400w.webp 400w, /a/thumb.webp 960w" src="/a/thumb.webp">';
		const img = document.querySelector('img')!;

		showStills(true);
		expect(img.getAttribute('src')).toBe('/a/thumb.still.webp');
		expect(img.hasAttribute('srcset')).toBe(false);

		// Pausing twice keeps the animated original to come back to
		showStills(true);
		showStills(false);
		expect(img.getAttribute('src')).toBe('/a/thumb.webp');
		expect(img.getAttribute('srcset')).toBe('/a/thumb.400w.webp 400w, /a/thumb.webp 960w');
	});
});
