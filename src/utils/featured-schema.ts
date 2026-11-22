// /featured/'s JSON-LD: an ItemList of everything on the page, as the CollectionPage's
// mainEntity, so search engines and AI crawlers can read who cites and covers Joe's work as
// structured data. The lead story is in it once, as its Press row. Papers are ScholarlyArticles; everything else is a plain CreativeWork,
// because the specific types (Course, DiscussionForumPosting, NewsArticle) come with Google
// rich-result requirements these third-party pages can't meet from here.
import { SITE_URL } from '../consts';
import { type Coverage, coverage, papersNewestFirst } from '../data/coverage';

const JOE = { '@id': `${SITE_URL}/#/schema/person` };

// Press, newsletters, courses and forums are organizations; a write-up's outlet is the person
// who wrote it; a repo's outlet is just its owner, so it's left out
function whoMadeIt({ kind, outlet }: Coverage) {
	if (kind === 'writeup') return { author: { '@type': 'Person', name: outlet } };
	if (kind === 'code' || kind === 'reuse') return {};
	return { publisher: { '@type': 'Organization', name: outlet } };
}

export function featuredItemList() {
	const items = [
		...papersNewestFirst.map((paper) => ({
			'@type': 'ScholarlyArticle',
			name: paper.title,
			url: paper.url,
			datePublished: String(paper.year),
			// The data says "my"; a crawler needs the name
			description: `${paper.venue} ${paper.year}. Cites ${paper.cites.replace(/\bmy\b/g, 'Joe Karlsson’s')}.`,
			mentions: JOE,
		})),
		...coverage.map((entry) => ({
			'@type': 'CreativeWork',
			name: entry.title,
			url: entry.url,
			...whoMadeIt(entry),
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
