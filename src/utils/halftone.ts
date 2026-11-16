// Whether the live pink treatment (src/scripts/halftone.ts) draws an image or clip:
// every one gets the clear pink-and-black tone, except files that come pre-graded.

/**
 * Finished thumbnails named thumb-<hash>.webp, for posts and projects, already carry their look, so the
 * live pink pass leaves them alone: work-post cards (scripts/generate-work-thumbnails.mjs) come out
 * graded pink with a taped print's border and tape kept, and boiling diagram cards
 * (scripts/boiling-thumbnail.mjs) are animated, which a live canvas copy would freeze.
 * /talks/' card pictures and video posters (scripts/fetch-talk-event-covers.mjs) come graded
 * too, so a page with over a hundred cards stays inside a phone's budget.
 */
export function isPretreatedThumbnail(src: string): boolean {
	return (
		/^\/images\/(blog|projects)\/[^/]+\/thumb-[0-9a-f]{8}\.webp$/.test(src) ||
		/^\/images\/talks\/(events|posters)\/[\w-]+\.webp$/.test(src) ||
		// Film posters, graded pink when imported (scripts/update-reviews.mjs)
		/^\/images\/reviews\/[^/]+\/poster\.webp$/.test(src)
	);
}

export function halftoneMode(src: string): 'flat' | undefined {
	return isPretreatedThumbnail(src) ? undefined : 'flat';
}

/** Post cards in lists: the same rule as everywhere else now that dots are gone */
export const cardHalftone = halftoneMode;

/** The card-size copy of a project clip (`npm run media:cards`): "/x/demo.mp4" -> "/x/demo-card.mp4" */
export function cardClip(video: string): string {
	return video.replace(/\.mp4$/, '-card.mp4');
}
