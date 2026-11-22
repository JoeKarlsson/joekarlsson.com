import { describe, expect, it } from 'vitest';
import { bibtex, chicagoCitation, scholarMeta } from '../src/utils/paper-citation';

const paper = {
	title: 'How Much of the Decline Is Punctuation? Evidence from Books, 1600–1974',
	authors: [{ name: 'Joe Karlsson' }],
	published: new Date('2026-11-22'),
	revised: new Date('2026-12-01'),
	keywords: ['sentence length', 'semicolon'],
	pdf: '/papers/x/x.pdf',
	references: ['Lewis, Edwin Herbert. 1894. The History of the English Paragraph.'],
};
const url = 'https://www.joekarlsson.com/papers/sentence-length-punctuation/';

describe('chicagoCitation', () => {
	it('inverts the first author and closes the title inside the quotes', () => {
		expect(chicagoCitation(paper, url)).toBe(
			'Karlsson, Joe. 2026. “How Much of the Decline Is Punctuation? Evidence from Books, 1600–1974.” Preprint, joekarlsson.com. https://www.joekarlsson.com/papers/sentence-length-punctuation/.',
		);
	});
	it('links the DOI once there is one, and joins a second author with "and"', () => {
		const two = {
			...paper,
			doi: '10.5281/zenodo.1',
			authors: [...paper.authors, { name: 'Ada Lovelace' }],
		};
		expect(chicagoCitation(two, url)).toMatch(
			/^Karlsson, Joe, and Ada Lovelace\. 2026\. .* https:\/\/doi\.org\/10\.5281\/zenodo\.1\.$/,
		);
	});
});

describe('bibtex', () => {
	it('keys the entry by surname, year and slug, and writes the en dash as --', () => {
		const entry = bibtex(paper, url, 'sentence-length-punctuation');
		expect(entry).toMatch(/^@misc\{karlsson2026punctuation,\n/);
		expect(entry).toContain('author = {Karlsson, Joe}');
		expect(entry).toContain('1600--1974}');
		expect(entry).toContain('month  = nov');
		expect(entry).not.toContain('doi');
	});
});

describe('scholarMeta', () => {
	it('gives Scholar slash dates, an absolute PDF URL and one tag per reference', () => {
		const tags = scholarMeta(paper, url, 'https://www.joekarlsson.com');
		expect(tags).toContainEqual(['citation_author', 'Karlsson, Joe']);
		expect(tags).toContainEqual(['citation_publication_date', '2026/11/22']);
		expect(tags).toContainEqual(['citation_online_date', '2026/11/22']);
		expect(tags).toContainEqual(['citation_pdf_url', 'https://www.joekarlsson.com/papers/x/x.pdf']);
		expect(tags.filter(([n]) => n === 'citation_reference')).toHaveLength(1);
		expect(tags.some(([n]) => n === 'citation_doi')).toBe(false);
	});
});

describe('rehypePaperCitations', () => {
	it("heads a source's first citation's note with its link, without repeating that link in the entry", async () => {
		const { fromHtml } = await import('hast-util-from-html');
		const { toHtml } = await import('hast-util-to-html');
		const { default: rehypePaperCitations } =
			await import('../src/plugins/rehype-paper-citations.mjs');
		const tree = fromHtml(
			'<p>As shown <span class="citation">(<a href="#ref-A1" role="doc-biblioref">Ames 1990</a>)</span>.</p>' +
				'<div id="refs"><div id="ref-A1" class="csl-entry">Ames, Al. 1990. <em>Book</em>. Press. <a href="https://doi.org/10.1/x">https://doi.org/10.1/x</a>.</div></div>',
			{ fragment: true },
		);
		rehypePaperCitations()(tree);
		const note = toHtml(tree.children[0]);
		expect(note).toContain('<a href="https://doi.org/10.1/x" tabindex="-1">Ames 1990</a>');
		expect(note).toContain('Press.</aside>');
		expect(note.match(/doi\.org/g)).toHaveLength(1);
	});
});
