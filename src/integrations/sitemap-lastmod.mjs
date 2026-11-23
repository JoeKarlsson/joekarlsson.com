import { readFileSync, readdirSync } from 'node:fs';

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
 * Pages whose canonical points at another site (crossposts with a canonicalUrl). They
 * stay up for readers, but a sitemap lists only canonical URLs, so they're left out.
 * @param {URL} contentDir @returns {Set<string>} /<collection>/<slug>/
 */
export function offSiteCanonicalPaths(contentDir) {
	const paths = new Set();
	for (const collection of COLLECTIONS) {
		const dir = new URL(`${collection}/`, contentDir);
		for (const file of readdirSync(dir).filter((f) => /\.mdx?$/.test(f))) {
			const md = readFileSync(new URL(file, dir), 'utf8');
			const slug = frontMatterValue(md, 'slug');
			const canonical = frontMatterValue(md, 'canonicalUrl');
			if (slug && canonical && new URL(canonical).hostname !== 'www.joekarlsson.com')
				paths.add(`/${collection}/${slug}/`);
		}
	}
	return paths;
}
