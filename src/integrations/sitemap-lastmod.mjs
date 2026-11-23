import { readFileSync, readdirSync } from 'node:fs';
import { indexedReviewSlugs } from '../utils/review-words.mjs';
import { parseReviewUrl } from '../utils/letterboxd-url.mjs';

// The sitemap's <lastmod> for every dated page: its updatedDate, else its date. Google
// uses lastmod only when it's accurate, and Bing asks for the content's real change
// time, so pages with no content date get none (never the build time). Read from front
// matter because astro.config can't use astro:content.
const COLLECTIONS = ['blog', 'reviews', 'talks', 'newsletter'];

/** @param {string} md @param {string} key */
const frontMatterValue = (md, key) =>
	(md.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '')
		.match(new RegExp(`^${key}:\\s*['"]?([^'"\\n]+)`, 'm'))?.[1]
		?.trim();

/** @param {URL} contentDir @returns {Map<string, string>} /<collection>/<slug>/ -> ISO date */
export function lastmodByPath(contentDir) {
	const dates = new Map();
	for (const collection of COLLECTIONS) {
		const dir = new URL(`${collection}/`, contentDir);
		for (const file of readdirSync(dir).filter((f) => /\.mdx?$/.test(f))) {
			const md = readFileSync(new URL(file, dir), 'utf8');
			const slug = frontMatterValue(md, 'slug');
			const changed = frontMatterValue(md, 'updatedDate') ?? frontMatterValue(md, 'date');
			if (!slug || !changed) continue;
			const date = new Date(changed);
			if (Number.isNaN(date.getTime()))
				throw new Error(`${collection}/${file}: bad date "${changed}"`);
			dates.set(`/${collection}/${slug}/`, date.toISOString());
		}
	}
	return dates;
}

/**
 * Crossposts: pages whose canonical points at the original on another site. They stay up
 * for readers, but a sitemap lists only canonical URLs, so they're left out of it, and
 * scripts/crosspost-originals-report.mjs checks monthly that each original still exists.
 * @param {URL} contentDir @returns {{ path: string, original: string }[]} path is /<collection>/<slug>/
 */
export function crossposts(contentDir) {
	const found = [];
	for (const collection of COLLECTIONS) {
		const dir = new URL(`${collection}/`, contentDir);
		for (const file of readdirSync(dir).filter((f) => /\.mdx?$/.test(f))) {
			const md = readFileSync(new URL(file, dir), 'utf8');
			const slug = frontMatterValue(md, 'slug');
			const original = frontMatterValue(md, 'canonicalUrl');
			if (slug && original && new URL(original).hostname !== 'www.joekarlsson.com')
				found.push({ path: `/${collection}/${slug}/`, original });
		}
	}
	return found;
}

/** @param {URL} contentDir @returns {Set<string>} */
export const offSiteCanonicalPaths = (contentDir) =>
	new Set(crossposts(contentDir).map((c) => c.path));

/** Reviews search shouldn't index (src/utils/review-words.mjs) @param {URL} contentDir @returns {Set<string>} */
export function unindexedReviewPaths(contentDir) {
	const dir = new URL('reviews/', contentDir);
	const reviews = readdirSync(dir)
		.filter((f) => /\.mdx?$/.test(f))
		.map((file) => {
			const md = readFileSync(new URL(file, dir), 'utf8');
			return {
				slug: frontMatterValue(md, 'slug') ?? '',
				film: parseReviewUrl(frontMatterValue(md, 'letterboxdUrl') ?? '').film,
				body: md.replace(/^---\n[\s\S]*?\n---\n/, ''),
			};
		});
	const indexed = indexedReviewSlugs(reviews);
	return new Set(reviews.filter((r) => !indexed.has(r.slug)).map((r) => `/reviews/${r.slug}/`));
}
