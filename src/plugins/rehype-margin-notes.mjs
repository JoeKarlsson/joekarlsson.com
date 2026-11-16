/**
 * Copy a post's notes into the right margin, beside the paragraph they belong to, like
 * the notes in a monograph (art book round 2, pick 7B; .margin-note in global.css).
 *
 * Four kinds count:
 * - a bracketed citation link, `[[Oliver 2025]](https://...)`: on wide screens its text
 *   gives way to a pink superscript number, and the margin note carries the citation and
 *   the site it links to. Narrower screens keep the bracketed text in the line and hide the note.
 * - a source link marked with a `cite:` title, `[We mourn our craft](https://... "cite: Lawson,
 *   February 2026")`: the link keeps its words and gets a pink number after it, and the note
 *   gives the author and date, the link's words and the site (DECISIONS.md, round 5 B).
 * - a GFM footnote reference, `[^1]`: its note is the footnote's own text. The footnotes
 *   list at the end of the post stays, so nothing is lost where the margin is hidden.
 * - an entry in the post's `marginNotes` front matter (round 6 and 7 in DECISIONS.md): a
 *   quote, term, update, see-also, exhibit or aside, tied to a short phrase of the text by
 *   `at`. The phrase gets a pink number and the note starts with it; margin-notes.ts lights
 *   both on hover and rings the phrase on a click. Quotes and updates also show on phones,
 *   under their paragraph. A phrase the post doesn't contain fails the build.
 *
 * A margin note goes just before its paragraph, floated right into the margin, so it starts
 * level with the paragraph. Citation and footnote notes are aria-hidden and link nowhere: a
 * screen reader already hears the citation in the line, or the footnote at the end. Front
 * matter notes say something the text doesn't, so they are read, and their numbers link.
 *
 * Three more things go in the margin (enrichment picks 1A, 2B and 6B, DECISIONS.md 2026-11-15):
 * - a quote from the source leads its citation's note, behind a pink rule, when the link's
 *   title carries one: `"cite: Lawson, February 2026 | quote: exact words"`, or for a
 *   bracketed citation just `"quote: exact words"`.
 * - a picture alone in a paragraph with a `margin:` title, `![alt](/a.webp "margin: Adam
 *   Smith, the Muir portrait. Wikimedia Commons")`, becomes a small captioned figure in the
 *   margin beside the next paragraph; with no margin it floats small at the paragraph's right.
 * - a code comment starting `[!margin]` moves beside its line, joined to it by a pink rule
 *   (.code-noted, global.css). Where the margin is hidden, or anchor positioning is missing,
 *   it stays an ordinary comment in the code, so copying the code keeps it either way.
 */
import { halftoneMode } from '../utils/halftone.ts';
import { localImageSize } from '../utils/image-size.mjs';
import { readPost } from './rehype-post-previews.mjs';

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

// How many crayon rings BaseLayout defines (#hover-ring-0 to -7, from RINGS in scribbles.ts)
const RING_COUNT = 8;
const PINK = '#ff4fd8';
// Kinds shown on phones too, under their paragraph (round 6: too useful to lose)
const SHOWN_ON_PHONES = new Set(['quote', 'update']);

function textOf(node) {
	if (node.type === 'text') return node.value;
	return (node.children ?? []).map(textOf).join('');
}

const el = (tagName, properties, children) => ({ type: 'element', tagName, properties, children });
const text = (value) => ({ type: 'text', value });
// Markdown curls quotes on the way in; a note's `at` is matched with them straightened
// (one character for one, so positions line up)
const straight = (s) => s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"');

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

