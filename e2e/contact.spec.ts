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

	test('typing animation completes', async ({ page }) => {
		// Look for typing indicator or message container
		const typingIndicator = page.locator('[class*="typing"], #typing-indicator');
		const messageContainer = page.locator('#typed-message, [data-typed]');

		// Either should exist
		const hasTypingFeature =
			(await typingIndicator.count()) > 0 || (await messageContainer.count()) > 0;

		if (hasTypingFeature) {
			// Wait for typing to complete (animation takes a few seconds)
			await page.waitForTimeout(3000);

			// Message should be visible after typing
			if ((await messageContainer.count()) > 0) {
				const text = await messageContainer.textContent();
				expect(text?.length).toBeGreaterThan(0);
			}
		}
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

test.describe('Contact Page - Reduced Motion', () => {
	// @ts-expect-error - reducedMotion is valid Playwright option but astro check doesn't recognize it
	test.use({ reducedMotion: 'reduce' });

	test('typing animation respects reduced motion preference', async ({ page }) => {
		await page.goto('/contact');

		// With reduced motion, message should appear immediately or skip animation
		const messageContainer = page.locator('#typed-message, [data-typed]');

		if ((await messageContainer.count()) > 0) {
			// Should have content immediately (no typing animation)
			await page.waitForTimeout(500);
			const text = await messageContainer.textContent();
			expect(text?.length).toBeGreaterThan(0);
		}
	});
});
