import { visit } from 'unist-util-visit';

/**
 * Turn an empty header cell into a plain cell.
 *
 * Comparison tables in posts leave the top-left corner blank (`|   | A | B |`).
 * Markdown makes that a <th> with no text, and a header that names nothing is
 * an accessibility error (axe: empty-table-header). A <td> there is valid and
 * reads the same.
 */
export default function rehypeEmptyCornerCell() {
	return (tree) => {
		visit(tree, 'element', (node) => {
			if (node.tagName !== 'th') return;
			const hasText = (node.children ?? []).some(
				(child) => child.type !== 'text' || child.value.trim() !== '',
			);
			if (!hasText) node.tagName = 'td';
		});
	};
}
