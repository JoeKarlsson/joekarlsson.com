// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, fontProviders } from 'astro/config';
import { readdirSync, readFileSync } from 'node:fs';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import rehypeAmazonAffiliate from './src/plugins/rehype-amazon-affiliate.mjs';
import rehypeCollapsibleToc from './src/plugins/rehype-collapsible-toc.mjs';
import rehypeEmptyCornerCell from './src/plugins/rehype-empty-corner-cell.mjs';
import rehypeFaqDetails from './src/plugins/rehype-faq-details.mjs';
import rehypeGifVideo from './src/plugins/rehype-gif-video.mjs';
import rehypeImageDimensions from './src/plugins/rehype-image-dimensions.mjs';
import rehypeInlineDiagrams from './src/plugins/rehype-inline-diagrams.mjs';
import rehypeLazyImages from './src/plugins/rehype-lazy-images.mjs';
import rehypeYouTubeEmbed from './src/plugins/rehype-youtube-embed.mjs';
import responsiveImages from './src/integrations/responsive-images.mjs';

// TL;DR in Tech back issues (imported from Substack, marked by substackUrl) are
// noindex on the page, and recaps of a blog post (recapOf) point their canonical at
// that post; keep both out of the sitemap too. Other new issues stay in.
const NEWSLETTER_DIR = new URL('./src/content/newsletter/', import.meta.url);
const unindexedIssuePaths = new Set(
	readdirSync(NEWSLETTER_DIR)
		.filter((f) => f.endsWith('.md'))
		.map((f) => readFileSync(new URL(f, NEWSLETTER_DIR), 'utf8'))
		.filter((md) => /^(substackUrl|recapOf):/m.test(md))
		.map((md) => md.match(/^slug:\s*['"]?([^'"\n]+)/m)?.[1])
		.filter(Boolean)
		.map((slug) => `/newsletter/${slug}/`),
);

// https://astro.build/config
export default defineConfig({
	site: 'https://www.joekarlsson.com',
	// Off for the Playwright run (playwright.config.ts sets ASTRO_E2E)
	devToolbar: { enabled: process.env.ASTRO_E2E !== '1' },
	// Self-hosted at build time, each with a fallback sized to its metrics, so text
	// doesn't reflow when the font arrives (that shift cost /work/ and /uses/ their
	// Lighthouse score). Fraunces stays on Google Fonts in BaseHead: Astro can't
	// request its optical-size axis.
	fonts: [
		{
			provider: fontProviders.google(),
			name: 'Anton',
			cssVariable: '--font-anton',
			styles: ['normal'],
		},
		{
			provider: fontProviders.google(),
			name: 'Hanken Grotesk',
			cssVariable: '--font-hanken-grotesk',
			weights: ['400 900'],
			styles: ['normal'],
			subsets: ['latin', 'latin-ext'],
		},
		{
			provider: fontProviders.google(),
			name: 'JetBrains Mono',
			cssVariable: '--font-jetbrains-mono',
			weights: [400, 500, 700],
			styles: ['normal'],
			fallbacks: ['monospace'],
		},
		{
			provider: fontProviders.google(),
			name: 'Fraunces',
			cssVariable: '--font-fraunces',
			weights: ['400 700'],
			styles: ['normal'],
			subsets: ['latin', 'latin-ext'],
			fallbacks: ['Georgia', 'serif'],
			// Keeps the optical-size axis, so big serif lines get Fraunces's display cut
			options: { experimental: { variableAxis: { opsz: ['9..144'] } } },
		},
	],
	integrations: [
		mdx(),
		// srcset for card images in public/ (components opt in with `sizes`)
		responsiveImages(),
		// /resume-pdf/ is the noindex source the resume PDF is printed from
		sitemap({
			filter: (page) => {
				const { pathname } = new URL(page);
				return pathname !== '/resume-pdf/' && !unindexedIssuePaths.has(pathname);
			},
		}),
	],
	vite: {
		plugins: [/** @type {any} */ (tailwindcss())],
	},
	markdown: {
		shikiConfig: {
			theme: 'github-dark',
		},
		processor: unified({
			rehypePlugins: [
				rehypeYouTubeEmbed,
				// gif-video first: it removes <img> nodes that lazy-images would
				// otherwise annotate for no reason
				rehypeGifVideo,
				// Before image-dimensions: diagrams stop being <img> here
				rehypeInlineDiagrams,
				rehypeImageDimensions,
				rehypeLazyImages,
				rehypeEmptyCornerCell,
				rehypeCollapsibleToc,
				rehypeFaqDetails,
				rehypeAmazonAffiliate,
				rehypeSlug,
				[
					rehypeAutolinkHeadings,
					{
						behavior: 'append',
						// An FAQ question's h3 sits in a <summary>, which is itself a control, so a
						// permalink there is a nested interactive element. Its id still deep-links.
						test: (
							/** @type {unknown} */ _heading,
							/** @type {number | undefined} */ _index,
							/** @type {{ tagName?: string } | undefined} */ parent,
						) => parent?.tagName !== 'summary',
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
		}),
	},
	redirects: {
		// WordPress date-based blog URLs → new /blog/slug pattern
		// Specific redirects for known old URLs (strips month from path)
		'/2023/09/how-to-get-started-building-a-homelab-server-in-2024':
			'/blog/how-to-get-started-building-a-homelab-server-in-2024/',

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

		// Newsletter posts renamed after publishing
		'/newsletter/its-been-a-while': '/newsletter/taste-matters-more-with-ai/',

		// Consolidated content redirects
		'/blog/how-i-work': '/uses/',
		// The same CData article imported twice under two slugs (2026-11-05)
		'/blog/connect-enterprise-data-meta-muse': '/blog/connect-business-apps-meta-muse/',

		// Old blog categories, folded into the six current ones (2026-11-05). Work was a
		// catch-all for employer posts, now shown by /blog/written-for/.
		'/blog/category/work': '/blog/',
		'/blog/category/dev-tools': '/blog/category/web-dev/',
		'/blog/category/databases': '/blog/category/web-dev/',
		'/blog/category/javascript': '/blog/category/web-dev/',
		'/blog/category/smart-home': '/blog/category/homelab/',
		'/blog/category/iot': '/blog/category/homelab/',
		'/blog/category/networking': '/blog/category/homelab/',
		'/blog/category/devrel': '/blog/category/career/',
		'/blog/category/personal': '/blog/category/life/',
		'/blog/category/film': '/blog/category/life/',
		'/blog/category/travel': '/blog/category/life/',

		// WordPress page redirects
		'/speaking/joe-karlssons-talk-archive': '/talk-archive/',
		'/speaking': '/talk-archive/',
		'/all-work': '/work/',
		'/404-error': '/404',

		// WordPress portfolio URLs
		'/portfolio': '/work/',

		// WordPress feed URLs
		'/feed': '/rss.xml',
	},
});
