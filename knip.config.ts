import type { KnipConfig } from 'knip';

const config: KnipConfig = {
	project: ['src/**/*.{ts,js,astro,mjs}'],
	ignoreBinaries: [
		// lychee is installed via GitHub Action, not npm
		'lychee',
		// vale is installed from its GitHub release in CI, not npm
		'vale',
	],
	ignoreExportsUsedInFile: true,
};

export default config;
