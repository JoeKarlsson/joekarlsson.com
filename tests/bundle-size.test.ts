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

	describe('CSS per page type', () => {
		const pages = builtPageCss();

		it('finds pages of every type', () => {
			for (const type of Object.keys(CSS_BUDGET))
				expect(
					pages.some((p) => p.type === type),
					type,
				).toBe(true);
		});

		for (const [type, budget] of Object.entries(CSS_BUDGET)) {
			it(`${type} pages load under ${formatBytes(budget)} of CSS, gzipped`, () => {
				const over = pages
					.filter((p) => p.type === type && p.size >= budget)
					.sort((a, b) => b.size - a.size);
				if (over.length > 0) {
					const [worst] = over;
					expect.fail(
						`${over.length} ${type} page(s) over ${formatBytes(budget)}; the heaviest, ` +
							`${worst.page}, loads ${formatBytes(worst.size)}:\n${breakdown(worst.parts)}`,
					);
				}
			});
		}
	});
});

// The CSS each kind of page downloads, gzipped: its linked stylesheets plus its inline <style>.
// Until 2026-11-22 one number capped every stylesheet in the build, since every page loaded the
// one global.css; it went from 18KB to 26KB in ten days, each feature raising it for every page.
// Now each page type imports only its own styles (prose.css, article.css from ArticleFrame,
// reviews.css, papers.css), so a type grows only with its own features. When a budget trips,
// it's a trade-off for that page type to decide in DECISIONS.md, not a reason to quietly raise
// it (Joe: "make sure the site remains performant as we like grow and expand out the
// capabilities of the site"). Measured 2026-11-22, heaviest of each: article 23.3KB, review
// 25.1KB, paper 25.5KB, homepage 18.2KB, section 20.2KB (/privacy-policy/), review stats 19.6KB.
const CSS_BUDGET = {
	article: 25 * 1024,
	review: 27 * 1024,
	paper: 27 * 1024,
	home: 20 * 1024,
	section: 22 * 1024,
	'review stats': 22 * 1024,
} as const;

type PageType = keyof typeof CSS_BUDGET;

/** Posts, talks, issues and projects render through ArticleFrame; reviews and papers do too, with
 * their own stylesheet on top. */
function pageType(page: string): PageType {
	if (page === '/index.html') return 'home';
	if (page.startsWith('/reviews/stats/')) return 'review stats';
	if (/^\/papers\/[^/]+\/index\.html$/.test(page)) return 'paper';
	if (/^\/reviews\/[^/]+\/index\.html$/.test(page)) return 'review';
	if (/^\/(blog|talks|newsletter|work)\/[^/]+\/index\.html$/.test(page)) return 'article';
	return 'section';
}

/** Every built page that links a stylesheet (redirect stubs link none), with what it loads. */
function builtPageCss() {
	const gzipped = new Map<string, number>();
	const sizeOf = (href: string) => {
		if (!gzipped.has(href)) gzipped.set(href, gzipSync(readFileSync(join(DIST_DIR, href))).length);
		return gzipped.get(href)!;
	};
	return listFiles(DIST_DIR)
		.filter((f) => f.path.endsWith('.html'))
		.flatMap(({ path }) => {
			const html = readFileSync(path, 'utf8');
			const parts = [
				...html.matchAll(/<link[^>]+rel="stylesheet"[^>]*href="(\/_astro\/[^"]+\.css)"/g),
			].map(([, href]) => ({ name: href, size: sizeOf(href) }));
			if (parts.length === 0) return [];
			const inline = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)]
				.map(([, css]) => css)
				.join('');
			if (inline) parts.push({ name: 'inline <style>', size: gzipSync(inline).length });
			const page = path.slice(DIST_DIR.length);
			return [{ page, type: pageType(page), size: getTotalSize(parts), parts }];
		});
}

// The homepage's media: what a visitor pulls before scrolling (the hero above <main>:
// the montage in the first <source> a browser picks, and its stills, both counted though
// a phone or a desktop gets one), and everything on the page if they scroll to the end.
// Below the hero, lazy clips (preload="none") count only toward the total.
// Measured 2026-11-05: about 2.4MB first view, about 7MB in all.
const HOME_MEDIA_BUDGET = {
	firstView: 3.5 * 1024 * 1024,
	total: 9 * 1024 * 1024,
};

/** Each <video>'s first source (or src) and poster, every <img> and <picture> source on a
 * built page. Everything in the hero, above <main>, is first view. */
function pageMedia(html: string): { path: string; eager: boolean }[] {
	const media: { path: string; eager: boolean }[] = [];
	const heroEnd = html.indexOf('<main');
	for (const { index, 1: attrs, 2: inner } of html.matchAll(
		/<video\b([^>]*)>([\s\S]*?)<\/video>/g,
	)) {
		const eager = index < heroEnd || !/preload="none"/.test(attrs);
		const src =
			attrs.match(/\ssrc="([^"]+)"/)?.[1] ?? inner.match(/<source[^>]*\ssrc="([^"]+)"/)?.[1];
		const poster = attrs.match(/\s(?:data-)?poster="([^"]+)"/)?.[1];
		if (src) media.push({ path: src, eager });
		if (poster) media.push({ path: poster, eager });
	}
	for (const { index, 1: inner } of html.matchAll(/<picture\b[^>]*>([\s\S]*?)<\/picture>/g)) {
		const eager = index < heroEnd || !/loading="lazy"/.test(inner);
		for (const [, srcset] of inner.matchAll(/<source[^>]*\ssrcset="([^"\s,]+)/g))
			if (srcset.startsWith('/')) media.push({ path: srcset, eager });
	}
	for (const { index, 1: attrs } of html.matchAll(/<img\b([^>]*)>/g)) {
		const src = attrs.match(/\ssrc="([^"]+)"/)?.[1];
		if (src?.startsWith('/'))
			media.push({ path: src, eager: index < heroEnd || !/loading="lazy"/.test(attrs) });
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
