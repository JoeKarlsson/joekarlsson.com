import { describe, expect, it } from 'vitest';
import rehypeTableScroll from '../src/plugins/rehype-table-scroll.mjs';

type Node = {
	type: string;
	tagName?: string;
	value?: string;
	properties?: Record<string, unknown>;
	children?: Node[];
};
const el = (tagName: string, children: Node[] = [], properties = {}): Node => ({
	type: 'element',
	tagName,
	properties,
	children,
});
const text = (value: string): Node => ({ type: 'text', value });
const table = (header: string) =>
	el('table', [el('thead', [el('tr', [el('th', [text(header)])])])]);
const run = (root: Node) => (rehypeTableScroll() as (tree: Node) => void)(root);

describe('rehype-table-scroll', () => {
	it('wraps each table once in a keyboard-reachable region named by the heading above', () => {
		const t = table('ID');
		const root: Node = { type: 'root', children: [el('h3', [text('Cars')], { id: 'cars' }), t] };
		run(root);
		run(root);
		expect(root.children?.[1]).toEqual(
			el('div', [t], {
				className: ['table-scroll'],
				role: 'region',
				tabIndex: 0,
				ariaLabelledBy: 'cars',
			}),
		);
	});

	it('names a table with no heading above it by its first header', () => {
		const root: Node = { type: 'root', children: [table('Model')] };
		run(root);
		expect(root.children?.[0].properties?.ariaLabel).toBe('Table: Model');
	});

	it("names a captioned table by its number, so two tables under one heading don't share a name", () => {
		const numbered = (n: number) =>
			el('table', [
				el('caption', [el('strong', [text(`Table ${n}.`)]), text(' The share by variant.')]),
			]);
		const root: Node = {
			type: 'root',
			children: [el('h3', [text('Robustness')], { id: 'robustness' }), numbered(3), numbered(4)],
		};
		run(root);
		expect(root.children?.slice(1).map((box) => box.properties?.ariaLabel)).toEqual([
			'Table 3',
			'Table 4',
		]);
	});
});
