import { test, expect } from '@playwright/test';

// Enter on a spoiler shows them all, and focus stays on that spoiler instead of falling back
// to <body> (which sent the next Tab thousands of pixels down the page in WebKit). Once focus
// moves on, the shown spoiler is plain text with no tab stop.
test('showing a spoiler keeps keyboard focus on it', async ({ page }) => {
	await page.goto('/reviews/after-hours/');
	const first = page.locator('.spoiler').first();
	await first.focus();
	await page.keyboard.press('Enter');

	await expect(page.locator('article.spoilers-shown')).toHaveCount(1);
	await expect(first).toBeFocused();
	await expect(page.locator('.spoiler[role]')).toHaveCount(0);

	await page.keyboard.press('Tab');
	await expect(first).not.toHaveAttribute('tabindex');
});

// A spoiler picture has a real Show spoiler button over it. Pressing it shows every spoiler,
// removes the button, and hands focus to the picture's Enlarge button or the picture itself.
test('a spoiler picture shows from its button and keeps focus nearby', async ({ page }) => {
	await page.goto('/reviews/after-hours/');
	// The button must not break the pair out of its side-by-side frame (rehype-frames.mjs)
	await expect(page.locator('figure.frame-pair > .spoiler-frame')).toHaveCount(1);
	const frame = page.locator('.spoiler-frame').first();
	const show = frame.getByRole('button', { name: 'Show spoiler' });
	await show.focus();
	await page.keyboard.press('Enter');

	await expect(page.locator('article.spoilers-shown')).toHaveCount(1);
	await expect(page.locator('.spoiler-show')).toHaveCount(0);
	const focusedInFrame = await frame.evaluate((f) => f.contains(document.activeElement));
	expect(focusedInFrame).toBe(true);
});

test('a click anywhere on a spoiler picture shows it', async ({ page }) => {
	await page.goto('/reviews/after-hours/');
	const img = page.locator('.spoiler-frame img').first();
	await img.scrollIntoViewIfNeeded();
	const box = (await img.boundingBox())!;
	await page.mouse.click(box.x + 10, box.y + 10);
	await expect(page.locator('article.spoilers-shown')).toHaveCount(1);
	await expect(page.locator('.lightbox[open], dialog[open]')).toHaveCount(0);
});
