import { describe, expect, it } from 'vitest';
import { toMarkdown, unsafeMarkdown } from '../scripts/cdata-markdown.mjs';

const ORIGIN = 'https://www.cdata.com';
const md = (html: string) => toMarkdown(html, ORIGIN);

// Security audit run-1: scraped cdata.com HTML reached built pages as live HTML
// through four paths. Each stays text, or the import fails.
describe('toMarkdown keeps scraped content inert', () => {
	it('keeps escaped tags in prose as text', () => {
		const out = md('<p>Use &lt;img src=x onerror=alert(1)&gt; here &amp;copy; ok</p>');
		expect(out).toContain('&lt;img src=x onerror=alert(1)>');
		expect(out).toContain('&amp;copy;');
		expect(unsafeMarkdown(out)).toEqual([]);
	});

	it('turns header-less and row-header tables into markdown tables without handlers', () => {
		const out = md(
			'<table><tbody><tr><td>a</td><td>b</td></tr><tr><th onmouseover="alert(2)">c</th><td><img src="https://x/y.png" onerror="alert(3)"></td></tr></tbody></table>',
		);
		expect(out).toMatch(/^\| a \| b \|$/m);
		expect(out).not.toMatch(/<table|onmouseover|onerror/i);
	});

	it('drops script-scheme link targets and keeps the text', () => {
		const out = md(
			'<p><a href="javascript:alert(4)">click</a> and <a href=" JaVaScRiPt:x">two</a> <a href="/blog/x">rel</a></p>',
		);
		expect(out).toContain('click and two');
		expect(out).not.toMatch(/javascript:/i);
		expect(out).toContain(`[rel](${ORIGIN}/blog/x)`);
	});

	it('fences code longer than any backtick run inside it', () => {
		const out = md('<pre><code>a\n```\n&lt;svg onload=alert(5)&gt;\n```</code></pre>');
		expect(out).toMatch(/^````\n/m);
		expect(unsafeMarkdown(out)).toEqual([]);
	});

	it('flags raw HTML and unsafe links outside code', () => {
		expect(unsafeMarkdown('hi <img src=x onerror=1>')).toHaveLength(1);
		expect(unsafeMarkdown('[x](javascript:alert(1))')).toHaveLength(1);
		expect(unsafeMarkdown('`<b>` and\n\n```\n<script>\n```\n<!-- vale X = NO -->')).toEqual([]);
	});
});
