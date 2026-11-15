/** The section name that runs up a page's left edge like a book spine (art book round 2, pick 10A). */
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

export function spineFor(pathname: string): { label: string } {
	const segment = pathname.split('/')[1] ?? '';
	return { label: SECTIONS.find(([s]) => s === segment)?.[1] ?? 'Joe Karlsson' };
}
