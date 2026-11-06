import { describe, expect, it } from 'vitest';
import { tagAmazonLinksInHtml, withAmazonTag } from '../src/utils/affiliate';
import rehypeAmazonAffiliate from '../src/plugins/rehype-amazon-affiliate.mjs';

describe('withAmazonTag', () => {
	it('adds the tag to amazon.com links, keeping existing params', () => {
		expect(withAmazonTag('https://www.amazon.com/dp/B0DSVVJXK5')).toBe(
			'https://www.amazon.com/dp/B0DSVVJXK5?tag=joekarlsson13-20',
		);
		expect(withAmazonTag('https://www.amazon.com/dp/X?th=1')).toBe(
			'https://www.amazon.com/dp/X?th=1&tag=joekarlsson13-20',
		);
	});

	it('leaves other sites alone', () => {
		expect(withAmazonTag('https://www.apple.com/macbook-pro/')).toBe(
			'https://www.apple.com/macbook-pro/',
		);
		expect(withAmazonTag('https://notamazon.com/dp/X')).toBe('https://notamazon.com/dp/X');
	});
});

describe('tagAmazonLinksInHtml', () => {
	it('tags amazon anchors and marks them sponsored, skipping the rest', () => {
		const html =
			'<a href="https://www.amazon.com/dp/B07K3FN5MR" target="_blank" rel="noopener noreferrer">Cam Link</a> and <a href="https://elgato.com/" rel="noopener">Elgato</a>';
		expect(tagAmazonLinksInHtml(html)).toBe(
			'<a href="https://www.amazon.com/dp/B07K3FN5MR?tag=joekarlsson13-20" target="_blank" rel="sponsored noopener noreferrer">Cam Link</a> and <a href="https://elgato.com/" rel="noopener">Elgato</a>',
		);
	});
});

describe('rehypeAmazonAffiliate', () => {
	const link = (href: string) => ({
		type: 'element',
		tagName: 'a',
		properties: { href } as Record<string, unknown>,
		children: [],
	});
	const run = (node: ReturnType<typeof link>, path: string) =>
		rehypeAmazonAffiliate()({ type: 'root', children: [node] }, { path });

	it('tags amazon links in blog posts, upgrading http, and marks them sponsored', () => {
		const amazon = link('http://www.amazon.com/dp/0465026567');
		run(amazon, '/site/src/content/blog/post.md');
		expect(amazon.properties).toEqual({
			href: 'https://www.amazon.com/dp/0465026567?tag=joekarlsson13-20',
			rel: ['sponsored'],
		});
	});

	it('leaves other links and newsletter issues (sent as email) alone', () => {
		const other = link('https://example.com/');
		run(other, '/site/src/content/blog/post.md');
		expect(other.properties).toEqual({ href: 'https://example.com/' });

		const issueLink = link('https://www.amazon.com/dp/X');
		run(issueLink, '/site/src/content/newsletter/issue.md');
		expect(issueLink.properties.href).toBe('https://www.amazon.com/dp/X');
	});
});
