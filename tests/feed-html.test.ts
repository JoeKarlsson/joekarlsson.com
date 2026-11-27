import { describe, expect, it } from 'vitest';
import { withoutMarginCopies, withoutPageOnlyParts } from '../src/utils/feed-html';

describe('withoutMarginCopies', () => {
	it('drops margin and code notes and leader rules, keeping the line and the code comment', () => {
		const html =
			'<aside class="margin-note" aria-hidden="true"><span class="margin-quote">“q”</span><b>2 </b>Oliver 2025.</aside><p>Text<span class="sr-only"> (“q”)</span></p>' +
			'<div class="code-noted"><pre><code><span class="line">x<span class="code-margin-comment"># why</span></span></code></pre>' +
			'<span class="code-note-rule" style="position-anchor:--code-note-1" aria-hidden="true"></span><aside class="code-note" style="position-anchor:--code-note-1" aria-hidden="true">why</aside></div>';
		expect(withoutMarginCopies(html)).toBe(
			'<p>Text<span class="sr-only"> (“q”)</span></p><div class="code-noted"><pre><code><span class="line">x<span class="code-margin-comment"># why</span></span></code></pre></div>',
		);
	});
	it("drops a front-matter note's phone copy and keeps the note itself", () => {
		const note =
			'<div role="note" class="margin-note mn-update" id="mn-5" data-note="5">Updated.</div>';
		const copy =
			'<div role="note" class="margin-note mn-update mn-narrow" id="mn-5-narrow" data-note="5">Updated.</div>';
		expect(withoutMarginCopies(`${note}<p>Text</p>${copy}`)).toBe(`${note}<p>Text</p>`);
	});
});

describe('withoutPageOnlyParts', () => {
	it('drops page-only parts and keeps the words, links and phone fallback', () => {
		const html =
			'<div class="heading-group"><h2 id="x">X</h2><a class="heading-anchor" aria-label="Link" href="#x"><span aria-hidden="true">#</span></a></div>' +
			'<div class="chapter"><span class="chapter-num" aria-hidden="true">01</span></div>' +
			'<p><span class="mn-words" data-note="1">words<svg class="hover-ring mn-ring" viewBox="0 0 520 150"><g><use href="#hover-ring-0"></use></g></svg></span><sup class="cite-num mn-num"><a href="#mn-1">1</a></sup><sup class="cite-num mn-num mn-phone"><a href="#mn-1">1</a></sup></p>' +
			'<p><a href="https://a.com/" data-note="2">A</a><sup class="cite-num" aria-hidden="true" data-note="2">2</sup></p>' +
			'<summary><h3>Q</h3><span class="faq-sign icon-swap" aria-hidden="true"><span data-icon-off="">+</span><span data-icon-on="">–</span></span></summary>' +
			'<p class="md:hidden">On a phone, <a href="https://g/">open it</a>.</p> <div class="@container max-md:hidden"> <iframe data-desktop-src="https://g/embed" title="G"></iframe> </div>';
		expect(withoutPageOnlyParts(html)).toBe(
			'<div class="heading-group"><h2 id="x">X</h2></div>' +
				'<div class="chapter"></div>' +
				'<p><span class="mn-words" data-note="1">words</span><sup class="cite-num mn-num"><a href="#mn-1">1</a></sup></p>' +
				'<p><a href="https://a.com/" data-note="2">A</a></p>' +
				'<summary><h3>Q</h3></summary>' +
				'<p class="md:hidden">On a phone, <a href="https://g/">open it</a>.</p> ',
		);
	});

	it('drops the mid-post newsletter ask, a form a feed reader can’t post', () => {
		const html =
			'<p>Before.</p><aside class="newsletter-middle" aria-label="Newsletter"><p class="newsletter-middle-row"><span>Works on My Machine</span></p><form method="post"><input type="email" name="email"><button type="submit">Subscribe</button></form><p class="newsletter-middle-fine">Free.</p></aside><h2>After</h2>';
		expect(withoutPageOnlyParts(html)).toBe('<p>Before.</p><h2>After</h2>');
	});
});
