import { test, expect } from '@playwright/test';

// From 1600px "On this page" sits left of a post's text and stays in view the whole way
// down (article.css), and the margin doodles on its side stay clear of it (margin-doodles.ts).
test.describe('On this page', () => {
	test('follows the reader down the left gutter on wide screens', async ({ page }) => {
		await page.setViewportSize({ width: 1600, height: 1000 });
		await page.goto('/blog/doom-mcp-server/');
		const nav = page.locator('#toc-nav');
		await page.evaluate(() => scrollTo(0, document.body.scrollHeight * 0.6));
		await expect(nav).toBeInViewport();
		const [navBox, textBox] = [await nav.boundingBox(), await page.locator('.prose').boundingBox()];
		expect(navBox!.x + navBox!.width).toBeLessThan(textBox!.x);

		// Doodles stay on both sides, the left ones clear of the list
		await page.setViewportSize({ width: 1960, height: 1100 });
		const tocLeft = (await page.locator('.margin-toc').boundingBox())!.x;
		const shownLeft = page.locator('.margin-doodles > div[data-left]:not([hidden])');
		// The doodles' ResizeObserver unhides them after the next layout, not during setViewportSize
		await expect.poll(() => shownLeft.count()).toBeGreaterThan(0);
		const left = await shownLeft.evaluateAll((doodles) =>
			doodles.map((d) => d.getBoundingClientRect().right),
		);
		for (const right of left) expect(right).toBeLessThanOrEqual(tocLeft);
	});

	test('a long list scrolls itself to keep the current section in view', async ({ page }) => {
		await page.setViewportSize({ width: 1680, height: 900 });
		await page.goto('/blog/i-ran-my-first-hackathon-and-so-can-you/');
		await page.evaluate(() => scrollTo(0, document.body.scrollHeight * 0.85));
		await expect(page.locator('#toc-nav [aria-current="location"]')).toBeInViewport();
	});

	test('a jump from the list lands below the nav and lights up that section', async ({ page }) => {
		await page.setViewportSize({ width: 1960, height: 1100 });
		await page.goto('/blog/how-to-get-started-building-a-homelab-server/');
		// A plain h3, not a chapter opener (those land lower, clear of their big numeral)
		const index = await page
			.locator('#toc-nav .toc-link')
			.evaluateAll((links) =>
				links.findIndex(
					(l) => document.getElementById((l as HTMLElement).dataset.tocSlug!)?.tagName === 'H3',
				),
			);
		const link = page.locator('#toc-nav .toc-link').nth(index);
		await link.click();
		await expect(link).toHaveAttribute('aria-current', 'location');
		const slug = (await link.getAttribute('data-toc-slug'))!;
		const top = await page.locator(`[id="${slug}"]`).evaluate((h) => h.getBoundingClientRect().top);
		expect(top).toBeGreaterThan(80);
		expect(top).toBeLessThan(110);
	});

	// An IntersectionObserver tracks the headings, so scrolling measures none of them, and the
	// highlight stays on the last heading at or above 200px from the top (Modern Web Guidance,
	// scrollspy)
	test('lights up the section under the reader without measuring headings as it scrolls', async ({
		page,
	}) => {
		await page.setViewportSize({ width: 1440, height: 900 });
		await page.addInitScript(() => {
			const measure = Element.prototype.getBoundingClientRect;
			(window as unknown as { headingMeasures: number }).headingMeasures = 0;
			Element.prototype.getBoundingClientRect = function () {
				if (document.readyState === 'complete' && /^H[2-4]$/.test(this.tagName))
					(window as unknown as { headingMeasures: number }).headingMeasures++;
				return measure.call(this);
			};
		});
		await page.goto('/blog/homelab-two-years-later/');
		const expected = () =>
			page.evaluate(() => {
				const slugs = [...document.querySelectorAll<HTMLElement>('#toc-nav .toc-link')].map(
					(l) => l.dataset.tocSlug!,
				);
				// Not getBoundingClientRect, which the count above would see
				let active = slugs[0];
				for (const slug of slugs) {
					const heading = document.getElementById(slug)!;
					let top = 0;
					for (let el: HTMLElement | null = heading; el; el = el.offsetParent as HTMLElement)
						top += el.offsetTop;
					if (top - scrollY <= 200) active = slug;
				}
				return active;
			});
		const current = page.locator('#toc-nav [aria-current="location"]');
		await page.evaluate(
			() => ((window as unknown as { headingMeasures: number }).headingMeasures = 0),
		);
		for (const share of [0.2, 0.45, 0.7]) {
			await page.evaluate((s) => scrollTo(0, document.body.scrollHeight * s), share);
			await expect.poll(async () => current.getAttribute('data-toc-slug')).toBe(await expected());
		}
		expect(
			await page.evaluate(() => (window as unknown as { headingMeasures: number }).headingMeasures),
		).toBe(0);
	});
});
