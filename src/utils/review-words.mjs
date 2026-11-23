// A review shorter than this, counting only Joe's own words, is a Letterboxd one-liner:
// it stays on the site but is noindex and out of the sitemap, so hundreds of thin pages
// (the same text Letterboxd already ranks for) don't weigh on the rest of the site.
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
