import { visit } from 'unist-util-visit';

const YOUTUBE_RE =
	/(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

function extractVideoId(url) {
	const match = url.match(YOUTUBE_RE);
	return match ? match[1] : null;
}

function isStandaloneLink(node, parent) {
	return (
		parent.type === 'element' &&
		parent.tagName === 'p' &&
		parent.children.length === 1
	);
}

export default function rehypeYouTubeEmbed() {
	return (tree) => {
		visit(tree, 'element', (node, index, parent) => {
			if (node.tagName !== 'a' || !node.properties?.href) return;

			const videoId = extractVideoId(node.properties.href);
			if (!videoId) return;
			if (!isStandaloneLink(node, parent)) return;

			const wrapper = {
				type: 'element',
				tagName: 'div',
				properties: {
					style: 'position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:100%;margin:1.5rem 0;',
				},
				children: [
					{
						type: 'element',
						tagName: 'iframe',
						properties: {
							src: `https://www.youtube-nocookie.com/embed/${videoId}`,
							title: 'YouTube video player',
							frameBorder: '0',
							allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
							allowFullScreen: true,
							loading: 'lazy',
							style: 'position:absolute;top:0;left:0;width:100%;height:100%;',
						},
						children: [],
					},
				],
			};

			// Replace the parent <p> with the wrapper div
			const grandparent = findParent(tree, parent);
			if (grandparent) {
				const parentIndex = grandparent.children.indexOf(parent);
				if (parentIndex !== -1) {
					grandparent.children[parentIndex] = wrapper;
				}
			}
		});
	};
}

function findParent(tree, target) {
	let result = null;
	visit(tree, 'element', (node) => {
		if (node.children?.includes(target)) {
			result = node;
		}
	});
	if (tree.children?.includes(target)) {
		return tree;
	}
	return result;
}
