import type { KnipConfig } from 'knip';

const config: KnipConfig = {
	project: ['src/**/*.{ts,js,astro,mjs}'],
	ignoreDependencies: [
		// Font packages imported in Astro components
		'@fontsource/inter',
		'@fontsource/jetbrains-mono',
		// Astro uses sharp internally for image optimization
		'sharp',
	],
	ignoreBinaries: [
		// lychee is installed via GitHub Action, not npm
		'lychee',
	],
};

export default config;
