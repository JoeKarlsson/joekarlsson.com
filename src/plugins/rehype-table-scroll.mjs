import { visit } from 'unist-util-visit';

const text = (node) =>
	node.type === 'text' ? node.value : (node.children ?? []).map(text).join('').trim();

/**
 * Wrap each table in a box that scrolls sideways (article.css `.table-scroll`).
 *
 * The page itself never scrolls sideways (global.css clips it), so a table wider
 * than a phone lost its right-hand columns: 52 of 63 pages with tables did in
 * November 2026. The box takes the table's place in the layout, so desktop looks
 * the same and a phone can swipe across.
 *
 * The box is a named region with a tab stop, as Shiki's code blocks are, because
 * Safari gives a keyboard no way into a scroll box with nothing focusable inside.
 * Its name is the table's caption ("Table 3" when the caption is numbered, as a paper's
 * are, since two tables can share a heading), else the heading above the table (runs after
 * rehype-slug for the ids), else the table's first header.
 */
export default function rehypeTableScroll() {
	return (tree) => {
		let headingId;
		visit(tree, 'element', (node, index, parent) => {
			if (/^h[2-4]$/.test(node.tagName) && node.properties?.id) headingId = node.properties.id;
			if (node.tagName !== 'table' || !parent || index === undefined) return;
			if (parent.type === 'element' && parent.properties?.className?.includes('table-scroll'))
				return;
			const caption = node.children.find((c) => c.tagName === 'caption');
			const captionText = caption && text(caption);
			let th;
			visit(node, 'element', (cell) => {
				if (!th && cell.tagName === 'th' && text(cell)) th = cell;
			});
			const name = captionText
				? { ariaLabel: captionText.match(/^(Table \d+)\./)?.[1] ?? captionText }
				: headingId
					? { ariaLabelledBy: headingId }
					: { ariaLabel: th ? `Table: ${text(th)}` : 'Table' };
			parent.children[index] = {
				type: 'element',
				tagName: 'div',
				properties: { className: ['table-scroll'], role: 'region', tabIndex: 0, ...name },
				children: [node],
			};
		});
	};
}
