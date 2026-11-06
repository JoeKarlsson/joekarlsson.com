import { describe, expect, it } from 'vitest';
import { tagAmazonLinksInHtml, withAmazonTag } from '../src/utils/affiliate';

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
