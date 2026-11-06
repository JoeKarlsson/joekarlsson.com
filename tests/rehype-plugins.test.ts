import { beforeEach, describe, expect, it, vi } from 'vitest';

// rehype-gif-video probes the filesystem for a sibling .mp4. Mock it so these
// stay hermetic rather than coupled to whatever happens to be in public/.
const existsSync = vi.hoisted(() => vi.fn());
vi.mock('node:fs', () => ({ default: { existsSync } }));

const { default: rehypeCollapsibleToc } = await import('../src/plugins/rehype-collapsible-toc.mjs');
const { default: rehypeEmptyCornerCell } =
	await import('../src/plugins/rehype-empty-corner-cell.mjs');
const { default: rehypeFaqDetails } = await import('../src/plugins/rehype-faq-details.mjs');
const { default: rehypeGifVideo } = await import('../src/plugins/rehype-gif-video.mjs');
const { default: rehypeLazyImages } = await import('../src/plugins/rehype-lazy-images.mjs');
const { default: rehypeYouTubeEmbed } = await import('../src/plugins/rehype-youtube-embed.mjs');

type HastNode = {
	type: string;
	tagName?: string;
	properties?: Record<string, unknown>;
	children?: HastNode[];
	value?: string;
};

function img(properties: Record<string, unknown>): HastNode {
	return { type: 'element', tagName: 'img', properties, children: [] };
}

/** Wrap nodes in a root > p so plugins see a real parent to splice into. */
function tree(...children: HastNode[]): HastNode {
	return {
		type: 'root',
		children: [{ type: 'element', tagName: 'p', properties: {}, children }],
	};
}

function paragraph(root: HastNode): HastNode[] {
	return root.children![0].children!;
}

function run(plugin: () => (t: HastNode) => void, root: HastNode): HastNode {
	plugin()(root);
	return root;
}

function el(tagName: string, text: string): HastNode {
	return { type: 'element', tagName, properties: {}, children: [{ type: 'text', value: text }] };
}

describe('rehype-faq-details', () => {
	it('wraps each FAQ question and its answer in a details toggle, up to the next h2', () => {
		const root = run(rehypeFaqDetails, {
			type: 'root',
			children: [
				el('h2', 'Setup'),
				el('h3', 'Not a question'),
				el('h2', 'Frequently Asked Questions'),
				el('h3', 'Is it free?'),
				el('p', 'Yes.'),
				el('p', 'Really.'),
				el('h3', 'Does it scale?'),
				el('p', 'Mostly.'),
				el('h2', 'Next steps'),
				el('p', 'Go.'),
			],
		});
		const tags = root.children!.map((n) => n.tagName);
		expect(tags).toEqual(['h2', 'h3', 'h2', 'details', 'details', 'h2', 'p']);

		const [first, second] = root.children!.filter((n) => n.tagName === 'details');
		expect(first.children!.map((n) => n.tagName)).toEqual(['summary', 'p', 'p']);
		expect(first.children![0].children![0]).toMatchObject({ tagName: 'h3' });
		expect(second.children!.map((n) => n.tagName)).toEqual(['summary', 'p']);
	});

	it('also recognises "FAQ" and "FAQs" headings, and leaves posts without one alone', () => {
		for (const heading of ['FAQ', 'FAQs']) {
			const root = run(rehypeFaqDetails, {
				type: 'root',
				children: [el('h2', heading), el('h3', 'Q?'), el('p', 'A.')],
			});
			expect(root.children!.map((n) => n.tagName)).toEqual(['h2', 'details']);
		}
		const plain = run(rehypeFaqDetails, {
			type: 'root',
			children: [el('h2', 'Intro'), el('h3', 'Part'), el('p', 'Text')],
		});
		expect(plain.children!.map((n) => n.tagName)).toEqual(['h2', 'h3', 'p']);
	});
});

