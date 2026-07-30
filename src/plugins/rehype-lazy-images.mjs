import { visit } from 'unist-util-visit';

/**
 * Add loading="lazy" and decoding="async" to images in post bodies.
 *
 * The hero in BlogPost.astro stays eager because it is the LCP element;
 * everything coming out of markdown sits below the fold, so there is no
 * reason to block on any of it.
 *
 * An explicit loading value in the source wins, so a post can still opt an
 * individual image back into eager loading.
 */
export default function rehypeLazyImages() {
	return (tree) => {
		visit(tree, 'element', (node) => {
			if (node.tagName !== 'img') return;
			if (!node.properties) node.properties = {};

			if (node.properties.loading === undefined) {
				node.properties.loading = 'lazy';
			}
			if (node.properties.decoding === undefined) {
				node.properties.decoding = 'async';
			}
		});
	};
}
