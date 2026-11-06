// Gives every built <img> that declares its slot (a `sizes` attribute) and points
// at a WebP in public/images a srcset of smaller copies, so a phone showing a card
// as a 112px thumbnail stops downloading the 1200px original. Files in public/
// skip Astro's image pipeline, hence this pass over the built HTML.
//
// Copies are made once into node_modules/.cache/responsive-images and reused
// until the original changes. A component opts in by setting `sizes`; images in
// post bodies are left alone.
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
							await sharp(original).resize({ width: w }).webp({ quality: 80 }).toFile(cached);
						}
						copyFileSync(cached, join(distDir, variantPath(src, w)));
					}
				}

				for (const { file, html } of pages) {
					const updated = addSrcsets(html, widthOf);
					if (updated !== html) writeFileSync(file, updated);
				}
				logger.info(`srcset added for ${widths.size} images`);
			},
		},
	};
}
