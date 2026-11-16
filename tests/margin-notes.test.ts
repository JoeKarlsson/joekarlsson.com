import { describe, expect, it } from 'vitest';
import rehypeMarginNotes from '../src/plugins/rehype-margin-notes.mjs';

type HastNode = {
	type: string;
	tagName?: string;
	properties?: Record<string, unknown>;
	children?: HastNode[];
	value?: string;
};

const text = (value: string): HastNode => ({ type: 'text', value });
const p = (...children: HastNode[]): HastNode => ({
	type: 'element',
	tagName: 'p',
	properties: {},
	children,
});
// A link as remark-rehype makes it, with the markdown title as `title`
const link = (href: string, words: string, title?: string): HastNode => ({
	type: 'element',
	tagName: 'a',
	properties: { href, ...(title ? { title } : {}) },
	children: [text(words)],
});
function run(...blocks: HastNode[]): HastNode {
	const root: HastNode = { type: 'root', children: blocks };
	(rehypeMarginNotes() as (t: HastNode) => void)(root);
	return root;
}
const textOf = (n: HastNode): string => n.value ?? (n.children ?? []).map(textOf).join('');
const notes = (root: HastNode) =>
	root.children!.filter((n) => n.tagName === 'aside').map((n) => textOf(n));
const numbers = (block: HastNode) =>
	block.children!.filter((n) => n.tagName === 'sup').map((n) => textOf(n));

describe('rehypeMarginNotes', () => {
	it('turns a cite: link into a numbered source note, keeping the link its own words', () => {
		const a = link(
			'https://nolanlawson.com/x/',
			'We mourn our craft',
			'cite: Lawson, February 2026',
		);
		const block = p(text('Nolan Lawson wrote '), a, text(', and more.'));
		const root = run(block);
		expect(notes(root)).toEqual(['1 Lawson, February 2026. We mourn our craft. nolanlawson.com']);
		expect(textOf(a)).toBe('We mourn our craft');
		expect(a.properties!.title).toBeUndefined();
		expect(numbers(block)).toEqual(['1']);
	});
	it('notes every source in a paragraph with several', () => {
		const block = p(
			link('https://a.com/', 'A', 'cite: A, 2020'),
			text(', '),
			link('https://b.com/', 'B', 'cite: B, 2020'),
			text(' and '),
			link('https://c.com/', 'C', 'cite: C, 2020'),
		);
		expect(notes(run(block))).toHaveLength(3);
		expect(numbers(block)).toEqual(['1', '2', '3']);
	});
	it('gives a source cited twice its first number and one note', () => {
		const again = p(text('Again '), link('https://a.com/x', 'A', 'cite: Ames, 2020'));
		const root = run(
			p(
				link('https://a.com/x', 'A', 'cite: Ames, 2020'),
				text(' and '),
				link('https://b.com/', 'B', 'cite: Bo, 2021'),
			),
			again,
		);
		expect(notes(root)).toHaveLength(2);
		expect(numbers(again)).toEqual(['1']);
	});
	it('leaves a plain outside link alone', () => {
		const block = p(text('See '), link('https://example.com/docs', 'the docs'));
		const root = run(block);
		expect(notes(root)).toEqual([]);
		expect(numbers(block)).toEqual([]);
	});
});
