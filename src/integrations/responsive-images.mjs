// Gives every built <img> that declares its slot (a `sizes` attribute) and points
// at a WebP in public/images a srcset of smaller copies, so a phone showing a card
// as a 112px thumbnail stops downloading the 1200px original. Files in public/
// skip Astro's image pipeline, hence this pass over the built HTML.
//
// Copies are made once into node_modules/.cache/responsive-images and reused
// until the original changes. A component opts in by setting `sizes`; post-body
// images get theirs from src/plugins/rehype-image-dimensions.mjs.
//
// An animated thumbnail (a boiling diagram card, thumb-<hash>.webp) also gets a still of
// its last frame, named in data-still, for src/scripts/still-images.ts to show while
// motion is paused or reduced: an animated image can't be paused the way a video can.
import {
	copyFileSync,
	existsSync,
	mkdirSync,
	readFileSync,
	readdirSync,
	statSync,
	writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

// 1200 for full-width photos on a phone: 390px at 2.6x needs about 1000px
export const VARIANT_WIDTHS = [400, 800, 1200];

/** `/images/a/b.webp` at 400px -> `/images/a/b.400w.webp` */
export function variantPath(src, width) {
	return src.replace(/\.webp$/, `.${width}w.webp`);
}

/**
 * Adds srcset to each opted-in <img> in the HTML. `widthOf(src)` returns the
 * original's pixel width, or undefined to leave that image alone.
 */
export function addSrcsets(html, widthOf) {
	return html.replace(/<img\b[^>]*>/g, (tag) => {
		if (!/\ssizes="/.test(tag) || /\ssrcset="/.test(tag)) return tag;
		const src = tag.match(/\ssrc="(\/images\/[^"]+\.webp)"/)?.[1];
		if (!src) return tag;
		const width = widthOf(src);
		if (!width) return tag;
		const smaller = VARIANT_WIDTHS.filter((w) => w < width);
		if (!smaller.length) return tag;
		const srcset = [...smaller.map((w) => `${variantPath(src, w)} ${w}w`), `${src} ${width}w`].join(
			', ',
		);
		return tag.replace(/\ssrc="/, ` srcset="${srcset}" src="`);
	});
}

/** `/images/a/thumb-1234abcd.webp` -> `/images/a/thumb-1234abcd.still.webp` */
export function stillPath(src) {
	return src.replace(/\.webp$/, '.still.webp');
}

const ANIMATED_CANDIDATE = /^\/images\/.+\/thumb-[0-9a-f]{8}\.webp$/;

/** Every <img> whose src `stillOf(src)` answers gets data-still with that answer */
export function addStills(html, stillOf) {
	return html.replace(/<img\b[^>]*>/g, (tag) => {
		if (/\sdata-still="/.test(tag)) return tag;
		const src = tag.match(/\ssrc="([^"]+)"/)?.[1];
		const still = src && stillOf(src);
		return still ? tag.replace(/^<img\b/, `<img data-still="${still}"`) : tag;
	});
}

function htmlFiles(dir) {
	return readdirSync(dir, { recursive: true })
		.filter((file) => file.endsWith('.html'))
		.map((file) => join(dir, file));
}

export default function responsiveImages() {
	return {
		name: 'responsive-images',
		hooks: {
			'astro:build:done': async ({ dir, logger }) => {
				const distDir = fileURLToPath(dir);
				const cacheDir = fileURLToPath(
					new URL('../../node_modules/.cache/responsive-images/', import.meta.url),
				);
				// Cache freshness goes by the public/ file: the dist copy is new every build
				const publicDir = fileURLToPath(new URL('../../public/', import.meta.url));
				const widths = new Map();
				const widthOf = (src) => widths.get(src);

				// First pass: find every opted-in image, and read its width
				const pages = htmlFiles(distDir).map((file) => ({
					file,
					html: readFileSync(file, 'utf8'),
				}));
				const wanted = new Set();
				for (const { html } of pages) {
					addSrcsets(html, (src) => {
						wanted.add(src);
						return undefined;
					});
				}
				for (const src of wanted) {
					const original = join(distDir, src);
					if (!existsSync(original)) throw new Error(`responsive-images: ${src} is not in dist`);
					const { width } = await sharp(original).metadata();
					widths.set(src, width);
					for (const w of VARIANT_WIDTHS.filter((w) => w < width)) {
						const cached = join(cacheDir, variantPath(src, w));
						if (
							!existsSync(cached) ||
							statSync(cached).mtimeMs < statSync(join(publicDir, src)).mtimeMs
						) {
							mkdirSync(dirname(cached), { recursive: true });
							// animated: an animated WebP (a boiling diagram thumbnail) keeps every frame;
							// without it sharp reads only the first and the card freezes
							await sharp(original, { animated: true })
								.resize({ width: w })
								.webp({ quality: 80 })
								.toFile(cached);
						}
						copyFileSync(cached, join(distDir, variantPath(src, w)));
					}
				}

				// Stills: the last frame of every animated thumbnail, where an animation ends on
				// its finished state (the solved Sudoku, every script saved)
				const stills = new Map();
				const candidates = new Set();
				for (const { html } of pages) {
					addStills(html, (src) => {
						if (ANIMATED_CANDIDATE.test(src)) candidates.add(src);
						return undefined;
					});
				}
				for (const src of candidates) {
					const original = join(distDir, src);
					if (!existsSync(original)) throw new Error(`responsive-images: ${src} is not in dist`);
					const { pages: frames = 1 } = await sharp(original).metadata();
					if (frames < 2) continue;
					const cached = join(cacheDir, stillPath(src));
					if (
						!existsSync(cached) ||
						statSync(cached).mtimeMs < statSync(join(publicDir, src)).mtimeMs
					) {
						mkdirSync(dirname(cached), { recursive: true });
						await sharp(original, { page: frames - 1 })
							.webp({ quality: 80 })
							.toFile(cached);
					}
					copyFileSync(cached, join(distDir, stillPath(src)));
					stills.set(src, stillPath(src));
				}

				for (const { file, html } of pages) {
					const updated = addStills(addSrcsets(html, widthOf), (src) => stills.get(src));
					if (updated !== html) writeFileSync(file, updated);
				}
				logger.info(`srcset added for ${widths.size} images, stills for ${stills.size} animations`);
			},
		},
	};
}
