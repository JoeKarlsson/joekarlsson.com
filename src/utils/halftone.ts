// Which look the live pink treatment (src/scripts/halftone.ts) gives an image or
// clip: a flat pink-and-black tone when it has text in it (found by
// `npm run media:text`), halftone dots otherwise.
import imagesWithText from '../data/images-with-text.json';

const withText = new Set<string>(imagesWithText);

export function halftoneMode(src: string): 'flat' | 'dots' {
	return withText.has(src) ? 'flat' : 'dots';
}
