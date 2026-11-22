// /featured/'s JSON-LD: an ItemList of everything on the page, as the CollectionPage's
// mainEntity, so search engines and AI crawlers can read who cites and covers Joe's work as
// structured data. The lead story is in it once, as its Press row. Papers are ScholarlyArticles; everything else is a plain CreativeWork,
// because the specific types (Course, DiscussionForumPosting, NewsArticle) come with Google
// rich-result requirements these third-party pages can't meet from here.
import { SITE_URL } from '../consts';
import { coverage, papers } from '../data/coverage';

const JOE = { '@id': `${SITE_URL}/#/schema/person` };

export function featuredItemList() {
	const items = [
		...papers.map((paper) => ({
			'@type': 'ScholarlyArticle',
			name: paper.title,
			url: paper.url,
			datePublished: String(paper.year),
			description: `${paper.venue} ${paper.year}. Cites ${paper.cites}.`,
			mentions: JOE,
		})),
		...coverage.map((entry) => ({
			'@type': 'CreativeWork',
			name: entry.title,
			url: entry.url,
			publisher: { '@type': 'Organization', name: entry.outlet },
			...(entry.date ? { datePublished: entry.date } : {}),
			mentions: JOE,
		})),
	];
	return {
		'@type': 'ItemList',
		numberOfItems: items.length,
		itemListElement: items.map((item, i) => ({ '@type': 'ListItem', position: i + 1, item })),
	};
}
