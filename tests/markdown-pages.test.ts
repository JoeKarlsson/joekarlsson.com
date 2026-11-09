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
