import { test, expect } from '@playwright/test';

// Runs in Chromium and Firefox (playwright.config.ts). halftone.ts lays a canvas with the
// picture's classes over a post's hero; CI's Firefox has no WebGL to draw one, so this
// places it the same way and checks the CSS lets it span the column like the picture.
// It once stopped at the picture's old 856px cap, 70px short of the masthead rules.
test.describe('Masthead', () => {
	test("the hero's halftone layer spans the column like its picture", async ({ page }) => {
		await page.setViewportSize({ width: 1600, height: 1000 });
		await page.goto('/blog/doom-mcp-server/');
		const [picture, layer, rule] = await page.evaluate(() => {
			const img = document.querySelector<HTMLImageElement>('.masthead img')!;
			const canvas = document.createElement('canvas');
			canvas.className = img.className;
			canvas.style.cssText = `position:absolute;margin:0;width:${img.offsetWidth}px`;
			img.after(canvas);
			const box = (el: Element) => {
				const { left, right } = el.getBoundingClientRect();
				return { left, right };
			};
			return [box(img), box(canvas), box(document.querySelector('.masthead-kicker')!)];
		});
		expect(picture.right - picture.left).toBeGreaterThan(856);
		expect(layer).toEqual(picture);
		expect(Math.abs(picture.left - rule.left)).toBeLessThan(1);
		expect(Math.abs(picture.right - rule.right)).toBeLessThan(1);
	});
});
