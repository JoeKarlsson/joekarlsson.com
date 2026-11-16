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
});
