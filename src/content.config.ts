import { defineCollection } from 'astro:content';
import { z } from 'zod';
import { glob } from 'astro/loaders';
import { BLOG_CATEGORIES, EMPLOYERS } from './utils/categories';
import { curlyApostrophes } from './utils/curly-apostrophes.mjs';
import { marginNotes } from './utils/margin-notes-schema';

// Text shown as written, curled once here so every page, card and feed gets “” and ’
const prose = z.string().transform(curlyApostrophes);

// Hacker News cuts titles at 80 characters. A post or issue whose title runs longer sets a
// shorter shareTitle for the share links (tests/content-schema.test.ts enforces this).
export const SHARE_TITLE_MAX = 80;
const shareTitle = z.string().max(SHARE_TITLE_MAX).transform(curlyApostrophes).optional();

// Google shows about 60 characters of a page title. A title longer than SEO_TITLE_MAX sets a
// shorter seoTitle for the browser tab and search results, so "<seoTitle> | Joe Karlsson" fits;
// the page heading keeps the full title (tests/content-schema.test.ts enforces this).
export const SEO_TITLE_MAX = 45;
const seoTitle = z.string().max(SEO_TITLE_MAX).transform(curlyApostrophes).optional();

const postSchema = z.object({
	title: prose,
	shareTitle,
	seoTitle,
	date: z.coerce.date(),
	slug: z.string(),
	description: prose.optional().default(''),
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
	// A flat, still copy of a taped card for the masthead, which shows pictures with no tilt
	// or tape (scripts/generate-work-thumbnails.mjs); the feed and og:image keep heroImage
	mastheadImage: z.string().optional(),
	updatedDate: z.coerce.date().optional(),
	// What a refresh changed, shown in a banner at the top of the post with the updatedDate
	// ("Updated November 2026: ..."). Needs updatedDate (tests/content-schema.test.ts).
	updateNote: prose.optional(),
	// Mistakes fixed in the post, each dated, listed newest first in a box at the top
	// ("Corrections: Nov 13, 2026: I said 8 GB of RAM; it runs fine on 4."). Notes take `code` spans and links
	corrections: z.array(z.object({ date: z.coerce.date(), note: z.string() })).optional(),
	canonicalUrl: z.url().optional(),
	contentNotice: z.union([prose, z.boolean()]).optional(),
	tldr: prose.optional(),
	// A long post's chapter openers (rehype-chapters.mjs) can carry an epigraph: an exact
	// quote from that section, keyed by the section's heading text
	epigraphs: z
		.array(z.object({ section: z.string(), quote: z.string(), cite: z.string() }))
		.optional(),
	// One line of the post's own text, set alone between two sections (rehype-interlude.mjs)
	interlude: z.object({ after: z.string(), line: z.string() }).optional(),
	faq: z.array(z.object({ question: z.string(), answer: z.string() })).optional(),
	howToSteps: z.array(z.object({ name: z.string(), text: z.string() })).optional(),
	marginNotes,
});

const blog = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	schema: postSchema,
});

// Talk write-ups, served at /talks/<slug>/ (src/pages/talks/[slug].astro) with the blog's
// post layout. Each lists the videos on its page for the VideoObject JSON-LD, the talk's
// own recording first; chapters (from the YouTube package READMEs on the NAS) are timed to
// that video, so a recording with an intro bumper gets its own offsets.
const talks = defineCollection({
	loader: glob({ base: './src/content/talks', pattern: '**/*.md' }),
	schema: postSchema.extend({
		videos: z
			.array(
				z.object({
					id: z.string().regex(/^[\w-]{11}$/),
					chapters: z.array(z.object({ at: z.string(), name: z.string() })).optional(),
				}),
			)
			.min(1),
	}),
});

// TL;DR in Tech back issues, imported from Substack (scripts/import-substack-newsletter.mjs).
// Kept out of the blog list, homepage and RSS on purpose: they are an archive.
const newsletter = defineCollection({
	loader: glob({ base: './src/content/newsletter', pattern: '**/*.md' }),
	schema: z.object({
		title: prose,
		shareTitle,
		seoTitle,
		date: z.coerce.date(),
		slug: z.string(),
		description: prose.optional().default(''),
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
		marginNotes,
	}),
});

// Joe's film reviews, imported from Letterboxd (scripts/update-reviews.mjs), served at
// /reviews/<slug>/ with the blog's post layout. `date` is the day he watched it.
const reviews = defineCollection({
	loader: glob({ base: './src/content/reviews', pattern: '**/*.md' }),
	schema: z.object({
		title: prose,
		year: z.number().int(),
		date: z.coerce.date(),
		rating: z.number().min(0.5).max(5).multipleOf(0.5).optional(),
		rewatch: z.boolean().optional().default(false),
		spoilers: z.boolean().optional().default(false),
		director: prose.optional(),
		genres: z.array(z.string()).optional().default([]),
		// From the film's Letterboxd page, for /reviews/stats/ (scripts/update-reviews.mjs)
		runtime: z.number().int().optional(),
		cast: z.array(prose).optional().default([]),
		countries: z.array(z.string()).optional().default([]),
		language: z.string().optional(),
		studios: z.array(z.string()).optional().default([]),
		letterboxdAverage: z.number().optional(),
		slug: z.string(),
		description: prose.optional().default(''),
		letterboxdUrl: z.url(),
		// The film's page on Bechdel.io when it's in that corpus (scripts/link-bechdel.mjs)
		bechdelUrl: z.url().optional(),
		poster: z.string().optional(),
		heroImage: z.string().optional(),
		heroAlt: z.string().optional(),
		// Who the backdrop shows, as its caption (written by hand; the import has no names)
		heroCaption: prose.optional(),
		// Mistakes fixed after posting, in the blog's dated corrections box
		updatedDate: z.coerce.date().optional(),
		corrections: z.array(z.object({ date: z.coerce.date(), note: z.string() })).optional(),
		marginNotes,
	}),
});

export const collections = { blog, talks, newsletter, reviews };
