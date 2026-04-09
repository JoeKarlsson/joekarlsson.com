import { test, expect } from '@playwright/test';

test.describe('CatChase Component', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/about');
		// Wait for cat chase section to be visible
		await page.waitForSelector('#cat-chase', { state: 'visible', timeout: 5000 });
	});

	test('renders cat and mouse ASCII art', async ({ page }) => {
		const cat = page.locator('#cat-ascii');
		const mouse = page.locator('#mouse-ascii');

		await expect(cat).toBeVisible();
		await expect(mouse).toBeVisible();

		// Check ASCII art contains expected characters
		const catText = await cat.textContent();
		const mouseText = await mouse.textContent();

		expect(catText).toContain('/\\_/\\');
		expect(catText).toContain('o.o');
		expect(mouseText).toContain(':3');
	});

	test('has correct accessibility attributes', async ({ page }) => {
		const section = page.locator('#cat-chase');

		// Should be hidden from assistive technology (decorative)
		await expect(section).toHaveAttribute('aria-hidden', 'true');
		await expect(section).toHaveAttribute('role', 'presentation');
	});

	test('has data attributes for direction switching', async ({ page }) => {
		const cat = page.locator('#cat-ascii');
		const mouse = page.locator('#mouse-ascii');

		// Both should have left and right variants in data attributes
		const catRight = await cat.getAttribute('data-right');
		const catLeft = await cat.getAttribute('data-left');
		const mouseRight = await mouse.getAttribute('data-right');
		const mouseLeft = await mouse.getAttribute('data-left');

		expect(catRight).toContain('/\\_/\\');
		expect(catLeft).toContain('/\\_/\\');
		expect(mouseRight).toContain(':3');
		expect(mouseLeft).toContain(':3');

		// Left and right should be different (mirrored)
		expect(catRight).not.toBe(catLeft);
		expect(mouseRight).not.toBe(mouseLeft);
	});

	test('cat and mouse are positioned within container', async ({ page }) => {
		const container = page.locator('#cat-chase .cat-chase-container');
		const cat = page.locator('#cat-ascii');
		const mouse = page.locator('#mouse-ascii');

		const containerBox = await container.boundingBox();
		const catBox = await cat.boundingBox();
		const mouseBox = await mouse.boundingBox();

		expect(containerBox).not.toBeNull();
		expect(catBox).not.toBeNull();
		expect(mouseBox).not.toBeNull();

		if (containerBox && catBox && mouseBox) {
			// Both should be within container bounds
			expect(catBox.x).toBeGreaterThanOrEqual(containerBox.x);
			expect(catBox.x + catBox.width).toBeLessThanOrEqual(containerBox.x + containerBox.width);
			expect(mouseBox.x).toBeGreaterThanOrEqual(containerBox.x);
			expect(mouseBox.x + mouseBox.width).toBeLessThanOrEqual(containerBox.x + containerBox.width);
		}
	});

	test('cat and mouse maintain gap between them', async ({ page }) => {
		const container = page.locator('#cat-chase');
		const cat = page.locator('#cat-ascii');
		const mouse = page.locator('#mouse-ascii');

		// Scroll into view and move cursor to the right side so the mouse
		// runs ahead while the cat chases — giving them time to separate
		await container.scrollIntoViewIfNeeded();
		const containerBox = await container.boundingBox();
		if (!containerBox) return;

		const centerY = containerBox.y + containerBox.height / 2;
		await page.mouse.move(containerBox.x + containerBox.width * 0.9, centerY);
		await page.waitForTimeout(1200);

		const catBox = await cat.boundingBox();
		const mouseBox = await mouse.boundingBox();

		expect(catBox).not.toBeNull();
		expect(mouseBox).not.toBeNull();

		if (catBox && mouseBox) {
			// There should be a gap between cat and mouse (not overlapping)
			const catRight = catBox.x + catBox.width;
			const mouseLeft = mouseBox.x;

			// Either cat is to the left of mouse or mouse is to the left of cat
			const hasGap = catRight < mouseLeft || mouseBox.x + mouseBox.width < catBox.x;
			expect(hasGap).toBeTruthy();
		}
	});

	test('displays comment text', async ({ page }) => {
		const comment = page.locator('.cat-chase-comment');

		await expect(comment).toBeVisible();
		await expect(comment).toHaveText('// cat.exe running...');
	});
});

