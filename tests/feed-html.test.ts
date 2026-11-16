import { describe, expect, it } from 'vitest';
import { withoutMarginCopies } from '../src/utils/feed-html';

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