function marginNote(number, children, quote = null, paired = false) {
	const pair = paired ? { dataNote: String(number) } : {};
	return el('aside', { className: ['margin-note'], ariaHidden: 'true', ...pair }, [
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
	// In the margin at most 15rem wide and 11rem tall, so a portrait is narrower; 7.5rem without one
	const { width, height } = img.properties;
	img.properties.sizes = `(width >= 80rem) ${width && height ? Math.min(15, (11 * width) / height).toFixed(1) : 15}rem, 7.5rem`;
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
/** The crayon ring a clicked phrase gets, the one /uses draws round a pinned item. */
function ring(number) {
	return el(
		'svg',
		{
			className: ['hover-ring', 'mn-ring'],
			viewBox: '0 0 520 150',
			preserveAspectRatio: 'none',
			ariaHidden: 'true',
		},
		[
			el(
				'g',
				{
					fill: 'none',
					stroke: PINK,
					strokeWidth: '4',
					strokeLinecap: 'round',
					strokeLinejoin: 'round',
					filter: 'url(#crayon)',
				},
				[el('use', { href: `#hover-ring-${(number - 1) % RING_COUNT}` }, [])],
			),
		],
	);
}

/** The body of a front matter note, by kind. */
function noteBody(note, number) {
	const back = el('b', {}, [
		el('a', { href: `#mn-w-${number}`, ariaLabel: `Note ${number}, back to the text` }, [
			text(String(number)),
		]),
		text(' '),
	]);
	switch (note.type) {
		case 'quote': {
			const by = note.url ? el('a', { href: note.url }, [text(note.by)]) : text(note.by);
			return [back, el('q', {}, [text(note.text)]), el('cite', {}, [by])];
		}
		case 'term':
			return [back, el('dfn', {}, [text(note.term ?? note.at)]), text(`: ${note.text}`)];
		case 'update':
			return [back, el('span', { className: ['mn-stamp'] }, [text(note.date)]), text(note.text)];
		case 'see': {
			const post = readPost(note.post);
			if (!post)
				throw new Error(`margin note: see-also post "${note.post}" isn't in src/content/blog`);
			return [
				back,
				el('a', { href: `/blog/${note.post}/`, className: ['mn-card'] }, [
					el(
						'img',
						{
							className: ['mn-img'],
							sizes: '56px',
							src: post.image,
							alt: '',
							loading: 'lazy',
							dataHalftone: halftoneMode(post.image),
						},
						[],
					),
					el('span', {}, [el('strong', {}, [text(post.title)]), text(note.text)]),
				]),
			];
		}
		case 'exhibit':
			return [
				back,
				...(note.image
					? [
							el(
								'img',
								{
									className: ['mn-img'],
									sizes: '15rem',
									src: note.image,
									alt: note.alt,
									loading: 'lazy',
									dataHalftone: halftoneMode(note.image),
								},
								[],
							),
						]
					: []),
				text(note.text),
			];
		default:
			return [back, text(note.text)];
	}
}

function frontMatterNote(note, number, narrow) {
	// A note, not an aside: a landmark per note would fill a screen reader's landmark list
	return el(
		'div',
		{
			role: 'note',
			className: ['margin-note', `mn-${note.type}`, ...(narrow ? ['mn-narrow'] : [])],
			id: narrow ? `mn-${number}-narrow` : `mn-${number}`,
			dataNote: String(number),
		},
		noteBody(note, number),
	);
}

/** Elements a note's phrase may not sit inside: it would ring a link or a code span. */
const SKIP = new Set(['a', 'code', 'sup', 'kbd', 'q']);

export default function rehypeMarginNotes() {
	return async (tree, file) => {
		const footnotes = footnoteTexts(tree);
		const pending = [...(file?.data?.astro?.frontmatter?.marginNotes ?? [])];
		let count = 0;
		// A source cited again keeps its first number and adds no second note, as in a book
		const numberOf = new Map();

		// Wrap the earliest pending phrase in a text node, number it, and go on after it
		const wrapPhrases = (node, parent, notes, after) => {
			let at = parent.children.indexOf(node);
			let rest = node;
			for (;;) {
				let best = null;
				for (const note of pending) {
					const i = straight(rest.value).indexOf(straight(note.at));
					if (i >= 0 && (!best || i < best.i)) best = { note, i };
				}
				if (!best) return;
				pending.splice(pending.indexOf(best.note), 1);
				const number = ++count;
				const before = text(rest.value.slice(0, best.i));
				const words = el(
					'span',
					{ className: ['mn-words'], id: `mn-w-${number}`, dataNote: String(number) },
					[text(rest.value.slice(best.i, best.i + best.note.at.length)), ring(number)],
				);
				const shownOnPhones = SHOWN_ON_PHONES.has(best.note.type);
				const num = el(
					'sup',
					{ className: ['cite-num', 'mn-num', ...(shownOnPhones ? ['mn-phone'] : [])] },
					[
						el(
							'a',
							{ href: `#mn-${number}`, dataNote: String(number), ariaLabel: `Note ${number}` },
							[text(String(number))],
						),
					],
				);
				rest = text(rest.value.slice(best.i + best.note.at.length));
				parent.children.splice(at, 1, before, words, num, rest);
				at += 3;
				notes.push(frontMatterNote(best.note, number, false));
				if (shownOnPhones) after.push(frontMatterNote(best.note, number, true));
			}
		};

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
			const blockNotes = [];
			// In a list, a note goes at the top of the innermost item holding its phrase, so it
			// sits level with that item instead of the whole list
			let notes = blockNotes;
			let after = [];
			const walk = (node, parent) => {
				if (node.type === 'text') {
					if (pending.length) wrapPhrases(node, parent, notes, after);
					return;
				}
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
					if (!repeat) node.properties.dataNote = String(number);
					const at = parent.children.indexOf(node);
					// After the link, not in it: the link's name stays its own words
					parent.children.splice(
						at + 1,
						0,
						el(
							'sup',
							{
								className: ['cite-num'],
								ariaHidden: 'true',
								...(repeat ? {} : { dataNote: String(number) }),
							},
							[text(String(number))],
						),
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
							true,
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
				if (SKIP.has(node.tagName)) return;
				if (node.tagName === 'li') {
					const [outerNotes, outerAfter] = [notes, after];
					notes = [];
					after = [];
					[...node.children].forEach((child) => walk(child, node));
					node.children.unshift(...notes);
					node.children.push(...after);
					[notes, after] = [outerNotes, outerAfter];
					return;
				}
				// A copy: a citation's number goes in after it, and forEach stops at the old length
				[...(node.children ?? [])].forEach((child) => walk(child, node));
			};
			[...block.children].forEach((child) => walk(child, block));
			if (after.length) tree.children.splice(i + 1, 0, ...after);
			if (blockNotes.length) {
				tree.children.splice(i, 0, ...blockNotes);
				i += blockNotes.length;
			}
			i += after.length;
		}
		codeNotes(tree);
		if (pending.length) {
			const where = file?.path ?? 'a post';
			throw new Error(
				`margin note: ${where} has no paragraph or list containing ${pending
					.map((n) => `"${n.at}"`)
					.join(
						', ',
					)} (a note's \`at\` must be plain text in one block, not inside a link or code)`,
			);
		}
		// Every picture in a post carries its size (tests/build-output.test.ts)
		const sizeImages = async (node) => {
			if (node.tagName === 'img' && node.properties.className?.includes?.('mn-img'))
				Object.assign(node.properties, await localImageSize(node.properties.src));
			for (const child of node.children ?? []) await sizeImages(child);
		};
		await sizeImages(tree);
	};
}
