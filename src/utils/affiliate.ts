// Amazon Associates: every amazon.com link on /uses carries this tracking ID and
// rel="sponsored". Amazon requires the disclosure line wherever these links appear.
export const AMAZON_ASSOCIATES_TAG = 'joekarlsson13-20';
export const AMAZON_DISCLOSURE = 'As an Amazon Associate I earn from qualifying purchases.';

export const isAmazonUrl = (url: string) => /^https:\/\/(www\.)?amazon\.com\//.test(url);

/** Adds the Associates tag to an amazon.com URL; any other URL comes back unchanged. */
export function withAmazonTag(url: string): string {
	if (!isAmazonUrl(url)) return url;
	const tagged = new URL(url);
	tagged.searchParams.set('tag', AMAZON_ASSOCIATES_TAG);
	return tagged.toString();
}

/** Tags every amazon.com <a> in a trusted HTML string and marks it rel="sponsored". */
export function tagAmazonLinksInHtml(html: string): string {
	return html.replace(/<a\s[^>]*>/g, (anchor) => {
		const href = anchor.match(/href="([^"]*)"/)?.[1];
		if (!href || !isAmazonUrl(href)) return anchor;
		const withHref = anchor.replace(`href="${href}"`, `href="${withAmazonTag(href)}"`);
		return /rel="/.test(withHref)
			? withHref.replace(/rel="([^"]*)"/, 'rel="sponsored $1"')
			: withHref.replace(/^<a/, '<a rel="sponsored"');
	});
}
