// No dependencies, so the site build and the monthly checks can read review URLs without
// loading the importer (scripts/update-reviews.mjs), which pulls in Prettier and Sharp.

/** Review URL -> the film's Letterboxd slug and the review's index (a second review of a film is /1/) */
export function parseReviewUrl(url) {
	const m = new URL(url).pathname.match(/\/film\/([^/]+)\/(?:(\d+)\/)?$/);
	if (!m) throw new Error(`Not a Letterboxd review URL: ${url}`);
	return { film: m[1], index: m[2] };
}
