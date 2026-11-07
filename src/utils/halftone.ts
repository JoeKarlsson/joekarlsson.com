// Which look the live pink treatment (src/scripts/halftone.ts) gives an image or
// clip: a flat pink-and-black tone when it has text in it (found by
// `npm run media:text`), halftone dots otherwise.
import imagesWithText from '../data/images-with-text.json';

const withText = new Set<string>(imagesWithText);

/**
 * Work-post thumbnails (scripts/generate-work-thumbnails.mjs) come out already graded pink, with the
 * white border and tape of a taped print kept, so the live pink pass leaves them alone.
 */
export function isPretreatedThumbnail(src: string): boolean {
	return /^\/images\/blog\/[^/]+\/thumb-[0-9a-f]{8}\.webp$/.test(src);
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
