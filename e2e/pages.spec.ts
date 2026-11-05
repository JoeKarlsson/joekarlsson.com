import { test, expect } from '@playwright/test';

test.describe('Uses Page', () => {
	test('uses page loads with content', async ({ page }) => {
		await page.goto('/uses');

		await expect(page.locator('h1').first()).toBeVisible();

		const content = await page.locator('main').textContent();
		expect(content?.length).toBeGreaterThan(500);
	});

	test('uses page has equipment sections', async ({ page }) => {
		await page.goto('/uses');

		const headings = page.locator('h2, h3');
		const count = await headings.count();

		expect(count).toBeGreaterThan(3);
	});
});

test.describe('Talk Archive', () => {
	test('talk archive page loads', async ({ page }) => {
		await page.goto('/talk-archive');

		await expect(page.locator('main').first()).toBeVisible();
	});

	test('talk archive has talks listed', async ({ page }) => {
		await page.goto('/talk-archive');

		const content = await page.locator('main').textContent();
		expect(content?.length).toBeGreaterThan(200);
	});
});

test.describe('Privacy Policy', () => {
	test('privacy policy page loads', async ({ page }) => {
		await page.goto('/privacy-policy');

		await expect(page.locator('main').first()).toBeVisible();
	});

	test('privacy policy has content', async ({ page }) => {
		await page.goto('/privacy-policy');

		const content = await page.locator('main').textContent();
		expect(content?.toLowerCase()).toMatch(/privacy|data|cookie/i);
	});
});

test.describe('Responsive Breakpoints', () => {
	test('tablet view (768px) renders correctly', async ({ page }) => {
		await page.setViewportSize({ width: 768, height: 1024 });
		await page.goto('/');

		await expect(page.locator('main').first()).toBeVisible();
		await expect(page.locator('header').first()).toBeVisible();
	});

	test('small mobile (320px) renders correctly', async ({ page }) => {
		await page.setViewportSize({ width: 320, height: 568 });
		await page.goto('/');

		await expect(page.locator('main').first()).toBeVisible();

		// The page never scrolls sideways. Crayon marks hang past the edge on purpose and
		// html/body clip them, so body.scrollWidth counts them; check what a visitor sees.
		const { pageWidth, scrollX } = await page.evaluate(() => {
			window.scrollTo(400, 0);
			return { pageWidth: document.documentElement.scrollWidth, scrollX: window.scrollX };
		});
		expect(pageWidth).toBeLessThanOrEqual(320);
		expect(scrollX).toBe(0);
	});

	test('large desktop (1920px) renders correctly', async ({ page }) => {
		await page.setViewportSize({ width: 1920, height: 1080 });
		await page.goto('/');

		await expect(page.locator('main').first()).toBeVisible();
	});
});
