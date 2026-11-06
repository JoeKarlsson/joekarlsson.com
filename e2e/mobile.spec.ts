import { test, expect, type Page } from '@playwright/test';

// The phone layout, at iPhone 13 size with touch. Chromium stands in for Safari, since
// WebKit isn't installed for these tests; the layout rules are plain CSS either way.
const PHONE = {
	viewport: { width: 390, height: 844 },
	deviceScaleFactor: 3,
	isMobile: true,
	hasTouch: true,
};
const DESKTOP = { viewport: { width: 1280, height: 900 } };

const box = async (page: Page, selector: string) => {
	const found = await page.locator(selector).first().boundingBox();
	if (!found) throw new Error(`${selector} has no box`);
	return found;
};

test.describe('Phone layout', () => {
	test.use(PHONE);

	test('the nav sits above the homepage hero', async ({ page }) => {
		await page.goto('/');
		const nav = await box(page, 'header nav[aria-label="Main navigation"]');
		const hero = await box(page, 'video[aria-label*="Montage"]');
		expect(nav.y).toBeLessThan(hero.y);
		expect(nav.y).toBeLessThan(40);
	});

	test("the hero coil stays off Joe's face, down on the clip's bottom edge", async ({ page }) => {
		await page.goto('/');
		const hero = await box(page, 'video[aria-label*="Montage"]');
		// The coil is the first scribble after the clip's rounded box
		const coil = await page
			.locator('video[aria-label*="Montage"]')
			.locator('xpath=../following-sibling::*[name()="svg"][1]')
			.boundingBox();
		expect(coil!.y).toBeGreaterThan(hero.y + hero.height * 0.7);
	});

	test('no ticker bands show on phones', async ({ page }) => {
		for (const path of ['/', '/blog/', '/about/', '/work/']) {
			await page.goto(path);
			const visible = await page
				.locator('.ticker')
				.evaluateAll((tickers) => tickers.filter((t) => (t as HTMLElement).offsetParent !== null));
			expect(visible, path).toHaveLength(0);
		}
	});

	test('the footer shows one "Works on my machine" line and wraps its links on screen', async ({
		page,
	}) => {
		await page.goto('/');
		const echoes = page.locator('footer .echo > span[aria-hidden="true"]');
		await expect(echoes.first()).toBeVisible();
		for (let i = 1; i < (await echoes.count()); i++) await expect(echoes.nth(i)).toBeHidden();
		// The one line stays solid black rather than blinking to an outline
		const fill = await echoes
			.first()
			.evaluate((el) => getComputedStyle(el).getPropertyValue('-webkit-text-fill-color'));
		expect(fill).toBe('rgb(0, 0, 0)');

		const links = await page
			.locator('footer nav[aria-label="Footer"] a')
			.evaluateAll((all) => all.map((a) => a.getBoundingClientRect().toJSON()));
		for (const link of links) {
			expect(link.right).toBeLessThanOrEqual(390);
			expect(link.height).toBeGreaterThanOrEqual(44);
		}
		const icons = await page
			.locator('footer a[aria-label]')
			.evaluateAll((all) => all.map((a) => a.getBoundingClientRect().toJSON()));
		for (const icon of icons) expect(icon.height).toBeGreaterThanOrEqual(44);
	});

	test('Recent posts: the newest keeps a big picture, the rest are compact rows', async ({
		page,
	}) => {
		await page.goto('/');
		const pictures = await page
			.locator('ul:has(> li.recent-compact) > li img')
			.evaluateAll((imgs) => imgs.map((img) => img.getBoundingClientRect().width));
		expect(pictures[0]).toBeGreaterThan(300);
		for (const width of pictures.slice(1)) expect(width).toBeLessThanOrEqual(112);
	});

	test('Around the house swipes sideways one clip at a time, captions readable', async ({
		page,
	}) => {
		await page.goto('/');
		const strip = page.locator('.house-strip');
		const { scrollWidth, clientWidth } = await strip.evaluate((el) => ({
			scrollWidth: el.scrollWidth,
			clientWidth: el.clientWidth,
		}));
		expect(scrollWidth).toBeGreaterThan(clientWidth);
		const figure = await box(page, '.house-strip figure');
		expect(figure.width).toBeGreaterThan(390 * 0.6);
		const captionSize = await page
			.locator('.house-strip figcaption')
			.first()
			.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
		expect(captionSize).toBeGreaterThanOrEqual(15);
	});

	test('/about drops Previously at, lines up As seen on, and folds Right now', async ({ page }) => {
		await page.goto('/about/');
		await expect(page.locator('.previously-at')).toBeHidden();

		const firstCard = await box(page, '.as-seen-on li');
		expect(firstCard.x).toBeGreaterThanOrEqual(16);

		const fold = page.locator('details.now-fold');
		await expect(fold).not.toHaveAttribute('open');
		await fold.locator('summary').click();
		await expect(fold).toHaveAttribute('open');
	});

	test('the TL;DR in Tech archive opens only its newest year', async ({ page }) => {
		await page.goto('/newsletter/');
		const years = page.locator('details.tldr-year');
		expect(await years.count()).toBeGreaterThan(1);
		await expect(years.first()).toHaveAttribute('open');
		await expect(years.nth(1)).not.toHaveAttribute('open');
		await years.nth(1).locator('summary').click();
		await expect(years.nth(1)).toHaveAttribute('open');
	});

	test('/work lists projects as compact rows with stills, no clips', async ({ page }) => {
		await page.goto('/work/');
		const heights = await page
			.locator('#projects-grid .project-card')
			.evaluateAll((cards) => cards.map((c) => c.getBoundingClientRect().height));
		expect(heights.length).toBeGreaterThan(10);
		for (const height of heights) expect(height).toBeLessThan(160);
		const visibleClips = await page
			.locator('#projects-grid video')
			.evaluateAll((videos) => videos.filter((v) => (v as HTMLElement).offsetParent !== null));
		expect(visibleClips).toHaveLength(0);
	});

	test('project demos and the DOOM post show a link out instead of a shrunken embed', async ({
		page,
	}) => {
		for (const path of ['/work/linger/', '/work/connect-ai-doom/']) {
			await page.goto(path);
			await expect(page.locator('iframe').first(), path).toBeHidden();
			await expect(page.locator('.embed-phone-poster'), path).toBeVisible();
		}
		await page.goto('/blog/why-i-use-doom-to-visualize-mcp-data/');
		await expect(page.locator('iframe[data-embed-project]')).toBeHidden();
		await expect(page.getByRole('link', { name: 'open the full version' }).last()).toBeVisible();
	});

	test('post FAQs are questions that open on tap', async ({ page }) => {
		await page.goto('/blog/opentofu-proxmox-immutable-homelab/');
		const questions = page.locator('details.faq');
		expect(await questions.count()).toBeGreaterThan(2);
		const first = questions.first();
		await expect(first.locator('p').first()).toBeHidden();
		await first.locator('summary').click();
		await expect(first.locator('p').first()).toBeVisible();
	});
});

test.describe('Desktop keeps its layout', () => {
	test.use(DESKTOP);

	test('the homepage hero stays above the nav, tickers run, Right now is open', async ({
		page,
	}) => {
		await page.goto('/');
		const nav = await box(page, 'header nav[aria-label="Main navigation"]');
		const hero = await box(page, 'video[aria-label*="Montage"]');
		expect(hero.y).toBeLessThan(nav.y);
		await expect(page.locator('.ticker').first()).toBeVisible();

		await page.goto('/about/');
		await expect(page.locator('details.now-fold')).toHaveAttribute('open');
		await expect(page.locator('.previously-at')).toBeVisible();
	});

	test('project pages still embed their demos', async ({ page }) => {
		await page.goto('/work/linger/');
		await expect(page.locator('iframe').first()).toBeVisible();
		await expect(page.locator('.embed-phone-poster')).toBeHidden();
	});
});
