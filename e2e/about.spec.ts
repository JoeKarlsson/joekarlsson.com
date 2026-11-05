import { test, expect } from '@playwright/test';

test.describe('About Page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/about');
	});

	test('page loads with profile content', async ({ page }) => {
		await expect(page.locator('h1').first()).toBeVisible();
		const textContent = await page.locator('main').textContent();
		expect(textContent?.trim().length).toBeGreaterThan(100);
	});

	test('career details open and close', async ({ page }) => {
		const details = page.locator('main details').first();
		await expect(details).not.toHaveAttribute('open');

		await details.locator('summary').click();
		await expect(details).toHaveAttribute('open');

		await details.locator('summary').click();
		await expect(details).not.toHaveAttribute('open');
	});

	test('videos load the YouTube player only when clicked', async ({ page }) => {
		// Click-to-load (YouTubeFacade): no player until asked, which keeps the page under its weight budget
		await expect(page.locator('iframe[src*="youtube"]')).toHaveCount(0);
		const play = page.getByRole('button', { name: /^Play The Art of Computer Science/ });
		await expect(play).toBeVisible();

		await play.click();
		await expect(page.locator('iframe[src*="youtube-nocookie.com/embed/GiNa2jen-lg"]')).toHaveCount(
			1,
		);
		await expect(play).toHaveCount(0);
	});

	test('every external link opens in a new tab with noopener', async ({ page }) => {
		const externalLinks = page.locator('main a[href^="http"]:not([href*="joekarlsson.com"])');
		expect(await externalLinks.count()).toBeGreaterThan(0);

		for (const link of await externalLinks.all()) {
			await expect(link).toHaveAttribute('target', '_blank');
			await expect(link).toHaveAttribute('rel', /noopener/);
		}
	});
});
