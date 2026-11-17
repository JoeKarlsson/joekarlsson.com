import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import { describe, expect, it } from 'vitest';
import rehypeNoWidows from '../src/plugins/rehype-no-widows.mjs';

const processor = await createMarkdownProcessor({
	syntaxHighlight: false,
	rehypePlugins: [rehypeNoWidows],
});
const NBSP = ' ';
const render = async (markdown: string) => (await processor.render(markdown)).code;

describe('rehype-no-widows', () => {
	it('joins a short last word to the one before it', async () => {
		expect(await render('It got cheaper.')).toBe(`<p>It got${NBSP}cheaper.</p>`);
		expect(await render('It got\ncheaper.')).toBe(`<p>It got${NBSP}cheaper.</p>`);
		// 10 letters plus the period: punctuation doesn't count toward a long word
		expect(await render('A better experience.')).toBe(`<p>A better${NBSP}experience.</p>`);
	});

	it('reaches the last text inside a link, and leaves long words and code alone', async () => {
		expect(await render('See [the docs](/d)')).toBe(`<p>See <a href="/d">the${NBSP}docs</a></p>`);
		expect(await render('Not extraordinarily')).toBe('<p>Not extraordinarily</p>');
		expect(await render('Run `npm run build`')).toBe('<p>Run <code>npm run build</code></p>');
	});

	it("does a list item's own text and its nested list's separately", async () => {
		expect((await render('- One two\n  - three four')).replace(/\n/g, '')).toBe(
			`<ul><li>One${NBSP}two<ul><li>three${NBSP}four</li></ul></li></ul>`,
		);
	});

	it('holds a closing " - word" together, and joins table cells', async () => {
		expect(await render('So what - why?')).toBe(`<p>So what${NBSP}-\u2060${NBSP}why?</p>`);
		expect(await render('| A |\n| - |\n| one two |')).toContain(`<td>one${NBSP}two</td>`);
	});

	it('reaches back into a link that only punctuation follows', async () => {
		expect(await render('A photo (via [Wikimedia Commons](/c)).')).toBe(
			`<p>A photo (via <a href="/c">Wikimedia${NBSP}Commons</a>).</p>`,
		);
		expect(await render('The code is on my [GitHub](/g).')).toBe(
			`<p>The code is on my${NBSP}<a href="/g">GitHub</a>.</p>`,
		);
	});

	it('holds a hyphenated last word together', async () => {
		// A nowrap span, not a U+2060 joiner, so copied text stays clean
		expect(await render('It runs every re-render.')).toBe(
			`<p>It runs every${NBSP}<span class="whitespace-nowrap">re-render.</span></p>`,
		);
		expect(await render('Get [vscode-icons](/v).')).toBe(
			`<p>Get${NBSP}<a href="/v"><span class="whitespace-nowrap">vscode-icons</span></a>.</p>`,
		);
	});

	it('joins a lone last word to the code before it', async () => {
		expect(await render('Delete the `*** END` lines.')).toBe(
			`<p>Delete the <code>*** END</code>${NBSP}lines.</p>`,
		);
	});
});
