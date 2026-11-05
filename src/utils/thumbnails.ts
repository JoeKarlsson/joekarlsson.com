// The dithered pink thumbnail kept next to each post's hero image, made by
// `npm run media:thumbnails` (scripts/media/dither-thumbnails.mjs, which repeats this rule).

/** "/images/blog/x/hero.webp" -> "/images/blog/x/hero-halftone.webp" */
export function halftoneThumbnail(image: string): string {
	return image.replace(/\.[a-z0-9]+$/i, '-halftone.webp');
}
