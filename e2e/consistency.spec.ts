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
		test(`${type} opens with the post masthead, every edge on one line`, async ({ page }) => {
			await page.setViewportSize({ width: 1600, height: 1000 });
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
