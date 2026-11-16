/**
 * Copy a post's citations into the right margin, beside the paragraph they belong to, like
 * the notes in a monograph (art book round 2, pick 7B; .margin-note in global.css).
 *
 * Two kinds count:
 * - a bracketed citation link, `[[Oliver 2025]](https://...)`: on wide screens its text
 *   gives way to a pink superscript number, and the margin note carries the citation and
 *   the site it links to. Narrower screens keep the bracketed text in the line and hide the note.
 * - a source link marked with a `cite:` title, `[We mourn our craft](https://... "cite: Lawson,
 *   February 2026")`: the link keeps its words and gets a pink number after it, and the note
 *   gives the author and date, the link's words and the site (DECISIONS.md, round 5 B).
 * - a GFM footnote reference, `[^1]`: its note is the footnote's own text. The footnotes
 *   list at the end of the post stays, so nothing is lost where the margin is hidden.
 *
 * A margin note goes just before its paragraph, floated right into the margin, so it starts
 * level with the paragraph. It's aria-hidden and links nowhere: a screen reader already hears
 * the citation in the line, or the footnote at the end, and the line's own link goes there.
 */
const BRACKETED = /^\[(.+)\]$/s;
const CITE_TITLE = /^cite:\s*(.+)$/s;

function textOf(node) {
	if (node.type === 'text') return node.value;
	return (node.children ?? []).map(textOf).join('');
}

const el = (tagName, properties, children) => ({ type: 'element', tagName, properties, children });
const text = (value) => ({ type: 'text', value });

function siteOf(href) {
	try {
		return new URL(href).hostname.replace(/^www\./, '');
	} catch {
		return null;
	}
}

/** The footnote definitions GFM put at the end, by id, without their ↩ back links. */
function footnoteTexts(tree) {
	const notes = new Map();
	const walk = (node) => {
		if (node.tagName === 'li' && String(node.properties?.id ?? '').startsWith('user-content-fn-')) {
			const strip = (n) =>
				n.type === 'element' && n.properties?.dataFootnoteBackref !== undefined
					? null
					: n.children
						? { ...n, children: n.children.map(strip).filter(Boolean) }
						: n;
			notes.set(`#${node.properties.id}`, textOf(strip(node)).trim());
			return;
		}
		node.children?.forEach(walk);
	};
	walk(tree);
	return notes;
}

function marginNote(number, children) {
	return el('aside', { className: ['margin-note'], ariaHidden: 'true' }, [
		el('b', {}, [text(`${number} `)]),
		...children,
	]);
}

export default function rehypeMarginNotes() {
	return (tree) => {
		const footnotes = footnoteTexts(tree);
		let count = 0;
		// A source cited again keeps its first number and adds no second note, as in a book
		const numberOf = new Map();

		// Only the post's top-level blocks get notes beside them; the footnotes list itself
		// and anything inside a table or a <details> stay as they are
		for (let i = 0; i < tree.children.length; i++) {
			const block = tree.children[i];
			if (block.type !== 'element' || !['p', 'ul', 'ol', 'blockquote'].includes(block.tagName)) {
				continue;
			}
			const notes = [];
			const walk = (node, parent) => {
				if (node.type !== 'element') return;
				const href = String(node.properties?.href ?? '');
				if (node.tagName === 'a' && node.properties?.dataFootnoteRef !== undefined) {
					const note = footnotes.get(href);
					if (note) notes.push(marginNote(textOf(node).trim(), [text(note)]));
					return;
				}
				const source =
					node.tagName === 'a' && String(node.properties?.title ?? '').match(CITE_TITLE);
				if (source && /^https?:/.test(href)) {
					const repeat = numberOf.get(href);
					const number = repeat ?? ++count;
					numberOf.set(href, number);
					delete node.properties.title;
					const at = parent.children.indexOf(node);
					// After the link, not in it: the link's name stays its own words
					parent.children.splice(
						at + 1,
						0,
						el('sup', { className: ['cite-num'], ariaHidden: 'true' }, [text(String(number))]),
					);
					if (repeat) return;
					const site = siteOf(href);
					notes.push(
						marginNote(number, [
							text(`${source[1].trim()}. ${textOf(node).trim()}.`),
							...(site ? [text(` ${site}`)] : []),
						]),
					);
					return;
				}
				const cited = node.tagName === 'a' && textOf(node).match(BRACKETED);
				if (cited && /^https?:/.test(href)) {
					count++;
					// The space before the citation goes with it, so the number sits on the word
					const at = parent.children.indexOf(node);
					const before = parent.children[at - 1];
					let lead = '';
					if (before?.type === 'text' && /\s$/.test(before.value)) {
						lead = before.value.match(/\s+$/)[0];
						before.value = before.value.trimEnd();
					}
					node.properties.className = [...(node.properties.className ?? []), 'cite'];
					node.children = [
						// The number first, so its name holds the visible number on wide screens
						el('sup', { className: ['cite-num'] }, [text(String(count))]),
						el('span', { className: ['cite-text'] }, [text(`${lead}${textOf(node)}`)]),
					];
					const site = siteOf(href);
					notes.push(
						marginNote(count, [text(`${cited[1]}.`), ...(site ? [text(` ${site}`)] : [])]),
					);
					return;
				}
				// A copy: a citation's number goes in after it, and forEach stops at the old length
				[...(node.children ?? [])].forEach((child) => walk(child, node));
			};
			[...block.children].forEach((child) => walk(child, block));
			if (notes.length) {
				tree.children.splice(i, 0, ...notes);
				i += notes.length;
			}
		}
	};
}
