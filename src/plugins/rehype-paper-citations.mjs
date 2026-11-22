/**
 * A paper's citations (scripts/sync-paper.mjs) as margin notes, mockup B (DECISIONS.md,
 * 2026-11-22). Pandoc's citeproc renders each citation as `span.citation` holding links to
 * `#ref-<key>` in the reference list (`div#refs`). The first time a source is cited, its full
 * Chicago entry goes in the margin beside that paragraph, headed by the citation's words linked
 * to the source; the in-text words stay as written ("(Lewis 1894)") and light their note on
 * hover (margin-notes.ts). Where there's no margin, the words link to the reference list.
 * Pages without pandoc's reference list are left alone.
 */
import rehypeRaw from 'rehype-raw';
import { textOf } from './hast-text.mjs';

export const isPaper = (file) => Boolean(file?.path?.includes('/src/content/papers/'));

/**
 * A paper's body is pandoc's HTML, which Astro would only parse after every plugin has run
 * (its rehype-raw comes last). Parsing it first lets the headings, permalinks, "On this page",
 * pictures and citations go through the same plugins as a post's. Only papers: parsing every
 * post's raw HTML this early would change pages that rely on it staying raw.
 */
export function rehypePaperRaw() {
	const parse = rehypeRaw();
	return (tree, file) => (isPaper(file) ? parse(tree, file) : undefined);
}

const el = (tagName, properties, children) => ({ type: 'element', tagName, properties, children });
const text = (value) => ({ type: 'text', value });
const classes = (node) => [node.properties?.className ?? []].flat().map(String);

/** A copy of the entry's markup with its links out of the Tab order: the note is aria-hidden. */
const untabbable = (node) =>
	node.type !== 'element'
		? node
		: {
				...node,
				properties: node.tagName === 'a' ? { ...node.properties, tabIndex: -1 } : node.properties,
				children: node.children.map(untabbable),
			};

function findAll(node, test, found = []) {
	if (test(node)) found.push(node);
	for (const child of node.children ?? []) findAll(child, test, found);
	return found;
}

export default function rehypePaperCitations() {
	return (tree) => {
		const entries = new Map(
			findAll(tree, (n) => n.tagName === 'div' && classes(n).includes('csl-entry')).map((n) => [
				String(n.properties.id),
				n,
			]),
		);
		if (!entries.size) return;
		const noted = new Set();
		for (let i = 0; i < tree.children.length; i++) {
			const block = tree.children[i];
			if (block.type !== 'element' || !['p', 'ul', 'ol', 'blockquote'].includes(block.tagName))
				continue;
			const notes = [];
			for (const cite of findAll(
				block,
				(n) => n.tagName === 'span' && classes(n).includes('citation'),
			)) {
				for (const link of findAll(cite, (n) => n.tagName === 'a')) {
					const id = String(link.properties.href).replace(/^#/, '');
					const entry = entries.get(id);
					if (!entry) throw new Error(`paper citation: no reference list entry #${id}`);
					link.properties.className = ['paper-cite'];
					link.properties.dataNote = id;
					if (noted.has(id)) continue;
					noted.add(id);
					// "Bruthiaux (1995)" links only the year, so a bare year takes the whole citation's words
					const words = textOf(link).trim();
					const label = /\p{L}/u.test(words) ? words : textOf(cite).replace(/[()]/g, '').trim();
					const source = findAll(
						entry,
						(n) => n.tagName === 'a' && /^https?:/.test(String(n.properties.href)),
					)[0];
					notes.push(
						el(
							'aside',
							{ className: ['margin-note', 'paper-note'], ariaHidden: 'true', dataNote: id },
							[
								el('b', {}, [
									el('a', { href: source?.properties.href ?? `#${id}`, tabIndex: -1 }, [
										text(label),
									]),
								]),
								text(' '),
								...entry.children.map(untabbable),
							],
						),
					);
				}
			}
			tree.children.splice(i, 0, ...notes);
			i += notes.length;
		}
	};
}
