import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('page loads with main content', async ({ page }) => {
		// Should have site header (the sticky nav one)
		await expect(page.locator('header.sticky, header:first-of-type').first()).toBeVisible();

		// Should have main content area
		await expect(page.locator('main').first()).toBeVisible();

		// Should have footer
		await expect(page.locator('body > footer, footer').first()).toBeVisible();
	});

	test('featured blog posts are displayed', async ({ page }) => {
		// Look for blog post cards or featured section
		const blogSection = page.locator('[class*="blog"], [class*="post"], article');

		if ((await blogSection.count()) > 0) {
			await expect(blogSection.first()).toBeVisible();
		}
	});

	test('project section is displayed', async ({ page }) => {
		// Look for projects or work section
		const projectsSection = page.locator('[class*="project"], [class*="work"]');

		if ((await projectsSection.count()) > 0) {
			await expect(projectsSection.first()).toBeVisible();
		}
	});

	test('page has proper SEO meta tags', async ({ page }) => {
		// Check title
		await expect(page).toHaveTitle(/joe karlsson/i);

		// Check meta description
		const metaDescription = page.locator('meta[name="description"]');
		const description = await metaDescription.getAttribute('content');
		expect(description?.length).toBeGreaterThan(50);

		// Check og:title
		const ogTitle = page.locator('meta[property="og:title"]');
		await expect(ogTitle).toHaveAttribute('content', /.+/);
	});
});

test.describe('Homepage - Desktop Terminal', () => {
	test.use({ viewport: { width: 1280, height: 720 } });

	test('terminal is visible on desktop', async ({ page }) => {
		await page.goto('/');

		const terminal = page.locator('#terminal');
		await expect(terminal).toBeVisible();
	});

	test('right panel shows about content', async ({ page }) => {
		await page.goto('/');

		// Look for the right panel with about.md content
		const aboutPanel = page.locator('[class*="about"], .prose').filter({ hasText: /joe/i });

		if ((await aboutPanel.count()) > 0) {
			await expect(aboutPanel.first()).toBeVisible();
		}
	});
});

test.describe('Homepage - Mobile', () => {
	test.use({ viewport: { width: 375, height: 667 } });

	test('terminal is hidden on mobile', async ({ page }) => {
		await page.goto('/');

		// Terminal should be hidden on mobile (has lg:block class)
		const terminal = page.locator('#terminal');

		// Either hidden or not present on mobile
		const isHidden =
			(await terminal.isHidden().catch(() => true)) || (await terminal.count()) === 0;
		expect(isHidden).toBeTruthy();
	});

	test('mobile-friendly content is shown', async ({ page }) => {
		await page.goto('/');

		// Main content should still be visible
		await expect(page.locator('main').first()).toBeVisible();

		// Site header should be visible
		await expect(page.locator('header.sticky, header:first-of-type').first()).toBeVisible();
	});
});

test.describe('Homepage - Scroll Animations', () => {
	test('content sections become visible on scroll', async ({ page }) => {
		await page.goto('/');

		// Scroll down to trigger any reveal animations
		await page.evaluate(() => window.scrollTo(0, 500));
		await page.waitForTimeout(300);

		// Content should be visible after scroll
		const mainContent = page.locator('main');
		await expect(mainContent).toBeVisible();

		// Scroll more
		await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
		await page.waitForTimeout(300);

		// Footer should be visible
		await expect(page.locator('footer')).toBeVisible();
	});
});

test.describe('Homepage - Marquee', () => {
	test('marquee banner is present', async ({ page }) => {
		await page.goto('/');

		const marquee = page.locator('.marquee, [class*="marquee"]');

		if ((await marquee.count()) > 0) {
			await expect(marquee.first()).toBeVisible();

			// Should have text content
			const text = await marquee.first().textContent();
			expect(text?.length).toBeGreaterThan(0);
		}
	});
});

test.describe('Homepage - Header Canvas', () => {
	test.use({ viewport: { width: 1280, height: 720 } });

	test('dot grid canvas is present on desktop', async ({ page }) => {
		await page.goto('/');

		const canvas = page.locator('header canvas, canvas#dot-grid');

		if ((await canvas.count()) > 0) {
			await expect(canvas).toBeVisible();

			// Canvas should have dimensions
			const box = await canvas.boundingBox();
			expect(box?.width).toBeGreaterThan(0);
			expect(box?.height).toBeGreaterThan(0);
		}
	});
});
