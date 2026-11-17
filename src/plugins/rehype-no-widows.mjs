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

// Letters only, so "experience." counts as 10
const LONGEST_WORD = 14;
// Not inside these: code keeps its spaces, and a list item's own paragraphs and nested
// lists are visited on their own
const SKIP = new Set(['code', 'pre', 'kbd', 'p', 'ul', 'ol', 'script', 'style', 'svg']);

/**
 * The last text node under `node` that isn't inside a skipped element, with its parent
 * and index, or undefined.
 */
function lastText(node) {
	for (let i = (node.children ?? []).length - 1; i >= 0; i--) {
		const child = node.children[i];
		if (child.type === 'text') {
			if (child.value.trim() !== '') return { text: child, parent: node, index: i };
		} else if (child.type === 'element' && !SKIP.has(child.tagName)) {
			const found = lastText(child);
			if (found) return found;
		}
	}
	return undefined;
}

const isShort = (word) => word.replace(/\W/g, '').length < LONGEST_WORD;

/**
 * Splits off a joined last word that has a hyphen ("re-render."), so it can sit in a
 * nowrap span: Firefox breaks at the hyphen even after a no-break space, and a U+2060
 * joiner would ride along into copied text. Returns [text] when there's nothing to hold.
 * @param {string} text
 * @returns {[string] | [string, string]}
 */
function splitHyphenatedLastWord(text) {
	const match = /^((?:[\s\S]*\u00A0)?)(\S*\w-\w\S*\s*)$/.exec(text);
	return match ? [match[1], match[2]] : [text];
}

/** Moves a hyphenated last word in `found.text` into a nowrap span after it. */
function holdHyphenated({ text, parent, index }) {
	const [head, word] = splitHyphenatedLastWord(text.value);
	if (word === undefined || !isShort(word)) return;
	text.value = head;
	parent.children.splice(index + 1, 0, {
		type: 'element',
		tagName: 'span',
		properties: { className: ['whitespace-nowrap'] },
		children: [{ type: 'text', value: word }],
	});
}

/**
 * @param {string} text
 * @returns {string}
 */
export function joinLastWord(text) {
	const match = /^([\s\S]*\S)[ \t\n]+(\S+\s*)$/.exec(text);
	if (!match || !isShort(match[2])) return text;
	// "... text - why?": Firefox breaks after a dash even before a no-break space, so the
	// dash joins the word before it too, and a word joiner holds it to the last word
	const dash = /^([\s\S]*\S)[ \t\n]+([-–])$/.exec(match[1]);
	if (dash) return `${dash[1]}\u00A0${dash[2]}\u2060\u00A0${match[2]}`;
	return `${match[1]}\u00A0${match[2]}`;
}

/** Join the last word that ends at `found.text` to the word before it. */
function joinAt(found) {
	const target = joinedText(found);
	if (target) holdHyphenated(target);
}

/** Joins the last word and returns the text node that now holds it, if any. */
function joinedText({ text, parent, index }) {
	// ")." or "." right after a link: the last word is the link's own last word
	if (/^[^\w\s]+\s*$/.test(text.value)) {
		const before = parent.children[index - 1];
		if (before?.type !== 'element') return undefined;
		const inner = SKIP.has(before.tagName) ? undefined : lastText(before);
		if (!inner) return undefined;
		if (/\S\s+\S/.test(inner.text.value.trim())) {
			inner.text.value = joinLastWord(inner.text.value);
			return inner;
		}
		// A one-word link ("my GitHub."): the space before the link becomes no-break
		const lead = parent.children[index - 2];
		if (lead?.type === 'text' && /\S[ \t\n]+$/.test(lead.value) && isShort(inner.text.value)) {
			lead.value = lead.value.replace(/[ \t\n]+$/, '\u00A0');
			return inner;
		}
		return undefined;
	}
	// " lines." after inline code or a link: the word joins the element before it
	const lone = /^[ \t\n]+(\S+\s*)$/.exec(text.value);
	if (lone && isShort(lone[1])) text.value = `\u00A0${lone[1]}`;
	else text.value = joinLastWord(text.value);
	return { text, parent, index };
}

export default function rehypeNoWidows() {
	return (tree) => {
		visit(tree, 'element', (node) => {
			if (node.tagName === 'pre' || node.tagName === 'code') return SKIP_NODE;
			if (!['p', 'li', 'td', 'th', 'figcaption'].includes(node.tagName)) return;
			const found = lastText(node);
			if (found) joinAt(found);
		});
	};
}
