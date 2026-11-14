import { test, expect, type Page } from '@playwright/test';

// Page changes are cross-document View Transitions (BaseHead.astro, motion.css). Each page
// keeps the transition it arrived with, so a test reads the types it was given.
const typesOnArrival = (page: Page) =>
	page.evaluate(() => {
		const transition = (window as unknown as { arrivedWith?: ViewTransition }).arrivedWith;
		return transition ? [...transition.types].sort() : [];
	});

test.beforeEach(async ({ page }) => {
	await page.addInitScript(() =>
		addEventListener('pagereveal', (event) => {
			(window as unknown as { arrivedWith?: ViewTransition | null }).arrivedWith = (
				event as PageRevealEvent
			).viewTransition;
		}),
	);
});

test('a section further right in the nav slides in from the right, and Back plays each change in reverse', async ({
	page,
}) => {
	await page.goto('/blog/');
	await page.locator('header nav a[href="/work/"]').click();
	await page.waitForURL('**/work/');
	await expect.poll(() => typesOnArrival(page)).toEqual(['slide-forward']);

	await page.locator('header nav a[href="/blog/"]').click();
	await page.waitForURL('**/blog/');
	await expect.poll(() => typesOnArrival(page)).toEqual(['slide-back']);

	// Back undoes Works to Blog (from the left), so it comes in from the right; then it
	// undoes Blog to Works
	await page.goBack();
	await page.waitForURL('**/work/');
	await expect.poll(() => typesOnArrival(page)).toEqual(['slide-forward']);
	await page.goBack();
	await page.waitForURL('**/blog/');
	await expect.poll(() => typesOnArrival(page)).toEqual(['slide-back']);
});

test('a project picture grows into its page header, and shrinks back on Back', async ({ page }) => {
	await page.goto('/work/');
	const picture = page.locator('#selected [data-morph]').first();
	await picture.scrollIntoViewIfNeeded();
	const path = await picture.getAttribute('data-morph');
	await picture.click();
	await page.waitForURL(`**${path}`);
	await expect.poll(() => typesOnArrival(page)).toEqual(['morph', 'slide-forward']);

	await page.goBack();
	await page.waitForURL('**/work/');
	await expect.poll(() => typesOnArrival(page)).toEqual(['morph', 'slide-back']);
});

test('a post opened from the nav gets no header morph', async ({ page }) => {
	await page.goto('/');
	await page.locator('header nav a[href="/blog/"]').click();
	await page.waitForURL('**/blog/');
	await expect.poll(() => typesOnArrival(page)).toEqual(['slide-forward']);
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
	await expect.poll(() => typesOnArrival(page)).toEqual(['page-turn', 'slide-forward']);

	await page.goBack();
	await page.waitForURL('**/how-to-get-started-building-a-homelab-server/');
	await expect.poll(() => typesOnArrival(page)).toEqual(['page-turn', 'slide-back']);
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
