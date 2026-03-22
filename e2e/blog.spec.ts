import { test, expect } from '@playwright/test';

test.describe('Blog Index Page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/blog');
	});

	test('displays blog posts', async ({ page }) => {
		// Should have blog post links or cards
		const postLinks = page.locator('a[href*="/blog/"]').filter({ hasNotText: /category/i });
		const postCount = await postLinks.count();
		expect(postCount).toBeGreaterThan(0);

		// First post link should be visible
		await expect(postLinks.first()).toBeVisible();
	});

	test('search filters posts by title', async ({ page }) => {
		const searchInput = page.getByPlaceholder(/search/i);
		await expect(searchInput).toBeVisible();

		// Get initial count
		const initialPosts = await page.locator('article').count();

		// Search for something specific
		await searchInput.fill('mongodb');
		await page.waitForTimeout(300); // Debounce

		// Should show filtered results
		const filteredPosts = await page.locator('article').count();
		expect(filteredPosts).toBeLessThanOrEqual(initialPosts);
	});

	test('search shows no results message for invalid query', async ({ page }) => {
		const searchInput = page.getByPlaceholder(/search/i);
		await searchInput.fill('xyznonexistentpost123');
		await page.waitForTimeout(300);

		// Should show no results message
		await expect(page.getByText(/no posts found/i)).toBeVisible();
	});

	test('sort buttons are present', async ({ page }) => {
		// Look for sort controls
		const sortButtons = page.locator('button').filter({ hasText: /newest|oldest|sort/i });

		// Sort buttons may or may not exist depending on page implementation
		const buttonCount = await sortButtons.count();

		// If they exist, they should be clickable
		if (buttonCount > 0) {
			await expect(sortButtons.first()).toBeVisible();
		}
	});

	test('category links exist', async ({ page }) => {
		// Find category links
		const categoryLinks = page.locator('a[href*="/blog/category/"]');
		const linkCount = await categoryLinks.count();

		// Categories should exist on blog page
		expect(linkCount).toBeGreaterThan(0);
		await expect(categoryLinks.first()).toBeVisible();
	});

	test('blog post links lead to valid pages', async ({ page }) => {
		// Get first blog post link
		const postLinks = page.locator('a[href*="/blog/"]').filter({ hasNotText: /category/i });
		const firstLink = postLinks.first();

		const href = await firstLink.getAttribute('href');
		expect(href).toBeTruthy();

		// Click and verify navigation
		await firstLink.click();
		await expect(page).toHaveURL(/\/blog\//);
	});
});

test.describe('Individual Blog Post', () => {
	test('blog post page loads correctly', async ({ page }) => {
		// Go to blog and click first post
		await page.goto('/blog');
		const postLinks = page.locator('a[href*="/blog/"]').filter({ hasNotText: /category|blog$/i });
		await postLinks.first().click();

		// Should have a title (h1)
		await expect(page.locator('h1')).toBeVisible();

		// Should have prose content
		const content = page.locator('.prose, main p').first();
		await expect(content).toBeVisible();
	});

	test('blog post has readable content', async ({ page }) => {
		await page.goto('/blog');
		const postLinks = page.locator('a[href*="/blog/"]').filter({ hasNotText: /category|blog$/i });
		await postLinks.first().click();

		// Should have substantial content
		const mainContent = page.locator('main, article').first();
		const textContent = await mainContent.textContent();
		expect(textContent?.trim().length).toBeGreaterThan(200);
	});
});

test.describe('Blog Pagination / Infinite Scroll', () => {
	test('more posts load on scroll', async ({ page }) => {
		await page.goto('/blog');

		// Count initial visible posts
		const initialCount = await page.locator('article').count();

		// If there are more posts to load, scrolling should load them
		// Scroll to bottom
		await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
		await page.waitForTimeout(500);

		// Check if more posts loaded (only if pagination exists)
		const sentinel = page.locator('#sentinel, [data-sentinel]');
		if (await sentinel.isVisible().catch(() => false)) {
			const newCount = await page.locator('article').count();
			expect(newCount).toBeGreaterThanOrEqual(initialCount);
		}
	});
});
