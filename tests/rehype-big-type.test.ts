import { describe, expect, it } from 'vitest';
import rehypeInterlude from '../src/plugins/rehype-interlude.mjs';
import rehypeQuoteMarks from '../src/plugins/rehype-quote-marks.mjs';

type Node = {
	type: string;
	tagName?: string;
	properties?: Record<string, unknown>;
	children?: Node[];
	value?: string;
};
const text = (value: string): Node => ({ type: 'text', value });
const el = (tagName: string, children: Node[], properties: Record<string, unknown> = {}): Node => ({
	type: 'element',
	tagName,
	properties,
	children,
});

describe('rehype-quote-marks', () => {
	type Transform = (root: Node, file?: object) => void;
	const run = (root: Node) => (rehypeQuoteMarks() as Transform)(root);

	it('hangs a mark on a quotation and drops its own marks', () => {
		const quote = el('blockquote', [
			el('p', [text('“Ship the '), el('em', [text('ugly')]), text(' pot.”')]),
			el('p', [text('From Orland')]),
		]);
		run({ type: 'root', children: [quote] });
		expect(quote.properties!.className).toEqual(['quote']);
		expect(quote.children![0].properties!.className).toEqual(['quote-mark']);
		expect(quote.children![1].children!.map((c) => c.value ?? 'em')).toEqual([
			'Ship the ',
			'em',
			' pot.',
		]);
	});

	it('leaves a quote that would keep an unpaired mark', () => {
		for (const words of ['“Ship it,” she said.', '“Ship it,” she said, “today.”', '“Ship it,']) {
			const quote = el('blockquote', [el('p', [text(words)])]);
			run({ type: 'root', children: [quote] });
			expect(quote.properties!.className).toBeUndefined();
		}
	});

	it('marks a long quote so it stays roman', () => {
		const quote = el('blockquote', [el('p', [text(`“${'word '.repeat(61).trim()}.”`)])]);
		run({ type: 'root', children: [quote] });
		expect(quote.properties!.className).toEqual(['quote', 'long']);
	});

	it('leaves a note alone', () => {
		const note = el('blockquote', [el('p', [text('Note: this uses mock data')])]);
		run({ type: 'root', children: [note] });
		expect(note.properties!.className).toBeUndefined();
		expect(note.children).toHaveLength(1);
	});
});

describe('rehype-interlude', () => {
	const post = () => ({
		type: 'root',
		children: [
			el('h2', [text('One')]),
			el('p', [text('That’s the part I miss. More words.')]),
			el('div', [el('h2', [text('Two')])], { className: ['heading-group'] }),
		],
	});
	const run = (root: Node, interlude: object) =>
		(rehypeInterlude() as (root: Node, file: object) => void)(root, {
			data: { astro: { frontmatter: { interlude } } },
		});

	it("sets the post's own curled line before the next section", () => {
		const root = post();
		run(root, { after: 'One', line: "That's the part I miss." });
		expect(root.children[2].properties!.className).toEqual(['interlude']);
		expect(root.children[2].children![0].value).toBe('That’s the part I miss.');
	});

	it('matches a line that ends its paragraph, where no-widows tied the last word', () => {
		const root = post();
		root.children[1].children![0].value = 'Only one had room to\u00a0play.';
		run(root, { after: 'One', line: 'Only one had room to play.' });
		expect(root.children[2].children![0].value).toBe('Only one had room to\u00a0play.');
	});

	it('fails the build on a line the post never says or a missing section', () => {
		expect(() => run(post(), { after: 'One', line: 'Not in the post.' })).toThrow(/word for word/);
		expect(() => run(post(), { after: 'Gone', line: 'More words.' })).toThrow(/no section/);
		expect(() => run(post(), { after: 'Two', line: 'More words.' })).toThrow(/last section/);
	});
});