describe('rehype-lazy-images', () => {
	/** A body that opens with a text paragraph, so `children` sit below the fold. */
	function belowIntro(...children: HastNode[]): HastNode {
		const root = tree(...children);
		root.children!.unshift({
			type: 'element',
			tagName: 'p',
			properties: {},
			children: [{ type: 'text', value: 'Intro.' }],
		});
		return root;
	}

	function secondParagraph(root: HastNode): HastNode[] {
		return root.children![1].children!;
	}

	it('adds loading and decoding to a bare image', () => {
		const root = run(rehypeLazyImages, belowIntro(img({ src: '/images/a.webp', alt: 'A' })));
		const [node] = secondParagraph(root);

		expect(node.properties?.loading).toBe('lazy');
		expect(node.properties?.decoding).toBe('async');
	});

	it('leaves an image that opens the body eager, since it shows at load', () => {
		const root = run(rehypeLazyImages, tree(img({ src: '/images/a.webp', alt: 'A' })));
		const [node] = paragraph(root);

		expect(node.properties?.loading).toBeUndefined();
		expect(node.properties?.decoding).toBe('async');
	});

	it('does not override an explicit loading value', () => {
		const root = run(
			rehypeLazyImages,
			belowIntro(img({ src: '/images/hero.webp', alt: 'Hero', loading: 'eager' })),
		);

		expect(secondParagraph(root)[0].properties?.loading).toBe('eager');
	});

	it('leaves non-image elements untouched', () => {
		const root = tree({
			type: 'element',
			tagName: 'a',
			properties: { href: '/x' },
			children: [],
		});
		run(rehypeLazyImages, root);

		expect(paragraph(root)[0].properties).toEqual({ href: '/x' });
	});

	it('handles an image that has no properties at all', () => {
		const root = belowIntro({ type: 'element', tagName: 'img', children: [] });
		run(rehypeLazyImages, root);

		expect(secondParagraph(root)[0].properties?.loading).toBe('lazy');
	});
});

describe('rehype-gif-video', () => {
	beforeEach(() => {
		existsSync.mockReset();
	});

	it('swaps a gif for a video when the mp4 exists', () => {
		existsSync.mockReturnValue(true);
		const root = run(
			rehypeGifVideo,
			tree(img({ src: '/images/blog/post/demo.gif', alt: 'A demo' })),
		);
		const [node] = paragraph(root);

		expect(node.tagName).toBe('video');
		expect(node.properties?.src).toBe('/images/blog/post/demo.mp4');
	});

	it('looks for the mp4 under public/', () => {
		existsSync.mockReturnValue(true);
		run(rehypeGifVideo, tree(img({ src: '/images/blog/post/demo.gif', alt: '' })));

		expect(existsSync).toHaveBeenCalledWith('public/images/blog/post/demo.mp4');
	});

	it('leaves the gif alone when no mp4 exists', () => {
		existsSync.mockReturnValue(false);
		const root = run(rehypeGifVideo, tree(img({ src: '/images/blog/post/demo.gif', alt: 'A' })));

		expect(paragraph(root)[0].tagName).toBe('img');
	});

	it('carries alt text into aria-label and the fallback body', () => {
		existsSync.mockReturnValue(true);
		const root = run(
			rehypeGifVideo,
			tree(img({ src: '/images/blog/post/demo.gif', alt: 'Terminal recording' })),
		);
		const [node] = paragraph(root);

		expect(node.properties?.['aria-label']).toBe('Terminal recording');
		expect(node.properties?.role).toBeUndefined();
		expect(node.children?.[0].value).toBe('Terminal recording');
	});

	it('uses a -poster.webp sibling as the poster when there is one', () => {
		existsSync.mockReturnValue(true);
		const root = run(rehypeGifVideo, tree(img({ src: '/images/blog/post/demo.gif', alt: 'x' })));

		expect(paragraph(root)[0].properties?.poster).toBe('/images/blog/post/demo-poster.webp');
	});

	it('keeps controls so the motion can be stopped (WCAG 2.2.2)', () => {
		existsSync.mockReturnValue(true);
		const root = run(rehypeGifVideo, tree(img({ src: '/a.gif', alt: 'x' })));
		const { properties } = paragraph(root)[0];

		expect(properties?.controls).toBe(true);
		expect(properties?.dataAutoplayInView).toBe(true);
		expect(properties?.preload).toBe('none');
		expect(properties?.loop).toBe(true);
		expect(properties?.muted).toBe(true);
	});

	it('matches the extension case-insensitively', () => {
		existsSync.mockReturnValue(true);
		const root = run(rehypeGifVideo, tree(img({ src: '/images/A.GIF', alt: 'x' })));

		expect(paragraph(root)[0].tagName).toBe('video');
		expect(paragraph(root)[0].properties?.src).toBe('/images/A.mp4');
	});

	it('ignores still formats without touching the filesystem', () => {
		const root = run(rehypeGifVideo, tree(img({ src: '/images/a.png', alt: 'x' })));

		expect(paragraph(root)[0].tagName).toBe('img');
		expect(existsSync).not.toHaveBeenCalled();
	});

	it('swaps an animated webp that has an mp4 sibling', () => {
		existsSync.mockReturnValue(true);
		const root = run(rehypeGifVideo, tree(img({ src: '/images/blog/p/reaction.webp', alt: 'x' })));

		expect(paragraph(root)[0].tagName).toBe('video');
		expect(paragraph(root)[0].properties?.src).toBe('/images/blog/p/reaction.mp4');
	});

	it('leaves a still webp alone when no mp4 sibling exists', () => {
		// The site has hundreds of still WebPs; only the handful the converter
		// turned into video get an .mp4 beside them.
		existsSync.mockReturnValue(false);
		const root = run(rehypeGifVideo, tree(img({ src: '/images/blog/p/photo.webp', alt: 'x' })));

		expect(paragraph(root)[0].tagName).toBe('img');
	});

	it('ignores an image with no src', () => {
		const root = run(rehypeGifVideo, tree(img({ alt: 'x' })));

		expect(paragraph(root)[0].tagName).toBe('img');
		expect(existsSync).not.toHaveBeenCalled();
	});
});

