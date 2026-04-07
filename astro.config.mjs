// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import rehypeYouTubeEmbed from './src/plugins/rehype-youtube-embed.mjs';

// https://astro.build/config
export default defineConfig({
	site: 'https://www.joekarlsson.com',
	integrations: [mdx(), sitemap()],
	vite: {
		plugins: [/** @type {any} */ (tailwindcss())],
	},
	markdown: {
		shikiConfig: {
			theme: 'github-dark',
		},
		rehypePlugins: [
			rehypeYouTubeEmbed,
			rehypeSlug,
			[
				rehypeAutolinkHeadings,
				{
					behavior: 'append',
					properties: {
						className: ['heading-anchor'],
						ariaLabel: 'Link to section',
					},
					content: {
						type: 'element',
						tagName: 'span',
						properties: { ariaHidden: 'true' },
						children: [{ type: 'text', value: '#' }],
					},
				},
			],
		],
	},
	redirects: {
		// WordPress date-based blog URLs → new /blog/slug pattern
		// Specific redirects for known old URLs (strips month from path)
		'/2023/09/how-to-get-started-building-a-homelab-server-in-2024':
			'/blog/how-to-get-started-building-a-homelab-server-in-2024',

		// Covers all /YYYY/MM/slug patterns from the old WordPress site
		'/2015/[...slug]': '/blog/[...slug]',
		'/2016/[...slug]': '/blog/[...slug]',
		'/2017/[...slug]': '/blog/[...slug]',
		'/2018/[...slug]': '/blog/[...slug]',
		'/2019/[...slug]': '/blog/[...slug]',
		'/2020/[...slug]': '/blog/[...slug]',
		'/2021/[...slug]': '/blog/[...slug]',
		'/2022/[...slug]': '/blog/[...slug]',
		'/2023/[...slug]': '/blog/[...slug]',
		'/2024/[...slug]': '/blog/[...slug]',
		'/2025/[...slug]': '/blog/[...slug]',
		'/2026/[...slug]': '/blog/[...slug]',

		// Consolidated content redirects
		'/blog/how-i-work': '/uses',

		// WordPress page redirects
		'/speaking/joe-karlssons-talk-archive': '/talk-archive',
		'/speaking': '/talk-archive',
		'/all-work': '/work',
		'/404-error': '/404',

		// WordPress portfolio URLs
		'/portfolio': '/work',

		// WordPress feed URLs
		'/feed': '/rss.xml',
	},
});
