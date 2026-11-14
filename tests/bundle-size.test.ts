import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import { gzipSync } from 'zlib';

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
	// Total CSS, gzipped: what a visitor downloads. Until 2026-11-12 this counted raw
	// bytes and sat at its cap (raised 50KB to 72KB in eight days, then held at 70KB),
	// so every new utility class broke the build and each session trimmed or bumped it.
	// Gzipped it was 14.6KB; 18KB left room for everyday changes and still caught a
	// big new block of styles. Raised to 20KB on 2026-11-14 (Joe's OK): main sat at 17.4KB
	// and the new-CSS round (DECISIONS.md) added 1KB, so 20KB restores ~2KB of headroom.
	maxTotalCssGzip: 20 * 1024,
	// Total dist folder (includes images). Raised from 200MB on 2026-11-05 for the
	// redesign's pink halftone of every post hero (7.5MB) and the homepage video,
	// when dist sat at 199MB. Those halftones are now drawn live in the browser
	// (src/scripts/halftone.ts), which freed the space again. Raised to 225MB on
	// 2026-11-06 when post-body images got 400/800/1200px copies for their srcset
	// (dist went to 217MB; visitors download less). Raised to 245MB on 2026-11-06
	// when 113 work posts swapped flat employer stock art for photo thumbnails
	// (scripts/generate-work-thumbnails.mjs): pictures, their srcset copies and their
	// og:image JPEGs took dist from 224MB to 237MB. Raised to 250MB on 2026-11-06
	// when dist had grown to 244.6MB and Wave Jump and Go Home Tanuki got project
	// pages with gameplay clips (1MB, already encoded at CRF 31). Raised to 255MB on
	// 2026-11-06 when PostStream (a sharp 1600px recording of its text UI), Streamroll
	// (six generated intros at 960px) and React Spotify Player (its README demo, 5.2MB
	// as a GIF, 0.4MB as video) got clips, taking dist to 250.3MB. Raised to 400MB the
	// same day: the total isn't what visitors download (they fetch one page; the
	// homepage media budget below, Lighthouse and validate-images.sh's per-file limits
	// guard that), it only costs deploy time and disk. Sitting a few MB under the line
	// meant every new project clip tripped it. This is now a tripwire for something
	// gone badly wrong (a folder of unconverted GIFs, raw footage), not a running tax.
	// Raised to 600MB on 2026-11-13 for /reviews/: 547 film review pages, their posters
	// and backdrops (with srcset copies) and an og:image JPEG each took dist to about 490MB.
	maxTotalDist: 600 * 1024 * 1024,
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
		it('total CSS is under 20KB gzipped', () => {
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
