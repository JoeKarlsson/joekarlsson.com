import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import { describe, expect, it } from 'vitest';
import rehypeFrames, { PAIR_SIZES } from '../src/plugins/rehype-frames.mjs';
import rehypeSpoilers from '../src/plugins/rehype-spoilers.mjs';
import rehypeStrayThoughts from '../src/plugins/rehype-stray-thoughts.mjs';

// Markdown through the same plugin order as astro.config.mjs: spoilers, then frames
const processor = await createMarkdownProcessor({
	syntaxHighlight: false,
	rehypePlugins: [rehypeSpoilers, rehypeFrames, rehypeStrayThoughts],
});
const render = async (markdown: string) =>
	(await processor.render(markdown)).code.replace(/>\s+</g, '><');

describe('rehype-frames', () => {
	it('turns two pictures into a labeled pair and takes the italic line as its caption', async () => {
		const html = await render(
			'![A](/a.webp "The Devils · 1971") ![B](/b.webp)\n\n_Two convents._\n\nNext.',
		);
		expect(html).toBe(
			`<figure class="frame-pair"><div class="frame-pair-grid"><div class="frame-pair-cell"><img src="/a.webp" alt="A" sizes="${PAIR_SIZES}"><span class="frame-label">The Devils · 1971</span></div><div class="frame-pair-cell"><img src="/b.webp" alt="B" sizes="${PAIR_SIZES}"></div></div><figcaption class="frame-caption">Two convents.</figcaption></figure><p>Next.</p>`,
		);
	});

	it('gives one captioned picture a figure, and leaves an uncaptioned one alone', async () => {
		expect(await render('![A](/a.webp)\n\n_Cap_')).toBe(
			'<figure class="frame"><img src="/a.webp" alt="A"><figcaption class="frame-caption">Cap</figcaption></figure>',
		);
		expect(await render('![A](/a.webp)\n\nText _not_ a caption')).toBe(
			'<p><img src="/a.webp" alt="A"></p><p>Text <em>not</em> a caption</p>',
		);
	});

	it('takes an italic line written right under the pictures in the same paragraph', async () => {
		expect(await render('![A](/a.webp) ![B](/b.webp)\n_Cap_')).toMatch(
			/<\/div><\/div><figcaption class="frame-caption">Cap<\/figcaption><\/figure>$/,
		);
	});

	it("puts a spoiler pair's Show spoiler button over the pictures, not the caption", async () => {
		const html = await render('![A](/a.webp "spoiler") ![B](/b.webp "spoiler")\n\n_Cap_');
		expect(html).toMatch(/^<figure class="frame-pair"><div class="frame-pair-grid spoiler-frame"/);
		expect(html).toMatch(
			/<span class="sr-only">Spoiler picture: <\/span><div class="frame-pair-cell">.*<\/div><button type="button" class="spoiler-show"><span>Show spoiler<\/span><\/button><\/div><figcaption class="frame-caption">Cap<\/figcaption><\/figure>$/,
		);
		expect(html).not.toContain('frame-label');
	});

	it('keeps the caption on the next line of a spoiler pair (After Hours, 2026-11-22)', async () => {
		const html = await render('![A](/a.webp "spoiler") ![B](/b.webp "spoiler")\n_Cap_');
		expect(html).toMatch(/^<figure class="frame-pair"><div class="frame-pair-grid spoiler-frame"/);
		expect(html).toMatch(
			/<\/button><\/div><figcaption class="frame-caption">Cap<\/figcaption><\/figure>$/,
		);
	});

	it('wraps a single spoiler picture so its caption stays outside the button', async () => {
		expect(await render('![A](/a.webp "spoiler")\n\n_Cap_')).toBe(
			'<figure class="frame"><div class="spoiler-frame"><span class="sr-only">Spoiler picture: </span><img src="/a.webp" alt="A"><button type="button" class="spoiler-show"><span>Show spoiler</span></button></div><figcaption class="frame-caption">Cap</figcaption></figure>',
		);
	});

	it('stacks three pictures as one comparison (Joe, 2026-11-27: never stitched side by side)', async () => {
		const html = await render('![A](/a.webp)\n![B](/b.webp)\n![C](/c.webp)\n\n_Three films._');
		expect(html.match(/class="frame-pair-cell"/g)).toHaveLength(3);
		expect(html).toMatch(
			/^<figure class="frame-pair">.*<figcaption class="frame-caption">Three films.<\/figcaption><\/figure>$/,
		);
	});

	it('pairs two loops like two pictures, each keeping its label', async () => {
		const loop = (src: string, title: string) => ({
			type: 'element',
			tagName: 'video',
			properties: { src, title, className: ['gif-video'] },
			children: [],
		});
		const tree = {
			type: 'root',
			children: [
				{
					type: 'element',
					tagName: 'p',
					properties: {},
					children: [loop('/a.mp4', 'Blue · 1993'), loop('/b.mp4', 'Donnie Darko · 2001')],
				},
			],
		};
		rehypeFrames()(tree as never);
		const figure = tree.children[0] as unknown as {
			properties: { className: string[] };
			children: {
				children: {
					children: {
						tagName?: string;
						properties?: { title?: string };
						children?: { value: string }[];
					}[];
				}[];
			}[];
		};
		expect(figure.properties.className).toEqual(['frame-pair']);
		const cells = figure.children[0].children;
		expect(cells.map((c) => c.children[0].tagName)).toEqual(['video', 'video']);
		expect(cells.map((c) => c.children[1].children![0].value)).toEqual([
			'Blue · 1993',
			'Donnie Darko · 2001',
		]);
		expect(cells.every((c) => c.children[0].properties!.title === undefined)).toBe(true);
	});

	it('leaves pictures mixed with text in their paragraph', async () => {
		expect(await render('See ![A](/a.webp) and ![B](/b.webp)')).toBe(
			'<p>See <img src="/a.webp" alt="A"> and <img src="/b.webp" alt="B"></p>',
		);
	});
});

describe('rehype-stray-thoughts', () => {
	it('makes a lone "Stray thoughts:" line a heading and drops its colon, but not a sentence', async () => {
		expect(await render('Stray thoughts:\n\nStray thoughts: I had one.')).toMatch(
			/^<h2 class="stray-label"[^>]*>Stray thoughts<\/h2><p>Stray thoughts: I had one.<\/p>$/,
		);
	});
});
