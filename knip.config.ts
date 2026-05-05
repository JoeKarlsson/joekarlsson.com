import type { KnipConfig } from 'knip';

const config: KnipConfig = {
	project: ['src/**/*.{ts,js,astro,mjs}'],
	ignoreDependencies: [
		// Font packages imported in Astro components
		'@fontsource/inter',
		'@fontsource/jetbrains-mono',
	],
	ignoreBinaries: [
		// lychee is installed via GitHub Action, not npm
		'lychee',
	],
	ignoreExportsUsedInFile: true,
	ignore: [
		// Terminal commands are dynamically invoked via command registry
		'src/lib/terminal-core.ts',
	],
};

export default config;
