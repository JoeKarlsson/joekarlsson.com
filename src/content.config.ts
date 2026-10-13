import { defineCollection } from 'astro:content';
import { z } from 'zod';
import { glob } from 'astro/loaders';

const blog = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		date: z.coerce.date(),
		slug: z.string(),
		description: z.string().optional().default(''),
		categories: z.array(z.string()).optional().default([]),
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
		date: z.coerce.date(),
		slug: z.string(),
		description: z.string().optional().default(''),
		issue: z.number().int().optional(),
		substackUrl: z.url().optional(),
		// Header image for the post page, its og:image and its card in the blog list.
		heroImage: z.string().optional(),
		heroAlt: z.string().optional(),
	}),
});

export const collections = { blog, newsletter };
