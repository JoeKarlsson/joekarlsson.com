import { test, expect } from '@playwright/test';

test.describe('Console Errors', () => {
	const pages = ['/', '/blog', '/about', '/work', '/uses', '/contact'];

	for (const path of pages) {
		test(`${path} has no console errors`, async ({ page }) => {
			const errors: string[] = [];

			page.on('console', (msg) => {
				if (msg.type() === 'error') {
					errors.push(msg.text());
				}
			});

			page.on('pageerror', (err) => {
				errors.push(err.message);
			});

			await page.goto(path);
			// Scripts deferred to idle run before the browser is next idle; a fixed second
			// waited longer than that on a quiet page and could miss them on a busy runner
			await page.evaluate(
				() => new Promise((resolve) => requestIdleCallback(resolve, { timeout: 2000 })),
			);

			// Filter out known third-party errors
			const realErrors = errors.filter(
				(e) => !e.includes('third-party') && !e.includes('analytics') && !e.includes('plausible'),
			);

			expect(realErrors).toHaveLength(0);
		});
	}
});
