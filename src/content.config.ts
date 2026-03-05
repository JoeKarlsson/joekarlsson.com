import { defineCollection, z } from 'astro:content';
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
		updatedDate: z.coerce.date().optional(),
		contentNotice: z.union([z.string(), z.boolean()]).optional(),
		tldr: z.string().optional(),
	}),
});

export const collections = { blog };
