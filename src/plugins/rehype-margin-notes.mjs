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
 *
 * Three more things go in the margin (enrichment picks 1A, 2B and 6B, DECISIONS.md 2026-11-15):
 * - a quote from the source leads its citation's note, behind a pink rule, when the link's
 *   title carries one: `"cite: Lawson, February 2026 | quote: exact words"`, or for a
 *   bracketed citation just `"quote: exact words"`.
 * - a picture alone in a paragraph with a `margin:` title, `![alt](/a.webp "margin: Adam
 *   Smith, the Muir portrait. Wikimedia Commons")`, becomes a small captioned figure in the
 *   margin beside the next paragraph.
 * - a code comment starting `[!margin]` moves beside its line, joined to it by a pink rule
 *   (.code-noted, global.css). Where the margin is hidden, or anchor positioning is missing,
 *   it stays an ordinary comment in the code, so copying the code keeps it either way.
 */
const BRACKETED = /^\[(.+)\]$/s;
const CITE_TITLE = /^cite:\s*(.+)$/s;
const QUOTE = /(?:^|\s*\|\s*)quote:\s*(.+)$/s;
const MARGIN_PICTURE = /^margin:\s*(.+)$/s;
// A comment holding a [!margin] note, in the comment styles the site's code blocks use
const CODE_NOTE = /(#|\/\/|--|;|<!--|\/\*)\s*\[!margin\]\s*/;

/** A link title split into its citation and an optional quote. */
function titleParts(title) {
	const value = String(title ?? '');
	const quote = value.match(QUOTE);
	return { rest: value.replace(QUOTE, '').trim(), quote: quote ? quote[1].trim() : null };
}

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

// The margin note is aria-hidden, so a quote that's only there would never be heard
const spokenQuote = (quote) => el('span', { className: ['sr-only'] }, [text(` (“${quote}”)`)]);

function marginNote(number, children, quote = null) {
	return el('aside', { className: ['margin-note'], ariaHidden: 'true' }, [
		...(quote ? [el('span', { className: ['margin-quote'] }, [text(`“${quote}”`)])] : []),
		el('b', {}, [text(`${number} `)]),
		...children,
	]);
}

/** A paragraph holding only a picture titled `margin: caption`, as a margin figure. */
function marginPicture(block) {
	if (block.type !== 'element' || block.tagName !== 'p') return null;
	const kids = block.children.filter((n) => n.type !== 'text' || n.value.trim());
	const [img] = kids;
	const caption =
		kids.length === 1 &&
		img.tagName === 'img' &&
		String(img.properties.title ?? '').match(MARGIN_PICTURE);
	if (!caption) return null;
	delete img.properties.title;
	// Shown at most 15rem wide and 11rem tall (global.css), so a portrait is narrower
	const { width, height } = img.properties;
	img.properties.sizes =
		width && height ? `${Math.min(15, (11 * width) / height).toFixed(1)}rem` : '15rem';
	return el('figure', { className: ['margin-figure'] }, [
		img,
		el('figcaption', {}, [text(caption[1].trim())]),
	]);
}

/**
 * Each Shiki line whose comment starts `[!margin]` gets an anchor where its code ends, and the
 * comment (marker dropped) is wrapped so wide screens can hide it visually; the note and the
 * rule joining it to the line go after the <pre>, outside its scroll box, which would clip them.
 */
function codeNotes(tree) {
	let count = 0;
	const walk = (node, parent) => {
		if (node.type !== 'element') return;
		if (node.tagName !== 'pre') {
			[...(node.children ?? [])].forEach((child) => walk(child, node));
			return;
		}
		const code = node.children.find((n) => n.tagName === 'code');
		const extras = [];
		for (const line of code?.children ?? []) {
			// Shiki sets `class` as a string, not hast's className list
			if (
				!String(line.properties?.class ?? '')
					.split(' ')
					.includes('line')
			)
				continue;
			const at = line.children.findIndex((t) => CODE_NOTE.test(textOf(t)));
			if (at < 0) continue;
			// Split the token at its comment, for a plain block whose line is one text token
			const token = line.children[at];
			const leaf = token.type === 'text' ? token : token.children.find((c) => c.type === 'text');
			const { index, 0: marker } = leaf.value.match(CODE_NOTE);
			const before = leaf.value.slice(0, index);
			const comment = leaf.value.slice(index).replace('[!margin]', '').replace(/\s+/, ' ');
			const note = leaf.value
				.slice(index + marker.length)
				.replace(/\s*(-->|\*\/)\s*$/, '')
				.trim();
			const withText = (value) =>
				token.type === 'text' ? text(value) : { ...token, children: [text(value)] };
			const anchor = `--code-note-${++count}`;
			line.children = [
				...line.children.slice(0, at),
				...(before ? [withText(before)] : []),
				el('span', { className: ['code-note-end'], style: `anchor-name:${anchor}` }, []),
				el('span', { className: ['code-margin-comment'] }, [
					withText(comment),
					...line.children.slice(at + 1),
				]),
			];
			const placed = { style: `position-anchor:${anchor}`, ariaHidden: 'true' };
			extras.push(
				el('span', { className: ['code-note-rule'], ...placed }, []),
				el('aside', { className: ['code-note'], ...placed }, [text(note)]),
			);
		}
		if (extras.length) {
			parent.children[parent.children.indexOf(node)] = el('div', { className: ['code-noted'] }, [
				node,
				...extras,
			]);
		}
	};
	[...tree.children].forEach((child) => walk(child, tree));
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
			const picture = marginPicture(block);
			if (picture) {
				tree.children[i] = picture;
				continue;
			}
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
				const { rest, quote } = titleParts(node.properties?.title);
				const source = node.tagName === 'a' && rest.match(CITE_TITLE);
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
					if (quote) parent.children.splice(at + 2, 0, spokenQuote(quote));
					const site = siteOf(href);
					notes.push(
						marginNote(
							number,
							[
								text(`${source[1].trim()}. ${textOf(node).trim()}.`),
								...(site ? [text(` ${site}`)] : []),
							],
							quote,
						),
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
					if (quote) {
						delete node.properties.title;
						parent.children.splice(at + 1, 0, spokenQuote(quote));
					}
					node.children = [
						// The number first, so its name holds the visible number on wide screens
						el('sup', { className: ['cite-num'] }, [text(String(count))]),
						el('span', { className: ['cite-text'] }, [text(`${lead}${textOf(node)}`)]),
					];
					const site = siteOf(href);
					notes.push(
						marginNote(count, [text(`${cited[1]}.`), ...(site ? [text(` ${site}`)] : [])], quote),
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
		codeNotes(tree);
	};
}
