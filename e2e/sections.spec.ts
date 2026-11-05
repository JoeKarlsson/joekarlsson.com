import { test, expect } from '@playwright/test';

test.describe('404 page', () => {
	test.beforeEach(async ({ page }) => {
		const response = await page.goto('/no-such-page-here/');
		expect(response?.status()).toBe(404);
	});

	test('links to every main section', async ({ page }) => {
		const main = page.locator('main');
		for (const href of ['/blog/', '/work/', '/about/', '/newsletter/', '/uses/', '/contact/']) {
			await expect(main.locator(`a[href="${href}"]`).first()).toBeVisible();
		}
	});

	test('its newest post and topic links open real pages', async ({ page }) => {
		const post = page.locator(
			'main a[href^="/blog/"]:not([href^="/blog/category/"]):not([href="/blog/"])',
		);
		const topic = page.locator('main a[href^="/blog/category/"]');
		for (const link of [post.first(), topic.first()]) {
			const response = await page.request.get((await link.getAttribute('href'))!);
			expect(response.status()).toBe(200);
		}
	});
});

test.describe('Man page', () => {
	test('reads as a man page', async ({ page }) => {
		await page.goto('/man/');
		const man = page.locator('pre.man-pre');
		await expect(man).toContainText('JOE(1)');
		for (const section of ['NAME', 'SYNOPSIS', 'DESCRIPTION']) {
			await expect(man).toContainText(section);
		}
	});
});

test.describe('Newsletter', () => {
	test('the index links to the latest issue, which opens with its title', async ({ page }) => {
		await page.goto('/newsletter/');
		await expect(page.locator('main h1')).toHaveText(/newsletter/i);
		await expect(page.locator('a[href="/newsletter/rss.xml"]')).toBeVisible();

		const issue = page.locator('main a[href^="/newsletter/"]:not([href$=".xml"])').first();
		const href = await issue.getAttribute('href');
		await issue.click();
		await expect(page).toHaveURL(href!);
		await expect(page.locator('main h1')).toBeVisible();
		expect((await page.locator('main').textContent())!.trim().length).toBeGreaterThan(500);
	});
});
