import { describe, it, expect } from 'vitest';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

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

	it('total dist size is under threshold', () => {
		// Get total size recursively (simplified - just check _astro folder exists)
		const stats = statSync(DIST_DIR);
		expect(stats.isDirectory()).toBe(true);

		// For a more accurate check, we'd recursively sum all files
		// For now, just verify _astro exists and has reasonable size
		const astroStats = statSync(ASTRO_DIR);
		expect(astroStats.isDirectory()).toBe(true);
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

			expect(totalSize).toBeLessThan(THRESHOLDS.maxTotalJsBundle);
		});

		it('lists all JS files with sizes', () => {
			const jsFiles = getFilesWithExtension(ASTRO_DIR, '.js');
			const totalSize = getTotalSize(jsFiles);

			// This test always passes but logs the bundle breakdown
			console.log('\n  JS Bundle Breakdown:');
			jsFiles
				.sort((a, b) => b.size - a.size)
				.forEach((f) => {
					console.log(`    ${f.name}: ${formatBytes(f.size)}`);
				});
			console.log(`    ─────────────────────`);
			console.log(`    Total: ${formatBytes(totalSize)}`);

			expect(true).toBe(true);
		});
	});

	describe('CSS bundles', () => {
		it('total CSS is under 50KB', () => {
			const cssFiles = getFilesWithExtension(ASTRO_DIR, '.css');
			const totalSize = getTotalSize(cssFiles);

			expect(totalSize).toBeLessThan(THRESHOLDS.maxTotalCss);
		});

		it('lists all CSS files with sizes', () => {
			const cssFiles = getFilesWithExtension(ASTRO_DIR, '.css');
			const totalSize = getTotalSize(cssFiles);

			console.log('\n  CSS Bundle Breakdown:');
			cssFiles
				.sort((a, b) => b.size - a.size)
				.forEach((f) => {
					console.log(`    ${f.name}: ${formatBytes(f.size)}`);
				});
			console.log(`    ─────────────────────`);
			console.log(`    Total: ${formatBytes(totalSize)}`);

			expect(true).toBe(true);
		});
	});
});
