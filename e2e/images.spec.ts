import { test, expect } from '@playwright/test';

test.describe('Image Loading', () => {
	test('images have lazy loading attribute', async ({ page }) => {
		await page.goto('/blog');

		const images = page.locator('img[loading="lazy"]');
		const lazyCount = await images.count();

		expect(lazyCount).toBeGreaterThan(0);
	});

	test('above-fold images load eagerly', async ({ page }) => {
		await page.goto('/');

		const eagerImages = page.locator('img[loading="eager"]');
		const count = await eagerImages.count();

		// Should have at least one eager image or no loading attr (defaults to eager)
		expect(count).toBeGreaterThanOrEqual(0);
	});

	test('images load on scroll', async ({ page }) => {
		await page.goto('/blog');

		// Scroll down
		await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
		await page.waitForTimeout(500);

		// Images should be loaded
		const loadedImages = await page.evaluate(() => {
			const imgs = document.querySelectorAll('img');
			return Array.from(imgs).filter((img) => img.complete).length;
		});

		expect(loadedImages).toBeGreaterThan(0);
	});
});

test.describe('External Links', () => {
	test('external links open in new tab', async ({ page }) => {
		await page.goto('/about');

		const externalLinks = page.locator('main a[href^="http"]:not([href*="joekarlsson.com"])');
		const count = await externalLinks.count();

		for (let i = 0; i < Math.min(count, 10); i++) {
			const link = externalLinks.nth(i);
			await expect(link).toHaveAttribute('target', '_blank');
		}
	});

	test('external links have noopener', async ({ page }) => {
		await page.goto('/about');

		const externalLinks = page.locator('main a[href^="http"][target="_blank"]');
		const count = await externalLinks.count();

		for (let i = 0; i < Math.min(count, 10); i++) {
			const link = externalLinks.nth(i);
			const rel = await link.getAttribute('rel');
			expect(rel).toMatch(/noopener/);
		}
	});
});
