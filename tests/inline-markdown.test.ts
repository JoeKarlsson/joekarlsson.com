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
});
