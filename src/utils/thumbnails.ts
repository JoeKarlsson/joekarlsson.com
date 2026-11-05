// The dithered pink version kept next to each post's hero image (the homepage
// thumbnail and the hero at the top of the post), made by
// `npm run media:thumbnails` (scripts/media/dither-thumbnails.mjs, which repeats this rule).

/** "/images/blog/x/hero.webp" -> "/images/blog/x/hero-halftone.webp" */
export function halftoneThumbnail(image: string): string {
	return image.replace(/\.[a-z0-9]+$/i, '-halftone.webp');
}
