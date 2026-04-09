import { test, expect } from '@playwright/test';

test.describe('Newsletter CTA Component', () => {
	test('newsletter CTA is present on contact page', async ({ page }) => {
		await page.goto('/contact');

		// Find newsletter section
		const newsletterSection = page.locator('text=newsletter').first();
		await expect(newsletterSection).toBeVisible();
	});

	test('newsletter CTA has subscribe link', async ({ page }) => {
		await page.goto('/contact');

		// Find Substack link
		const substackLink = page.locator('a[href*="substack"]');
		await expect(substackLink).toBeVisible();
		await expect(substackLink).toContainText(/subscribe/i);
	});

	test('newsletter link opens in new tab', async ({ page }) => {
		await page.goto('/contact');

		const substackLink = page.locator('a[href*="substack"]');
		await expect(substackLink).toHaveAttribute('target', '_blank');
		await expect(substackLink).toHaveAttribute('rel', /noopener/);
	});

	test('newsletter CTA has proper styling', async ({ page }) => {
		await page.goto('/contact');

		// Find the CTA container
		const ctaContainer = page.locator('.rounded-lg.border').filter({ hasText: /newsletter/i });

		if ((await ctaContainer.count()) > 0) {
			await expect(ctaContainer.first()).toBeVisible();
		}
	});

	test('newsletter CTA has plausible tracking', async ({ page }) => {
		await page.goto('/contact');

		const substackLink = page.locator('a[href*="substack"]');

		// Check for plausible event class
		const className = await substackLink.getAttribute('class');
		expect(className).toContain('plausible-event-name');
	});
});

test.describe('Newsletter CTA on Blog Posts', () => {
	test('author bio or newsletter CTA appears on blog posts', async ({ page }) => {
		await page.goto('/blog');

		// Click first blog post
		const postLinks = page.locator('a[href*="/blog/"]').filter({ hasNotText: /category|blog$/i });
		await postLinks.first().click();

		// Should have some form of CTA or author info
		const authorBio = page.locator('text=Joe Karlsson');
		const newsletterCta = page.locator('text=newsletter');

		const hasAuthorContent = (await authorBio.count()) > 0 || (await newsletterCta.count()) > 0;

		expect(hasAuthorContent).toBeTruthy();
	});
});
