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
		// vale is installed from its GitHub release in CI, not npm
		'vale',
	],
	ignoreExportsUsedInFile: true,
	ignore: [
		// Terminal commands are dynamically invoked via command registry
		'src/lib/terminal-core.ts',
	],
};

export default config;
