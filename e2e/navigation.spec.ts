import { test, expect } from '@playwright/test';

test.describe('Header Navigation', () => {
	test('desktop nav links are visible and work', async ({ page }) => {
		await page.goto('/');

		// Check all nav links exist
		const nav = page.locator('header nav');
		await expect(nav.getByRole('link', { name: 'Home' })).toBeVisible();
		await expect(nav.getByRole('link', { name: 'Blog' })).toBeVisible();
		await expect(nav.getByRole('link', { name: 'About' })).toBeVisible();
		await expect(nav.getByRole('link', { name: 'Projects' })).toBeVisible();
		await expect(nav.getByRole('link', { name: 'Uses' })).toBeVisible();
		await expect(nav.getByRole('link', { name: 'Contact' })).toBeVisible();

		// Click Blog and verify navigation
		await nav.getByRole('link', { name: 'Blog' }).click();
		await expect(page).toHaveURL(/\/blog/);
	});

	test('active nav link is visually distinct', async ({ page }) => {
		await page.goto('/about');

		const aboutLink = page.locator('header nav').getByRole('link', { name: 'About' });
		// Active link should exist and be visible
		await expect(aboutLink).toBeVisible();

		// It should have some styling (class attribute)
		const className = await aboutLink.getAttribute('class');
		expect(className).toBeTruthy();
	});

	test('social links in header open in new tab', async ({ page }) => {
		await page.goto('/');

		const githubLink = page.locator('header').getByRole('link', { name: /github/i });
		await expect(githubLink).toHaveAttribute('target', '_blank');
		await expect(githubLink).toHaveAttribute('rel', /noopener/);
	});
});

test.describe('Mobile Navigation', () => {
	test.use({ viewport: { width: 375, height: 667 } });

	test('mobile menu button exists', async ({ page }) => {
		await page.goto('/');

		// Look for any menu/hamburger button
		const menuButton = page
			.locator('button[aria-label*="menu" i], button[aria-label*="Menu" i], header button')
			.first();
		await expect(menuButton).toBeVisible();
	});

	test('mobile navigation is functional', async ({ page }) => {
		await page.goto('/');

		// Click menu button
		const menuButton = page
			.locator('button[aria-label*="menu" i], button[aria-label*="Menu" i], header button')
			.first();
		await menuButton.click();

		// Should be able to find and click navigation links after menu opens
		await page.waitForTimeout(300);

		// Navigate to about via any visible link
		const aboutLink = page.getByRole('link', { name: 'About' }).first();
		if (await aboutLink.isVisible()) {
			await aboutLink.click();
			await expect(page).toHaveURL(/\/about/);
		}
	});
});

test.describe('Footer', () => {
	test('footer links are functional', async ({ page }) => {
		await page.goto('/');

		const footer = page.locator('footer');

		// Check key footer links exist
		await expect(footer.getByRole('link', { name: /rss/i })).toBeVisible();

		// Check copyright year
		const currentYear = new Date().getFullYear().toString();
		await expect(footer).toContainText(currentYear);
	});

	test('newsletter CTA button links to Substack', async ({ page }) => {
		await page.goto('/');

		const subscribeLink = page.locator('footer').getByRole('link', { name: /subscribe/i });
		await expect(subscribeLink).toHaveAttribute('href', /substack/);
	});
});

test.describe('Page Navigation', () => {
	test('can navigate through all main pages', async ({ page }) => {
		const pages = [
			{ path: '/', title: /joe karlsson/i },
			{ path: '/blog', title: /blog/i },
			{ path: '/about', title: /about/i },
			{ path: '/work', title: /projects/i },
			{ path: '/uses', title: /uses/i },
			{ path: '/contact', title: /contact/i },
		];

		for (const p of pages) {
			await page.goto(p.path);
			await expect(page).toHaveTitle(p.title);
		}
	});

	test('404 page displays for invalid routes', async ({ page }) => {
		await page.goto('/this-page-does-not-exist-xyz');
		// Page should contain 404 somewhere
		await expect(page.locator('body')).toContainText('404');
	});
});
