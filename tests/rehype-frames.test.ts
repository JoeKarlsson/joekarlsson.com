import { fromHtml } from 'hast-util-from-html';
import { toHtml } from 'hast-util-to-html';
import { describe, expect, it } from 'vitest';
import rehypeFrames, { PAIR_SIZES } from '../src/plugins/rehype-frames.mjs';

const run = (html: string) => {
	const tree = fromHtml(html, { fragment: true });
	(rehypeFrames() as (t: unknown) => void)(tree);
	return toHtml(tree);
};

describe('rehype-frames', () => {
	it('turns two pictures into a labeled pair, columns sized to share a height, and takes the italic line as its caption', () => {
		const html = run(
			'<p><img src="/a.webp" alt="A" title="The Devils · 1971" width="1259" height="536"> <img src="/b.webp" alt="B" width="1280" height="536"></p>\n<p><em>Two convents.</em></p>\n<p>Next.</p>',
		);
		expect(html).toBe(
			`<figure class="frame-pair"><div class="frame-pair-grid" style="--pair-columns: 2.349fr 2.388fr"><div class="frame-pair-cell"><img src="/a.webp" alt="A" width="1259" height="536" sizes="${PAIR_SIZES}"><span class="frame-label">The Devils · 1971</span></div><div class="frame-pair-cell"><img src="/b.webp" alt="B" width="1280" height="536" sizes="${PAIR_SIZES}"></div></div><figcaption class="frame-caption">Two convents.</figcaption></figure>\n<p>Next.</p>`,
		);
	});

	it('gives one captioned picture a figure, and leaves an uncaptioned one alone', () => {
		expect(run('<p><img src="/a.webp" alt="A"></p><p><em>Cap</em></p>')).toBe(
			'<figure class="frame"><img src="/a.webp" alt="A"><figcaption class="frame-caption">Cap</figcaption></figure>',
		);
		expect(run('<p><img src="/a.webp" alt="A"></p><p>Text <em>not</em> a caption</p>')).toBe(
			'<p><img src="/a.webp" alt="A"></p><p>Text <em>not</em> a caption</p>',
		);
	});

	it('takes an italic line written right under the pictures in the same paragraph', () => {
		expect(
			run('<p><img src="/a.webp" alt="A"> <img src="/b.webp" alt="B">\n<em>Cap</em></p>'),
		).toMatch(/<\/div><\/div><figcaption class="frame-caption">Cap<\/figcaption><\/figure>$/);
	});

	it("puts a spoiler paragraph's button around the pictures, not the caption", () => {
		const html = run(
			'<p class="spoiler-frame" tabindex="0" role="button"><span class="sr-only">Spoiler picture: </span><img src="/a.webp" alt="A"><img src="/b.webp" alt="B"></p><p><em>Cap</em></p>',
		);
		expect(html).toMatch(
			/^<figure class="frame-pair"><div class="frame-pair-grid spoiler-frame" tabindex="0" role="button" style="--pair-columns: 1fr 1fr"><span class="sr-only">Spoiler picture: <\/span><div class="frame-pair-cell">.*<\/div><\/div><figcaption class="frame-caption">Cap<\/figcaption><\/figure>$/,
		);
	});

	it('wraps a single spoiler picture so its caption stays outside the button', () => {
		expect(
			run(
				'<p class="spoiler-frame" role="button"><span class="sr-only">Spoiler picture: </span><img src="/a.webp" alt="A"></p><p><em>Cap</em></p>',
			),
		).toBe(
			'<figure class="frame"><div class="spoiler-frame" role="button"><span class="sr-only">Spoiler picture: </span><img src="/a.webp" alt="A"></div><figcaption class="frame-caption">Cap</figcaption></figure>',
		);
	});

	it('leaves pictures mixed with text in their paragraph', () => {
		const html = '<p>See <img src="/a.webp" alt="A"> and <img src="/b.webp" alt="B"></p>';
		expect(run(html)).toBe(html);
	});
});

describe('rehype-stray-thoughts', async () => {
	const { default: rehypeStrayThoughts } = await import('../src/plugins/rehype-stray-thoughts.mjs');
	it('makes a lone "Stray thoughts:" line a heading and drops its colon, but not a sentence', () => {
		const tree = fromHtml('<p>Stray thoughts:</p><p>Stray thoughts: I had one.</p>', {
			fragment: true,
		});
		(rehypeStrayThoughts() as (t: unknown) => void)(tree);
		expect(toHtml(tree)).toBe(
			'<h2 class="stray-label">Stray thoughts</h2><p>Stray thoughts: I had one.</p>',
		);
	});
});
