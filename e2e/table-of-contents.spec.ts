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
});
