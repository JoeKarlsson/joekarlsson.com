// Which look the live pink treatment (src/scripts/halftone.ts) gives an image or
// clip: a flat pink-and-black tone when it has text in it (found by
// `npm run media:text`), halftone dots otherwise.
import imagesWithText from '../data/images-with-text.json';

const withText = new Set<string>(imagesWithText);

/**
 * Finished thumbnails named thumb-<hash>.webp, for posts and projects, already carry their look, so the
 * live pink pass leaves them alone: work-post cards (scripts/generate-work-thumbnails.mjs) come out
 * graded pink with a taped print's border and tape kept, and boiling diagram cards
 * (scripts/boiling-thumbnail.mjs) are animated, which a live canvas copy would freeze.
 * /talks/' covers for cards with no video of their own (scripts/fetch-talk-event-covers.mjs)
 * come graded too, so a page with over a hundred cards stays inside a phone's budget.
 */
export function isPretreatedThumbnail(src: string): boolean {
	return (
		/^\/images\/(blog|projects)\/[^/]+\/thumb-[0-9a-f]{8}\.webp$/.test(src) ||
		/^\/images\/talks\/(events|recorded)\/[\w-]+\.webp$/.test(src)
	);
}

export function halftoneMode(src: string): 'flat' | 'dots' | undefined {
	if (isPretreatedThumbnail(src)) return undefined;
	return withText.has(src) ? 'flat' : 'dots';
}

/** Post cards in lists draw every thumbnail flat, except the pretreated ones */
export function cardHalftone(src: string): 'flat' | undefined {
	return isPretreatedThumbnail(src) ? undefined : 'flat';
}

/** The card-size copy of a project clip (`npm run media:cards`): "/x/demo.mp4" -> "/x/demo-card.mp4" */
export function cardClip(video: string): string {
	return video.replace(/\.mp4$/, '-card.mp4');
}
