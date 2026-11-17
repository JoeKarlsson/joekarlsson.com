// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';

// jsdom has no matchMedia. Every query answers "no": motion allowed, but a narrow
// screen, so a phone. Hoisted above the imports, which read it as they load.
vi.hoisted(() => {
	window.matchMedia = (query: string) =>
		({
			matches: false,
			media: query,
			addEventListener: () => {},
		}) as unknown as MediaQueryList;
});

import { addStills, stillPath } from '../src/integrations/responsive-images.mjs';
import { initStillImages, showStills } from '../src/scripts/still-images';

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

	it('ships only the still to a paper hero, which boils around it instead', () => {
		const html =
			'<img src="/a/thumb.webp" data-still-only srcset="/a/thumb.400w.webp 400w, /a/thumb.webp 960w" alt="x">';
		expect(addStills(html, (src: string) => stillPath(src))).toBe(
			'<img src="/a/thumb.still.webp" data-still-only alt="x">',
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

describe('still srcset', () => {
	it('names same-width copies of the still, and swaps them in', () => {
		const html =
			'<img srcset="/images/a/thumb-1234abcd.400w.webp 400w, /images/a/thumb-1234abcd.webp 1200w" src="/images/a/thumb-1234abcd.webp">';
		document.body.innerHTML = addStills(html, (src: string) => stillPath(src));
		const img = document.querySelector('img')!;
		showStills(true);
		expect(img.getAttribute('srcset')).toBe(
			'/images/a/thumb-1234abcd.still.400w.webp 400w, /images/a/thumb-1234abcd.still.webp 1200w',
		);
		showStills(false);
	});
});

describe('initStillImages', () => {
	it('shows the still on a phone even with motion allowed', () => {
		document.body.innerHTML = '<img data-still="/a/thumb.still.webp" src="/a/thumb.webp">';
		initStillImages();
		expect(document.querySelector('img')!.getAttribute('src')).toBe('/a/thumb.still.webp');
	});
});
