import { visit } from 'unist-util-visit';

const YOUTUBE_RE =
	/(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

function extractVideoId(url) {
	const match = url.match(YOUTUBE_RE);
	return match ? match[1] : null;
}

function isStandaloneLink(_node, parent) {
	return parent.type === 'element' && parent.tagName === 'p' && parent.children.length === 1;
}

function linkText(node) {
	return (node.children ?? [])
		.map((child) => (child.type === 'text' ? child.value : linkText(child)))
		.join('')
		.trim();
}

/**
 * A link alone in its paragraph becomes the same click-to-play button as
 * YouTubeFacade.astro (src/scripts/youtube-facade.ts swaps in the player), so a
 * post costs one thumbnail instead of ~900KB of YouTube player scripts on load.
 */
export default function rehypeYouTubeEmbed() {
	return (tree) => {
		visit(tree, 'element', (node, _index, parent) => {
			if (node.tagName !== 'a' || !node.properties?.href) return;

			const videoId = extractVideoId(node.properties.href);
			if (!videoId) return;
			if (!isStandaloneLink(node, parent)) return;

			const text = linkText(node);
			const title = text && !/^https?:\/\//.test(text) ? text : 'YouTube video';

			const wrapper = {
				type: 'element',
				tagName: 'button',
				properties: {
					type: 'button',
					// Inline margin: a new utility class would cost every page's CSS
					style: 'margin:1.5rem 0',
					className: [
						'youtube-facade',
						'group',
						'relative',
						'block',
						'aspect-video',
						'w-full',
						'cursor-pointer',
						'overflow-hidden',
						'rounded-xl',
						'bg-ink',
					],
					dataYoutubeId: videoId,
					dataYoutubeTitle: title,
					ariaLabel: `Play ${title}`,
				},
				children: [
					{
						type: 'element',
						tagName: 'img',
						properties: {
							src: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
							width: 480,
							height: 360,
							// Beats .prose img's margin, auto sizing and object-fit:contain, so the
							// letterbox bars baked into YouTube's 4:3 thumbnail are cropped off
							style: 'margin:0;width:100%;height:100%;object-fit:cover',
							alt: '',
							ariaHidden: 'true',
							crossOrigin: 'anonymous',
							loading: 'lazy',
							decoding: 'async',
							dataHalftone: 'flat',
							className: ['block'],
						},
						children: [],
					},
					{
						type: 'element',
						tagName: 'span',
						properties: {
							ariaHidden: 'true',
							className: [
								'absolute',
								'top-1/2',
								'left-1/2',
								'z-10',
								'grid',
								'size-16',
								'-translate-x-1/2',
								'-translate-y-1/2',
								'place-items-center',
								'rounded-full',
								'bg-pink',
								'text-ink',
								'group-hover:bg-paper',
							],
						},
						children: [
							{
								type: 'element',
								tagName: 'svg',
								properties: {
									viewBox: '0 0 24 24',
									className: ['ml-1', 'size-7'],
									fill: 'currentColor',
								},
								children: [
									{
										type: 'element',
										tagName: 'path',
										properties: { d: 'M8 5v14l11-7z' },
										children: [],
									},
								],
							},
						],
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
