import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Pages are served at /path/; a link to /path costs every visitor and crawler a 308
// redirect first. Files (/images/x.webp, /rss.xml) and anchors are fine as they are.
const CONTENT = new URL('../src/content/', import.meta.url);

const slashlessLinks = (md: string) =>
	[...md.matchAll(/\]\((\/[^)\s#?]*)[#?)\s]/g)]
		.map((m) => m[1])
		.filter((path) => !path.endsWith('/') && !/\.[a-z0-9]+$/i.test(path));

describe('internal links', () => {
	it('finds a link without its trailing slash', () => {
		expect(slashlessLinks('see [uses](/uses) and [a](/blog/a/) and ![x](/images/x.webp)')).toEqual([
			'/uses',
		]);
	});

	it('every internal Markdown link ends in a slash', () => {
		const found = readdirSync(CONTENT, { recursive: true, encoding: 'utf8' })
			.filter((f) => /\.mdx?$/.test(f))
			.flatMap((f) =>
				slashlessLinks(readFileSync(new URL(f, CONTENT), 'utf8')).map((l) => `${f}: ${l}`),
			);
		expect(found).toEqual([]);
	});
});