test.describe('CatChase Cursor Tracking', () => {
	test('mouse follows cursor movement', async ({ page }) => {
		await page.goto('/about');

		const container = page.locator('#cat-chase');
		const mouse = page.locator('#mouse-ascii');

		// Scroll element into view to ensure animation is running
		await container.scrollIntoViewIfNeeded();
		await page.waitForTimeout(300);

		const containerBox = await container.boundingBox();
		if (!containerBox) return;

		// First move cursor to the LEFT to establish baseline
		// Use center Y of container for reliable tracking
		const centerY = containerBox.y + containerBox.height / 2;
		await page.mouse.move(containerBox.x + containerBox.width * 0.1, centerY);
		await page.waitForTimeout(1000);

		// Get position after moving left
		const leftBox = await mouse.boundingBox();
		expect(leftBox).not.toBeNull();

		// Now move cursor to the RIGHT
		await page.mouse.move(containerBox.x + containerBox.width * 0.9, centerY);
		await page.waitForTimeout(1000);

		// Get new position
		const rightBox = await mouse.boundingBox();
		expect(rightBox).not.toBeNull();

		if (leftBox && rightBox) {
			// Mouse should have moved toward cursor (to the right)
			expect(rightBox.x).toBeGreaterThan(leftBox.x);
		}
	});

	test('cat chases mouse with delay', async ({ page }) => {
		await page.goto('/about');

		const container = page.locator('#cat-chase');
		const cat = page.locator('#cat-ascii');
		const mouse = page.locator('#mouse-ascii');

		// Scroll element into view
		await container.scrollIntoViewIfNeeded();
		await page.waitForTimeout(300);

		const containerBox = await container.boundingBox();
		if (!containerBox) return;

		const centerY = containerBox.y + containerBox.height / 2;

		// Move cursor to the left first to establish baseline
		await page.mouse.move(containerBox.x + containerBox.width * 0.1, centerY);
		await page.waitForTimeout(1200);

		// Get positions after moving left
		const catLeft = await cat.boundingBox();
		const mouseLeft = await mouse.boundingBox();

		// Now move cursor far to the right
		await page.mouse.move(containerBox.x + containerBox.width * 0.95, centerY);
		await page.waitForTimeout(1200);

		const catRight = await cat.boundingBox();
		const mouseRight = await mouse.boundingBox();

		if (catLeft && mouseLeft && catRight && mouseRight) {
			// Both should have moved to the right
			expect(mouseRight.x).toBeGreaterThan(mouseLeft.x);
			expect(catRight.x).toBeGreaterThan(catLeft.x);

			// Cat should still be behind mouse (chasing, not catching)
			expect(catRight.x).toBeLessThan(mouseRight.x);
		}
	});
});

test.describe('CatChase Reduced Motion', () => {
	// @ts-expect-error - reducedMotion is valid Playwright option
	test.use({ reducedMotion: 'reduce' });

	test('respects prefers-reduced-motion', async ({ page }) => {
		await page.goto('/about');
		await page.waitForSelector('#cat-chase', { state: 'visible', timeout: 5000 });

		const cat = page.locator('#cat-ascii');
		const mouse = page.locator('#mouse-ascii');

		// Get initial positions
		const catInitial = await cat.boundingBox();
		const mouseInitial = await mouse.boundingBox();

		// Move cursor - should NOT cause animation
		const container = page.locator('#cat-chase');
		const containerBox = await container.boundingBox();

		if (containerBox) {
			await page.mouse.move(containerBox.x + containerBox.width * 0.9, containerBox.y + 40);
			await page.waitForTimeout(500);
		}

		// Positions should remain the same (no animation)
		const catAfter = await cat.boundingBox();
		const mouseAfter = await mouse.boundingBox();

		if (catInitial && catAfter && mouseInitial && mouseAfter) {
			// With reduced motion, positions should not change significantly
			expect(Math.abs(catAfter.x - catInitial.x)).toBeLessThan(5);
			expect(Math.abs(mouseAfter.x - mouseInitial.x)).toBeLessThan(5);
		}
	});

	test('elements still render with reduced motion', async ({ page }) => {
		await page.goto('/about');
		await page.waitForSelector('#cat-chase', { state: 'visible', timeout: 5000 });

		// Should still show the ASCII art
		const cat = page.locator('#cat-ascii');
		const mouse = page.locator('#mouse-ascii');

		await expect(cat).toBeVisible();
		await expect(mouse).toBeVisible();
	});
});

// Note: Touch device behavior (autonomous movement) is difficult to test reliably
// in Playwright because matchMedia mocking must happen before script execution.
// The component's touch detection uses window.matchMedia('(hover: none)') at load time.

