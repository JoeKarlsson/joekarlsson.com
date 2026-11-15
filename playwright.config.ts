import { defineConfig, devices } from '@playwright/test';

// PORT lets a session run the suite next to another session's dev server on 4321
const port = Number(process.env.PORT ?? 4321);

export default defineConfig({
	testDir: './e2e',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	// A test that passes only on retry fails the run, so flakes get fixed instead of hidden
	failOnFlakyTests: !!process.env.CI,
	// The CI runner has 4 cores; one worker left the job at 3 minutes on the deploy's critical path
	workers: process.env.CI ? 2 : undefined,
	// html alone printed nothing to the CI log; github annotates failures and flakes on the run
	reporter: process.env.CI ? [['github'], ['list'], ['html', { open: 'never' }]] : 'html',
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
		// The dev toolbar adds its own h1s and buttons, which tests would count as the page's
		env: { ASTRO_E2E: '1' },
		// A PORT run is a session's own: a server already there is another worktree's
		// stale build, so fail loudly instead of testing it
		reuseExistingServer: !process.env.CI && !process.env.PORT,
		timeout: 120 * 1000,
	},
});
