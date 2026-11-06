import { visit } from 'unist-util-visit';
import { isAmazonUrl, withAmazonTag } from '../utils/affiliate.ts';

/**
 * Tag amazon.com links in blog posts with the Associates ID and mark them
 * rel="sponsored". Blog posts only: newsletter issues go out as email, where
 * Amazon bans affiliate links. BlogPost.astro shows the disclosure.
 */
export default function rehypeAmazonAffiliate() {
	return (tree, file) => {
		if (!file.path?.includes('/content/blog/')) return;
		visit(tree, 'element', (node) => {
			const href = node.tagName === 'a' && node.properties?.href;
			if (typeof href !== 'string' || !isAmazonUrl(href)) return;
			node.properties.href = withAmazonTag(href);
			const rel = [node.properties.rel ?? []].flat();
			node.properties.rel = ['sponsored', ...rel.filter((r) => r !== 'sponsored')];
		});
	};
}
