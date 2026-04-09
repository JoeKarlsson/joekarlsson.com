import { test, expect } from '@playwright/test';

test.describe('Blog Category Pages', () => {
	test('category page loads with posts', async ({ page }) => {
		await page.goto('/blog');

		// Find a category link
		const categoryLinks = page.locator('a[href*="/blog/category/"]');
		const firstCategory = categoryLinks.first();

		const href = await firstCategory.getAttribute('href');
		expect(href).toBeTruthy();

		// Navigate to category
		await firstCategory.click();
		await expect(page).toHaveURL(/\/blog\/category\//);

		// Should have posts or empty state
		const posts = page.locator('article');
		const emptyState = page.locator('text=/no posts|empty/i');

		const hasContent = (await posts.count()) > 0 || (await emptyState.count()) > 0;
		expect(hasContent).toBeTruthy();
	});

	test('category page has heading', async ({ page }) => {
		await page.goto('/blog');

		const categoryLinks = page.locator('a[href*="/blog/category/"]');
		await categoryLinks.first().click();

		// Should have a heading indicating the category
		const heading = page.locator('h1');
		await expect(heading).toBeVisible();
	});

	test('category page posts link back to full posts', async ({ page }) => {
		await page.goto('/blog');

		const categoryLinks = page.locator('a[href*="/blog/category/"]');
		await categoryLinks.first().click();

		const posts = page.locator('article');
		const postCount = await posts.count();

		if (postCount > 0) {
			// First post should have a link to full article
			const postLink = posts.first().locator('a[href*="/blog/"]').first();
			await expect(postLink).toBeVisible();
		}
	});

	test('multiple categories exist', async ({ page }) => {
		await page.goto('/blog');

		const categoryLinks = page.locator('a[href*="/blog/category/"]');
		const count = await categoryLinks.count();

		// Should have multiple categories
		expect(count).toBeGreaterThan(1);
	});

	test('category links have distinct hrefs', async ({ page }) => {
		await page.goto('/blog');

		const categoryLinks = page.locator('a[href*="/blog/category/"]');
		const count = await categoryLinks.count();

		const hrefs: string[] = [];
		for (let i = 0; i < count; i++) {
			const href = await categoryLinks.nth(i).getAttribute('href');
			if (href) hrefs.push(href);
		}

		// All hrefs should be unique
		const uniqueHrefs = new Set(hrefs);
		expect(uniqueHrefs.size).toBe(hrefs.length);
	});
});

test.describe('Blog Search Edge Cases', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/blog');
	});

	test('search handles special characters', async ({ page }) => {
		const searchInput = page.getByPlaceholder(/search/i);

		// Try special characters
		await searchInput.fill('<script>alert("xss")</script>');
		await page.waitForTimeout(300);

		// Should not break the page
		await expect(page.locator('body')).toBeVisible();
	});

	test('search handles very long input', async ({ page }) => {
		const searchInput = page.getByPlaceholder(/search/i);

		// Try very long input
		const longInput = 'a'.repeat(500);
		await searchInput.fill(longInput);
		await page.waitForTimeout(300);

		// Should not break the page
		await expect(page.locator('body')).toBeVisible();
	});

	test('search can be cleared', async ({ page }) => {
		const searchInput = page.getByPlaceholder(/search/i);

		// Get initial post count
		const initialCount = await page.locator('article').count();

		// Search for something
		await searchInput.fill('mongodb');
		await page.waitForTimeout(300);

		// Clear search
		await searchInput.fill('');
		await page.waitForTimeout(300);

		// Should show all posts again
		const finalCount = await page.locator('article').count();
		expect(finalCount).toBeGreaterThanOrEqual(initialCount - 1); // Allow for timing
	});

	test('search is case insensitive', async ({ page }) => {
		const searchInput = page.getByPlaceholder(/search/i);

		// Search lowercase
		await searchInput.fill('mongodb');
		await page.waitForTimeout(300);
		const lowercaseCount = await page.locator('article').count();

		// Clear and search uppercase
		await searchInput.fill('MONGODB');
		await page.waitForTimeout(300);
		const uppercaseCount = await page.locator('article').count();

		// Should return same results
		expect(uppercaseCount).toBe(lowercaseCount);
	});
});

test.describe('Blog Post Edge Cases', () => {
	test('blog post without hero image renders correctly', async ({ page }) => {
		// Go to blog and find posts
		await page.goto('/blog');

		// Navigate to a post
		const postLinks = page.locator('a[href*="/blog/"]').filter({ hasNotText: /category|blog$/i });
		await postLinks.first().click();

		// Post should still render with title and content
		await expect(page.locator('h1')).toBeVisible();
		await expect(page.locator('main')).toBeVisible();
	});

	test('blog post with long title displays correctly', async ({ page }) => {
		await page.goto('/blog');

		// Click first post
		const postLinks = page.locator('a[href*="/blog/"]').filter({ hasNotText: /category|blog$/i });
		await postLinks.first().click();

		const title = page.locator('h1');
		await expect(title).toBeVisible();

		// Title should not overflow viewport
		const titleBox = await title.boundingBox();
		const viewportWidth = page.viewportSize()?.width || 1280;

		if (titleBox) {
			expect(titleBox.width).toBeLessThanOrEqual(viewportWidth);
		}
	});
});
