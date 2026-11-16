import { test, expect } from '@playwright/test';

// From 1600px "On this page" sits left of a post's text and stays in view the whole way
// down (global.css), and the margin doodles keep to the right (margin-doodles.ts).
test.describe('On this page', () => {
	test('follows the reader down the left gutter on wide screens', async ({ page }) => {
		await page.setViewportSize({ width: 1600, height: 1000 });
		await page.goto('/blog/doom-mcp-server/');
		const nav = page.locator('#toc-nav');
		await page.evaluate(() => scrollTo(0, document.body.scrollHeight * 0.6));
		await expect(nav).toBeInViewport();
		const [navBox, textBox] = [await nav.boundingBox(), await page.locator('.prose').boundingBox()];
		expect(navBox!.x + navBox!.width).toBeLessThan(textBox!.x);

		const sides = await page
			.locator('.margin-doodles')
			.evaluate((l) =>
				[...l.children]
					.filter((d) => d instanceof HTMLElement && d.style.top)
					.map((d) => ((d as HTMLElement).style.left ? 'left' : 'right')),
			);
		expect(sides.length).toBeGreaterThan(0);
		expect(new Set(sides)).toEqual(new Set(['right']));
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
});
