/**
 * A blockquote that is one real quotation (its first paragraph is wrapped in quote marks) gets one giant
 * pink quote mark hanging in the margin beside it, and its own small marks come off, since the
 * big one does their job (big type round, 9A; .quote in global.css). Notes, TL;DRs and lists in
 * blockquotes don't open with a quotation mark, so they keep the plain pink rule.
 *
 * Only the first paragraph is the quote; a paragraph after it is the attribution ("From ...").
 */

import { textOf } from './hast-text.mjs';

const LONG_QUOTE_WORDS = 60;
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
			const whole = quote ? textOf(quote).trim() : '';
			// Only one quotation, whole: '"Ship it," she said.' or a quote running on to a second
			// paragraph would be left with an unpaired mark
			if (!OPENING.test(whole) || !CLOSING.test(whole) || /["“”]/.test(whole.slice(1, -1)))
				continue;

			const first = firstText(quote);
			const last = lastText(quote);
			first.value = first.value.replace(OPENING, '');
			last.value = last.value.replace(CLOSING, '');
			// Italic slows a long passage, so a long quote stays roman
			const long = whole.split(/\s+/).length > LONG_QUOTE_WORDS;
			node.properties = { ...node.properties, className: long ? ['quote', 'long'] : ['quote'] };
			node.children.unshift({
				type: 'element',
				tagName: 'span',
				properties: { className: ['quote-mark'], ariaHidden: 'true' },
				children: [{ type: 'text', value: '“' }],
			});
		}
	};
}
