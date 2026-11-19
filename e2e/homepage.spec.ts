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
		await expect(video).toHaveAttribute('data-poster', /montage-poster/);
		await expect(video.locator('source')).toHaveCount(2);
		await expect(video.locator('source').first()).toHaveAttribute('type', 'video/webm');
		// Desktop plays the square cut (dated filename busts the 30-day cache)
		expect(await video.evaluate((v: HTMLVideoElement) => v.currentSrc)).toMatch(
			/\/montage(-\d{4}-\d{2}-\d{2})?\.(webm|mp4)$/,
		);
	});

	test('the terminal card shows the live container count', async ({ page }) => {
		await expect(page.locator('main pre')).toContainText(/run \d+ containers/);
	});

	test('the hero panel leads with my name, then one line on what I do', async ({ page }) => {
		const panel = page
			.locator('h1')
			.locator('xpath=ancestor::div[contains(@class,"bg-surface-1")][1]');
		const nameTop = (await page.locator('h1').boundingBox())!.y;
		const lead = panel.getByText('Technology is better when it');
		expect((await lead.boundingBox())!.y).toBeGreaterThan(nameTop);
		await expect(page.locator('body')).not.toContainText('15 years writing software');
	});

	test('every section heading links to its section page', async ({ page }) => {
		const headings: [string, string][] = [
			['Writing', '/blog/'],
			['Works', '/work/'],
			['Talks', '/talks/'],
		];
		for (const [name, href] of headings) {
			const masthead = page.locator('header', {
				has: page.getByRole('heading', { level: 2, name, exact: true }),
			});
			await expect(masthead.getByRole('link')).toHaveAttribute('href', href);
		}
	});

	test('Odds & ends links each group to its full list', async ({ page }) => {
		const odds = page.locator('section[aria-labelledby="odds"]');
		for (const [name, href] of [
			['All Shorts', '/talks/#short-videos'],
			['All reviews', '/reviews/'],
			['All podcasts', '/talks/?filter=podcast'],
		])
			await expect(odds.getByRole('link', { name })).toHaveAttribute('href', href);
	});

	test('posts, works, talks and reviews all link into the site', async ({ page }) => {
		// 3 side posts + 5 most read + 4 works + 2 talks + 3 small reviews
		const rows = page.locator('main li a:not([tabindex="-1"]):not([target="_blank"])');
		expect(await rows.count()).toBeGreaterThanOrEqual(3 + 5 + 4 + 2 + 3);
		for (const href of await rows.evaluateAll((links) =>
			links.map((a) => a.getAttribute('href')),
		)) {
			expect(href).toMatch(/^\//);
		}
	});

	test('Most read shows no visitor counts', async ({ page }) => {
		const list = page.locator('section[aria-labelledby="most-read"] ol');
		await expect(list.locator('li')).toHaveCount(5);
		expect(await list.innerText()).not.toMatch(/\d,\d{3}|visitors|readers/i);
	});

	test('typing in the newsletter field holds the echo and the slot reel still', async ({
		page,
	}) => {
		const reel = page.locator('.slot-reel');
		await expect(reel).toHaveCSS('animation-play-state', 'running');
		await page.locator('main .newsletter-band input[type="email"]').focus();
		await expect(reel).toHaveCSS('animation-play-state', 'paused');
		await expect(
			page.locator('.newsletter-band .echo > span[aria-hidden="true"]').first(),
		).toHaveCSS('animation-play-state', 'paused');
	});

	test('the newsletter sits up the page, and the footer leaves it out', async ({ page }) => {
		await expect(page.locator('main .newsletter-band form.newsletter-signup')).toHaveCount(1);
		await expect(page.locator('footer form.newsletter-signup')).toHaveCount(0);
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

	test('phones show the headshot and download neither the clip nor its poster', async ({
		page,
	}) => {
		const montage: string[] = [];
		page.on('request', (request) => {
			if (/\/montage-/.test(request.url())) montage.push(request.url());
		});
		await page.goto('/', { waitUntil: 'networkidle' });
		const still = page.locator('section[aria-label="Introduction"] picture img');
		await expect(still).toBeVisible();
		expect(await still.evaluate((img: HTMLImageElement) => img.currentSrc)).toMatch(
			/joe-headshot\.webp$/,
		);
		await expect(page.locator('video[aria-label*="Montage"]')).toBeHidden();
		expect(montage).toEqual([]);
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
