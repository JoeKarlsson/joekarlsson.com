import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import rehypePostPreviews from '../src/plugins/rehype-post-previews.mjs';
import { withoutLinkPreviews } from '../src/utils/feed-html.js';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';

const blogDir = fs.mkdtempSync(path.join(os.tmpdir(), 'post-previews-'));
fs.writeFileSync(
	path.join(blogDir, 'doom.md'),
	"---\ntitle: 'I put an MCP server inside DOOM'\ndate: 2026-10-16T14:47:57Z\nheroImage: /images/blog/recording-setup-tour/thumb-a60218b7.webp\n---\nBody",
);
fs.writeFileSync(path.join(blogDir, 'old.md'), '---\ntitle: Old post\ndate: 2015-01-02\n---\nBody');

const processor = await createMarkdownProcessor({
	syntaxHighlight: false,
	rehypePlugins: [[rehypePostPreviews, { blogDir }]],
});
const run = async (markdown: string) =>
	(await processor.render(markdown, { fileURL: new URL(`file://${blogDir}/self.md`) })).code;

describe('rehype-post-previews', () => {
	it('adds a preview card after a link to another post', async () => {
		const html = await run('[a post](/blog/doom/)');
		expect(html).toContain('interestfor="peek-1"');
		expect(html).toContain('popover="hint"');
		expect(html).toContain('<strong>I put an MCP server inside DOOM</strong>');
		expect(html).toContain('<small>Oct 16, 2026</small>');
		expect(html).toMatch(/width="\d+" height="\d+"/);
		// pretreated thumbnail: no live pink pass
		expect(html).not.toContain('data-halftone');
	});

	it('gives a post without a thumbnail the default image, drawn flat pink', async () => {
		const html = await run('[a post](/blog/old/#part-2)');
		expect(html).toContain('src="/images/og-default-pink.webp"');
		expect(html).toContain('data-halftone="flat"');
	});

	it('leaves other links plain', async () => {
		const html = await run(
			'[a](/blog/missing/) [b](/blog/self/) [c](https://example.com/blog/doom/) [d](/blog/) [![e](/x.webp)](/blog/doom/)\n\n## [f](/blog/doom/)',
		);
		expect(html).not.toContain('popover');
	});

	it('numbers each preview so ids stay unique', async () => {
		const html = await run('[a](/blog/doom/) [b](/blog/doom/)');
		expect(html).toContain('id="peek-2"');
	});

	it('is cut out of feeds', async () => {
		expect(withoutLinkPreviews(await run('[DOOM](/blog/doom/)'))).toBe(
			'<p><a href="/blog/doom/" interestfor="peek-1" aria-describedby="peek-1" style="anchor-name:--peek-1">DOOM</a></p>',
		);
	});
});
