import { describe, expect, it } from 'vitest';
import { isExternalHref, openExternalLinksInNewTab } from '../src/integrations/external-links.mjs';

describe('isExternalHref', () => {
	it('treats other hosts as external and this site as internal', () => {
		expect(isExternalHref('https://www.amazon.com/dp/B07HB8LNSY')).toBe(true);
		expect(isExternalHref('//example.com/x')).toBe(true);
		expect(isExternalHref('https://docs.joekarlsson.com/')).toBe(true);
		expect(isExternalHref('https://www.joekarlsson.com/blog/')).toBe(false);
		expect(isExternalHref('https://joekarlsson.com/uses')).toBe(false);
		expect(isExternalHref('/uses')).toBe(false);
		expect(isExternalHref('#faq')).toBe(false);
		expect(isExternalHref('mailto:hi@example.com')).toBe(false);
	});
});

describe('openExternalLinksInNewTab', () => {
	it('adds target and rel to an external link', () => {
		expect(openExternalLinksInNewTab('<a href="https://ifixit.com">x</a>')).toBe(
			'<a rel="noopener" target="_blank" href="https://ifixit.com">x</a>',
		);
	});

	it('keeps an existing rel and replaces an existing target', () => {
		expect(
			openExternalLinksInNewTab(
				'<a href="https://amazon.com/dp/1" rel="sponsored" target="_self">x</a>',
			),
		).toBe('<a href="https://amazon.com/dp/1" rel="sponsored noopener" target="_blank">x</a>');
	});

	it('leaves internal links and script blocks alone', () => {
		const html =
			'<a href="/blog/">b</a><script>el.innerHTML = \'<a href="https://x.com">\'</script>';
		expect(openExternalLinksInNewTab(html)).toBe(html);
	});
});
