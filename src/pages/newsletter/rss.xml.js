import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { NEWSLETTER } from '../../consts';

// The newsletter for feed readers: every issue, newest first, with the full text so a
// reader never has to click through (the TL;DR in Tech back issues included).
export async function GET(context) {
	const issues = await getCollection('newsletter');
	return rss({
		stylesheet: '/rss-style.xsl',
		title: `${NEWSLETTER.name} by Joe Karlsson`,
		description:
			"Joe Karlsson's newsletter: thoughts and reactions on tech writing, AI, homelab builds and open source.",
		site: context.site,
		xmlns: { atom: 'http://www.w3.org/2005/Atom' },
		customData: `<atom:link href="${new URL('newsletter/rss.xml', context.site)}" rel="self" type="application/rss+xml"/>`,
		items: issues
			.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
			.map((issue) => ({
				title: issue.data.title,
				pubDate: issue.data.date,
				description: issue.data.description || issue.data.title,
				link: `/newsletter/${issue.data.slug}/`,
				content: issue.rendered?.html,
			})),
	});
}
