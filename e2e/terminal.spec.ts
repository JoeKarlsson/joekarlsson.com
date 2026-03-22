import { test, expect } from '@playwright/test';

test.describe('Homepage Terminal', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		// Wait for boot sequence to complete (input-line becomes visible)
		await page.waitForSelector('#input-line', { state: 'visible', timeout: 10000 });
	});

	test('terminal displays correctly after boot', async ({ page }) => {
		// Check the prompt is visible
		const prompt = page.locator('#input-line .prompt');
		await expect(prompt).toBeVisible();
		await expect(prompt).toHaveText('~$');

		// Check placeholder is visible when empty
		const placeholder = page.locator('#placeholder');
		await expect(placeholder).toBeVisible();
		await expect(placeholder).toHaveText('type a command...');

		// Check cursor is visible
		const cursor = page.locator('#cursor');
		await expect(cursor).toBeVisible();
	});

	test('placeholder positioning - should NOT overlap with prompt', async ({ page }) => {
		// Get bounding boxes
		const prompt = page.locator('#input-line .prompt');
		const placeholder = page.locator('#placeholder');

		const promptBox = await prompt.boundingBox();
		const placeholderBox = await placeholder.boundingBox();

		expect(promptBox).not.toBeNull();
		expect(placeholderBox).not.toBeNull();

		if (promptBox && placeholderBox) {
			// Placeholder should start AFTER the prompt (to the right of it)
			// The placeholder's left edge should be >= prompt's right edge
			expect(placeholderBox.x).toBeGreaterThanOrEqual(promptBox.x + promptBox.width - 5);
		}
	});

	test('placeholder hides when typing', async ({ page }) => {
		const terminal = page.locator('#terminal');
		const placeholder = page.locator('#placeholder');

		// Focus terminal and type
		await terminal.click();
		await page.keyboard.type('h');

		// Placeholder should be hidden
		await expect(placeholder).toBeHidden();

		// Input text should show what we typed
		const inputText = page.locator('#input-text');
		await expect(inputText).toHaveText('h');
	});

	test('placeholder reappears when input cleared', async ({ page }) => {
		const terminal = page.locator('#terminal');
		const placeholder = page.locator('#placeholder');

		// Type something
		await terminal.click();
		await page.keyboard.type('help');
		await expect(placeholder).toBeHidden();

		// Clear it with backspace
		await page.keyboard.press('Backspace');
		await page.keyboard.press('Backspace');
		await page.keyboard.press('Backspace');
		await page.keyboard.press('Backspace');

		// Placeholder should reappear
		await expect(placeholder).toBeVisible();
	});

	test('tab autocomplete works for commands', async ({ page }) => {
		const terminal = page.locator('#terminal');
		const inputText = page.locator('#input-text');

		// Type partial command - "hel" matches "hello" and "help", completes to first alphabetically
		await terminal.click();
		await page.keyboard.type('hel');

		// Press Tab
		await page.keyboard.press('Tab');

		// Should autocomplete to "hello" (first alphabetically among matches)
		await expect(inputText).toHaveText('hello');
	});

	test('tab autocomplete works for multiple commands', async ({ page }) => {
		const terminal = page.locator('#terminal');
		const inputText = page.locator('#input-text');

		// Test "neo" -> "neofetch"
		await terminal.click();
		await page.keyboard.type('neo');
		await page.keyboard.press('Tab');
		await expect(inputText).toHaveText('neofetch');

		// Clear and test another
		await page.keyboard.press('Backspace');
		await page.keyboard.press('Backspace');
		await page.keyboard.press('Backspace');
		await page.keyboard.press('Backspace');
		await page.keyboard.press('Backspace');
		await page.keyboard.press('Backspace');
		await page.keyboard.press('Backspace');
		await page.keyboard.press('Backspace');

		// Test "who" -> "whoami"
		await page.keyboard.type('who');
		await page.keyboard.press('Tab');
		await expect(inputText).toHaveText('whoami');
	});

	test('help command outputs expected content', async ({ page }) => {
		const terminal = page.locator('#terminal');
		const output = page.locator('#output');

		// Type help and press enter
		await terminal.click();
		await page.keyboard.type('help');
		await page.keyboard.press('Enter');

		// Wait for output
		await page.waitForTimeout(100);

		// Should contain help text
		const outputText = await output.textContent();
		expect(outputText).toContain('Available commands');
	});

	test('arrow up recalls command history', async ({ page }) => {
		const terminal = page.locator('#terminal');
		const inputText = page.locator('#input-text');

		// Execute a command
		await terminal.click();
		await page.keyboard.type('whoami');
		await page.keyboard.press('Enter');

		// Wait for command to execute
		await page.waitForTimeout(100);

		// Press up arrow to recall
		await page.keyboard.press('ArrowUp');

		// Should show previous command
		await expect(inputText).toHaveText('whoami');
	});

	test('input-text does not disappear on arrow key press', async ({ page }) => {
		const terminal = page.locator('#terminal');
		const inputText = page.locator('#input-text');
		const inputLine = page.locator('#input-line');

		// Type something
		await terminal.click();
		await page.keyboard.type('test');
		await expect(inputText).toHaveText('test');

		// Press arrow keys - input line should remain visible and functional
		await page.keyboard.press('ArrowUp');
		await page.keyboard.press('ArrowDown');

		// The input line container should still be visible (the span inside may be empty)
		await expect(inputLine).toBeVisible();

		// Should be able to type again
		await page.keyboard.type('x');
		await expect(inputText).toContainText('x');
	});
});

test.describe('404 Page Terminal', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/nonexistent-page-xyz');
		// Wait for boot sequence
		await page.waitForSelector('#input-line', { state: 'visible', timeout: 10000 });
	});

	test('404 terminal displays correctly', async ({ page }) => {
		const prompt = page.locator('#input-line .prompt');
		await expect(prompt).toBeVisible();
		await expect(prompt).toHaveText('joe@404 ~$');
	});

	test('placeholder positioning on 404', async ({ page }) => {
		const prompt = page.locator('#input-line .prompt');
		const placeholder = page.locator('#placeholder');

		const promptBox = await prompt.boundingBox();
		const placeholderBox = await placeholder.boundingBox();

		expect(promptBox).not.toBeNull();
		expect(placeholderBox).not.toBeNull();

		if (promptBox && placeholderBox) {
			expect(placeholderBox.x).toBeGreaterThanOrEqual(promptBox.x + promptBox.width - 5);
		}
	});
});
