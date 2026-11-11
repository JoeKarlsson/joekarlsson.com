import rss from '@astrojs/rss';
import { diagramsAsImages, postersForFeeds } from '../utils/feed-html';
import { getFeedPosts } from '../utils/posts';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';

// The newest posts carry their full text so feed readers can show them without a click.
// Older items keep only the description to hold the feed to a reasonable size.
const FULL_CONTENT_ITEMS = 20;

// Feed readers resolve relative URLs inconsistently, so make root-relative ones absolute
function absolutizeUrls(html, site) {
	return html.replace(/\b(src|href|poster)="\/(?!\/)/g, `$1="${new URL('/', site).href}`);
}

export async function GET(context) {
	const posts = await getFeedPosts();
	return rss({
		stylesheet: '/rss-style.xsl',
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		xmlns: { atom: 'http://www.w3.org/2005/Atom' },
		customData: `<atom:link href="${new URL('rss.xml', context.site)}" rel="self" type="application/rss+xml"/>`,
		items: posts.map((post, i) => ({
			title: post.data.title,
			pubDate: post.data.date,
			description: post.data.description,
			link: post.href,
			content:
				i < FULL_CONTENT_ITEMS && post.html
					? absolutizeUrls(postersForFeeds(diagramsAsImages(post.html)), context.site)
					: undefined,
		})),
	});
}
