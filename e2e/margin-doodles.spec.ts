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

	test('stays off below 1600px and on the homepage', async ({ page }) => {
		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto('/contact/');
		await expect(page.locator('.margin-doodles')).toBeHidden();
		await page.setViewportSize({ width: 1920, height: 1080 });
		await page.goto('/');
		await expect(page.locator('.margin-doodles')).toHaveCount(0);
	});
});
