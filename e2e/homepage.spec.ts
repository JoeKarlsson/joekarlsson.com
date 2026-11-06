import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('has the landmarks: hero above the nav, main and footer', async ({ page }) => {
		await expect(page.locator('header nav')).toBeVisible();
		await expect(page.locator('main')).toBeVisible();
		await expect(page.locator('footer')).toBeVisible();
		await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Joe\s*Karlsson/);
	});

	test('hero montage video is present and labeled', async ({ page }) => {
		const video = page.locator('video[aria-label*="Montage"]');
		await expect(video).toHaveAttribute('poster', /montage-poster/);
		await expect(video.locator('source')).toHaveCount(4);
		await expect(video.locator('source').first()).toHaveAttribute('type', 'video/webm');
		// Desktop plays the full square cut
		expect(await video.evaluate((v: HTMLVideoElement) => v.currentSrc)).toMatch(
			/montage\.(webm|mp4)$/,
		);
	});

	test('the bio carries the live container count', async ({ page }) => {
		await expect(page.locator('body')).toContainText(/run a \d+-container homelab/);
	});

	test('every section heading links to its section page', async ({ page }) => {
		const headings: [string, string][] = [
			['Recent posts', '/blog/'],
			['Projects', '/work/'],
			['Writing by topic', '/blog/'],
		];
		for (const [name, href] of headings) {
			await expect(page.getByRole('heading', { level: 2, name }).getByRole('link')).toHaveAttribute(
				'href',
				href,
			);
		}
	});

	test('recent posts, project and topic rows all link somewhere', async ({ page }) => {
		const rows = page.locator('main li a:not([tabindex="-1"]), main a.index-row');
		expect(await rows.count()).toBeGreaterThanOrEqual(5 + 5 + 4);
		for (const href of await rows.evaluateAll((links) =>
			links.map((a) => a.getAttribute('href')),
		)) {
			expect(href).toMatch(/^\//);
		}
		await expect(page.getByRole('link', { name: /^All \d+ posts/ })).toHaveAttribute(
			'href',
			'/blog/',
		);
	});

	test('the slot machine has real screen-reader text', async ({ page }) => {
		await expect(page.locator('.sr-only', { hasText: 'Ship the ugly pot' })).toHaveCount(1);
		await expect(page.locator('.slot-window')).toHaveAttribute('aria-hidden', 'true');
	});

	test('the drawing board is hidden from assistive tech and keyboard focus', async ({ page }) => {
		const board = page.locator('.drawing-board');
		await expect(board).toHaveAttribute('aria-hidden', 'true');
		for (const tabindex of await board
			.locator('button')
			.evaluateAll((buttons) => buttons.map((b) => b.getAttribute('tabindex')))) {
			expect(tabindex).toBe('-1');
		}
	});

	test('mouse movement over the board draws a stroke', async ({ page }) => {
		const board = page.locator('.drawing-board');
		await board.scrollIntoViewIfNeeded();
		const box = (await board.boundingBox())!;
		await page.mouse.move(box.x + 100, box.y + 200);
		await page.mouse.move(box.x + 300, box.y + 260, { steps: 10 });
		await expect(page.locator('.drawing-board .board-stroke')).toHaveCount(1);
	});
});

test.describe('Homepage - Mobile', () => {
	test.use({ viewport: { width: 375, height: 667 }, hasTouch: true });

	test('phones get the cropped montage', async ({ page }) => {
		await page.goto('/');
		const video = page.locator('video[aria-label*="Montage"]');
		await expect
			.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentSrc))
			.toMatch(/montage-phone/);
	});

	test('the drawing board lets touch scroll the page until drawing is on', async ({ page }) => {
		await page.goto('/');
		const pad = page.locator('.drawing-board-pad');
		await expect(pad).toHaveCSS('touch-action', 'auto');
		await page
			.locator('.drawing-board')
			.evaluate((board) => board.setAttribute('data-drawing', ''));
		await expect(pad).toHaveCSS('touch-action', 'none');
	});

	test('the page does not scroll sideways', async ({ page }) => {
		await page.goto('/');
		const widths = await page.evaluate(() => [
			document.documentElement.scrollWidth,
			window.innerWidth,
		]);
		expect(widths[0]).toBeLessThanOrEqual(widths[1]);
	});
});
