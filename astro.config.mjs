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
import rehypeChapters from './src/plugins/rehype-chapters.mjs';
import rehypeInterlude from './src/plugins/rehype-interlude.mjs';
import rehypeQuoteMarks from './src/plugins/rehype-quote-marks.mjs';
import rehypeCollapsibleToc from './src/plugins/rehype-collapsible-toc.mjs';
import rehypeEmptyCornerCell from './src/plugins/rehype-empty-corner-cell.mjs';
import rehypeTableScroll from './src/plugins/rehype-table-scroll.mjs';
import rehypeFaqDetails from './src/plugins/rehype-faq-details.mjs';
import rehypeFrames from './src/plugins/rehype-frames.mjs';
import rehypeGifVideo from './src/plugins/rehype-gif-video.mjs';
import rehypeImageDimensions from './src/plugins/rehype-image-dimensions.mjs';
import rehypeInlineDiagrams from './src/plugins/rehype-inline-diagrams.mjs';
import rehypeMarginNotes from './src/plugins/rehype-margin-notes.mjs';
import rehypeNewsletterMiddle from './src/plugins/rehype-newsletter-middle.mjs';
import rehypeNoWidows from './src/plugins/rehype-no-widows.mjs';
import rehypePaperCitations, { rehypePaperRaw } from './src/plugins/rehype-paper-citations.mjs';
import rehypeLazyImages from './src/plugins/rehype-lazy-images.mjs';
import rehypePostPreviews from './src/plugins/rehype-post-previews.mjs';
import rehypeSpoilers from './src/plugins/rehype-spoilers.mjs';
import rehypeStrayThoughts from './src/plugins/rehype-stray-thoughts.mjs';
import rehypeYouTubeEmbed from './src/plugins/rehype-youtube-embed.mjs';
import externalLinks from './src/integrations/external-links.mjs';
import markdownPages from './src/integrations/markdown-pages.mjs';
import responsiveImages from './src/integrations/responsive-images.mjs';
import minifyInlineScripts from './src/integrations/minify-inline-scripts.mjs';
import halftoneLevels from './src/integrations/halftone-levels.mjs';
import scriptCsp from './src/integrations/script-csp.mjs';
import {
	lastmodByPath,
	offSiteCanonicalPaths,
	unindexedReviewPaths,
} from './src/integrations/sitemap-lastmod.mjs';

const contentLastmod = lastmodByPath(new URL('./src/content/', import.meta.url));
const offSiteCanonicals = offSiteCanonicalPaths(new URL('./src/content/', import.meta.url));
const unindexedReviews = unindexedReviewPaths(new URL('./src/content/', import.meta.url));

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
	// Lighthouse score). Fraunces loads its real italic too: captions, chapter titles and
	// quotes are set in it, and without it the browser slanted the roman. Anton isn't
	// here: BaseHead inlines it into every page.
	fonts: [
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
			// 300 for the chapter titles' font-light
			weights: ['300 700'],
			styles: ['normal', 'italic'],
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
		// Each pink picture's levels, measured from its file (global.css, "Pink pictures")
		halftoneLevels(),
		// Every link off the site opens in a new tab
		externalLinks(),
		// A Markdown copy of every indexed page for AI agents: /about/ -> /about.md
		markdownPages(),
		// /resume-pdf/ is the noindex source the resume PDF is printed from; crossposts whose
		// canonical is the original on another site aren't canonical URLs, so they're out too,
		// and so are reviews search shouldn't index (a short one, or a film's shorter review) (noindex on the page)
		sitemap({
			filter: (page) => {
				const { pathname } = new URL(page);
				return (
					pathname !== '/resume-pdf/' &&
					!unindexedIssuePaths.has(pathname) &&
					!offSiteCanonicals.has(pathname) &&
					!unindexedReviews.has(pathname)
				);
			},
			serialize: (item) => {
				const lastmod = contentLastmod.get(new URL(item.url).pathname);
				return lastmod ? { ...item, lastmod } : item;
			},
		}),
		// Before script-csp, so the hashes match the minified scripts
		minifyInlineScripts(),
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
				// First: a paper's pandoc HTML becomes elements the plugins below can see
				rehypePaperRaw,
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
				// After spoilers: a spoiler picture's paragraph becomes its figure
				rehypeFrames,
				rehypeStrayThoughts,
				rehypePostPreviews,
				rehypeNoWidows,
				rehypeSlug,
				// After slug: a table's scroll box is named by the heading above it
				rehypeTableScroll,
				[
					rehypeAutolinkHeadings,
					{
						// After the heading, not inside it: a link inside would add its name to the
						// heading's, so every heading in a screen reader's list ended "Link to section".
						// The wrapper lets the # sit in the margin beside it (prose.css).
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
							// In the Tab order so a keyboard can copy a section's link (Joe, 2026-11-22); it
							// shows when focused (prose.css), so no stop is invisible
						}),
						content: {
							type: 'element',
							tagName: 'span',
							properties: { ariaHidden: 'true' },
							children: [{ type: 'text', value: '#' }],
						},
					},
				],
				rehypeQuoteMarks,
				// After the permalinks: these find each h2 inside its .heading-group
				rehypeInterlude,
				// After the interlude, which it keeps clear of; before chapters, which hide each h2
				rehypeNewsletterMiddle,
				rehypeChapters,
				rehypePaperCitations,
				rehypeMarginNotes,
			],
		}),
	},
	// No `redirects`: a static build turns each one into a 200 page with a meta refresh and
	// noindex. Moved pages are real 301s in the Caddyfile's moved_to map.
});