describe('rehype-youtube-embed', () => {
	function link(href: string): HastNode {
		return {
			type: 'element',
			tagName: 'a',
			properties: { href },
			children: [{ type: 'text', value: href }],
		};
	}

	it.each([
		'https://www.youtube.com/watch?v=GiNa2jen-lg',
		'https://youtu.be/GiNa2jen-lg',
		'https://www.youtube.com/embed/GiNa2jen-lg',
	])('turns a link alone in its paragraph into a click-to-play thumbnail: %s', (href) => {
		const root = run(rehypeYouTubeEmbed, tree(link(href)));

		const button = root.children![0];
		expect(button.tagName).toBe('button');
		expect(button.properties?.className).toContain('youtube-facade');
		expect(button.properties?.dataYoutubeId).toBe('GiNa2jen-lg');
		// A bare URL makes a poor accessible name
		expect(button.properties?.dataYoutubeTitle).toBe('YouTube video');
		const thumbnail = button.children![0];
		expect(thumbnail.tagName).toBe('img');
		expect(thumbnail.properties?.src).toBe('https://i.ytimg.com/vi/GiNa2jen-lg/hqdefault.jpg');
		expect(thumbnail.properties?.loading).toBe('lazy');
	});

	it('names the video after the link text', () => {
		const named = link('https://youtu.be/GiNa2jen-lg');
		named.children = [{ type: 'text', value: 'Watch the talk on YouTube' }];
		const root = run(rehypeYouTubeEmbed, tree(named));

		expect(root.children![0].properties?.ariaLabel).toBe('Play Watch the talk on YouTube');
	});

	it('leaves a YouTube link inside a sentence as a link', () => {
		const text: HastNode = { type: 'text', value: 'Watch ' };
		const root = run(rehypeYouTubeEmbed, tree(text, link('https://youtu.be/GiNa2jen-lg')));

		expect(root.children![0].tagName).toBe('p');
		expect(paragraph(root)[1].tagName).toBe('a');
	});

	it('leaves other links alone', () => {
		const root = run(rehypeYouTubeEmbed, tree(link('https://vimeo.com/123456789')));

		expect(root.children![0].tagName).toBe('p');
	});
});

describe('rehype-empty-corner-cell', () => {
	it('makes a blank header cell a plain cell and keeps named headers', () => {
		const root = tree(el('th', '  '), el('th', 'IAM Users'), {
			type: 'element',
			tagName: 'th',
			properties: {},
			children: [],
		});
		run(rehypeEmptyCornerCell, root);

		expect(paragraph(root).map((cell) => cell.tagName)).toEqual(['td', 'th', 'td']);
	});
});

describe('rehype-collapsible-toc', () => {
	const label = (text: string): HastNode => ({
		type: 'element',
		tagName: 'p',
		properties: {},
		children: [el('strong', text)],
	});
	const list: HastNode = { type: 'element', tagName: 'ul', properties: {}, children: [] };

	it('wraps an "In this article:" line and its list for phone-collapse', () => {
		const root: HastNode = {
			type: 'root',
			children: [label('In this article:'), { type: 'text', value: '\n' }, list],
		};
		run(rehypeCollapsibleToc, root);

		const [wrapper] = root.children!;
		expect(wrapper.properties).toEqual({ dataPhoneCollapse: '' });
		expect(wrapper.children!.map((c) => Object.keys(c.properties!))).toEqual([
			['dataCollapseHeading'],
			['dataCollapseBody'],
		]);
	});

	it('leaves other bold lines and a label with no list alone', () => {
		const root: HastNode = {
			type: 'root',
			children: [label('Note:'), list, label('Table of Contents'), el('p', 'text')],
		};
		run(rehypeCollapsibleToc, root);

		expect(root.children!.map((c) => c.tagName)).toEqual(['p', 'ul', 'p', 'p']);
	});
});
