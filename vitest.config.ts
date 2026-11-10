import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		include: ['tests/**/*.test.ts'],
		// Build-output tests walk thousands of dist files and take 5-8s when other builds share the
		// machine; the 5s default failed pushes on time, not on results
		testTimeout: 30_000,
	},
});
