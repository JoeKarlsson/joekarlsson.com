/** Shared by the rehype plugins that read a post's headings and text. */

export function textOf(node) {
	if (node.type === 'text') return node.value;
	return (node.children ?? []).map(textOf).join('');
}

/** A section's h2, bare or inside the .heading-group the heading permalinks wrap it in. */
export const h2Of = (node) =>
	node.type !== 'element'
		? undefined
		: node.tagName === 'h2'
			? node
			: node.properties?.className?.includes('heading-group')
				? node.children.find((child) => child.tagName === 'h2')
				: undefined;
