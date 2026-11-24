// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { announce } from '../src/scripts/announce';
import { initHeadingLinks } from '../src/scripts/heading-links';

// VoiceOver skips a live region message identical to its last one, even after the region was
// emptied, so a repeat has to differ (Modern Web Guidance, copy-button guide)
describe('announce', () => {
	it('makes a repeated message differ from the last one, and alternates back', () => {
		const region = document.createElement('span');
		announce(region, 'Copied');
		const first = region.textContent;
		region.textContent = '';
		announce(region, 'Copied');
		const second = region.textContent;
		announce(region, 'Copied');
		expect(first).toBe('Copied');
		expect(second).toBe('Copied\u00A0');
		expect(region.textContent).toBe('Copied');
	});

	it('keeps each region to itself', () => {
		const a = document.createElement('span');
		const b = document.createElement('span');
		announce(a, 'Copied');
		announce(b, 'Copied');
		expect(b.textContent).toBe('Copied');
	});

	it('gives a second "Link copied" on a heading different words', async () => {
		vi.stubGlobal('requestAnimationFrame', (run: FrameRequestCallback) => run(0));
		Object.assign(navigator, { clipboard: { writeText: () => Promise.resolve() } });
		document.body.innerHTML = '<main><h2 id="one">One</h2></main>';
		initHeadingLinks();
		const tag = document.querySelector('.link-copied')!;
		const heard: string[] = [];
		const click = async () => {
			document.querySelector('h2 a')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
			await new Promise((resolve) => setTimeout(resolve));
			heard.push(tag.textContent ?? '');
		};
		await click();
		await click();
		expect(heard[0]).toBe('Link copied');
		expect(heard[1]).not.toBe(heard[0]);
		vi.unstubAllGlobals();
	});
});
