/**
 * How a paper on /papers/ cites itself: its Chicago author-date entry and BibTeX for the
 * "Cite this" box, and the citation_* tags Google Scholar reads (scholar.google.com/intl/en/scholar/inclusion.html).
 */
interface Author {
	name: string;
	orcid?: string;
}
export interface PaperForCitation {
	title: string;
	authors: Author[];
	published: Date;
	revised: Date;
	doi?: string;
	keywords: string[];
	pdf: string;
	references: string[];
}

const lastFirst = (name: string) => {
	const parts = name.trim().split(/\s+/);
	return `${parts.at(-1)}, ${parts.slice(0, -1).join(' ')}`;
};
// UTC, as the content schema parses the dates
const ymd = (d: Date, sep: string) => d.toISOString().slice(0, 10).replaceAll('-', sep);

/** Chicago author-date: the first author inverted, the rest as written, joined with "and". */
export function chicagoCitation(paper: PaperForCitation, pageUrl: string): string {
	const names = paper.authors.map((a, i) => (i === 0 ? lastFirst(a.name) : a.name));
	const authors =
		names.length < 3
			? names.join(', and ')
			: `${names.slice(0, -1).join(', ')}, and ${names.at(-1)}`;
	const link = paper.doi ? `https://doi.org/${paper.doi}` : pageUrl;
	// Chicago puts the title's closing period inside the quotes, unless it ends in ? or !
	const title = /[.?!]$/.test(paper.title) ? paper.title : `${paper.title}.`;
	return `${authors}. ${paper.published.getUTCFullYear()}. “${title}” Preprint, joekarlsson.com. ${link}.`;
}

export function bibtex(paper: PaperForCitation, pageUrl: string, slug: string): string {
	const year = paper.published.getUTCFullYear();
	const surname = lastFirst(paper.authors[0].name).split(',')[0].toLowerCase();
	const month = paper.published
		.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })
		.toLowerCase();
	const fields: [string, string][] = [
		['author', `{${paper.authors.map((a) => lastFirst(a.name)).join(' and ')}}`],
		['title', `{${paper.title.replaceAll('–', '--')}}`],
		['year', `{${year}}`],
		['month', month],
		...(paper.doi ? ([['doi', `{${paper.doi}}`]] as [string, string][]) : []),
		['url', `{${pageUrl}}`],
		['note', '{Preprint}'],
	];
	const width = Math.max(...fields.map(([k]) => k.length));
	const body = fields.map(([k, v]) => `  ${k.padEnd(width)} = ${v}`).join(',\n');
	return `@misc{${surname}${year}${slug.split('-').at(-1)},\n${body}\n}`;
}

/** [name, content] pairs for <meta name=... content=...>, in the order Scholar documents them. */
export function scholarMeta(
	paper: PaperForCitation,
	pageUrl: string,
	site: string | URL,
): [string, string][] {
	return [
		['citation_title', paper.title],
		...paper.authors.flatMap((a): [string, string][] => [
			['citation_author', lastFirst(a.name)],
			...(a.orcid ? ([['citation_author_orcid', a.orcid]] as [string, string][]) : []),
		]),
		['citation_publication_date', ymd(paper.published, '/')],
		['citation_online_date', ymd(paper.published, '/')],
		['citation_pdf_url', new URL(paper.pdf, site).href],
		['citation_abstract_html_url', pageUrl],
		...(paper.doi ? ([['citation_doi', paper.doi]] as [string, string][]) : []),
		['citation_language', 'en'],
		['citation_keywords', paper.keywords.join('; ')],
		...paper.references.map((r): [string, string] => ['citation_reference', r]),
	];
}
