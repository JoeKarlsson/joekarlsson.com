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
		for (const [path, selector] of [
			['/about/', `a[href="${LEAD_STORY.url}"], ${PAPERS}`],
			['/featured/', PAPERS],
		]) {
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
