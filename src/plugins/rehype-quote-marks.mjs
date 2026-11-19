/**
 * A blockquote that is a real quotation (its text opens with a quotation mark) gets one giant
 * pink quote mark hanging in the margin beside it, and its own small marks come off, since the
 * big one does their job (big type round, 9A; .quote in global.css). Notes, TL;DRs and lists in
 * blockquotes don't open with a quotation mark, so they keep the plain pink rule.
 *
 * Only the first paragraph is the quote; a paragraph after it is the attribution ("From ...").
 */

const OPENING = /^\s*["“]/;
const CLOSING = /["”]\s*$/;

function firstText(node) {
	if (node.type === 'text') return node.value.trim() ? node : undefined;
	for (const child of node.children ?? []) {
		const found = firstText(child);
		if (found) return found;
	}
}

function lastText(node) {
	if (node.type === 'text') return node.value.trim() ? node : undefined;
	for (const child of [...(node.children ?? [])].reverse()) {
		const found = lastText(child);
		if (found) return found;
	}
}

export default function rehypeQuoteMarks() {
	return (tree) => {
		for (const node of tree.children) {
			if (node.type !== 'element' || node.tagName !== 'blockquote') continue;
			const quote = node.children.find((c) => c.type === 'element' && c.tagName === 'p');
			const first = quote && firstText(quote);
			if (!first || !OPENING.test(first.value)) continue;

			first.value = first.value.replace(OPENING, '');
			const last = lastText(quote);
			if (CLOSING.test(last.value)) last.value = last.value.replace(CLOSING, '');
			node.properties = { ...node.properties, className: ['quote'] };
			node.children.unshift({
				type: 'element',
				tagName: 'span',
				properties: { className: ['quote-mark'], ariaHidden: 'true' },
				children: [{ type: 'text', value: '“' }],
			});
		}
	};
}
