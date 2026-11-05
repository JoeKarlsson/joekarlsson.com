import { test, expect } from '@playwright/test';

test.describe('Contact Page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/contact');
	});

	test('page loads with contact information', async ({ page }) => {
		// Should have heading
		await expect(page.locator('h1').first()).toBeVisible();

		// Should have some external links (social, email, etc)
		const externalLinks = page.locator('main a[href^="http"], main a[href^="mailto"]');
		const linkCount = await externalLinks.count();
		expect(linkCount).toBeGreaterThan(0);
	});

	test('social links open in new tabs', async ({ page }) => {
		const socialLinks = page.locator('main a[href^="http"]');
		const linkCount = await socialLinks.count();

		// All external links should open in new tab
		for (let i = 0; i < Math.min(linkCount, 5); i++) {
			const link = socialLinks.nth(i);
			await expect(link).toHaveAttribute('target', '_blank');
		}
	});

	test('has multiple contact options', async ({ page }) => {
		// Should have multiple ways to contact
		const contactLinks = page.locator('main a[href^="http"], main a[href^="mailto"]');
		const linkCount = await contactLinks.count();

		// Should have at least 3 contact options
		expect(linkCount).toBeGreaterThanOrEqual(3);
	});

	test('social links have proper accessibility', async ({ page }) => {
		const socialLinks = page.locator('main a[href^="http"]').first();

		// Should have accessible name (aria-label or visible text)
		const hasAccessibleName =
			(await socialLinks.getAttribute('aria-label')) !== null ||
			((await socialLinks.textContent())?.trim().length ?? 0) > 0;

		expect(hasAccessibleName).toBeTruthy();
	});
});
