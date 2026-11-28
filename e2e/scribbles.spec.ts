import { expect, test } from '@playwright/test';

// The coil over the homepage name must draw itself in, in Chromium and in Safari's WebKit: a
// version of the scribble motion Safari couldn't compute showed it always drawn, never moving.
test('the coil over the homepage name draws itself in', async ({ page }) => {
	await page.goto('/');
	const offsets = page.locator('h1 svg.redraw').last().locator('path').first();
	const seen = new Set<string>();
	for (let i = 0; i < 8; i++) {
		seen.add(await offsets.evaluate((path) => getComputedStyle(path).strokeDashoffset));
		await page.waitForTimeout(150);
	}
	expect(seen.size, `stroke-dashoffset stayed at ${[...seen].join(', ')}`).toBeGreaterThan(1);
});
