import { test, expect } from '@playwright/test';

// Runs in Chromium and Firefox (playwright.config.ts): a face the browser has to fake
// looked fine in one and slanted in the other.
test.describe('Typography', () => {
	test('chapter titles are set in a real Fraunces italic, not a slanted roman', async ({
		page,
	}) => {
		await page.goto('/blog/homelab-two-years-later/');
		const title = page.locator('.prose .chapter h2').first();
		await expect(title).toHaveCSS('font-style', 'italic');
		const italicLoaded = await page.evaluate(async () => {
			await document.fonts.ready;
			return [...document.fonts].some(
				(face) =>
					/Fraunces/.test(face.family) && face.style === 'italic' && face.status === 'loaded',
			);
		});
		expect(italicLoaded).toBe(true);
	});
});
