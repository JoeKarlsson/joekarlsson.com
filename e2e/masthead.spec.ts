import { test, expect } from '@playwright/test';

// Runs in Chromium and Firefox (playwright.config.ts). On a wide screen a post's hero
// spans the text and the margin, edge to edge with the masthead rules; it once stopped
// at an old 856px cap, 70px short. Its pink frame fitting it is e2e/halftone.spec.ts.
test.describe('Masthead', () => {
	test('the hero spans the column, edge to edge with the masthead rules', async ({ page }) => {
		await page.setViewportSize({ width: 1600, height: 1000 });
		await page.goto('/blog/doom-mcp-server/');
		const [picture, rule] = await page.evaluate(() => {
			const box = (el: Element) => {
				const { left, right } = el.getBoundingClientRect();
				return { left, right };
			};
			return [
				box(document.querySelector('.masthead :is(img, video)')!),
				box(document.querySelector('.masthead-kicker')!),
			];
		});
		expect(picture.right - picture.left).toBeGreaterThan(856);
		expect(Math.abs(picture.left - rule.left)).toBeLessThan(1);
		expect(Math.abs(picture.right - rule.right)).toBeLessThan(1);
	});
});
