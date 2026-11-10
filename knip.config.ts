import type { KnipConfig } from 'knip';

const config: KnipConfig = {
	// Scripts run by hand or from package.json; listing them lets knip check their imports
	entry: ['scripts/**/*.mjs'],
	project: ['src/**/*.{ts,js,astro,mjs}', 'scripts/**/*.mjs'],
	ignoreBinaries: [
		// lychee is installed via GitHub Action, not npm
		'lychee',
		// vale is installed from its GitHub release in CI, not npm
		'vale',
		// media tests and scripts shell out to the system ffmpeg, which CI installs with apt
		'ffmpeg',
		'ffprobe',
		// boiling-thumbnail.mjs, run by hand, shells out to img2webp from libwebp (brew install webp)
		'img2webp',
		// youtube-thumbnail.mjs, run by hand on a Mac, compiles its Vision cut-out helper with Xcode's swiftc
		'swiftc',
	],
	ignoreExportsUsedInFile: true,
};

export default config;
