import { test, expect } from '@playwright/test';

test.describe('RSS Feed', () => {
	test('RSS feed is accessible', async ({ page }) => {
		const response = await page.goto('/rss.xml');

		expect(response?.status()).toBe(200);
	});

	test('RSS feed has correct content type', async ({ page }) => {
		const response = await page.goto('/rss.xml');

		const contentType = response?.headers()['content-type'];
		expect(contentType).toMatch(/xml|rss/i);
	});

	test('RSS feed contains blog content', async ({ request }) => {
		const response = await request.get('/rss.xml');
		const body = await response.text();

		expect(body).toContain('/blog/');
	});
});

// Sitemap validation handled by CI validate-feeds.sh script

test.describe('LLMs.txt', () => {
	test('llms.txt is accessible', async ({ page }) => {
		const response = await page.goto('/llms.txt');

		expect(response?.status()).toBe(200);
	});

	test('llms.txt has content', async ({ page }) => {
		await page.goto('/llms.txt');

		const content = await page.locator('body').textContent();
		expect(content?.length).toBeGreaterThan(100);
	});

	test('llms-full.txt is accessible', async ({ page }) => {
		const response = await page.goto('/llms-full.txt');

		expect(response?.status()).toBe(200);
	});
});

test.describe('Robots.txt', () => {
	test('robots.txt is accessible', async ({ page }) => {
		const response = await page.goto('/robots.txt');

		expect(response?.status()).toBe(200);
	});

	test('robots.txt has proper directives', async ({ page }) => {
		await page.goto('/robots.txt');

		const content = await page.locator('body').textContent();

		expect(content).toMatch(/user-agent/i);
		expect(content).toMatch(/sitemap/i);
	});
});
