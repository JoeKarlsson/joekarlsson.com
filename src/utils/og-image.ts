export const DEFAULT_OG_IMAGE = '/images/og-default.webp';

// LinkedIn link previews don't render WebP, so every local share image also ships as a
// 1200x630 JPEG under /og/ (src/pages/og/[...path].jpg.ts builds them).
export function ogJpegPath(image: string): string {
	if (/^https?:\/\//.test(image)) return image;
	return `/og${image.replace(/\.[a-z0-9]+$/i, '')}.jpg`;
}
