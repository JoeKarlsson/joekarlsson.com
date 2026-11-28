import { test, expect } from '@playwright/test';

test.describe("Joe's margin doodles", () => {
	test('a short page keeps only the doodles that fit above its end', async ({ page }) => {
		await page.setViewportSize({ width: 1920, height: 1080 });
		await page.goto('/contact/');
		const layer = page.locator('.margin-doodles');
		await expect(layer).toBeVisible();
		// The doodle script is its own chunk, fetched once the page sees a wide screen
		await expect.poll(() => layer.evaluate((l) => l.children.length)).toBeGreaterThan(0);
		// The hidden ones must stay hidden (a hidden doodle measures 0, which once flipped them back on)
		await page.waitForTimeout(500);
		const { shown, total, overflowing } = await layer.evaluate((l: HTMLElement) => {
			const doodles = [...l.children] as HTMLElement[];
			const visible = doodles.filter((d) => !d.hidden);
			return {
				shown: visible.length,
				total: doodles.length,
				overflowing: visible.filter((d) => d.offsetTop + d.offsetHeight > l.clientHeight).length,
			};
		});
		expect(shown).toBeGreaterThan(0);
		expect(shown).toBeLessThan(total);
		expect(overflowing).toBe(0);
	});

	test('stays off below 1600px, and on the homepage below 2020px', async ({ page }) => {
		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto('/contact/');
		await expect(page.locator('.margin-doodles')).toBeHidden();
		await page.setViewportSize({ width: 1920, height: 1080 });
		await page.goto('/');
		await expect(page.locator('.margin-doodles')).toBeHidden();
	});

	test('the homepage keeps its doodles to the right and runs one line down the left', async ({
		page,
	}) => {
		await page.setViewportSize({ width: 2560, height: 1440 });
		await page.goto('/');
		const layer = page.locator('.margin-doodles');
		const thread = layer.locator('.margin-thread path');
		await expect(thread.first()).toBeAttached();
		// Drawn by scroll; a minified shorthand once dropped the animation without a trace.
		// Polled: fit() redraws the line on every layer resize (images settling the page height),
		// and a replaced, detached path reports an empty animationName
		await expect
			.poll(() => thread.first().evaluate((p) => getComputedStyle(p).animationName))
			.toBe('thread-draw');
		const sides = await layer.evaluate((l) =>
			[...l.children]
				.filter((d) => d instanceof HTMLElement && d.style.top)
				.map((d) => ((d as HTMLElement).style.left ? 'left' : 'right')),
		);
		expect(sides.length).toBeGreaterThan(0);
		expect(new Set(sides)).toEqual(new Set(['right']));
	});

	test('sized for a wide window, never run over the text once it narrows', async ({ page }) => {
		await page.setViewportSize({ width: 2560, height: 1300 });
		await page.goto('/blog/the-artists-way-review/');
		const layer = page.locator('.margin-doodles');
		await expect.poll(() => layer.locator('.margin-lane').count()).toBe(1);
		await page.setViewportSize({ width: 1620, height: 1300 });
		await expect
			.poll(() =>
				layer.evaluate((l) => {
					const text = l.querySelector('.margin-lane')!.getBoundingClientRect();
					return [...l.querySelectorAll<HTMLElement>(':scope > div[style*="top"]')]
						.filter((d) => !d.hidden)
						.filter((d) => {
							const r = d.getBoundingClientRect();
							return r.right > text.left && r.left < text.right;
						}).length;
				}),
			)
			.toBe(0);
	});

	test('come back after the window narrows and widens again', async ({ page }) => {
		await page.setViewportSize({ width: 1920, height: 1080 });
		await page.goto('/contact/');
		const layer = page.locator('.margin-doodles');
		await expect(layer).toBeVisible();
		await page.setViewportSize({ width: 1440, height: 900 });
		await expect(layer).toBeHidden();
		await page.setViewportSize({ width: 1920, height: 1080 });
		await expect(layer).toBeVisible();
	});

	test('a page opened before a deploy skips the doodles when their old chunk is gone', async ({
		page,
	}) => {
		// Live visitors hit "Failed to fetch dynamically imported module margin-doodles.*.js"
		const errors: string[] = [];
		page.on('pageerror', (error) => errors.push(error.message));
		await page.route(/margin-doodles/, (route) =>
			route.request().resourceType() === 'script'
				? route.fulfill({ status: 404 })
				: route.continue(),
		);
		await page.setViewportSize({ width: 1920, height: 1080 });
		await page.goto('/contact/');
		await page.waitForTimeout(1000);
		expect(errors).toEqual([]);
	});
});
