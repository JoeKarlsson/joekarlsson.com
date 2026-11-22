/**
 * How a reference post or talk write-up cites itself, for its "Cite this" box (DECISIONS.md
 * 2026-11-22, option B). A repost of something Joe wrote for an employer names the original
 * publisher and date, then gives the joekarlsson.com URL, so the citation keeps working after
 * the original page dies (MongoDB's Developer Center did).
 */

// Where each employer published Joe's posts
const OUTLETS: Record<string, string> = {
	CData: 'CData Blog',
	CloudQuery: 'CloudQuery Blog',
	MongoDB: 'MongoDB Developer Center',
	SingleStore: 'SingleStore Blog',
	Tinybird: 'Tinybird Blog',
};

export interface PostForCitation {
	title: string;
	date: Date;
	// Where it first ran; none for a post that first ran on joekarlsson.com
	outlet?: string;
}

const longDate = (d: Date) =>
	d.toLocaleDateString('en-US', {
		month: 'long',
		day: 'numeric',
		year: 'numeric',
		timeZone: 'UTC',
	});

/** The outlet an employer published Joe's posts in. */
export function outletFor(writtenFor: string): string {
	const outlet = OUTLETS[writtenFor];
	if (!outlet) throw new Error(`No outlet for writtenFor "${writtenFor}" in post-citation.ts`);
	return outlet;
}

/** Chicago author-date for a blog post (17th ed., 15.51). */
export function chicagoPost(post: PostForCitation, pageUrl: string): string {
	const title = /[.?!]$/.test(post.title) ? post.title : `${post.title}.`;
	const { outlet } = post;
	const where = outlet
		? `${outlet}, ${longDate(post.date)}. Reposted at ${pageUrl}.`
		: `Joe Karlsson (blog), ${longDate(post.date)}. ${pageUrl}.`;
	return `Karlsson, Joe. ${post.date.getUTCFullYear()}. “${title}” ${where}`;
}

export function bibtexPost(post: PostForCitation, pageUrl: string, slug: string): string {
	const year = post.date.getUTCFullYear();
	const month = post.date
		.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })
		.toLowerCase();
	const { outlet } = post;
	const fields: [string, string][] = [
		['author', '{Karlsson, Joe}'],
		['title', `{${post.title.replaceAll('–', '--')}}`],
		['year', `{${year}}`],
		['month', month],
		['howpublished', `{${outlet ?? 'joekarlsson.com'}}`],
		['url', `{${pageUrl}}`],
		...(outlet ? ([['note', '{Reposted on joekarlsson.com}']] as [string, string][]) : []),
	];
	const width = Math.max(...fields.map(([k]) => k.length));
	const body = fields.map(([k, v]) => `  ${k.padEnd(width)} = ${v}`).join(',\n');
	// The slug's longest word names the post best: karlsson2023recommendation, not karlsson2023what
	const key = slug.split('-').reduce((a, b) => (b.length > a.length ? b : a));
	return `@misc{karlsson${year}${key},\n${body}\n}`;
}
