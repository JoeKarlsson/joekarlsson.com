import { visit } from 'unist-util-visit';
import { localImageSize } from '../utils/image-size.mjs';

/**
 * Give every local image in a post body its intrinsic width and height, read from
 * the file in public/. The browser reserves the space before the image loads, so
 * the text under it doesn't jump (unsized post images cost the homelab post a CLS
 * of 0.15). CSS still scales the image to the column; `height: auto` keeps the ratio.
 *
 * An explicit width or height in the source wins. Remote images are left alone.
 * A local image that doesn't exist fails the build rather than shipping broken.
 */
export default function rehypeImageDimensions({ publicDir } = {}) {
	const sizeBySrc = new Map();

	return async (tree) => {
		const images = [];
		visit(tree, 'element', (node) => {
			if (node.tagName !== 'img') return;
			const src = node.properties?.src;
			if (typeof src !== 'string' || !src.startsWith('/') || src.startsWith('//')) return;
			if (node.properties.width !== undefined || node.properties.height !== undefined) return;
			images.push(node);
		});

		for (const node of images) {
			const { src } = node.properties;
			if (!sizeBySrc.has(src)) sizeBySrc.set(src, await localImageSize(src, publicDir));
			Object.assign(node.properties, sizeBySrc.get(src));
		}
	};
}
