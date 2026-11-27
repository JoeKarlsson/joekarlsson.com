/**
 * A short newsletter ask halfway down a long blog post: one slim strip between two sections,
 * the name, one line and the email form (newsletter round 1, option B; DECISIONS.md
 * 2026-11-27; .newsletter-middle in prose.css). The ask at the end of the post stays.
 *
 * Why the middle: in November 2,678 readers scrolled into a post and 352 finished it, and the
 * ask at the end made 2 signups. Plausible tells the two apart by location (post-middle,
 * post-end); NewsletterSignup.astro's script records the signup for every form.newsletter-signup.
 *
 * Long means about ten minutes to read (2,500 words at the site's 250 a minute). The strip goes
 * before the section heading nearest the middle of the text, never before the closing
 * reference lists or FAQ, and never right after an interlude. Runs after rehype-interlude and
 * before rehype-chapters, which wraps each h2 in a chapter opener.
 */
import { NEWSLETTER } from '../consts.ts';
import { h2Of, textOf } from './hast-text.mjs';
import { NOT_CHAPTERS } from './rehype-chapters.mjs';

export const LONG_POST_WORDS = 2500;
const LOCATION = 'post-middle';

const el = (tagName, properties, children = []) => ({
	type: 'element',
	tagName,
	properties,
	children,
});
const text = (value) => ({ type: 'text', value });
const wordsIn = (node) => textOf(node).split(/\s+/).filter(Boolean).length;
const isBlogPost = (file) => Boolean(file?.path?.includes('/src/content/blog/'));

/** The strip: the same form, fields and tracking as NewsletterSignup.astro, in one row. */
export function newsletterMiddle() {
	const inputId = `newsletter-email-${LOCATION}`;
	return el('aside', { className: ['newsletter-middle'], ariaLabel: 'Newsletter' }, [
		el('p', { className: ['newsletter-middle-row'] }, [
			el('span', { className: ['newsletter-middle-name'] }, [text(NEWSLETTER.name)]),
			el('span', { className: ['newsletter-middle-say'] }, [text('Get the next post by email.')]),
		]),
		el(
			'form',
			{
				method: 'post',
				action: NEWSLETTER.subscribeAction,
				className: [
					'newsletter-signup',
					'flex',
					'max-w-[520px]',
					'flex-col',
					'gap-2',
					'sm:flex-row',
				],
				dataLocation: LOCATION,
			},
			[
				el('input', { type: 'hidden', name: 'l', value: NEWSLETTER.listUuid }),
				// Honeypot: listmonk rejects the submission if this is filled in
				el('input', {
					type: 'text',
					name: 'nonce',
					value: '',
					tabIndex: -1,
					autoComplete: 'off',
					ariaHidden: 'true',
					className: ['hidden'],
				}),
				el('label', { htmlFor: inputId, className: ['sr-only'] }, [text('Email address')]),
				el('input', {
					id: inputId,
					type: 'email',
					name: 'email',
					required: true,
					autoComplete: 'email',
					autoCapitalize: 'none',
					autoCorrect: 'off',
					spellCheck: 'false',
					placeholder: 'you@example.com',
					className: [
						'min-w-0',
						'flex-1',
						'rounded-md',
						'bg-ink',
						'px-4',
						'py-3',
						'text-base',
						'text-paper',
						'placeholder-muted',
						'border',
						'border-muted',
						'transition-colors',
						'focus:border-pink',
					],
				}),
				el(
					'button',
					{
						type: 'submit',
						className: [
							'sticker',
							'min-w-[8.5em]',
							'cursor-pointer',
							'rounded-md',
							'border',
							'border-transparent',
							'px-[17px]',
							'py-[11px]',
							'font-semibold',
							'bg-pink',
							'text-ink',
							'hover:bg-paper',
						],
					},
					[text('Subscribe')],
				),
			],
		),
		el('p', { className: ['newsletter-middle-fine'] }, [
			text('Free. You’ll get an email to confirm first.'),
		]),
	]);
}

export default function rehypeNewsletterMiddle() {
	return (tree, file) => {
		if (!isBlogPost(file)) return;
		const total = wordsIn(tree);
		if (total < LONG_POST_WORDS) return;

		// Words before each section heading, as a share of the post
		let before = 0;
		const candidates = [];
		tree.children.forEach((node, index) => {
			const h2 = h2Of(node);
			if (h2 && !NOT_CHAPTERS.test(textOf(h2).trim())) {
				const previous = tree.children.slice(0, index).findLast((n) => n.type === 'element');
				const afterInterlude = previous?.properties?.className?.includes('interlude');
				if (!afterInterlude && before > 0) candidates.push({ index, share: before / total });
			}
			before += wordsIn(node);
		});
		const middle = candidates
			.filter((c) => c.share >= 0.3 && c.share <= 0.7)
			.sort((a, b) => Math.abs(a.share - 0.5) - Math.abs(b.share - 0.5))[0];
		if (!middle) return;
		tree.children.splice(middle.index, 0, newsletterMiddle());
	};
}
