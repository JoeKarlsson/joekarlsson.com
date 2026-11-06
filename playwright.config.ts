import { defineConfig, devices } from '@playwright/test';

// PORT lets a session run the suite next to another session's dev server on 4321
const port = Number(process.env.PORT ?? 4321);

export default defineConfig({
	testDir: './e2e',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: 'html',
	use: {
		baseURL: `http://localhost:${port}`,
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},
	],
	webServer: {
		// --ignore-lock keeps it in the foreground: Astro 7 backgrounds `astro dev` when it
		// detects a coding agent, and Playwright would see the command exit
		command: `npm run dev -- --port ${port} --ignore-lock`,
		url: `http://localhost:${port}`,
		reuseExistingServer: !process.env.CI,
		timeout: 120 * 1000,
	},
});
