import { test, expect } from '@playwright/test';

test.describe('Terminal Easter Eggs', () => {
	test.beforeEach(async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 720 });
		await page.goto('/');
		await page.waitForSelector('#input-line', { state: 'visible', timeout: 10000 });
	});

	async function runCommand(page: import('@playwright/test').Page, command: string) {
		const terminal = page.locator('#terminal');
		await terminal.click();
		await page.keyboard.type(command);
		await page.keyboard.press('Enter');
		await page.waitForTimeout(100);
	}

	test('hack command triggers matrix effect', async ({ page }) => {
		await runCommand(page, 'hack');

		const output = page.locator('#output');
		const outputText = await output.textContent();

		// Should contain some hack-related output
		expect(outputText?.toLowerCase()).toMatch(/hack|matrix|access|granted/i);
	});

	test('sudo rm -rf / triggers fake deletion', async ({ page }) => {
		await runCommand(page, 'sudo rm -rf /');

		const output = page.locator('#output');
		const outputText = await output.textContent();

		// Should have humorous response
		expect(outputText).toBeTruthy();
		expect(outputText?.length).toBeGreaterThan(10);
	});

	test('neofetch displays system info', async ({ page }) => {
		await runCommand(page, 'neofetch');

		const output = page.locator('#output');
		const outputText = await output.textContent();

		// Should contain system-like info
		expect(outputText?.toLowerCase()).toMatch(/os|host|shell|joe/i);
	});

	test('whoami returns identity', async ({ page }) => {
		await runCommand(page, 'whoami');

		const output = page.locator('#output');
		const outputText = await output.textContent();

		expect(outputText?.toLowerCase()).toContain('joe');
	});

	test('fortune displays a quote', async ({ page }) => {
		await runCommand(page, 'fortune');

		const output = page.locator('#output');
		const outputText = await output.textContent();

		// Should have some text output
		expect(outputText?.length).toBeGreaterThan(20);
	});

	test('cowsay displays ASCII cow', async ({ page }) => {
		await runCommand(page, 'cowsay');

		const output = page.locator('#output');
		const outputText = await output.textContent();

		// Should contain cow-like ASCII characters
		expect(outputText).toMatch(/[_\\/<>()]/);
	});

	test('coffee command responds', async ({ page }) => {
		await runCommand(page, 'coffee');

		const output = page.locator('#output');
		const outputText = await output.textContent();

		expect(outputText?.toLowerCase()).toMatch(/coffee|brew|cup|☕/i);
	});

	test('beer command responds', async ({ page }) => {
		await runCommand(page, 'beer');

		const output = page.locator('#output');
		const outputText = await output.textContent();

		expect(outputText?.toLowerCase()).toMatch(/beer|drink|🍺/i);
	});

	test('42 command gives answer', async ({ page }) => {
		await runCommand(page, '42');

		const output = page.locator('#output');
		const outputText = await output.textContent();

		// Should reference hitchhiker's guide
		expect(outputText?.toLowerCase()).toMatch(/life|universe|everything|answer|42/i);
	});

	test('xkcd command responds', async ({ page }) => {
		await runCommand(page, 'xkcd');

		const output = page.locator('#output');
		const outputText = await output.textContent();

		expect(outputText?.length).toBeGreaterThan(10);
	});

	test('vim vs emacs vs nano responses', async ({ page }) => {
		// Test vim
		await runCommand(page, 'vim');
		let output = await page.locator('#output').textContent();
		expect(output?.toLowerCase()).toMatch(/vim|editor|exit|:q/i);

		// Test emacs
		await runCommand(page, 'emacs');
		output = await page.locator('#output').textContent();
		expect(output).toBeTruthy();

		// Test nano
		await runCommand(page, 'nano');
		output = await page.locator('#output').textContent();
		expect(output).toBeTruthy();
	});

	test('sl (steam locomotive) responds', async ({ page }) => {
		await runCommand(page, 'sl');

		const output = page.locator('#output');
		const outputText = await output.textContent();

		// Should have train or typo joke
		expect(outputText).toBeTruthy();
	});

	test('clear command clears terminal', async ({ page }) => {
		// First add some output
		await runCommand(page, 'help');
		let output = await page.locator('#output').textContent();
		expect(output?.length).toBeGreaterThan(50);

		// Clear it
		await runCommand(page, 'clear');

		// Output should be empty or minimal
		output = await page.locator('#output').textContent();
		expect(output?.trim().length).toBeLessThan(50);
	});

	test('exit command on homepage offers navigation', async ({ page }) => {
		await runCommand(page, 'exit');

		const output = page.locator('#output');
		const outputText = await output.textContent();

		// Should have some response about leaving or navigation
		expect(outputText).toBeTruthy();
	});

	test('unknown command shows helpful error', async ({ page }) => {
		await runCommand(page, 'nonexistentcommand123');

		const output = page.locator('#output');
		const outputText = await output.textContent();

		// Should indicate command not found
		expect(outputText?.toLowerCase()).toMatch(/not found|unknown|command/i);
	});

	test('ls command lists pages', async ({ page }) => {
		await runCommand(page, 'ls');

		const output = page.locator('#output');
		const outputText = await output.textContent();

		// Should list some pages
		expect(outputText?.toLowerCase()).toMatch(/blog|about|work|contact/i);
	});

	test('pwd shows current path', async ({ page }) => {
		await runCommand(page, 'pwd');

		const output = page.locator('#output');
		const outputText = await output.textContent();

		expect(outputText).toMatch(/\//);
	});

	test('echo command echoes text', async ({ page }) => {
		await runCommand(page, 'echo hello world');

		const output = page.locator('#output');
		const outputText = await output.textContent();

		expect(outputText).toContain('hello world');
	});

	test('uptime shows time', async ({ page }) => {
		await runCommand(page, 'uptime');

		const output = page.locator('#output');
		const outputText = await output.textContent();

		expect(outputText?.toLowerCase()).toMatch(/up|time|day|hour|minute/i);
	});
});
