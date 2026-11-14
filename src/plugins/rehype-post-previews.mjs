/**
 * Hover previews for links to other posts: after each link to /blog/<slug>/ it adds a
 * hint popover holding that post's thumbnail, date and title, a small taped card (global.css).
 *
 * Chrome shows it on hover or focus through `interestfor` and pins it above the link with
 * anchor positioning; src/scripts/link-peek.ts does the showing where `interestfor` is
 * missing. Browsers without anchor positioning, and touch screens, never show it, so the
 * link stays a plain link there. Feeds drop it (withoutLinkPreviews, utils/feed-html.js).
 *
 * The card's children are deliberately not spans, so a feed can cut it out with one regex.
 */
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';
import { localImageSize } from '../utils/image-size.mjs';

const BLOG_DIR = path.resolve('src/content/blog');
const DEFAULT_HERO_IMAGE = '/images/og-default-pink.webp';
const POST_LINK = /^\/blog\/([a-z0-9-]+)\/?(?:#.*)?$/;
// Work thumbnails come graded pink already; anything else gets the flat pink pass, as on cards
const PRETREATED = /^\/images\/blog\/[^/]+\/thumb-[0-9a-f]{8}\.webp$/;

const postCache = new Map();

/** A post's title, date and thumbnail from its front matter, or undefined when there's no such post. */
export function readPost(slug, blogDir = BLOG_DIR) {
	if (postCache.has(`${blogDir}:${slug}`)) return postCache.get(`${blogDir}:${slug}`);
	const file = [`${slug}.md`, `${slug}.mdx`, `${slug}/index.md`]
		.map((name) => path.join(blogDir, name))
		.find((candidate) => fs.existsSync(candidate));
	let post;
	if (file) {
		const frontMatter = fs.readFileSync(file, 'utf8').match(/^---\n([\s\S]*?)\n---/);
		if (!frontMatter) throw new Error(`rehype-post-previews: ${file} has no front matter`);
		const data = parse(frontMatter[1]);
		post = {
			title: data.title,
			date: new Date(data.date).toLocaleDateString('en-US', {
				timeZone: 'UTC',
				year: 'numeric',
				month: 'short',
				day: 'numeric',
			}),
			image: data.heroImage || DEFAULT_HERO_IMAGE,
		};
	}
	postCache.set(`${blogDir}:${slug}`, post);
	return post;
}

const textOf = (node) =>
	node.type === 'text' ? node.value : (node.children ?? []).map(textOf).join('');

function previewCard(id, post) {
	return {
		type: 'element',
		tagName: 'span',
		properties: {
			popover: 'hint',
			id,
			className: ['link-peek'],
			style: `position-anchor:--${id}`,
			role: 'tooltip',
		},
		children: [
			{
				type: 'element',
				tagName: 'img',
				properties: {
					src: post.image,
					alt: '',
					loading: 'lazy',
					sizes: '16rem',
					...(PRETREATED.test(post.image) ? {} : { dataHalftone: 'flat' }),
				},
				children: [],
			},
			{
				type: 'element',
				tagName: 'small',
				properties: {},
				children: [{ type: 'text', value: post.date }],
			},
			{
				type: 'element',
				tagName: 'strong',
				properties: {},
				children: [{ type: 'text', value: post.title }],
			},
		],
	};
}

/** @param {{ blogDir?: string }} [options] */
export default function rehypePostPreviews(options = {}) {
	const blogDir = options.blogDir ?? BLOG_DIR;
	return async (tree, file) => {
		const ownSlug = file?.path ? path.basename(file.path).replace(/\.mdx?$/, '') : undefined;
		let count = 0;
		const pictures = [];
		const walk = (parent, inHeading) => {
			const children = parent.children ?? [];
			for (let i = 0; i < children.length; i++) {
				const node = children[i];
				if (node.type !== 'element') continue;
				const heading = inHeading || /^h[1-6]$/.test(node.tagName);
				const slug =
					node.tagName === 'a' && typeof node.properties?.href === 'string'
						? node.properties.href.match(POST_LINK)?.[1]
						: undefined;
				// A link around a picture, or in a heading, stays plain
				const plainLink =
					!slug ||
					heading ||
					slug === ownSlug ||
					!textOf(node).trim() ||
					(node.children ?? []).some((child) =>
						['img', 'picture', 'video'].includes(child.tagName),
					);
				if (node.tagName === 'a') {
					const post = plainLink ? undefined : readPost(slug, blogDir);
					if (post) {
						const id = `peek-${++count}`;
						node.properties.interestfor = id;
						node.properties.ariaDescribedBy = id;
						node.properties.style = `anchor-name:--${id}`;
						const card = previewCard(id, post);
						pictures.push(card.children[0]);
						children.splice(i + 1, 0, card);
						i++;
					}
					continue;
				}
				walk(node, heading);
			}
		};
		walk(tree, false);
		// Every picture in a post carries its size (tests/build-output.test.ts)
		for (const img of pictures)
			Object.assign(img.properties, await localImageSize(img.properties.src));
	};
}
