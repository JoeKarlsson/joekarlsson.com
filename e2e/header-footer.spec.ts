import { test, expect } from '@playwright/test';

test.describe('Header Navigation', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/about');
	});

	test('header is sticky and visible', async ({ page }) => {
		const header = page.locator('header').first();
		await expect(header).toBeVisible();
		await expect(header).toHaveClass(/sticky/);
	});

	test('logo links to homepage', async ({ page }) => {
		const logo = page.locator('header a[href="/"]').first();
		await expect(logo).toBeVisible();
		await expect(logo).toContainText('Joe Karlsson');
	});

	test('navigation links are present on desktop', async ({ page }) => {
		// Set desktop viewport
		await page.setViewportSize({ width: 1280, height: 720 });

		const nav = page.locator('header nav');
		await expect(nav).toBeVisible();

		// Check for main nav links
		const blogLink = nav.locator('a[href="/blog"]');
		const aboutLink = nav.locator('a[href="/about"]');
		const workLink = nav.locator('a[href="/work"]');

		await expect(blogLink).toBeVisible();
		await expect(aboutLink).toBeVisible();
		await expect(workLink).toBeVisible();
	});

	test('current page is highlighted in nav', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 720 });

		// On /about page, about link should be highlighted
		const aboutLink = page.locator('header nav a[href="/about"]');
		await expect(aboutLink).toHaveClass(/text-coral|bg-surface/);
	});

	test('social links have aria-labels', async ({ page }) => {
		const socialLinks = page.locator('header a[target="_blank"]');
		const count = await socialLinks.count();

		expect(count).toBeGreaterThan(0);

		for (let i = 0; i < count; i++) {
			const link = socialLinks.nth(i);
			const ariaLabel = await link.getAttribute('aria-label');
			expect(ariaLabel).toBeTruthy();
		}
	});

	test('social links open in new tab', async ({ page }) => {
		const socialLinks = page.locator('header a[target="_blank"]');
		const count = await socialLinks.count();

		for (let i = 0; i < count; i++) {
			const link = socialLinks.nth(i);
			await expect(link).toHaveAttribute('rel', /noopener/);
		}
	});
});

test.describe('Mobile Menu', () => {
	test.beforeEach(async ({ page }) => {
		// Set mobile viewport
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto('/about');
	});

	test('mobile menu button is visible on mobile', async ({ page }) => {
		const menuBtn = page.locator('#mobile-menu-btn');
		await expect(menuBtn).toBeVisible();
	});

	test('mobile menu is hidden by default', async ({ page }) => {
		const mobileMenu = page.locator('#mobile-menu');
		await expect(mobileMenu).toHaveClass(/hidden/);
	});

	test('clicking menu button toggles mobile menu', async ({ page }) => {
		const menuBtn = page.locator('#mobile-menu-btn');
		const mobileMenu = page.locator('#mobile-menu');

		// Open menu
		await menuBtn.click();
		await expect(mobileMenu).not.toHaveClass(/hidden/);
		await expect(menuBtn).toHaveAttribute('aria-expanded', 'true');

		// Close menu
		await menuBtn.click();
		await expect(mobileMenu).toHaveClass(/hidden/);
		await expect(menuBtn).toHaveAttribute('aria-expanded', 'false');
	});

	test('mobile menu contains navigation links', async ({ page }) => {
		const menuBtn = page.locator('#mobile-menu-btn');
		const mobileMenu = page.locator('#mobile-menu');

		await menuBtn.click();

		const blogLink = mobileMenu.locator('a[href="/blog"]');
		const aboutLink = mobileMenu.locator('a[href="/about"]');

		await expect(blogLink).toBeVisible();
		await expect(aboutLink).toBeVisible();
	});

	test('mobile menu link navigates correctly', async ({ page }) => {
		const menuBtn = page.locator('#mobile-menu-btn');
		await menuBtn.click();

		const blogLink = page.locator('#mobile-menu a[href="/blog"]');
		await blogLink.click();

		await expect(page).toHaveURL('/blog');
	});
});

test.describe('Footer', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/about');
	});

	test('footer is present', async ({ page }) => {
		const footer = page.locator('footer').first();
		await expect(footer).toBeVisible();
	});

	test('footer contains copyright or site info', async ({ page }) => {
		const footer = page.locator('footer').first();
		const text = await footer.textContent();

		// Should contain some identifying info
		const hasRelevantContent =
			text?.includes('Joe') || text?.includes('©') || text?.includes('Karlsson');

		expect(hasRelevantContent).toBeTruthy();
	});

	test('footer links are accessible', async ({ page }) => {
		const footerLinks = page.locator('footer a');
		const count = await footerLinks.count();

		for (let i = 0; i < Math.min(count, 10); i++) {
			const link = footerLinks.nth(i);
			const href = await link.getAttribute('href');
			expect(href).toBeTruthy();
		}
	});
});

test.describe('Dot Grid Animation', () => {
	test('dot grid canvas exists on desktop', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 720 });
		await page.goto('/');

		const canvas = page.locator('#dot-grid');
		await expect(canvas).toBeVisible();
	});

	test('dot grid is hidden on mobile', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto('/');

		const canvas = page.locator('#dot-grid');
		// Should have hidden class on mobile
		await expect(canvas).toHaveClass(/hidden/);
	});
});
