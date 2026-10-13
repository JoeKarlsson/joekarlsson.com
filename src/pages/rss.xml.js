import rss from '@astrojs/rss';
import { getFeedPosts } from '../utils/posts';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';

export async function GET(context) {
	const posts = await getFeedPosts();
	return rss({
		stylesheet: '/rss-style.xsl',
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		xmlns: { atom: 'http://www.w3.org/2005/Atom' },
		customData: `<atom:link href="${new URL('rss.xml', context.site)}" rel="self" type="application/rss+xml"/>`,
		items: posts.map((post) => ({
			title: post.data.title,
			pubDate: post.data.date,
			description: post.data.description,
			link: post.href,
		})),
	});
}
