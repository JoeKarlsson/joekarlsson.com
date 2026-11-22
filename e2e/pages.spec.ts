import { test, expect } from '@playwright/test';
import { LEAD_STORY } from '../src/data/coverage';

// Every section page opens its header at the same height under the nav, Talks and
// Resume included (they light up About in the nav instead of a back link).
test.describe('Page header position', () => {
	const sectionPages = [
		'/blog/',
		'/about/',
		'/work/',
		'/uses/',
		'/talks/',
		'/featured/',
		'/resume/',
		'/contact/',
		'/newsletter/',
		'/blog/category/homelab/',
		'/privacy-policy/',
		'/reviews/',
		'/reviews/stats/',
		'/404',
	];

	for (const width of [1280, 390]) {
		test(`section page headers start at the same height at ${width}px`, async ({ page }) => {
			await page.setViewportSize({ width, height: 900 });
			const tops = new Set<number>();
			for (const path of sectionPages) {
				await page.goto(path);
				tops.add(
					await page
						.locator('main h1')
						.first()
						.evaluate((h1) => Math.round(h1.closest('header')!.getBoundingClientRect().top)),
				);
			}
			expect([...tops]).toHaveLength(1);
		});
	}
});

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

test.describe('Talks', () => {
	test('talks page loads', async ({ page }) => {
		await page.goto('/talks/');

		await expect(page.locator('main').first()).toBeVisible();
	});

	test('talks page lists talks', async ({ page }) => {
		await page.goto('/talks/');

		const content = await page.locator('main').textContent();
		expect(content?.length).toBeGreaterThan(200);
	});

	test('?filter=podcast opens with only podcasts showing, without shifting the cards', async ({
		page,
	}) => {
		// Only shifts of the talk cards count: the page title fitting its font can shift on a
		// busy machine, which has nothing to do with the filter
		await page.addInitScript(() => {
			const w = window as unknown as { cardShift: number };
			w.cardShift = 0;
			new PerformanceObserver((list) => {
				for (const entry of list.getEntries() as unknown as {
					value: number;
					hadRecentInput: boolean;
					sources: { node?: Node }[];
				}[])
					if (
						!entry.hadRecentInput &&
						entry.sources.some((s) => s.node instanceof Element && s.node.closest('.talk-era'))
					)
						w.cardShift += entry.value;
			}).observe({ type: 'layout-shift', buffered: true });
		});
		await page.goto('/talks/?filter=podcast');
		await expect(page.locator('[data-talk-filter="podcast"]')).toHaveAttribute(
			'aria-pressed',
			'true',
		);
		const groups = await page
			.locator('.talk-card:visible')
			.evaluateAll((cards) => [...new Set(cards.map((c) => (c as HTMLElement).dataset.talkGroup))]);
		expect(groups).toEqual(['podcast']);
		// Hiding the cards and scrolling in one frame once scored 0.58
		await expect(page.locator('[data-talk-filter="podcast"]')).toBeFocused();
		expect(
			await page.evaluate(() => (window as unknown as { cardShift: number }).cardShift),
		).toBeLessThan(0.1);
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

	// html/body clip overflow, so the check above can't see a card cut off at the edge
	const PAPERS = 'ul:has([aria-describedby^="paper-ref"])';
	test('Written about and the papers fit a 320px screen', async ({ page }) => {
		await page.setViewportSize({ width: 320, height: 568 });
		for (const [path, selector] of [['/about/', `a[href="${LEAD_STORY.url}"], ${PAPERS}`]]) {
			await page.goto(path);
			const rights = await page.locator(selector).evaluateAll((els) =>
				// Every box inside, but not the hover rings, which hang past on purpose
				els.flatMap((el) =>
					[el, ...el.querySelectorAll(':not(svg, svg *)')].map(
						(node) => node.getBoundingClientRect().right,
					),
				),
			);
			expect(rights.length, path).toBeGreaterThan(0);
			for (const right of rights) expect(right, path).toBeLessThanOrEqual(320);
		}
	});

	// The same clip hid a wide table's last columns; its box scrolls sideways instead
	test('a wide table scrolls inside the 320px screen', async ({ page }) => {
		await page.setViewportSize({ width: 320, height: 568 });
		await page.goto('/talks/mongodb-schema-design-best-practices/');
		const box = page.locator('.prose .table-scroll').first();
		const { right, scrolls } = await box.evaluate((el) => ({
			right: el.getBoundingClientRect().right,
			scrolls: el.scrollWidth > el.clientWidth && getComputedStyle(el).overflowX === 'auto',
		}));
		expect(right).toBeLessThanOrEqual(320);
		expect(scrolls).toBe(true);
	});

	test('a paper page fits a 320px screen, its tables scrolling in their boxes', async ({
		page,
	}) => {
		await page.setViewportSize({ width: 320, height: 568 });
		await page.goto('/papers/sentence-length-punctuation/');
		// Inside a scroll box a table may run wider; everything else has to fit
		const rights = await page
			.locator('main :not(.table-scroll *, svg, svg *, math, math *)')
			.evaluateAll((els) =>
				els
					.filter((el) => el.getClientRects().length)
					.map((el) => el.getBoundingClientRect().right),
			);
		for (const right of rights) expect(right).toBeLessThanOrEqual(320);
		const boxes = await page.locator('.paper-body .table-scroll').evaluateAll((els) =>
			els.map((el) => ({
				right: el.getBoundingClientRect().right,
				overflow: getComputedStyle(el).overflowX,
			})),
		);
		expect(boxes.length).toBe(4);
		for (const box of boxes) {
			expect(box.right).toBeLessThanOrEqual(320);
			expect(box.overflow).toBe('auto');
		}
	});

	test('large desktop (1920px) renders correctly', async ({ page }) => {
		await page.setViewportSize({ width: 1920, height: 1080 });
		await page.goto('/');

		await expect(page.locator('main').first()).toBeVisible();
	});
});

// Titles are curled at build (Kiki’s), but a desktop keyboard types a straight quote
test('review search finds a curled title from a straight-quote query', async ({ page }) => {
	await page.goto('/reviews/');
	await page.locator('#review-search').fill("kiki's");
	await expect(page.locator('[data-search]:visible').first()).toContainText('Kiki’s');
});

// DECISIONS.md 2026-11-22: clicking a heading gives the link to its section
test('clicking a post heading puts its section link in the address bar and copies it', async ({
	page,
	context,
	browserName,
}) => {
	test.skip(browserName !== 'chromium', 'only Chromium lets a test grant clipboard access');
	await context.grantPermissions(['clipboard-read', 'clipboard-write']);
	await page.goto('/talks/mongodb-schema-design-best-practices/');
	const heading = page.locator('.prose h2[id]').first();
	const id = await heading.getAttribute('id');
	await heading.click();
	await expect(page.locator('.link-copied')).toHaveText('Link copied');
	expect(new URL(page.url()).hash).toBe(`#${id}`);
	expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(page.url());
});

test('the keyboard copies a section heading’s link with Enter on its self link', async ({
	page,
	context,
	browserName,
}) => {
	test.skip(browserName !== 'chromium', 'only Chromium lets a test grant clipboard access');
	await context.grantPermissions(['clipboard-read', 'clipboard-write']);
	await page.goto('/featured/');
	await page.locator('#built-on-my-work .heading-self-link').focus();
	await page.keyboard.press('Enter');
	await expect(page.locator('.link-copied')).toHaveText('Link copied');
	expect(new URL(page.url()).hash).toBe('#built-on-my-work');
});

// Written for's 44px tap box reached up over the category link when the top line wrapped
test('each link in a post’s top line gets its own taps at 320px', async ({ page }) => {
	await page.setViewportSize({ width: 320, height: 640 });
	await page.goto('/blog/how-to-automate-continuous-data-copying-from-mongodb-to-s3/');
	const links = page.locator('.meta-parts a');
	expect(await links.count()).toBeGreaterThan(1);
	for (const link of await links.all()) {
		const hit = await link.evaluate((el) => {
			const r = el.getBoundingClientRect();
			const at = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
			return el.contains(at);
		});
		expect(hit, (await link.textContent()) ?? '').toBe(true);
	}
});

// DECISIONS.md 2026-11-22: reference posts and talks end with Cite this; story posts don't
test('a reference post’s Cite this opens from the keyboard and fits a 320px screen', async ({
	page,
}) => {
	await page.setViewportSize({ width: 320, height: 640 });
	await page.goto('/blog/what-it-takes-to-build-a-real-time-recommendation-system/');
	const box = page.locator('details.cite-this');
	await box.locator('summary').focus();
	await page.keyboard.press('Enter');
	await expect(box).toHaveAttribute('open', '');
	await expect(box).toContainText('Tinybird Blog, July 25, 2023');
	expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
	await page.goto('/blog/homelab-two-years-later/');
	await expect(page.locator('details.cite-this')).toHaveCount(0);
});
