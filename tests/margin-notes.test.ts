import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { describe, expect, it } from 'vitest';
import rehypeMarginNotes from '../src/plugins/rehype-margin-notes.mjs';

const render = (markdown: string) =>
	String(
		unified()
			.use(remarkParse)
			.use(remarkRehype)
			.use(rehypeMarginNotes)
			.use(rehypeStringify)
			.processSync(markdown),
	);

describe('rehypeMarginNotes', () => {
	it('turns a cite: link into a numbered source note, keeping the link its own words', () => {
		const html = render(
			'Nolan Lawson wrote [We mourn our craft](https://nolanlawson.com/x/ "cite: Lawson, February 2026"), and more.',
		);
		expect(html).toContain(
			'<a href="https://nolanlawson.com/x/">We mourn our craft</a><sup class="cite-num" aria-hidden="true">1</sup>',
		);
		expect(html).toContain('<b>1 </b>Lawson, February 2026. We mourn our craft. nolanlawson.com');
		expect(html).not.toContain('title=');
	});
	it('gives a source cited twice its first number and one note', () => {
		const html = render(
			'[A](https://a.com/x "cite: Ames, 2020") and [B](https://b.com/ "cite: Bo, 2021").\n\nAgain [A](https://a.com/x "cite: Ames, 2020").',
		);
		expect(html.match(/class="margin-note"/g)).toHaveLength(2);
		expect(html).toContain(
			'Again <a href="https://a.com/x">A</a><sup class="cite-num" aria-hidden="true">1</sup>',
		);
	});
	it('notes every source in a paragraph with several', () => {
		const html = render(
			'[A](https://a.com/ "cite: A, 2020"), [B](https://b.com/ "cite: B, 2020") and [C](https://c.com/ "cite: C, 2020").',
		);
		expect(html.match(/class="margin-note"/g)).toHaveLength(3);
		expect(html).not.toContain('title=');
	});
	it('leaves a plain outside link alone', () => {
		const html = render('See [the docs](https://example.com/docs).');
		expect(html).not.toContain('margin-note');
		expect(html).not.toContain('cite-num');
	});
});
