/**
 * The section name that runs up a page's left edge like a book spine, and the page number
 * its colophon ends on (art book round 2, pick 10A). Pages run in the footer's order;
 * a post gets its own number instead (BlogPost.astro).
 */
const SECTIONS: [segment: string, label: string][] = [
	['', 'Joe Karlsson'],
	['blog', 'Writing'],
	['about', 'About'],
	['resume', 'Resume'],
	['work', 'Works'],
	['talks', 'Talks'],
	['reviews', 'Reviews'],
	['newsletter', 'Newsletter'],
	['uses', 'Uses'],
	['contact', 'Contact'],
];

export function spineFor(pathname: string): { label: string; page?: string } {
	const segment = pathname.split('/')[1] ?? '';
	const at = SECTIONS.findIndex(([s]) => s === segment);
	if (at < 0) return { label: 'Joe Karlsson' };
	return { label: SECTIONS[at][1], page: `p. ${at + 1}` };
}
