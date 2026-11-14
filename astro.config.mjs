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
import rehypePostPreviews from './src/plugins/rehype-post-previews.mjs';
import rehypeSpoilers from './src/plugins/rehype-spoilers.mjs';
import rehypeYouTubeEmbed from './src/plugins/rehype-youtube-embed.mjs';
import externalLinks from './src/integrations/external-links.mjs';
import markdownPages from './src/integrations/markdown-pages.mjs';
import responsiveImages from './src/integrations/responsive-images.mjs';
import scriptCsp from './src/integrations/script-csp.mjs';

// TL;DR in Tech back issues (imported from Substack, marked by substackUrl) are
// noindex on the page, and recaps of a blog post (recapOf) point their canonical at
// that post; keep both out of the sitemap too, and any issue dated after the build (a
// scheduled send). Other new issues stay in.
/** @typedef {{ type: string, value?: string, children?: HastNode[], properties?: Record<string, unknown> }} HastNode */
/** @param {HastNode} node @returns {string} */
const textOf = (node) =>
	node.type === 'text' ? (node.value ?? '') : (node.children ?? []).map(textOf).join('');

const NEWSLETTER_DIR = new URL('./src/content/newsletter/', import.meta.url);
const unindexedIssuePaths = new Set(
	readdirSync(NEWSLETTER_DIR)
		.filter((f) => f.endsWith('.md'))
		.map((f) => readFileSync(new URL(f, NEWSLETTER_DIR), 'utf8'))
		.filter(
			(md) =>
				/^(substackUrl|recapOf):/m.test(md) ||
				// scheduled: dated after this build, so noindex until it's sent (src/utils/sent.ts)
				new Date(md.match(/^date:\s*['"]?([^'"\n]+)/m)?.[1] ?? 0) > new Date(),
		)
		.map((md) => md.match(/^slug:\s*['"]?([^'"\n]+)/m)?.[1])
		.filter(Boolean)
		.map((slug) => `/newsletter/${slug}/`),
);

// https://astro.build/config
export default defineConfig({
	site: 'https://www.joekarlsson.com',
	// Renders four pages at a time instead of one: 863 pages took 3m 52s on the homelab
	// test runner one by one, 56s four at a time
	build: { concurrency: 4 },
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
		// Every link off the site opens in a new tab
		externalLinks(),
		// A Markdown copy of every indexed page for AI agents: /about/ -> /about.md
		markdownPages(),
		// /resume-pdf/ is the noindex source the resume PDF is printed from
		sitemap({
			filter: (page) => {
				const { pathname } = new URL(page);
				return pathname !== '/resume-pdf/' && !unindexedIssuePaths.has(pathname);
			},
		}),
		// Last: hashes each page's inline scripts as they ship (meta CSP + Trusted Types)
		scriptCsp(),
	],
	vite: {
		plugins: [/** @type {any} */ (tailwindcss())],
		// Each Playwright run starts the dev server on a new port, which Astro counts as a
		// config change: it rebuilds its content store and every open page reloads mid-test.
		// The tests never need live reload, so the e2e server doesn't offer it
		server: { hmr: process.env.ASTRO_E2E !== '1' },
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
				rehypeSpoilers,
				rehypePostPreviews,
				rehypeSlug,
				[
					rehypeAutolinkHeadings,
					{
						// After the heading, not inside it: a link inside would add its name to the
						// heading's, so every heading in a screen reader's list ended "Link to section".
						// The wrapper lets the # sit in the margin beside it (global.css).
						behavior: 'after',
						group: {
							type: 'element',
							tagName: 'div',
							properties: { className: ['heading-group'] },
							children: [],
						},
						// An FAQ question's h3 sits in a <summary>, which is itself a control, so a
						// permalink there is a nested interactive element. Its id still deep-links.
						// A screen-reader-only heading (GFM's "Footnotes") gets none either: its # would
						// show beside nothing.
						test: (
							/** @type {HastNode} */ heading,
							/** @type {number | undefined} */ _index,
							/** @type {{ tagName?: string } | undefined} */ parent,
						) =>
							parent?.tagName !== 'summary' &&
							!String(heading.properties?.className ?? '').includes('sr-only'),
						// Each permalink is named for its section, so the links don't all share one name
						properties: (/** @type {HastNode} */ heading) => ({
							className: ['heading-anchor'],
							ariaLabel: `Link to section: ${textOf(heading)}`,
						}),
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
			'/blog/how-to-get-started-building-a-homelab-server/',

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

		// Old WordPress "why I joined" posts that never moved over (404s in Plausible, 2026-11-09)
		'/blog/why-i-joined-singlestore': '/about/',
		'/blog/why-i-joined-viam-🤖': '/about/',

		// Consolidated content redirects
		'/blog/how-i-work': '/uses/',
		// The same CData article imported twice under two slugs (2026-11-05)
		'/blog/connect-enterprise-data-meta-muse': '/blog/connect-business-apps-meta-muse/',

		// Evergreen guides lost the year in their URL so a yearly refresh only changes the title
		// (2026-11-09)
		'/blog/how-to-get-started-with-home-assistant-in-2026':
			'/blog/how-to-get-started-with-home-assistant/',
		'/blog/how-to-get-started-building-a-homelab-server-in-2024':
			'/blog/how-to-get-started-building-a-homelab-server/',
		'/blog/running-devrel-2026': '/blog/running-devrel/',

		// Thin, off-topic or dead-product posts cut in the 2027 content audit (2026-11-09)
		'/blog/overwhelmed-by-the-web': '/blog/category/life/',
		'/blog/my-relationship-with-the-internet': '/blog/category/life/',
		'/blog/how-to-explain-to-your-dad-why-snapchat-is-so-awesome': '/blog/category/life/',
		'/blog/10-things-i-learned-at-startup-weekend': '/blog/category/career/',
		'/blog/how-to-find-a-technical-co-founder': '/blog/category/career/',
		'/blog/psa-activate-2-step-verification-on-your-email-account': '/blog/',
		'/blog/one-week-in-oahu-a-tourists-travel-itinerary': '/blog/category/life/',
		'/blog/a-brief-cuba-travel-guide': '/blog/category/life/',
		'/blog/save-the-world-and-money-with-mongodb-atlas-data-lake':
			'/blog/how-to-manage-mongodb-data-at-scale/',
		'/blog/getting-started-with-graphql-and-atlas': '/talks/',
		'/blog/a-gentle-introduction-to-building-serverless-apps': '/talks/',
		'/blog/a-gentle-introduction-to-setting-up-a-react-and-mongodb-stitch-app-from-scratch-in-10-minutes':
			'/blog/',
		'/blog/iot-and-js-a-gentle-introduction-to-the-internet-of-things':
			'/talks/an-introduction-to-iot-internet-of-toilets/',
		'/blog/i-was-on-hawaii-public-radio-to-talk-about-the-stupid-shit-hackathon':
			'/blog/i-ran-my-first-hackathon-and-so-can-you/',
		'/blog/devrel-as-dev-zero': '/blog/running-devrel/',
		'/blog/developer-advocacy-in-2023': '/blog/running-devrel/',
		'/blog/treat-content-development-for-your-open-source-project-like-your-open-source-project':
			'/blog/running-devrel/',

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
		'/speaking/joe-karlssons-talk-archive': '/talks/',
		'/speaking': '/talks/',
		'/talk-archive': '/talks/',
		// Talk write-ups moved out of the blog to their own pages (2026-11-09)
		'/blog/mongodb-schema-design-best-practices': '/talks/mongodb-schema-design-best-practices/',
		'/blog/from-sql-to-nosql-a-gentle-introduction-for-devs':
			'/talks/from-sql-to-nosql-a-gentle-introduction-for-devs/',
		'/blog/the-art-of-computer-science': '/talks/the-art-of-computer-science/',
		'/blog/bechdel-io-how-we-used-javascript-to-help-make-film-more-inclusive':
			'/talks/bechdel-io-how-we-used-javascript-to-help-make-film-more-inclusive/',
		'/blog/building-high-performance-react-applications':
			'/talks/building-high-performance-react-applications/',
		'/blog/an-introduction-to-iot-internet-of-toilets':
			'/talks/an-introduction-to-iot-internet-of-toilets/',
		'/all-work': '/work/',
		'/404-error': '/404',

		// WordPress portfolio URLs
		'/portfolio': '/work/',

		// WordPress feed URLs
		'/feed': '/rss.xml',
	},
});
