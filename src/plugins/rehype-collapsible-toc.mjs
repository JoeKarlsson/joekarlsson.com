/**
 * Fold a post's written-in table of contents on phones.
 *
 * A few cross-posted articles open with a bold "In this article:" (or "Table of
 * Contents") line and a list of links to their sections, which runs a screen long
 * on a phone. This wraps the line and its list in the attributes
 * src/scripts/phone-collapse.ts reads, so phones show the line with a + and wider
 * screens see the list as written.
 */
const LABEL = /^(in this article|table of contents):?$/i;

const isBlank = (node) => node.type === 'text' && node.value.trim() === '';

/** <p><strong>In this article:</strong></p>, and nothing else in the paragraph */
const isTocLabel = (node) => {
	if (node.type !== 'element' || node.tagName !== 'p') return false;
	const [only, ...rest] = node.children.filter((child) => !isBlank(child));
	return (
		rest.length === 0 &&
		only?.type === 'element' &&
		only.tagName === 'strong' &&
		LABEL.test(
			only.children
				.map((child) => child.value ?? '')
				.join('')
				.trim(),
		)
	);
};

export default function rehypeCollapsibleToc() {
	return (tree) => {
		const children = tree.children;
		for (let i = 0; i < children.length; i++) {
			if (!isTocLabel(children[i])) continue;
			let next = i + 1;
			while (next < children.length && isBlank(children[next])) next++;
			const list = children[next];
			if (list?.type !== 'element' || !['ul', 'ol'].includes(list.tagName)) continue;

			children[i].properties = { ...children[i].properties, dataCollapseHeading: '' };
			list.properties = { ...list.properties, dataCollapseBody: '' };
			children.splice(i, next - i + 1, {
				type: 'element',
				tagName: 'div',
				properties: { dataPhoneCollapse: '' },
				children: [children[i], list],
			});
		}
	};
}
