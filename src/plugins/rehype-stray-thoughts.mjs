/**
 * A review's "Stray thoughts:" line before its closing list becomes a heading set as a small label
 * over a thin rule (.stray-label, reviews.css), like the AV Club's "Stray observations".
 */
const LABEL = /^\s*(stray (?:thoughts?|observations)):?\s*$/i;

export default function rehypeStrayThoughts() {
	return (tree) => {
		for (const node of tree.children) {
			if (node.type !== 'element' || node.tagName !== 'p' || node.children.length !== 1) continue;
			const [only] = node.children;
			const match = only.type === 'text' && only.value.match(LABEL);
			if (!match) continue;
			node.tagName = 'h2';
			node.properties = { ...node.properties, className: ['stray-label'] };
			only.value = match[1];
		}
	};
}
