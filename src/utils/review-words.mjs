// Search sees one review per film: the longest of Joe's reviews of it (a rewatch gets its
// own page, at Letterboxd's /film/<slug>/1/), and only when it runs at least this many
// words of his own. The rest stay on the site but are noindex and out of the sitemap, so
// Letterboxd one-liners (text Letterboxd already ranks for) don't count as thin pages.
export const THIN_REVIEW_WORDS = 150;

/** Words of a review's own text: Markdown body minus pictures, link URLs, HTML tags and spoiler bars */
export const reviewProseWords = (/** @type {string} */ body) =>
	body
		.replace(/!\[[^\]]*\]\([^)]*\)/g, '')
		.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
		.replace(/<[^>]+>/g, ' ')
		.replace(/\|\|/g, '')
		.split(/\s+/)
		.filter(Boolean).length;

/**
 * The slugs search should index: per film, its longest review (a tie goes to the first
 * entry, `zodiac` before `zodiac-1`), if it isn't thin.
 * @param {{ slug: string, film: string, body: string }[]} reviews
 * @returns {Set<string>}
 */
export function indexedReviewSlugs(reviews) {
	const best = new Map();
	for (const r of reviews) {
		const words = reviewProseWords(r.body);
		const held = best.get(r.film);
		if (!held || words > held.words || (words === held.words && r.slug.length < held.slug.length))
			best.set(r.film, { slug: r.slug, words });
	}
	return new Set([...best.values()].filter((b) => b.words >= THIN_REVIEW_WORDS).map((b) => b.slug));
}