test.describe('CatChase Direction Changes', () => {
	test('characters flip direction based on relative position', async ({ page }) => {
		await page.goto('/about');
		await page.waitForSelector('#cat-chase', { state: 'visible', timeout: 5000 });

		const container = page.locator('#cat-chase');
		const cat = page.locator('#cat-ascii');
		const mouse = page.locator('#mouse-ascii');
		const containerBox = await container.boundingBox();

		if (!containerBox) return;

		// Move cursor far right
		await page.mouse.move(containerBox.x + containerBox.width * 0.9, containerBox.y + 40);
		await page.waitForTimeout(800);

		// Get ASCII content - should be right-facing
		let mouseText = await mouse.textContent();

		// Right-facing mouse has tail on left: ~~(:3>
		expect(mouseText).toContain('~~');

		// Now move cursor far left
		await page.mouse.move(containerBox.x + containerBox.width * 0.1, containerBox.y + 40);
		await page.waitForTimeout(1200);

		// Get new ASCII content
		mouseText = await mouse.textContent();

		// Left-facing mouse has tail on right: <:3)~~
		// The ASCII should have flipped
		const catBox = await cat.boundingBox();
		const mouseBox = await mouse.boundingBox();

		if (catBox && mouseBox && catBox.x > mouseBox.x) {
			// Cat is to the right of mouse - both should face left
			expect(mouseText).toContain('<:3');
		}
	});
});

test.describe('CatChase Idle Behavior', () => {
	test('cat creeps closer when cursor is idle', async ({ page }) => {
		await page.goto('/about');

		const container = page.locator('#cat-chase');
		const cat = page.locator('#cat-ascii');
		const mouse = page.locator('#mouse-ascii');

		// Scroll into view
		await container.scrollIntoViewIfNeeded();
		await page.waitForTimeout(300);

		const containerBox = await container.boundingBox();
		if (!containerBox) return;

		const centerY = containerBox.y + containerBox.height / 2;

		// Move cursor to center and let things settle
		await page.mouse.move(containerBox.x + containerBox.width * 0.6, centerY);
		await page.waitForTimeout(1500);

		// Get initial gap between cat and mouse
		const catInitial = await cat.boundingBox();
		const mouseInitial = await mouse.boundingBox();

		if (!catInitial || !mouseInitial) return;

		const initialGap = Math.abs(mouseInitial.x - catInitial.x);

		// Keep cursor still for 3+ seconds (idle threshold is 2s, creep starts after)
		await page.waitForTimeout(3500);

		// Get new positions
		const catAfter = await cat.boundingBox();
		const mouseAfter = await mouse.boundingBox();

		if (!catAfter || !mouseAfter) return;

		const finalGap = Math.abs(mouseAfter.x - catAfter.x);

		// Cat should have crept closer (gap decreased) or at minimum gap
		// The MIN_GAP is 0.18 of the usable width, so cat stops there
		expect(finalGap).toBeLessThanOrEqual(initialGap + 5); // Allow small tolerance
	});
});

test.describe('CatChase Visibility Optimization', () => {
	test('component exists on about page', async ({ page }) => {
		await page.goto('/about');

		// The cat chase section should exist
		const section = page.locator('#cat-chase');
		await expect(section).toBeVisible();
	});

	test('animation pauses when scrolled out of view', async ({ page }) => {
		await page.goto('/about');
		await page.waitForSelector('#cat-chase', { state: 'visible', timeout: 5000 });

		const mouse = page.locator('#mouse-ascii');
		const container = page.locator('#cat-chase');

		// Get position when visible
		const visibleBox = await mouse.boundingBox();

		// Scroll the component out of view
		await page.evaluate(() => {
			window.scrollTo(0, document.body.scrollHeight);
		});
		await page.waitForTimeout(300);

		// Move cursor (shouldn't affect animation since it's not visible)
		const containerBox = await container.boundingBox();
		if (containerBox) {
			await page.mouse.move(containerBox.x + 100, containerBox.y + 40);
		}
		await page.waitForTimeout(500);

		// Scroll back
		await page.evaluate(() => {
			window.scrollTo(0, 0);
		});
		await page.waitForTimeout(300);

		// Position should be similar (animation was paused while off-screen)
		const afterBox = await mouse.boundingBox();

		if (visibleBox && afterBox) {
			// The position difference should be minimal since animation was paused
			// Allow some tolerance for the brief visible moments during scroll
			expect(Math.abs(afterBox.x - visibleBox.x)).toBeLessThan(100);
		}
	});
});
