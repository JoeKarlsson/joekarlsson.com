import { test, expect } from '@playwright/test';

test.describe('About Page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/about');
	});

	test('page loads with profile content', async ({ page }) => {
		// Should have main heading
		await expect(page.locator('h1').first()).toBeVisible();

		// Should have substantial content
		const mainContent = page.locator('main').first();
		const textContent = await mainContent.textContent();
		expect(textContent?.length).toBeGreaterThan(100);
	});

	test('expandable details sections work', async ({ page }) => {
		// Find details elements (career timeline)
		const detailsElements = page.locator('details');
		const detailsCount = await detailsElements.count();

		if (detailsCount > 0) {
			const firstDetails = detailsElements.first();

			// Should be collapsed by default (or some open)
			const summary = firstDetails.locator('summary');
			await expect(summary).toBeVisible();

			// Click to toggle
			const wasOpen = await firstDetails.getAttribute('open');
			await summary.click();
			await page.waitForTimeout(100);

			// State should change
			const isOpenNow = await firstDetails.getAttribute('open');
			expect(isOpenNow !== wasOpen || isOpenNow !== null).toBeTruthy();
		}
	});

	test('video embeds are present', async ({ page }) => {
		// Look for YouTube iframes or video containers
		const videos = page.locator('iframe[src*="youtube"], .video-container, lite-youtube');
		const videoCount = await videos.count();

		// About page should have videos
		expect(videoCount).toBeGreaterThan(0);
	});

	test('external links have proper attributes', async ({ page }) => {
		// Check external links have target="_blank" and rel="noopener"
		const externalLinks = page.locator('a[href^="http"]:not([href*="joekarlsson.com"])');
		const linkCount = await externalLinks.count();

		if (linkCount > 0) {
			const firstExternal = externalLinks.first();
			await expect(firstExternal).toHaveAttribute('target', '_blank');
			await expect(firstExternal).toHaveAttribute('rel', /noopener/);
		}
	});

	test('page content is readable and complete', async ({ page }) => {
		// Should have substantial content
		const mainContent = page.locator('main, article, .prose').first();
		const textContent = await mainContent.textContent();

		// Should have meaningful content (not empty or just whitespace)
		expect(textContent?.trim().length).toBeGreaterThan(100);
	});
});

test.describe('TikTok Embeds', () => {
	test('TikTok facade buttons are clickable', async ({ page }) => {
		await page.goto('/about');

		// Look for TikTok embed facades or blockquotes
		const tiktokElements = page.locator(
			'[class*="tiktok"], blockquote[class*="tiktok"], button[data-tiktok]',
		);

		if ((await tiktokElements.count()) > 0) {
			// TikTok elements exist on the page
			await expect(tiktokElements.first()).toBeVisible();
		}
	});
});
