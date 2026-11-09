import { test, expect } from '@playwright/test';

// Post rows the list script is currently showing (it hides the rest with display: none)
const SHOWN_ROWS = '#posts-grid > li:visible';
const POSTS_PER_PAGE = 12;

test.describe('Blog Index Page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/blog');
	});

	test('shows the first page of posts, and more load on scroll', async ({ page }) => {
		await expect(page.locator(SHOWN_ROWS)).toHaveCount(POSTS_PER_PAGE);

		await page.locator('#load-more-sentinel').scrollIntoViewIfNeeded();
		await expect(page.locator(SHOWN_ROWS)).toHaveCount(POSTS_PER_PAGE * 2);
	});

	test('search narrows the list to matching posts and counts them', async ({ page }) => {
		await page.getByPlaceholder(/search/i).fill('homelab');

		await expect(page.locator('#results-count')).toHaveText(/^\d+ posts? found$/);
		const rows = page.locator(SHOWN_ROWS);
		expect(await rows.count()).toBeGreaterThan(0);
		expect(await rows.count()).toBeLessThanOrEqual(POSTS_PER_PAGE);
	});

	test('search forgives spacing and typos', async ({ page }) => {
		const search = page.getByPlaceholder(/search/i);
		const firstRow = page.locator(SHOWN_ROWS).first();
		for (const query of ['open tofu', 'opne tofu', 'opentofu proxmx']) {
			await search.fill(query);
			await expect(firstRow).toContainText(/opentofu/i);
		}
	});

	test('search shows no results message for invalid query', async ({ page }) => {
		await page.getByPlaceholder(/search/i).fill('xyznonexistentpost123');
		await expect(page.getByText(/no posts found/i)).toBeVisible();
		await expect(page.locator(SHOWN_ROWS)).toHaveCount(0);
	});

	test('Popular sort puts a most-read post first, and ten posts carry the flame', async ({
		page,
	}) => {
		const flame = 'One of my 10 most-read posts';
		await expect(page.locator('#posts-grid').getByText(flame, { exact: true })).toHaveCount(10);

		const popular = page.getByRole('button', { name: 'Popular' });
		await popular.click();
		await expect(popular).toHaveAttribute('aria-pressed', 'true');
		await expect(page.getByRole('button', { name: 'Newest' })).toHaveAttribute(
			'aria-pressed',
			'false',
		);
		// Rows are reordered with CSS order, so find the one placed first
		const firstShown = page.locator('#posts-grid > li[style*="order: 0"]');
		await expect(firstShown.getByText(flame, { exact: true })).toBeAttached();
	});

	test('a category link opens its page with that category marked current', async ({ page }) => {
		const categories = page.getByRole('navigation', { name: 'Blog categories' });
		const category = categories.locator('a[href^="/blog/category/"]').first();
		const href = await category.getAttribute('href');

		await category.click();
		await expect(page).toHaveURL(href!);
		await expect(
			page.getByRole('navigation', { name: 'Blog categories' }).locator(`a[href="${href}"]`),
		).toHaveAttribute('aria-current', 'page');
		expect(await page.locator(SHOWN_ROWS).count()).toBeGreaterThan(0);
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

	test('a picture opens full size in a lightbox and Escape closes it', async ({ page }) => {
		await page.goto('/blog/why-clickhouse-should-be-your-next-database/');
		const picture = page.getByRole('button', { name: /^Enlarge image:/ }).first();
		const lightbox = page.locator('#image-lightbox');
		await picture.click();
		await expect(lightbox).toBeVisible();
		await expect(lightbox.locator('img')).toHaveAttribute('src', /\.webp$/);
		await page.keyboard.press('Escape');
		await expect(lightbox).toBeHidden();
		await expect(picture).toBeFocused();
	});
});
