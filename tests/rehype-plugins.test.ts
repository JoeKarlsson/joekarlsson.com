import { beforeEach, describe, expect, it, vi } from 'vitest';

// rehype-gif-video probes the filesystem for a sibling .mp4. Mock it so these
// stay hermetic rather than coupled to whatever happens to be in public/.
const existsSync = vi.hoisted(() => vi.fn());
vi.mock('node:fs', () => ({ default: { existsSync } }));

const { default: rehypeGifVideo } = await import('../src/plugins/rehype-gif-video.mjs');
const { default: rehypeLazyImages } = await import('../src/plugins/rehype-lazy-images.mjs');

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

describe('rehype-lazy-images', () => {
	it('adds loading and decoding to a bare image', () => {
		const root = run(rehypeLazyImages, tree(img({ src: '/images/a.webp', alt: 'A' })));
		const [node] = paragraph(root);

		expect(node.properties?.loading).toBe('lazy');
		expect(node.properties?.decoding).toBe('async');
	});

	it('does not override an explicit loading value', () => {
		const root = run(
			rehypeLazyImages,
			tree(img({ src: '/images/hero.webp', alt: 'Hero', loading: 'eager' })),
		);

		expect(paragraph(root)[0].properties?.loading).toBe('eager');
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
		const root = tree({ type: 'element', tagName: 'img', children: [] });
		run(rehypeLazyImages, root);

		expect(paragraph(root)[0].properties?.loading).toBe('lazy');
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
		expect(node.children?.[0].value).toBe('Terminal recording');
	});

	it('marks the video as an image for assistive tech', () => {
		// These are silent screen recordings. role=img keeps axe's video-caption
		// rule, which assumes spoken audio, from demanding a captions track.
		existsSync.mockReturnValue(true);
		const root = run(rehypeGifVideo, tree(img({ src: '/a.gif', alt: 'x' })));

		expect(paragraph(root)[0].properties?.role).toBe('img');
	});

	it('keeps controls so the motion can be stopped (WCAG 2.2.2)', () => {
		existsSync.mockReturnValue(true);
		const root = run(rehypeGifVideo, tree(img({ src: '/a.gif', alt: 'x' })));
		const { properties } = paragraph(root)[0];

		expect(properties?.controls).toBe(true);
		expect(properties?.autoplay).toBe(true);
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
