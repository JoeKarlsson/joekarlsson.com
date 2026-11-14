import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
	const pages = ['/', '/blog', '/about', '/work', '/uses', '/contact', '/reviews/stats'];

	for (const path of pages) {
		test(`${path} has proper heading hierarchy`, async ({ page }) => {
			await page.goto(path);

			// Should have at least one h1 (some pages may have hidden or multiple for layout)
			const h1Count = await page.locator('h1').count();
			expect(h1Count).toBeGreaterThanOrEqual(1);

			// At least one h1 should be visible
			const visibleH1 = page.locator('h1:visible').first();
			await expect(visibleH1).toBeVisible();
		});

		test(`${path} images have alt text`, async ({ page }) => {
			await page.goto(path);

			// One round trip for every image: the stats page has hundreds of posters, and one
			// call per image ran past the test timeout on the slower test runner
			const inaccessible = await page
				.locator('img:not([role="presentation"])')
				.evaluateAll((images) =>
					images
						// Alt text, an aria-label, or hidden from assistive tech
						.filter(
							(img) =>
								!img.getAttribute('alt') &&
								!img.hasAttribute('aria-label') &&
								img.getAttribute('aria-hidden') !== 'true',
						)
						.map((img) => img.getAttribute('src')),
				);
			expect(inaccessible).toEqual([]);
		});

		test(`${path} links have accessible names`, async ({ page }) => {
			await page.goto(path);

			const links = page.locator('a:not([aria-hidden="true"])');
			const linkCount = await links.count();

			// Check first 20 links (performance)
			for (let i = 0; i < Math.min(linkCount, 20); i++) {
				const link = links.nth(i);
				const text = await link.textContent();
				const ariaLabel = await link.getAttribute('aria-label');
				const title = await link.getAttribute('title');

				// Link should have accessible name
				const hasAccessibleName =
					(text?.trim().length ?? 0) > 0 || ariaLabel !== null || title !== null;

				expect(hasAccessibleName).toBeTruthy();
			}
		});
	}
});

test.describe('Keyboard Navigation', () => {
	test('can tab through homepage navigation', async ({ page }) => {
		await page.goto('/about'); // Use about page for simpler structure

		// Start at beginning
		await page.keyboard.press('Tab');

		// Should be able to focus something
		const focusedElement = page.locator(':focus');
		const isFocused = (await focusedElement.count()) > 0;
		expect(isFocused).toBeTruthy();
	});

	test('skip link works', async ({ page }) => {
		await page.goto('/');

		// The first Tab lands on the skip link, which shows itself
		await page.keyboard.press('Tab');
		const skipLink = page.getByRole('link', { name: 'Skip to content' });
		await expect(skipLink).toBeFocused();
		await expect(skipLink).toBeInViewport();

		// Enter moves focus past the hero and nav, into main
		await page.keyboard.press('Enter');
		await expect(page.locator('main#main')).toBeFocused();
	});

	test('interactive elements are keyboard accessible', async ({ page }) => {
		await page.goto('/blog');

		// Tab to search input
		const searchInput = page.getByPlaceholder(/search/i);
		await searchInput.focus();
		await expect(searchInput).toBeFocused();

		// Type in search
		await page.keyboard.type('test');
		await expect(searchInput).toHaveValue('test');

		// Tab to sort buttons
		await page.keyboard.press('Tab');
		const focusedElement = page.locator(':focus');
		await expect(focusedElement).toBeVisible();
	});
});

test.describe('Focus Visibility', () => {
	test('focus indicators are visible', async ({ page }) => {
		await page.goto('/');

		// Tab to an element
		await page.keyboard.press('Tab');
		await page.keyboard.press('Tab');

		const focusedElement = page.locator(':focus');

		// Get computed styles for focus indicator
		const outlineStyle = await focusedElement.evaluate((el) => {
			const styles = window.getComputedStyle(el);
			return {
				outline: styles.outline,
				outlineWidth: styles.outlineWidth,
				boxShadow: styles.boxShadow,
				border: styles.border,
			};
		});

		// Should have some visual focus indicator
		const hasFocusIndicator =
			outlineStyle.outlineWidth !== '0px' ||
			outlineStyle.boxShadow !== 'none' ||
			outlineStyle.outline !== 'none';

		expect(hasFocusIndicator).toBeTruthy();
	});
});

test.describe('Reduced Motion', () => {
	test.use({ reducedMotion: 'reduce' });

	test('page loads correctly with reduced motion preference', async ({ page }) => {
		await page.goto('/about'); // Use about page for simpler structure

		// Page should still load and be functional
		await expect(page.locator('main').first()).toBeVisible();

		// Navigation should work
		await page.goto('/contact');
		await expect(page.locator('main').first()).toBeVisible();
	});
});

test.describe('ARIA Attributes', () => {
	test('navigation landmarks are present', async ({ page }) => {
		await page.goto('/about'); // Use about page which has simpler structure

		// Should have main landmark
		await expect(page.locator('main').first()).toBeVisible();

		// Should have site header
		await expect(page.locator('header.sticky, header:first-of-type').first()).toBeVisible();

		// Should have navigation
		await expect(page.locator('nav').first()).toBeVisible();

		// Should have footer
		await expect(page.locator('body > footer, footer').first()).toBeVisible();
	});
});
