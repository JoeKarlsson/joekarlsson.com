import { test, expect, type Page } from '@playwright/test';

// Content has to be readable with scripts off: a reveal, boil or lazy loader that starts
// content hidden and waits for a script to show it leaves a blank page for anyone whose
// script failed, was blocked, or never loaded. Pages are the most scripted ones on the site.
const pages = [
	'/',
	'/blog/',
	'/work/',
	'/about/',
	'/uses/',
	'/talks/',
	'/blog/hackers-and-painters-ai-agents/',
	'/blog/homelab-two-years-later/',
	'/blog/why-i-use-doom-to-visualize-mcp-data/',
	'/work/connect-ai-doom/',
];

const CONTENT = 'h1, h2, h3, h4, p, li, img, figure, a, video, picture, blockquote, table';

type Hidden = { path: string; why: string; text: string };

// Every content element inside <main> that a reader can't see, keyed by its DOM path so the
// scripts-on run can be compared against it. Things hidden on purpose (closed <details>,
// [hidden], aria-hidden decoration, screen-reader-only text, <template>, hover-only heading
// anchors) are left out.
async function findHiddenContent(page: Page): Promise<Hidden[]> {
	return page.evaluate((selector) => {
		const main = document.querySelector('main');
		if (!main) return [{ path: 'main', why: 'no <main>', text: '' }];
		const domPath = (el: Element) => {
			const parts: string[] = [];
			for (let node: Element | null = el; node && node !== main; node = node.parentElement) {
				const parent = node.parentElement;
				const index = parent ? Array.from(parent.children).indexOf(node) : 0;
				parts.unshift(`${node.tagName.toLowerCase()}:${index}`);
			}
			return parts.join('>');
		};
		// .heading-anchor: the "#" beside a post heading, shown by CSS on hover and focus
		const hiddenOnPurpose = (el: Element) =>
			el.closest(
				'[hidden], [aria-hidden="true"], template, dialog:not([open]), noscript, .heading-anchor',
			) !== null ||
			(el.closest('details:not([open])') !== null && !el.closest('summary'));
		const screenReaderOnly = (el: Element) => {
			const style = getComputedStyle(el);
			return style.position === 'absolute' && (style.clip !== 'auto' || style.clipPath !== 'none');
		};
		const found: { path: string; why: string; text: string }[] = [];
		for (const el of main.querySelectorAll(selector)) {
			if (hiddenOnPurpose(el) || screenReaderOnly(el)) continue;
			let why = '';
			for (let node: Element | null = el; node && !why; node = node.parentElement) {
				const style = getComputedStyle(node);
				// A CSS loop (the /about frames cut on a timer) shows each frame in turn without
				// scripts, so whichever frame is between cuts when we look isn't hidden content
				const cycles = node
					.getAnimations()
					.some((a) => a.effect?.getTiming().iterations === Infinity);
				if (cycles) continue;
				if (Number(style.opacity) === 0)
					why = `opacity 0 on ${node.tagName.toLowerCase()}.${node.className}`;
				else if (style.visibility === 'hidden')
					why = `visibility hidden on ${node.tagName.toLowerCase()}`;
				if (node === main) break;
			}
			const box = el.getBoundingClientRect();
			if (!why && el.getClientRects().length === 0) why = 'not rendered (display none)';
			else if (!why && (box.width === 0 || box.height === 0)) why = 'zero size';
			if (why)
				found.push({
					path: domPath(el),
					why,
					text: (el.textContent || el.getAttribute('alt') || '').trim().slice(0, 60),
				});
		}
		return found;
	}, CONTENT);
}

test.describe('Readable without JavaScript', () => {
	for (const path of pages) {
		test(`${path} shows its content with scripts off`, async ({ browser }) => {
			const scriptsOff = await browser.newContext({ javaScriptEnabled: false });
			const scriptsOn = await browser.newContext();
			try {
				const offPage = await scriptsOff.newPage();
				const response = await offPage.goto(path);
				expect(response?.status(), `${path} loads`).toBeLessThan(400);
				const hiddenWithoutScripts = await findHiddenContent(offPage);

				// Opacity and visibility are script-dependent hiding by definition here (no script
				// ran). Display none and zero size can be plain responsive CSS, so those only count
				// when the same element shows once scripts run.
				const onPage = await scriptsOn.newPage();
				await onPage.goto(path);
				await onPage.waitForLoadState('load');
				const hiddenWithScripts = new Set((await findHiddenContent(onPage)).map((h) => h.path));
				const broken = hiddenWithoutScripts.filter(
					(h) =>
						h.why.startsWith('opacity') ||
						h.why.startsWith('visibility') ||
						!hiddenWithScripts.has(h.path),
				);

				expect(broken, `${path}: content hidden until a script runs`).toEqual([]);
			} finally {
				await scriptsOff.close();
				await scriptsOn.close();
			}
		});
	}
});
