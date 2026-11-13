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
		const nav = await box(page, 'header nav[aria-label="Main"]');
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

	test('pages start 16px under the nav and space sections on one scale', async ({ page }) => {
		// 8: a heading to its one-line subtitle (TL;DR in Tech)
		const SCALE = [8, 12, 16, 24, 32, 48];
		for (const path of ['/blog/', '/work/', '/about/', '/newsletter/', '/resume/', '/talks/']) {
			await page.goto(path);
			const { top, gaps } = await page.evaluate(() => {
				const navBottom =
					document.querySelector('header nav')!.getBoundingClientRect().bottom + scrollY;
				// The page column, not the margin-doodle layer that comes first in main
				const col = document.querySelector('main > div:not(.margin-doodles)')!;
				const inner = col.querySelector(':scope > div > div.min-w-0');
				const blocks = [...col.children]
					.flatMap((b) => (inner && b.contains(inner) ? [...inner.children] : [b]))
					.filter((el) => {
						const style = getComputedStyle(el);
						return (
							el.tagName !== 'SCRIPT' &&
							el.tagName !== 'svg' &&
							style.display !== 'none' &&
							style.position !== 'absolute' &&
							el.getBoundingClientRect().height > 0
						);
					})
					.map((el) => el.getBoundingClientRect());
				return {
					top: Math.round(blocks[0].top + scrollY - navBottom),
					gaps: blocks.slice(1).map((r, i) => Math.round(r.top - blocks[i].bottom)),
				};
			});
			expect(top, path).toBe(16);
			for (const gap of gaps) expect(SCALE, `${path} gap ${gap}`).toContain(gap);
		}
	});

	test('short page titles are no bigger than ABOUT', async ({ page }) => {
		const titleSize = async (path: string) => {
			await page.goto(path);
			return page
				.locator('main header h1')
				.evaluate((h1) => parseFloat(getComputedStyle(h1).fontSize));
		};
		const about = await titleSize('/about/');
		for (const path of ['/uses/', '/blog/', '/talks/', '/work/', '/newsletter/']) {
			expect(await titleSize(path), path).toBeLessThanOrEqual(about + 0.5);
		}
		expect(await titleSize('/uses/')).toBeCloseTo(about, 0);
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

	test('/about has no Hawaii photo, and its art swipes sideways', async ({ page }) => {
		await page.goto('/about/');
		await expect(page.locator('img[src*="joe-hawaii"]')).toHaveCount(0);
		await expect(page.locator('#what-i-do')).toBeHidden();
		await expect(page.locator('.what-i-do')).toBeHidden();
		const gallery = page.locator('.art-gallery');
		const { scrollWidth, clientWidth } = await gallery.evaluate((el) => ({
			scrollWidth: el.scrollWidth,
			clientWidth: el.clientWidth,
		}));
		expect(scrollWidth).toBeGreaterThan(clientWidth);
	});

	test('pages open on their title, skipping decorative pictures of Joe, but keep featured content', async ({
		page,
	}) => {
		for (const path of ['/about/', '/uses/', '/resume/', '/contact/', '/talks/']) {
			await page.goto(path);
			await expect(page.locator('.poster-media-decorative > *').first(), path).toBeHidden();
		}
		for (const path of ['/blog/', '/newsletter/']) {
			await page.goto(path);
			await expect(
				page.locator('header [slot="media"], header > div > a').first(),
				path,
			).toBeVisible();
		}
		// /work's hero media is the reel of selected works
		await page.goto('/work/');
		await expect(page.locator('header a[data-reel-pieces]')).toBeVisible();
	});

	test('Where to next keeps one big card and lists the rest as compact rows', async ({ page }) => {
		await page.goto('/work/');
		const widths = await page
			.locator('#keep-exploring ~ ul img')
			.evaluateAll((imgs) => imgs.map((img) => img.getBoundingClientRect().width));
		expect(widths.length).toBeGreaterThan(1);
		expect(widths[0]).toBeGreaterThan(300);
		for (const width of widths.slice(1)) expect(width).toBeLessThanOrEqual(112);
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
		// Every era's projects; the five selected works above them are big rows on purpose
		const heights = await page
			.locator('.era-grid .project-card')
			.evaluateAll((cards) => cards.map((c) => c.getBoundingClientRect().height));
		expect(heights.length).toBeGreaterThan(10);
		// Worst case by design: a title clamped to three lines plus the link row wrapped
		// to two, since cards with their own /work page show four links (Project page,
		// Source, Demo, Blog Post). That measured 208px (the Hawaii hackathon card,
		// 2026-11-09); the big selected-work rows aren't in .era-grid.
		for (const height of heights) expect(height).toBeLessThan(220);
		const visibleClips = await page
			.locator('.era-grid video')
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

	test('tap targets are at least 44px', async ({ page }) => {
		const tall = async (selector: string) => {
			const heights = await page
				.locator(selector)
				.evaluateAll((all) =>
					all
						.filter((el) => (el as HTMLElement).offsetParent !== null)
						.map((el) => el.getBoundingClientRect().height),
				);
			expect(heights.length, selector).toBeGreaterThan(0);
			for (const height of heights) expect(height, selector).toBeGreaterThanOrEqual(44);
		};

		await page.goto('/blog/');
		await tall('nav[aria-label="Blog categories"] a, .sort-btn');
		await page.goto('/');
		await tall('main a:text-matches("^All \\\\d+ posts")');
		await page.goto('/work/');
		// The filter chips are gone; the era index and each project's Source/Demo/Blog links remain
		await tall('nav[aria-label="Eras"] a');
		await tall('.project-card > div > a');
		await page.goto('/404');
		await tall('main section a');
		await page.goto('/blog/opentofu-proxmox-immutable-homelab/');
		await tall('nav[aria-label="Breadcrumb"] a');
		// The folded contents list that stands in for the sidebar under 1280px
		await page.locator('details.group\\/toc summary').click();
		await tall('details.group\\/toc summary, details.group\\/toc a');
		await expect(page.locator('.prose .heading-anchor').first()).toBeHidden();

		// /uses pins bunch up too close to tap apart at phone width, so phones skip them
		await page.goto('/uses/');
		await expect(page.locator('a.uses-pin').first()).toBeHidden();
	});

	test('/uses opens the first group of each section, and a pin opens a folded group', async ({
		page,
	}) => {
		await page.goto('/uses/');
		const sections = await page.locator('section:has(.uses-group)').all();
		expect(sections.length).toBeGreaterThan(3);
		for (const section of sections) {
			await expect(section.locator('.uses-group [data-collapse-body]').first()).toBeVisible();
		}
		// Turned sideways the pins come back, but the folds were set at load and stay
		await page.setViewportSize({ width: 900, height: 700 });
		const keyboard = page.locator('#on-the-desk-custom-vortex-pok3r');
		await expect(keyboard).toBeHidden();
		await page.locator('#on-the-desk a.uses-pin[aria-label^="5:"]').click();
		await expect(keyboard).toBeVisible();
		// and circles the name it points at
		await expect(keyboard.locator('svg.hover-ring')).toBeVisible();
	});

	test('folds stay still while the page loads and ease open on tap', async ({ page }) => {
		await page.addInitScript(() => {
			(window as unknown as { foldRuns: number }).foldRuns = 0;
			document.addEventListener('transitionrun', (event) => {
				if ((event.target as Element).matches('[data-collapse-body]'))
					(window as unknown as { foldRuns: number }).foldRuns++;
			});
		});
		await page.goto('/talks/');
		await page.waitForTimeout(400);
		const foldRuns = () =>
			page.evaluate(() => (window as unknown as { foldRuns: number }).foldRuns);
		expect(await foldRuns()).toBe(0);
		await page.locator('[data-collapsed] [data-collapse-toggle]').first().tap();
		await expect.poll(foldRuns).toBeGreaterThan(0);
		// A link into a folded era opens it without growing it (a fresh load: from /talks/
		// itself, only the hash would change, and that open animates)
		await page.goto('about:blank');
		await page.goto('/talks/#era-2021');
		await expect(page.locator('#era-2021 [data-collapse-body]')).toBeVisible();
		await page.waitForTimeout(400);
		expect(await foldRuns()).toBe(0);
	});

	test('/uses previews a folded group while the mouse is over its pin or heading', async ({
		browser,
	}) => {
		// A mouse this time: load at phone width so the groups fold, then widen
		const page = await browser.newPage({
			viewport: { width: 390, height: 844 },
			isMobile: false,
			hasTouch: false,
			deviceScaleFactor: 1,
		});
		await page.goto('/uses/');
		await page.setViewportSize({ width: 1100, height: 800 });
		const keyboard = page.locator('#on-the-desk-custom-vortex-pok3r');
		const pin = page.locator('#on-the-desk a.uses-pin[aria-label^="5:"]');
		await pin.hover();
		await expect(keyboard).toBeVisible();
		await page.mouse.move(0, 0);
		await expect(keyboard).toBeHidden();
		const group = page.locator('#on-the-desk .uses-group', { has: keyboard });
		await group.locator('[data-collapse-toggle]').hover();
		await expect(keyboard).toBeVisible();
		await page.mouse.move(0, 0);
		await expect(keyboard).toBeHidden();
		await page.close();
	});

	test('the bar runs the full width: name left, MENU right, Pause motion inside the menu', async ({
		page,
	}) => {
		await page.goto('/blog/');
		const nav = await box(page, 'header nav[aria-label="Main"]');
		expect(nav.x).toBe(16);
		expect(nav.width).toBe(390 - 32);

		const name = await box(page, 'header nav > a[href="/"]');
		const menu = page.locator('header [data-nav-menu-toggle]');
		const menuBox = (await menu.boundingBox())!;
		expect(name.height).toBeGreaterThanOrEqual(44);
		expect(menuBox.height).toBeGreaterThanOrEqual(44);
		expect(menuBox.x + menuBox.width).toBeGreaterThan(390 - 30);

		const pause = page.getByRole('button', { name: 'Pause motion' });
		await expect(pause).toBeHidden();
		await expect(menu.getByText('Menu', { exact: true })).toBeVisible();
		await menu.click();
		await expect(menu.getByText('Close', { exact: true })).toBeVisible();
		await expect(pause).toBeVisible();
		await expect(pause.getByText('Pause motion')).toBeVisible();
		expect((await pause.boundingBox())!.height).toBeGreaterThanOrEqual(44);
	});

	test('on a post, the bar shows where you are once the title scrolls under it', async ({
		page,
	}) => {
		await page.goto('/blog/homelab-two-years-later/');
		const nav = page.locator('header nav[aria-label="Main"]');
		const home = page.locator('header nav > a[href="/"]');
		await expect(nav).not.toHaveAttribute('data-context-on');
		// Phones always show the JK logo, drawn twice (fill and wobbling outline)
		await expect(home.getByText('JK', { exact: true }).first()).toBeVisible();

		await page.evaluate(() => {
			const body = document.querySelector('article .prose')!;
			scrollTo(0, body.getBoundingClientRect().top + scrollY + body.clientHeight / 3);
		});
		await expect(nav).toHaveAttribute('data-context-on');
		await expect(nav.locator('[data-context-title]')).toHaveText(
			'My Homelab Two Years Later, Every Upgrade and What It Cost',
		);
		await expect(nav.locator('[data-context-meta]')).toHaveText(/^Homelab · \d+ min left$/);
		const progress = await nav
			.locator('[data-read-progress]')
			// a 0-1 scale on a full-width line, so scrolling never relays out the bar
			.evaluate((line) => parseFloat((line as HTMLElement).style.scale) * 100);
		expect(progress).toBeGreaterThan(20);
		expect(progress).toBeLessThan(50);
	});

	test('the footer follows close behind the last section', async ({ page }) => {
		await page.goto('/work/');
		const gap = await page.evaluate(() => {
			const nav = document.querySelector('nav[aria-labelledby="keep-exploring"]')!;
			const footer = document.querySelector('footer')!;
			return footer.getBoundingClientRect().top - nav.getBoundingClientRect().bottom;
		});
		expect(gap).toBeLessThanOrEqual(110);
	});

	test('phones skip the Make a mark board', async ({ page }) => {
		for (const path of ['/', '/404-error/']) {
			await page.goto(path);
			await expect(page.locator('.drawing-board'), path).toBeHidden();
		}
	});

	test('on a touch tablet the board scrolls until a crayon is tapped, then draws in any direction', async ({
		page,
		context,
	}) => {
		await page.setViewportSize({ width: 820, height: 1180 });
		const board = page.locator('.drawing-board').first();
		const cdp = await context.newCDPSession(page);
		// Swipe up from the board's middle
		const swipeUpOnBoard = async () => {
			const area = await box(page, '.drawing-board');
			const x = area.x + area.width / 2;
			const y = area.y + area.height / 2;
			await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
			for (let i = 1; i <= 12; i++) {
				await cdp.send('Input.dispatchTouchEvent', {
					type: 'touchMove',
					touchPoints: [{ x, y: y - i * 15 }],
				});
			}
			await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
			await page.waitForTimeout(300);
		};
		const longestStroke = () =>
			page
				.locator('.drawing-board-pad path')
				.evaluateAll((paths) =>
					Math.max(0, ...paths.map((p) => (p.getAttribute('d') ?? '').split('Q').length - 1)),
				);
		const scrollY = () => page.evaluate(() => window.scrollY);

		// Before a crayon is tapped, a swipe scrolls the page and draws nothing
		await page.goto('/');
		await board.scrollIntoViewIfNeeded();
		await expect(page.locator('.board-hint').first()).toBeVisible();
		const before = await scrollY();
		await swipeUpOnBoard();
		// Under load the touch scroll can land after the swipe's 300ms settle, so wait for it
		await expect.poll(scrollY).toBeGreaterThan(before);
		expect(await longestStroke()).toBe(0);

		// After a crayon is tapped (on a fresh load), the same swipe draws and the page holds still
		await page.goto('/');
		await board.scrollIntoViewIfNeeded();
		await board.locator('[data-crayon]').last().tap();
		await expect(board).toHaveAttribute('data-drawing', '');
		await page.waitForTimeout(500);
		const held = await scrollY();
		await swipeUpOnBoard();
		await expect.poll(longestStroke).toBeGreaterThan(3);
		expect(await scrollY()).toBe(held);

		await board.locator('[data-board-done]').tap();
		await expect(board).not.toHaveAttribute('data-drawing');
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
		const nav = await box(page, 'header nav[aria-label="Main"]');
		const hero = await box(page, 'video[aria-label*="Montage"]');
		expect(hero.y).toBeLessThan(nav.y);
		// The pink ticker became the featured band (FeaturedBand.astro)
		await expect(page.locator('[data-featured-band]').first()).toBeVisible();

		await page.goto('/about/');
		await expect(page.locator('details.now-fold')).toHaveAttribute('open');
		await expect(page.locator('.previously-at')).toBeVisible();
		await expect(page.locator('.what-i-do')).toBeVisible();
	});

	test('project pages still embed their demos', async ({ page }) => {
		await page.goto('/work/linger/');
		await expect(page.locator('iframe').first()).toBeVisible();
		await expect(page.locator('.embed-phone-poster')).toBeHidden();
	});
});
