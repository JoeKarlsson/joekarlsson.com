import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import { gzipSync } from 'zlib';

/** Every file under a directory, with its size. */
function listFiles(dir: string): { path: string; size: number }[] {
	return readdirSync(dir, { withFileTypes: true, recursive: true })
		.filter((entry) => entry.isFile())
		.map((entry) => {
			const path = join(entry.parentPath, entry.name);
			return { path, size: statSync(path).size };
		});
}

const DIST_DIR = join(process.cwd(), 'dist');
const ASTRO_DIR = join(DIST_DIR, '_astro');

// Bundle size thresholds (in bytes)
const THRESHOLDS = {
	// Individual JS file should not exceed 50KB
	maxSingleJsFile: 50 * 1024,
	// Total JS bundle should not exceed 150KB
	maxTotalJsBundle: 150 * 1024,
	// Total CSS, gzipped: what a visitor downloads. Until 2026-11-12 this counted raw
	// bytes and sat at its cap (raised 50KB to 72KB in eight days, then held at 70KB),
	// so every new utility class broke the build and each session trimmed or bumped it.
	// Gzipped it was 14.6KB; 18KB left room for everyday changes and still caught a
	// big new block of styles. Raised to 20KB on 2026-11-14 (Joe's OK): main sat at 17.4KB
	// and the new-CSS round (DECISIONS.md) added 1KB, so 20KB restores ~2KB of headroom.
	// A coverage run that day found no dead rules to cut (the unused share is spoilers, the
	// lightbox, callouts and other states), and it's one stylesheet cached for a year.
	// Raised to 22KB the same day (Joe's OK): the art book layout (spine, margin notes,
	// chapter openers) took it to 20.1KB. Raised to 23KB on 2026-11-16 (Joe's OK): margin
	// notes beyond citations (quotes, terms, updates, see-also cards) took it to 22.1KB.
	// Raised to 25KB on 2026-11-19 (Joe's OK): the big type round (hanging quote mark,
	// interlude) took it to 23.2KB; 25KB leaves ~2KB of headroom again.
	maxTotalCssGzip: 25 * 1024,
	// No total dist cap: it was raised six times in November 2026 as new media kept tripping
	// it, while visitors only ever fetch one page. These catch what it was there for (raw
	// footage, unconverted GIFs); per-page weight is the homepage budget, Lighthouse and
	// validate-images.sh. The biggest file was a 14MB tour video and the biggest GIF 345KB.
	maxSingleFile: 25 * 1024 * 1024,
	maxGif: 1024 * 1024,
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

	it('dist has no raw footage, design files or oversized media', () => {
		const problems = listFiles(DIST_DIR).flatMap(({ path, size }) => {
			if (/\.(mov|heic|tiff?|psd|avi|mkv|wav)$/i.test(path)) return [`${path}: raw format`];
			if (size > THRESHOLDS.maxSingleFile) return [`${path}: ${formatBytes(size)}`];
			if (/\.gif$/i.test(path) && size > THRESHOLDS.maxGif)
				return [`${path}: ${formatBytes(size)} GIF (./scripts/convert-gifs-to-video.sh)`];
			return [];
		});
		expect(problems).toEqual([]);
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
		it('total CSS is under 23KB gzipped', () => {
			const cssFiles = getFilesWithExtension(ASTRO_DIR, '.css').map((f) => ({
				name: f.name,
				size: gzipSync(readFileSync(join(ASTRO_DIR, f.name))).length,
			}));
			const totalSize = getTotalSize(cssFiles);

			if (totalSize >= THRESHOLDS.maxTotalCssGzip) {
				expect.fail(
					`Total CSS is ${formatBytes(totalSize)} gzipped, over ${formatBytes(THRESHOLDS.maxTotalCssGzip)}:\n` +
						breakdown(cssFiles),
				);
			}

			expect(totalSize).toBeLessThan(THRESHOLDS.maxTotalCssGzip);
		});
	});
});

// The homepage's media: what a visitor pulls before scrolling (the montage, in the
// first <source> a browser picks, plus its poster), and everything on the page if
// they scroll to the end. Lazy clips (preload="none") count only toward the total.
// Measured 2026-11-05: about 2.4MB first view, about 7MB in all.
const HOME_MEDIA_BUDGET = {
	firstView: 3.5 * 1024 * 1024,
	total: 9 * 1024 * 1024,
};

/** Each <video>'s first source (or src), poster, and every <img> on a built page. */
function pageMedia(html: string): { path: string; eager: boolean }[] {
	const media: { path: string; eager: boolean }[] = [];
	for (const [, attrs, inner] of html.matchAll(/<video\b([^>]*)>([\s\S]*?)<\/video>/g)) {
		const eager = !/preload="none"/.test(attrs);
		const src =
			attrs.match(/\ssrc="([^"]+)"/)?.[1] ?? inner.match(/<source[^>]*\ssrc="([^"]+)"/)?.[1];
		const poster = attrs.match(/\sposter="([^"]+)"/)?.[1];
		if (src) media.push({ path: src, eager });
		if (poster) media.push({ path: poster, eager });
	}
	for (const [, attrs] of html.matchAll(/<img\b([^>]*)>/g)) {
		const src = attrs.match(/\ssrc="([^"]+)"/)?.[1];
		if (src?.startsWith('/')) media.push({ path: src, eager: !/loading="lazy"/.test(attrs) });
	}
	return media;
}

describe('Homepage media budget', () => {
	const html = readFileSync(join(DIST_DIR, 'index.html'), 'utf8');
	const media = pageMedia(html).map((m) => ({ ...m, size: statSync(join(DIST_DIR, m.path)).size }));

	it('finds the montage, its poster and the lazy clips', () => {
		expect(media.some((m) => m.path.includes('montage') && m.eager)).toBe(true);
		expect(media.filter((m) => !m.eager).length).toBeGreaterThan(5);
	});

	it(`first view is under ${formatBytes(HOME_MEDIA_BUDGET.firstView)}`, () => {
		const eager = media.filter((m) => m.eager);
		const total = getTotalSize(eager);
		if (total >= HOME_MEDIA_BUDGET.firstView) {
			expect.fail(
				`Homepage first view loads ${formatBytes(total)}:\n` +
					breakdown(eager.map((m) => ({ name: m.path, size: m.size }))),
			);
		}
	});

	it(`whole page is under ${formatBytes(HOME_MEDIA_BUDGET.total)}`, () => {
		const total = getTotalSize(media);
		if (total >= HOME_MEDIA_BUDGET.total) {
			expect.fail(
				`Homepage media totals ${formatBytes(total)}:\n` +
					breakdown(media.map((m) => ({ name: m.path, size: m.size }))),
			);
		}
	});
});
