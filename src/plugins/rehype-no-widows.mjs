import { SKIP as SKIP_NODE, visit } from 'unist-util-visit';

/**
 * Keep a short last word off a line of its own.
 *
 * `text-wrap: pretty` (global.css) does this in Chromium and WebKit, but Firefox (Joe's
 * browser) doesn't support it, so a long post ended about four paragraphs on a lone
 * "cheaper." or "seconds.". This joins the last word of each paragraph and list item to
 * the one before it with a no-break space. Long last words are left alone: carrying one
 * down would leave a short line above it.
 */

const LONGEST_WORD = 10;
// Not inside these: code keeps its spaces, and a list item's own paragraphs and nested
// lists are visited on their own
const SKIP = new Set(['code', 'pre', 'kbd', 'p', 'ul', 'ol', 'script', 'style', 'svg']);

/** The last text node under `node` that isn't inside a skipped element, or undefined. */
function lastText(node) {
	for (let i = (node.children ?? []).length - 1; i >= 0; i--) {
		const child = node.children[i];
		if (child.type === 'text') {
			if (child.value.trim() !== '') return child;
		} else if (child.type === 'element' && !SKIP.has(child.tagName)) {
			const found = lastText(child);
			if (found) return found;
		}
	}
	return undefined;
}

export function joinLastWord(text) {
	const match = /^([\s\S]*\S)[ ]+(\S+\s*)$/.exec(text);
	if (!match || match[2].trim().length >= LONGEST_WORD) return text;
	return `${match[1]}\u00A0${match[2]}`;
}

export default function rehypeNoWidows() {
	return (tree) => {
		visit(tree, 'element', (node) => {
			if (node.tagName === 'pre' || node.tagName === 'code') return SKIP_NODE;
			if (node.tagName !== 'p' && node.tagName !== 'li') return;
			const text = lastText(node);
			if (text) text.value = joinLastWord(text.value);
		});
	};
}
