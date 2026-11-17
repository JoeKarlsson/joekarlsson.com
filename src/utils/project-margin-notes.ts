import { fromHtml } from 'hast-util-from-html';
import { toHtml } from 'hast-util-to-html';
import rehypeMarginNotes from '../plugins/rehype-margin-notes.mjs';
import { localImageSize } from './image-size.mjs';
import { inlineMarkdown } from './inline-markdown';

// A project page's margin notes (src/data/projects.ts): the post kinds (content.config.ts's
// marginNotes), plus a `picture`, a small captioned photo beside the paragraph holding `at`
export type ProjectMarginNote = {
	type: 'quote' | 'term' | 'update' | 'see' | 'exhibit' | 'aside' | 'picture';
	at: string;
	text: string;
	by?: string;
	url?: string;
	term?: string;
	date?: string;
	post?: string;
	title?: string;
	image?: string;
	alt?: string;
};

const plain = (s: string) =>
	s
		.replace(/<[^>]+>/g, '')
		.replace(/&amp;/g, '&')
		.replace(/&quot;/g, '"')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/[‘’]/g, "'")
		.replace(/[“”]/g, '"')
		.replace(/\u00A0/g, ' ');

/**
 * One section's paragraphs as HTML, each led by its margin notes the way a post's are
 * (rehype-margin-notes.mjs). `placed` carries the note count and the notes used across the
 * page's sections, so numbers run on; checkAllPlaced fails the build on a note that found no text.
 */
export async function annotate(
	paragraphs: string[],
	notes: ProjectMarginNote[] = [],
	placed = { count: 0, used: new Set<ProjectMarginNote>() },
): Promise<string[]> {
	const out: string[] = [];
	for (const paragraph of paragraphs) {
		const html = inlineMarkdown(paragraph);
		const mine = notes.filter((n) => !placed.used.has(n) && plain(html).includes(plain(n.at)));
		mine.forEach((n) => placed.used.add(n));
		const pictures = await Promise.all(
			mine
				.filter((n) => n.type === 'picture')
				.map(async (n) => ({
					type: 'element' as const,
					tagName: 'p',
					properties: {},
					children: [
						{
							type: 'element' as const,
							tagName: 'img',
							properties: {
								src: n.image,
								alt: n.alt,
								title: `margin: ${n.text}`,
								loading: 'lazy',
								...(await localImageSize(n.image)),
							},
							children: [],
						},
					],
				})),
		);
		const tree = {
			type: 'root' as const,
			children: [
				...pictures,
				{
					type: 'element' as const,
					tagName: 'p',
					properties: {},
					children: fromHtml(html, { fragment: true }).children,
				},
			],
		};
		const file = {
			path: 'src/data/projects.ts',
			data: {
				astro: { frontmatter: { marginNotes: mine.filter((n) => n.type !== 'picture') } },
				marginNoteStart: placed.count,
				marginNoteCount: placed.count,
			},
		};
		await (rehypeMarginNotes() as (tree: unknown, file: unknown) => Promise<void>)(tree, file);
		placed.count = file.data.marginNoteCount;
		out.push(toHtml(tree as Parameters<typeof toHtml>[0]));
	}
	return out;
}

export function checkAllPlaced(
	slug: string,
	notes: ProjectMarginNote[] = [],
	placed: { used: Set<ProjectMarginNote> },
) {
	const missing = notes.filter((n) => !placed.used.has(n));
	if (missing.length)
		throw new Error(
			`work/${slug}: no paragraph contains margin note ${missing.map((n) => `"${n.at}"`).join(', ')}`,
		);
}
