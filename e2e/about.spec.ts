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

	test('career rows open and close on click', async ({ page }) => {
		// Hover eases a row open; a click keeps it open until clicked again
		const toggle = page.locator('main .job > button').first();
		await expect(toggle).toHaveAttribute('aria-expanded', 'false');

		await toggle.click();
		await expect(toggle).toHaveAttribute('aria-expanded', 'true');

		await toggle.click();
		await expect(toggle).toHaveAttribute('aria-expanded', 'false');
	});

	test('career rows never claim to be collapsed when scripts are off', async ({ browser }) => {
		// Without scripts every row is open, so aria-expanded="false" would lie to screen readers
		const scriptsOff = await browser.newContext({ javaScriptEnabled: false });
		try {
			const offPage = await scriptsOff.newPage();
			await offPage.goto('/about');
			await expect(offPage.locator('main .job > button').first()).toBeVisible();
			await expect(offPage.locator('main .job > button[aria-expanded="false"]')).toHaveCount(0);
		} finally {
			await scriptsOff.close();
		}
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

	for (const width of [1000, 320]) {
		test(`Recently shipped repo names fit their card at ${width}px`, async ({ page }) => {
			await page.setViewportSize({ width, height: 900 });
			await page.goto('/about/');
			const names = page.locator('p[data-repo-name]');
			expect(await names.count()).toBeGreaterThan(0);
			for (const name of await names.all()) {
				// Names shrink to fit on one line, down to 24px; longer ones wrap at their hyphens
				const fit = await name.evaluate((p) => ({
					fontSize: parseFloat(getComputedStyle(p).fontSize),
					overflow:
						p.getBoundingClientRect().width - p.parentElement!.getBoundingClientRect().width,
				}));
				expect(fit.fontSize).toBeGreaterThanOrEqual(24);
				expect(fit.overflow).toBeLessThanOrEqual(0);
			}
		});
	}
});
