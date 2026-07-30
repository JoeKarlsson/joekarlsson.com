import { describe, it, expect } from 'vitest';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

/** Recursive byte total for a directory. */
function getDirSize(dir: string): number {
	let total = 0;
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) {
			total += getDirSize(full);
		} else if (entry.isFile()) {
			total += statSync(full).size;
		}
	}
	return total;
}

const DIST_DIR = join(process.cwd(), 'dist');
const ASTRO_DIR = join(DIST_DIR, '_astro');

// Bundle size thresholds (in bytes)
const THRESHOLDS = {
	// Individual JS file should not exceed 50KB
	maxSingleJsFile: 50 * 1024,
	// Total JS bundle should not exceed 150KB
	maxTotalJsBundle: 150 * 1024,
	// Total CSS should not exceed 50KB
	maxTotalCss: 50 * 1024,
	// Total dist folder should not exceed 200MB (includes images)
	maxTotalDist: 200 * 1024 * 1024,
};

function getFilesWithExtension(dir: string, ext: string): { name: string; size: number }[] {
	try {
		return readdirSync(dir)
			.filter((file) => file.endsWith(ext))
			.map((file) => ({
				name: file,
				size: statSync(join(dir, file)).size,
			}));
	} catch {
		return [];
	}
}

function getTotalSize(files: { size: number }[]): number {
	return files.reduce((sum, f) => sum + f.size, 0);
}

/** Largest-first file listing, shown only when a budget is blown. */
function breakdown(files: { name: string; size: number }[]): string {
	return [...files]
		.sort((a, b) => b.size - a.size)
		.map((f) => `    ${f.name}: ${formatBytes(f.size)}`)
		.join('\n');
}

function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

describe('Bundle Size', () => {
	it('dist folder exists', () => {
		const stats = statSync(DIST_DIR);
		expect(stats.isDirectory()).toBe(true);
	});

	// This used to assert only that dist/ and _astro/ were directories while
	// being named after a 200MB threshold it never applied. dist sat well past
	// that - public/images alone was 292MB - and this reported green throughout.
	it('total dist size is under threshold', () => {
		const totalSize = getDirSize(DIST_DIR);

		if (totalSize > THRESHOLDS.maxTotalDist) {
			expect.fail(
				`dist is ${formatBytes(totalSize)}, over the ${formatBytes(THRESHOLDS.maxTotalDist)} budget.\n` +
					`  Largest contributor is usually public/images - check for unconverted\n` +
					`  animated GIFs (./scripts/convert-gifs-to-video.sh) or non-WebP stills.`,
			);
		}

		expect(totalSize).toBeLessThan(THRESHOLDS.maxTotalDist);
	});

	describe('JavaScript bundles', () => {
		it('no single JS file exceeds 50KB', () => {
			const jsFiles = getFilesWithExtension(ASTRO_DIR, '.js');
			expect(jsFiles.length).toBeGreaterThan(0);

			const oversized = jsFiles.filter((f) => f.size > THRESHOLDS.maxSingleJsFile);

			if (oversized.length > 0) {
				const details = oversized.map((f) => `${f.name}: ${formatBytes(f.size)}`).join('\n  ');
				expect.fail(`JS files exceeding ${formatBytes(THRESHOLDS.maxSingleJsFile)}:\n  ${details}`);
			}
		});

		it('total JS bundle is under 150KB', () => {
			const jsFiles = getFilesWithExtension(ASTRO_DIR, '.js');
			const totalSize = getTotalSize(jsFiles);

			if (totalSize >= THRESHOLDS.maxTotalJsBundle) {
				expect.fail(
					`Total JS is ${formatBytes(totalSize)}, over ${formatBytes(THRESHOLDS.maxTotalJsBundle)}:\n` +
						breakdown(jsFiles),
				);
			}

			expect(totalSize).toBeLessThan(THRESHOLDS.maxTotalJsBundle);
		});
	});

	describe('CSS bundles', () => {
		it('total CSS is under 50KB', () => {
			const cssFiles = getFilesWithExtension(ASTRO_DIR, '.css');
			const totalSize = getTotalSize(cssFiles);

			if (totalSize >= THRESHOLDS.maxTotalCss) {
				expect.fail(
					`Total CSS is ${formatBytes(totalSize)}, over ${formatBytes(THRESHOLDS.maxTotalCss)}:\n` +
						breakdown(cssFiles),
				);
			}

			expect(totalSize).toBeLessThan(THRESHOLDS.maxTotalCss);
		});
	});
});
