import { defineCollection } from 'astro:content';
import { z } from 'zod';
import { glob } from 'astro/loaders';
import { BLOG_CATEGORIES, EMPLOYERS } from './utils/categories';

// Hacker News cuts titles at 80 characters. A post or issue whose title runs longer sets a
// shorter shareTitle for the share links (tests/content-schema.test.ts enforces this).
export const SHARE_TITLE_MAX = 80;
const shareTitle = z.string().max(SHARE_TITLE_MAX).optional();

// Google shows about 60 characters of a page title. A title longer than SEO_TITLE_MAX sets a
// shorter seoTitle for the browser tab and search results, so "<seoTitle> | Joe Karlsson" fits;
// the page heading keeps the full title (tests/content-schema.test.ts enforces this).
export const SEO_TITLE_MAX = 45;
const seoTitle = z.string().max(SEO_TITLE_MAX).optional();

const blog = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		shareTitle,
		seoTitle,
		date: z.coerce.date(),
		slug: z.string(),
		description: z.string().optional().default(''),
		// One or two of the fixed list; a typo or an old category fails the build
		categories: z.array(z.enum(BLOG_CATEGORIES)).min(1).max(2),
		// The employer a post was written for (a crosspost of their blog); none means personal
		writtenFor: z.enum(EMPLOYERS).optional(),
		tags: z.array(z.string()).optional().default([]),
		heroImage: z.string().optional(),
		heroAlt: z.string().optional(),
		// Looping MP4 shown in place of heroImage on the post page. heroImage is
		// still required as its poster and for og:image and blog cards.
		heroVideo: z.string().optional(),
		updatedDate: z.coerce.date().optional(),
		canonicalUrl: z.url().optional(),
		contentNotice: z.union([z.string(), z.boolean()]).optional(),
		tldr: z.string().optional(),
		faq: z.array(z.object({ question: z.string(), answer: z.string() })).optional(),
		howToSteps: z.array(z.object({ name: z.string(), text: z.string() })).optional(),
	}),
});

// TL;DR in Tech back issues, imported from Substack (scripts/import-substack-newsletter.mjs).
// Kept out of the blog list, homepage and RSS on purpose: they are an archive.
const newsletter = defineCollection({
	loader: glob({ base: './src/content/newsletter', pattern: '**/*.md' }),
	schema: z.object({
		title: z.string(),
		shareTitle,
		seoTitle,
		date: z.coerce.date(),
		slug: z.string(),
		description: z.string().optional().default(''),
		issue: z.number().int().optional(),
		substackUrl: z.url().optional(),
		// Header image for the post page, its og:image and its card in the blog list.
		heroImage: z.string().optional(),
		heroAlt: z.string().optional(),
		// Photo for the issue's generated header card (scripts/generate-issue-cards.mjs), a
		// path under public/, and what it shows. Without one the card circles the issue number.
		cardPhoto: z.string().optional(),
		cardPhotoAlt: z.string().optional(),
		// Slug of the blog post this issue condenses. Recaps stay on /newsletter/ only, so the
		// blog list, homepage and RSS don't show the same post twice.
		recapOf: z.string().optional(),
	}),
});

export const collections = { blog, newsletter };
