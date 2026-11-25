import { test, expect, type Page } from '@playwright/test';

// Every article-style page shares the blog post's frame (DECISIONS.md: consistency comes
// first). Each page type has its own template, so a fix to one used to leave the others
// behind for weeks; this fails CI the moment one drifts. Runs in Chromium and Firefox.
const PAGES = {
	post: '/blog/doom-mcp-server/',
	review: '/reviews/the-little-hours/',
	talk: '/talks/an-introduction-to-iot-internet-of-toilets/',
	newsletter: '/newsletter/taste-matters-more-with-ai/',
	project: '/work/adult-swim-bumper/',
};

/** Left and right edges of the first element matching each selector, or null. */
async function edges(page: Page, selectors: Record<string, string>) {
	return page.evaluate((selectors) => {
		const out: Record<string, { left: number; right: number } | null> = {};
		for (const [name, selector] of Object.entries(selectors)) {
			const el = document.querySelector(selector);
			if (!el) {
				out[name] = null;
				continue;
			}
			const { left, right } = el.getBoundingClientRect();
			out[name] = { left, right };
		}
		return out;
	}, selectors);
}

test.describe('Consistency across page types', () => {
	for (const [type, path] of Object.entries(PAGES)) {
		// 1024 too: below 1280 the masthead once sat 100px left of the text
		for (const width of [1024, 1600])
			test(`${type} opens with the post masthead, every edge on one line at ${width}px`, async ({
				page,
			}) => {
				await page.setViewportSize({ width, height: 1000 });
				await page.goto(path);
				const e = await edges(page, {
					back: '.post-axis > :first-child',
					rule: '.post-axis .masthead-kicker',
					title: '.post-axis .masthead-title',
					picture: '.post-axis .masthead :is(img, video)',
					caption: '.post-axis .masthead-caption',
					text: '.margin-column',
				});
				for (const [name, box] of Object.entries(e)) expect(box, `${type}: ${name}`).not.toBeNull();
				const left = e.rule!.left;
				for (const name of ['back', 'title', 'picture', 'caption', 'text'])
					expect(Math.abs(e[name]!.left - left), `${type}: ${name} left edge`).toBeLessThan(1);
				expect(
					Math.abs(e.picture!.right - e.rule!.right),
					`${type}: picture right edge`,
				).toBeLessThan(1);
				await expect(page.locator('.masthead-caption')).toHaveCSS('font-style', 'italic');
				await expect(page.locator('.masthead :is(img, video)').first()).toHaveCSS(
					'border-radius',
					'0px',
				);
			});

		test(`${type} ends like a post: end mark, newsletter ask, sharing, bio, more to read`, async ({
			page,
		}) => {
			await page.goto(path);
			await expect(page.locator('#post-newsletter-heading')).toHaveText(/works on my machine/i);
			await expect(page.locator('[data-share-links]')).toHaveCount(1);
			await expect(page.getByRole('region', { name: 'About the author' })).toHaveCount(1);
			// Keep reading, More reviews or More works, as the same pink section heading
			const more = page.locator('main nav h2', {
				hasText: /keep reading|more reviews|more works/i,
			});
			await expect(more.first()).toBeAttached();
			const [newsletterClass, moreClass] = await Promise.all([
				page.locator('#post-newsletter-heading').getAttribute('class'),
				more.first().getAttribute('class'),
			]);
			expect(moreClass, `${type}: the two closing headings share a style`).toBe(newsletterClass);
		});

		test(`${type} shows how far through you are`, async ({ page }) => {
			await page.goto(path);
			await expect(page.locator('#reading-progress')).toHaveCount(1);
		});

		test(`${type}'s masthead picture stays a banner on a phone`, async ({ page }) => {
			await page.setViewportSize({ width: 390, height: 844 });
			await page.goto(path);
			const box = (await page.locator('.masthead :is(img, video)').first().boundingBox())!;
			expect(box.height, `${type}: picture height`).toBeLessThanOrEqual(box.width * 0.6);
		});

		test(`${type} keeps On this page in the left gutter and in view`, async ({ page }) => {
			await page.setViewportSize({ width: 1600, height: 1000 });
			await page.goto(path);
			const toc = page.locator('.margin-column > .margin-toc');
			test.skip((await toc.count()) === 0, `${type}: no sections to list`);
			await page.evaluate(() => scrollTo(0, document.body.scrollHeight * 0.5));
			const nav = page.locator('#toc-nav');
			await expect(nav).toBeInViewport();
			const [navBox, textBox] = [
				await nav.boundingBox(),
				await page.locator('.margin-column').boundingBox(),
			];
			expect(navBox!.x + navBox!.width).toBeLessThan(textBox!.x);
		});
	}

	test("a taped card's post shows its picture flat in the masthead, the card in the feed", async ({
		page,
	}) => {
		// Blog posts with an archival clip show its first frame instead, so this checks a talk
		await page.goto('/talks/mongodb-schema-design-best-practices/');
		await expect(page.locator('.masthead img')).toHaveAttribute('src', /\/masthead-[0-9a-f]{8}\./);
	});

	test("a project's hero clip shows its whole frame, and its wide blocks keep to the text", async ({
		page,
	}) => {
		for (const width of [1280, 1960]) {
			await page.setViewportSize({ width, height: 1100 });
			await page.goto('/work/connect-ai-doom/');
			const hero = page.locator('.masthead video');
			const [box, ratio] = await Promise.all([
				hero.boundingBox(),
				hero.evaluate((v) => Number(v.getAttribute('width')) / Number(v.getAttribute('height'))),
			]);
			expect(Math.abs(box!.width / box!.height - ratio), `${width}: hero cropped`).toBeLessThan(
				0.02,
			);
			const text = (await page.locator('.margin-column').boundingBox())!;
			for (const wide of await page.locator('.work-wide:visible').all()) {
				const b = (await wide.boundingBox())!;
				expect(b.x, `${width}: wide block left edge`).toBeGreaterThanOrEqual(text.x - 1);
			}
		}
	});
});

