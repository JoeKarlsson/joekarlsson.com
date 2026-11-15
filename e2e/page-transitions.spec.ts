import { test, expect, type Page } from '@playwright/test';

// Page changes are cross-document View Transitions (BaseHead.astro, motion.css). Each page
// keeps the transition it arrived with, so a test reads the types it was given.
// A transition the browser cancels (two elements with one name) still has its types, so
// this waits for it to start and fails if it doesn't
const typesOnArrival = (page: Page) =>
	page.evaluate(async () => {
		const transition = (window as unknown as { arrivedWith?: ViewTransition }).arrivedWith;
		if (!transition) return [];
		await transition.ready;
		return [...transition.types].sort();
	});

// Back, the arriving page names the thumbnail the header shrinks into (noted as the
// transition starts, since the name goes when it ends)
const thumbnailNamedOnArrival = (page: Page) =>
	page.evaluate(() => (window as unknown as { thumbnailNamed?: boolean }).thumbnailNamed);

test.beforeEach(async ({ page }) => {
	await page.addInitScript(() =>
		addEventListener('pagereveal', (event) => {
			const transition = (event as PageRevealEvent).viewTransition;
			const notes = window as unknown as {
				arrivedWith?: ViewTransition | null;
				thumbnailNamed?: boolean;
			};
			notes.arrivedWith = transition;
			transition?.ready.then(() => {
				notes.thumbnailNamed = [...document.querySelectorAll<HTMLElement>('[data-morph]')].some(
					(element) => element.style.viewTransitionName === 'morph-hero',
				);
			});
		}),
	);
});

test('a section further right in the nav slides in from the right, and Back plays each change in reverse', async ({
	page,
}) => {
	await page.goto('/blog/');
	await page.locator('header nav a[href="/work/"]').click();
	await page.waitForURL('**/work/');
	await expect.poll(() => typesOnArrival(page)).toEqual(['forward']);

	await page.locator('header nav a[href="/blog/"]').click();
	await page.waitForURL('**/blog/');
	await expect.poll(() => typesOnArrival(page)).toEqual(['back']);

	// Back undoes Works to Blog (from the left), so it comes in from the right; then it
	// undoes Blog to Works
	await page.goBack();
	await page.waitForURL('**/work/');
	await expect.poll(() => typesOnArrival(page)).toEqual(['forward']);
	await page.goBack();
	await page.waitForURL('**/blog/');
	await expect.poll(() => typesOnArrival(page)).toEqual(['back']);
});

test('a project picture grows into its page header, and shrinks back on Back', async ({ page }) => {
	await page.goto('/work/');
	const picture = page.locator('#selected [data-morph]').first();
	await picture.scrollIntoViewIfNeeded();
	const path = await picture.getAttribute('data-morph');
	await picture.click();
	await page.waitForURL(`**${path}`);
	await expect.poll(() => typesOnArrival(page)).toEqual(['forward', 'morph']);

	await page.goBack();
	await page.waitForURL('**/work/');
	await expect.poll(() => typesOnArrival(page)).toEqual(['back']);
	await expect.poll(() => thumbnailNamedOnArrival(page)).toBe(true);
});

test('a post opened from a link with no picture of it on screen gets no header morph', async ({
	page,
}) => {
	await page.goto('/');
	const featured = page.locator('section[aria-label="Introduction"] a[href^="/blog/"]').first();
	const path = await featured.getAttribute('href');
	await featured.click();
	await page.waitForURL(`**${path}`);
	await expect.poll(() => typesOnArrival(page)).toEqual(['forward']);
});

test("a related project's picture grows into its page from another project page, and back", async ({
	page,
}) => {
	await page.goto('/work/pixelpane/');
	const related = page.locator('article [data-morph^="/work/"]:visible').first();
	await related.scrollIntoViewIfNeeded();
	const path = await related.getAttribute('data-morph');
	await related.click();
	await page.waitForURL(`**${path}`);
	await expect.poll(() => typesOnArrival(page)).toEqual(['forward', 'morph']);

	await page.goBack();
	await page.waitForURL('**/work/pixelpane/');
	await expect.poll(() => typesOnArrival(page)).toEqual(['back']);
});

test('Keep exploring turns the next post in like a page, and Back turns it back', async ({
	page,
}) => {
	await page.goto('/blog/how-to-get-started-building-a-homelab-server/');
	const next = page.locator('[data-page-turn] ul a').first();
	await next.scrollIntoViewIfNeeded();
	const path = await next.getAttribute('href');
	await next.click();
	await page.waitForURL(`**${path}`);
	await expect.poll(() => typesOnArrival(page)).toEqual(['forward', 'turn']);

	await page.goBack();
	await page.waitForURL('**/how-to-get-started-building-a-homelab-server/');
	await expect.poll(() => typesOnArrival(page)).toEqual(['back', 'turn']);
});

test('a nav link whose page is slow to arrive gets a squiggle under it', async ({ page }) => {
	// Before the page loads, so a prefetch of About is slow too
	await page.route('**/about/', async (route) => {
		await new Promise((resolve) => setTimeout(resolve, 1500));
		await route.continue();
	});
	await page.goto('/blog/');
	// Hovering the link would prerender About past the slow route; removing the rules
	// cancels them
	await page.evaluate(() =>
		document.querySelectorAll('script[type="speculationrules"]').forEach((rules) => rules.remove()),
	);
	// Playwright waits out a navigation before it looks at the page, so the page notes the
	// squiggle itself
	await page.evaluate(() => {
		const about = document.querySelector('header nav a[href="/about/"]')!;
		new MutationObserver(() => {
			if (about.hasAttribute('data-loading')) sessionStorage.setItem('squiggled', 'yes');
		}).observe(about, { attributes: true });
	});
	await page.locator('header nav a[href="/about/"]').click();
	await page.waitForURL('**/about/');
	expect(await page.evaluate(() => sessionStorage.getItem('squiggled'))).toBe('yes');
	await expect(page.locator('header nav [data-loading]')).toHaveCount(0);
});
