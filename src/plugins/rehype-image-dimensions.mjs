import { visit } from 'unist-util-visit';
import { localImageSize } from '../utils/image-size.mjs';

/**
 * Give every local image in a post body its intrinsic width and height, read from
 * the file in public/. The browser reserves the space before the image loads, so
 * the text under it doesn't jump (unsized post images cost the homelab post a CLS
 * of 0.15). CSS still scales the image to the column; `height: auto` keeps the ratio.
 *
 * It also declares the width the image shows at in `sizes`, which opts it into
 * src/integrations/responsive-images.mjs: phones get a 400-1200px copy instead of
 * originals up to 3000px wide.
 *
 * A post shows a picture at one of two widths, never in between: a wide one
 * (about 16:9 or wider, and big enough not to stretch) gets class "wide" and fills the
 * hero's width; the rest stay at the 640px text width or their own size.
 *
 * An explicit width, height or sizes in the source wins. Remote images are left alone.
 * A local image that doesn't exist fails the build rather than shipping broken.
 */
export const POST_IMAGE_SIZES = '(min-width: 768px) 640px, 100vw';
export const WIDE_IMAGE_SIZES = '(min-width: 1280px) 856px, 100vw';
// The hero's width on a desktop, and the flattest shape that fills it under the
// 500px height cap on post images (global.css): 856 / 500
const WIDE_MIN_WIDTH = 856;
const WIDE_MIN_RATIO = 1.7;

export default function rehypeImageDimensions({ publicDir } = {}) {
	const sizeBySrc = new Map();

	return async (tree) => {
		const images = [];
		visit(tree, 'element', (node) => {
			if (node.tagName !== 'img') return;
			const src = node.properties?.src;
			if (typeof src !== 'string' || !src.startsWith('/') || src.startsWith('//')) return;
			images.push(node);
		});

		for (const node of images) {
			const { src } = node.properties;
			if (node.properties.width === undefined && node.properties.height === undefined) {
				if (!sizeBySrc.has(src)) sizeBySrc.set(src, await localImageSize(src, publicDir));
				Object.assign(node.properties, sizeBySrc.get(src));
			}
			const width = Number(node.properties.width);
			const height = Number(node.properties.height);
			const wide = width >= WIDE_MIN_WIDTH && width / height >= WIDE_MIN_RATIO;
			if (wide) node.properties.className = [...(node.properties.className ?? []), 'wide'];
			if (node.properties.sizes === undefined) {
				node.properties.sizes = wide ? WIDE_IMAGE_SIZES : POST_IMAGE_SIZES;
			}
		}
	};
}