// The section pages (Blog, Newsletter, Works, Reviews, Talks) share one top, one section header
// and one ending; the newsletter drifted from the others before this was checked
const SECTION_PAGES = ['/blog/', '/newsletter/', '/work/', '/reviews/', '/talks/'];

test.describe('Consistency across section pages', () => {
	test('Newsletter, Works and Talks use the same section header', async ({ page }) => {
		const classes: string[] = [];
		for (const path of ['/newsletter/', '/work/', '/talks/']) {
			await page.goto(path);
			classes.push((await page.locator('main section header h2').first().getAttribute('class'))!);
		}
		expect(new Set(classes).size, classes.join('\n')).toBe(1);
	});

	for (const path of SECTION_PAGES)
		test(`${path} ends with a next step`, async ({ page }) => {
			await page.goto(path);
			await expect(page.locator('#keep-exploring')).toHaveCount(1);
		});

	for (const path of ['/blog/', '/newsletter/', '/reviews/'])
		test(`${path}'s featured picture fills its cell, with the title on a strip`, async ({
			page,
		}) => {
			await page.setViewportSize({ width: 1440, height: 900 });
			await page.goto(path);
			const img = page.locator('img[fetchpriority="high"]').first();
			const media = img.locator('xpath=ancestor::a[1]');
			const [cell, picture] = [await media.boundingBox(), await img.boundingBox()];
			expect(Math.abs(cell!.height - picture!.height), `${path}: picture height`).toBeLessThan(2);
		});
});

// Firefox puts every <video> in the Tab order, and a graded clip was invisible under its old pink
// canvas, so a silent clip with no controls took a Tab stop with no ring: /work/ had 23
test.describe('Silent clips stay out of the Tab order', () => {
	for (const path of ['/', '/work/', '/talks/', '/about/', '/uses/', '/contact/', PAGES.project])
		test(`${path} has no focusable clip without controls`, async ({ page }) => {
			await page.goto(path);
			await expect(page.locator('video:not([controls]):not([tabindex="-1"])')).toHaveCount(0);
		});
});
