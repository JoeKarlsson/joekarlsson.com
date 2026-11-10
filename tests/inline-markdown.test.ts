import { describe, expect, it } from 'vitest';
import { inlineMarkdown } from '../src/utils/inline-markdown';

describe('inlineMarkdown', () => {
	it('escapes HTML', () => {
		expect(inlineMarkdown('a <b> & "c"')).toBe('a &lt;b&gt; &amp; &quot;c&quot;');
	});

	it('renders code spans and links', () => {
		const html = inlineMarkdown(
			'With `--claude-plays`, see the [Doom MCP server](/blog/doom-mcp-server/).',
		);
		expect(html).toContain('<code>--claude-plays</code>');
		expect(html).toMatch(
			/<a href="\/blog\/doom-mcp-server\/" class="[^"]+">Doom MCP server<\/a>\.$/,
		);
	});

	it('leaves brackets that are not links alone', () => {
		expect(inlineMarkdown('[draft] (soon)')).toBe('[draft] (soon)');
	});

	// Security audit run-1: only http(s), root-relative and #fragment links become anchors
	it('leaves script-scheme and protocol-relative links as plain text', () => {
		for (const href of [
			'javascript:alert(1)',
			'JavaScript:x',
			'data:text/html,x',
			'//evil.example/x',
		]) {
			expect(inlineMarkdown(`[x](${href})`)).not.toContain('<a ');
		}
		expect(inlineMarkdown('[x](https://a.example/) [y](#top)')).toMatch(
			/<a href="https:\/\/a\.example\/".*<a href="#top"/,
		);
	});
});
