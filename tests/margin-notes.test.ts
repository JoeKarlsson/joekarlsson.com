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
async function run(...blocks: HastNode[]): Promise<HastNode> {
	return runWith(undefined, ...blocks);
}
// A post's marginNotes front matter reaches the plugin the way Astro passes it
async function runWith(marginNotes: unknown, ...blocks: HastNode[]): Promise<HastNode> {
	const root: HastNode = { type: 'root', children: blocks };
	const file = { path: 'post.md', data: { astro: { frontmatter: { marginNotes } } } };
	await (rehypeMarginNotes() as (t: HastNode, f: unknown) => Promise<void>)(root, file);
	return root;
}
const textOf = (n: HastNode): string => n.value ?? (n.children ?? []).map(textOf).join('');
const notes = (root: HastNode) =>
	root
		.children!.filter((n) => String(n.properties?.className ?? '').includes('margin-note'))
		.map((n) => textOf(n));
const numbers = (block: HastNode) =>
	block.children!.filter((n) => n.tagName === 'sup').map((n) => textOf(n));

describe('rehypeMarginNotes', async () => {
	it('turns a cite: link into a numbered source note, keeping the link its own words', async () => {
		const a = link(
			'https://nolanlawson.com/x/',
			'We mourn our craft',
			'cite: Lawson, February 2026',
		);
		const block = p(text('Nolan Lawson wrote '), a, text(', and more.'));
		const root = await run(block);
		expect(notes(root)).toEqual(['1 Lawson, February 2026. We mourn our craft. nolanlawson.com']);
		expect(textOf(a)).toBe('We mourn our craft');
		expect(a.properties!.title).toBeUndefined();
		expect(numbers(block)).toEqual(['1']);
	});
	it('notes every source in a paragraph with several', async () => {
		const block = p(
			link('https://a.com/', 'A', 'cite: A, 2020'),
			text(', '),
			link('https://b.com/', 'B', 'cite: B, 2020'),
			text(' and '),
			link('https://c.com/', 'C', 'cite: C, 2020'),
		);
		expect(notes(await run(block))).toHaveLength(3);
		expect(numbers(block)).toEqual(['1', '2', '3']);
	});
	it('gives a source cited twice its first number and one note', async () => {
		const again = p(text('Again '), link('https://a.com/x', 'A', 'cite: Ames, 2020'));
		const root = await run(
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
	it('leaves a plain outside link alone', async () => {
		const block = p(text('See '), link('https://example.com/docs', 'the docs'));
		const root = await run(block);
		expect(notes(root)).toEqual([]);
		expect(numbers(block)).toEqual([]);
	});
	it('numbers a front matter note in reading order with the citations, and wraps its phrase', async () => {
		const block = p(
			link('https://a.com/', 'A', 'cite: A, 2020'),
			text(' runs as the state backend for everything.'),
		);
		const root = await runWith(
			[{ type: 'term', at: 'state backend', term: 'State backend', text: 'where state lives.' }],
			block,
		);
		expect(notes(root)).toEqual([
			'1 A, 2020. A. a.com',
			'2 State backend: where state\u00A0lives.',
		]);
		const words = block.children!.find((n) => n.properties?.id === 'mn-w-2')!;
		expect(textOf(words)).toBe('state backend');
		expect(textOf(block)).toBe('A1 runs as the state backend2 for everything.');
	});
	it('repeats a quote or update under its paragraph for phones, and not a term', async () => {
		const block = p(text('It has 41 checks and an LXC container.'));
		const root = await runWith(
			[
				{ type: 'update', at: '41 checks', date: 'Oct 2026', text: 'It has 185 now.' },
				{ type: 'term', at: 'LXC container', text: 'a light container.' },
			],
			block,
		);
		const ids = root.children!.map((n) => n.properties?.id ?? n.tagName);
		expect(ids).toEqual(['mn-1', 'mn-2', 'p', 'mn-1-narrow']);
	});
	it("fails the build when a note's phrase isn't plain text in the post", async () => {
		const block = p(text('See '), link('https://example.com/', 'the docs'));
		await expect(runWith([{ type: 'aside', at: 'the docs', text: 'x' }], block)).rejects.toThrow(
			/no paragraph or list containing "the docs"/,
		);
	});
	it('puts a note in a list at the top of the item holding its phrase', async () => {
		const li = (...children: HastNode[]): HastNode => ({
			type: 'element',
			tagName: 'li',
			properties: {},
			children,
		});
		const second = li(text('How long do you keep it?'));
		const list: HastNode = {
			type: 'element',
			tagName: 'ul',
			properties: {},
			children: [li(text('How big?')), second],
		};
		const root = await runWith(
			[{ type: 'see', at: 'keep it', post: 'homelab-two-years-later', text: 'x' }],
			list,
		);
		expect(root.children!.map((n) => n.tagName)).toEqual(['ul']);
		expect(second.children![0].properties?.id).toBe('mn-1');
	});
	it("matches a note's straight quotes against the curled ones markdown renders", async () => {
		const block = p(text('Claude and Word don’t get along.'));
		const root = await runWith([{ type: 'aside', at: "don't get along", text: 'x' }], block);
		expect(textOf(block.children!.find((n) => n.properties?.id === 'mn-w-1')!)).toBe(
			'don’t get along',
		);
		expect(notes(root)).toEqual(['1 x']);
	});
	it("repeats a list item's quote under that item on phones, not under the whole list", async () => {
		const li = (...children: HastNode[]): HastNode => ({
			type: 'element',
			tagName: 'li',
			properties: {},
			children,
		});
		const first = li(text('It said no.'));
		const list: HastNode = {
			type: 'element',
			tagName: 'ul',
			properties: {},
			children: [first, li(text('Later.'))],
		};
		const root = await runWith(
			[{ type: 'quote', at: 'said no', text: 'No.', by: 'Someone' }],
			list,
		);
		expect(root.children!.map((n) => n.tagName)).toEqual(['ul']);
		expect(first.children!.at(-1)!.properties?.id).toBe('mn-1-narrow');
	});
});

describe('rehypeMarginNotes enrichment', async () => {
	it("leads a citation's note with the quote in its title", async () => {
		const a = link('https://a.com/', 'A', 'cite: Ames, 2020 | quote: exact words here');
		const cited = {
			...link('https://b.com/', '[Bo 2021]'),
			properties: { href: 'https://b.com/', title: 'quote: more words' },
		};
		const root = await run(p(a, text(' and '), cited));
		expect(notes(root)).toEqual([
			'“exact words here”1 Ames, 2020. A. a.com',
			'“more words”2 Bo 2021. b.com',
		]);
		expect(cited.properties.title).toBeUndefined();
		// Screen readers hear each quote in the sentence, since the note is aria-hidden
		expect(
			root
				.children!.at(-1)!
				.children!.filter((n) =>
					(n.properties?.className as string[] | undefined)?.includes('sr-only'),
				)
				.map(textOf),
		).toEqual([' (“exact words here”)', ' (“more words”)']);
	});
	it('turns a lone picture titled margin: into a captioned margin figure', async () => {
		const img: HastNode = {
			type: 'element',
			tagName: 'img',
			properties: { src: '/a.webp', alt: 'A', title: 'margin: Ames, a portrait' },
			children: [],
		};
		const root = await run(p(img), p(text('Next paragraph')));
		const figure = root.children![0];
		expect(figure.tagName).toBe('figure');
		expect(textOf(figure)).toBe('Ames, a portrait');
		expect(img.properties!.title).toBeUndefined();
	});
	it('moves a [!margin] code comment beside its line and keeps it in the code', async () => {
		const token = (value: string): HastNode => ({
			type: 'element',
			tagName: 'span',
			properties: {},
			children: [text(value)],
		});
		const line: HastNode = {
			type: 'element',
			tagName: 'span',
			properties: { class: 'line' },
			children: [token('x = 1  '), token('# [!margin] Why x is one.')],
		};
		const pre: HastNode = {
			type: 'element',
			tagName: 'pre',
			properties: {},
			children: [{ type: 'element', tagName: 'code', properties: {}, children: [line] }],
		};
		const root = await run(pre);
		const box = root.children![0];
		expect(box.tagName).toBe('div');
		expect(textOf(pre)).toBe('x = 1  # Why x is one.');
		expect(box.children!.filter((n) => n.tagName === 'aside').map(textOf)).toEqual([
			'Why x is one.',
		]);
	});
	it("links a citation's note to its source and back to its words, sharing their number", async () => {
		const a = link('https://a.com/x', 'A paper', 'cite: Ames, 2020');
		const root = await run(p(text('See '), a));
		const note = root.children![0];
		const links = (n: HastNode): HastNode[] =>
			n.tagName === 'a' ? [n] : (n.children ?? []).flatMap(links);
		expect(links(note).map((l) => l.properties!.href)).toEqual(['#mn-w-1', 'https://a.com/x']);
		expect(note.properties!.dataNote).toBe('1');
		expect(a.properties).toMatchObject({ dataNote: '1', id: 'mn-w-1' });
	});
	it('copies a footnote into the margin with its links, paired with its number in the line', async () => {
		const ref: HastNode = {
			type: 'element',
			tagName: 'a',
			properties: { href: '#user-content-fn-t', id: 'user-content-fnref-t', dataFootnoteRef: '' },
			children: [text('1')],
		};
		const sup: HastNode = { type: 'element', tagName: 'sup', properties: {}, children: [ref] };
		const def: HastNode = {
			type: 'element',
			tagName: 'li',
			properties: { id: 'user-content-fn-t' },
			children: [p(text('See '), link('https://a.com/', 'this'), text('.'))],
		};
		const list: HastNode = { type: 'element', tagName: 'ol', properties: {}, children: [def] };
		const root = await run(p(text('Text.'), sup), {
			type: 'element',
			tagName: 'section',
			properties: {},
			children: [list],
		});
		const note = root.children![0];
		expect(textOf(note)).toBe('1 See this.');
		expect(note.properties!.dataNote).toBe('fn-1');
		expect(ref.properties!.dataNote).toBe('fn-1');
	});
	it('stacks a code note under the one before it when their lines are close', async () => {
		const line = (code: string): HastNode => ({
			type: 'element',
			tagName: 'span',
			properties: { class: 'line' },
			children: [text(code)],
		});
		const pre: HastNode = {
			type: 'element',
			tagName: 'pre',
			properties: {},
			children: [
				{
					type: 'element',
					tagName: 'code',
					properties: {},
					children: [line('a = 1 # [!margin] One.'), line('b = 2 # [!margin] Two.')],
				},
			],
		};
		const root = await run(pre);
		const [first, second] = root.children![0].children!.filter((n) => n.tagName === 'aside');
		expect(first.properties!.dataNote).toBe('code-1');
		expect(String(first.properties!.style)).not.toContain('max(');
		expect(String(second.properties!.style)).toContain('anchor(--code-note-1-note bottom)');
	});
});
