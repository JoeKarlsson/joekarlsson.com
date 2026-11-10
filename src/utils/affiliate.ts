// Amazon Associates: amazon.com links on /uses and in blog posts carry this tracking ID
// and rel="sponsored" (rehype-amazon-affiliate.mjs does the posts). Amazon requires the
// disclosure wherever they appear. Newsletter issues are left out: they go out as email,
// and Amazon bans affiliate links in email.
import nowFeed from '../data/now-feed.json';

export const AMAZON_ASSOCIATES_TAG = 'joekarlsson13-20';
export const AMAZON_DISCLOSURE = `Amazon links here are affiliate links. Buying through one helps pay the power bill for my ${nowFeed.homelab.runningContainers}-container homelab. As an Amazon Associate I earn from qualifying purchases.`;

const AMAZON_URL = /^https?:\/\/(www\.)?amazon\.com\//;

export const isAmazonUrl = (url: string) => AMAZON_URL.test(url);

/** True when markdown or HTML text links to amazon.com anywhere. */
export const hasAmazonLink = (text: string) => /https?:\/\/(www\.)?amazon\.com\//.test(text);

/** Adds the Associates tag (and https) to an amazon.com URL; any other URL comes back unchanged. */
export function withAmazonTag(url: string): string {
	if (!isAmazonUrl(url)) return url;
	const tagged = new URL(url);
	tagged.protocol = 'https:';
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
