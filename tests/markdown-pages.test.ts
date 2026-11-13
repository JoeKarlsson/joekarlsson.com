import { describe, expect, it } from 'vitest';
import { pageToMarkdown } from '../src/integrations/markdown-pages.mjs';

const page = (body: string) =>
	`<!doctype html><html><head><title>T</title></head><body><main>${body}</main></body></html>`;

describe('pageToMarkdown tables', () => {
	it('escapes pipes and backslashes in cells so the columns stay intact', () => {
		const md = pageToMarkdown(
			page('<table><tr><th>Key</th><th>Value</th></tr><tr><td>a|b</td><td>c\\|d</td></tr></table>'),
			'https://joekarlsson.com/t/',
		);
		expect(md).toContain('| Key | Value |');
		expect(md).toContain('| a\\|b | c\\\\\\|d |');
	});
});

describe('pageToMarkdown phone copies', () => {
	it('drops a short phone version and keeps the full text it shortens', () => {
		const md = pageToMarkdown(
			page(
				'<div class="md:hidden" data-phone-copy><p>Short.</p></div><div><p>The full text.</p></div>',
			),
			'https://joekarlsson.com/t/',
		);
		expect(md).not.toContain('Short.');
		expect(md).toContain('The full text.');
	});
});

describe('pageToMarkdown metadata lines', () => {
	it('puts a bar between the pieces the page separates with CSS', () => {
		const md = pageToMarkdown(
			page(
				'<p class="meta-parts"><time>Nov 10, 2026</time> <span>22 min read</span> <a href="/blog/category/web-dev/">Web Dev</a></p>',
			),
			'https://joekarlsson.com/t/',
		);
		expect(md).toContain(
			'Nov 10, 2026 | 22 min read | [Web Dev](https://joekarlsson.com/blog/category/web-dev/)',
		);
	});
});
