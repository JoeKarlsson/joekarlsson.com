import { z } from 'zod';

// Notes in the right margin tied to a short phrase of the text, `at` (rehype-margin-notes.mjs).
// A quote needs `by` (and `url` for its source), an update its `date` ("Oct 2026"), a
// see-also its `post` (a blog slug, or reviews/x, newsletter/x, talks/x, or work/x with a
// `title`), an exhibit an `image` with `alt` or just a number in `text`, an aside an optional
// source `url`. Posts, talks, newsletter issues and reviews all take them.
const kinds = [
	z.object({
		type: z.literal('quote'),
		at: z.string(),
		text: z.string(),
		by: z.string(),
		url: z.url().optional(),
	}),
	z.object({
		type: z.literal('term'),
		at: z.string(),
		text: z.string(),
		term: z.string().optional(),
	}),
	z.object({ type: z.literal('update'), at: z.string(), text: z.string(), date: z.string() }),
	z.object({
		type: z.literal('see'),
		at: z.string(),
		text: z.string(),
		post: z.string(),
		title: z.string().optional(),
	}),
	z
		.object({
			type: z.literal('exhibit'),
			at: z.string(),
			text: z.string(),
			image: z.string().optional(),
			alt: z.string().optional(),
		})
		.refine((n) => !n.image || n.alt, 'an exhibit picture needs alt text'),
	z.object({
		type: z.literal('aside'),
		at: z.string(),
		text: z.string(),
		url: z.url().optional(),
	}),
] as const;

export const marginNotes = z.array(z.discriminatedUnion('type', [...kinds])).optional();

// A project page (src/data/projects.ts) also takes a picture: a small captioned photo in the
// margin beside the paragraph holding `at` (src/utils/project-margin-notes.ts)
export const projectMarginNotes = z.array(
	z.discriminatedUnion('type', [
		...kinds,
		z.object({
			type: z.literal('picture'),
			at: z.string(),
			text: z.string(),
			image: z.string(),
			alt: z.string(),
		}),
	]),
);
export type ProjectMarginNote = z.infer<typeof projectMarginNotes>[number];
