import { visit } from 'unist-util-visit';

/**
 * Add loading="lazy" and decoding="async" to images in post bodies.
 *
 * The hero in BlogPost.astro stays eager because it is the LCP element.
 * Images in the body's first block are left eager too: they sit right under
 * the hero (the 2022 newsletter issues open with a photo bigger than their
 * card), so on a phone they are on screen at load and often the LCP element.
 * Everything after that is below the fold.
 *
 * An explicit loading value in the source wins, so a post can still opt an
 * individual image back into eager loading.
 */
export default function rehypeLazyImages() {
	return (tree) => {
		const firstBlock = tree.children?.find((node) => node.type === 'element');
		const opening = new Set();
		if (firstBlock) {
			visit(firstBlock, 'element', (node) => {
				if (node.tagName === 'img') opening.add(node);
			});
		}

		visit(tree, 'element', (node) => {
			if (node.tagName !== 'img') return;
			if (!node.properties) node.properties = {};

			if (node.properties.loading === undefined && !opening.has(node)) {
				node.properties.loading = 'lazy';
			}
			if (node.properties.decoding === undefined) {
				node.properties.decoding = 'async';
			}
		});
	};
}
