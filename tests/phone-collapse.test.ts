// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { initPhoneCollapse, openCollapsedSectionOf } from '../src/scripts/phone-collapse';

const onPhone = (matches: boolean) =>
	vi.stubGlobal('matchMedia', () => ({ matches }) as MediaQueryList);

function page() {
	document.body.innerHTML = `
		<section data-phone-collapse data-collapse-noun="talk">
			<h2 data-collapse-heading>2021</h2>
			<ul data-collapse-body><li id="only-talk">One</li></ul>
		</section>
		<section data-phone-collapse="open">
			<h2 data-collapse-heading>2026</h2>
			<ul data-collapse-body><li>A</li><li>B</li></ul>
		</section>`;
	return [...document.querySelectorAll('section')];
}

describe('phone collapse', () => {
	it('folds sections behind a button on phones, and the button opens them', () => {
		onPhone(true);
		const [folded, open] = page();
		initPhoneCollapse();

		const button = folded.querySelector('button')!;
		expect(button.getAttribute('aria-expanded')).toBe('false');
		expect(folded.querySelector('ul')!.hidden).toBe(true);
		expect(button.textContent).toBe('20211 talk+');
		expect(open.querySelector('ul')!.hidden).toBe(false);

		button.click();
		expect(button.getAttribute('aria-expanded')).toBe('true');
		expect(folded.querySelector('ul')!.hidden).toBe(false);
	});

	it('opens the folded section around an element (a Uses pin target)', () => {
		onPhone(true);
		const [folded] = page();
		initPhoneCollapse();

		openCollapsedSectionOf(document.getElementById('only-talk')!);
		expect(folded.querySelector('ul')!.hidden).toBe(false);
	});

	it('leaves wider screens alone', () => {
		onPhone(false);
		const [folded] = page();
		initPhoneCollapse();

		expect(folded.querySelector('button')).toBeNull();
		expect(folded.querySelector('ul')!.hidden).toBe(false);
	});
});
