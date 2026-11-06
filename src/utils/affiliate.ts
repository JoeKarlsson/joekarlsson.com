// Amazon Associates: amazon.com links on /uses and in blog posts carry this tracking ID
// and rel="sponsored" (rehype-amazon-affiliate.mjs does the posts). Amazon requires the
// disclosure wherever they appear. Newsletter issues are left out: they go out as email,
// and Amazon bans affiliate links in email.
import nowFeed from '../data/now-feed.json';

export const AMAZON_ASSOCIATES_TAG = 'joekarlsson13-20';
export const AMAZON_DISCLOSURE = `Fair warning: the Amazon links on this page are affiliate links. They're still my genuine recommendations, stuff I actually use and would push on a friend. If you want to help me out, buying through one costs you nothing extra and goes toward this site, my writing, and the power bill for the ${nowFeed.homelab.runningContainers} containers humming in my homelab, which my electric company enjoys more than I do. The legally required version: as an Amazon Associate I earn from qualifying purchases.`;

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
