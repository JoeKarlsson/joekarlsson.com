// The dithered pink versions kept next to each post hero and project image, made
// by `npm run media:thumbnails` (scripts/media/dither-thumbnails.mjs, which repeats
// these rules). Two sizes, so the dots come out big and visible wherever the image
// is shown: a halftone dot is only as big as the file is scaled down.

/** Hero size (1120px), for a post's hero and the featured rows: "/x/hero.webp" -> "/x/hero-halftone.webp" */
export function halftoneHero(image: string): string {
	return image.replace(/\.[a-z0-9]+$/i, '-halftone.webp');
}

/** List size (560px), for post rows and project cards: "/x/hero.webp" -> "/x/hero-halftone-thumb.webp" */
export function halftoneThumbnail(image: string): string {
	return image.replace(/\.[a-z0-9]+$/i, '-halftone-thumb.webp');
}
