import { describe, expect, it } from 'vitest';
import rehypeNewsletterMiddle, {
	LONG_POST_WORDS,
} from '../src/plugins/rehype-newsletter-middle.mjs';

type Node = {
	type: string;
	tagName?: string;
	properties?: Record<string, unknown>;
	children?: Node[];
	value?: string;
};

const words = (n: number): Node => ({
	type: 'element',
	tagName: 'p',
	properties: {},
	children: [{ type: 'text', value: 'word '.repeat(n) }],
});
const h2 = (title: string): Node => ({
	type: 'element',
	tagName: 'h2',
	properties: {},
	children: [{ type: 'text', value: title }],
});
const BLOG = { path: '/site/src/content/blog/a-post.md' };

function run(children: Node[], file = BLOG) {
	const tree: Node = { type: 'root', children };
	rehypeNewsletterMiddle()(tree, file);
	return tree.children!.map((n) =>
		n.tagName === 'aside' ? 'ASK' : n.tagName === 'h2' ? String(n.children![0].value) : 'p',
	);
}

const long = LONG_POST_WORDS / 4;

describe('rehype-newsletter-middle', () => {
	it('puts one ask before the section heading nearest the middle of a long post', () => {
		expect(
			run([words(long), h2('One'), words(long), h2('Two'), words(long), h2('Three'), words(long)]),
		).toEqual(['p', 'One', 'p', 'ASK', 'Two', 'p', 'Three', 'p']);
	});

	it('leaves short posts, other collections and back matter alone', () => {
		const short = [words(100), h2('One'), words(100)];
		expect(run(short)).not.toContain('ASK');
		const review = [words(long * 2), h2('One'), words(long * 2)];
		expect(run(review, { path: '/site/src/content/reviews/a.md' })).not.toContain('ASK');
		// Only the reference list sits near the middle: no ask
		expect(run([words(long * 2), h2('References'), words(long * 2)])).not.toContain('ASK');
	});

	it('never sits right after an interlude: it takes the next-nearest heading', () => {
		const interlude: Node = {
			type: 'element',
			tagName: 'p',
			properties: { className: ['interlude'] },
			children: [{ type: 'text', value: 'a line' }],
		};
		const part = Math.ceil(LONG_POST_WORDS / 5);
		const sections = ['One', 'Two', 'Three', 'Four', 'Five'].flatMap((title) => [
			...(title === 'Three' ? [interlude] : []),
			h2(title),
			words(part),
		]);
		// Three opens the middle of the post, but the interlude sits before it
		expect(run([words(part), ...sections])).toEqual([
			'p',
			'One',
			'p',
			'ASK',
			'Two',
			'p',
			'p',
			'Three',
			'p',
			'Four',
			'p',
			'Five',
			'p',
		]);
	});

	it('posts to listmonk with its own location, so Plausible tells it from the end ask', () => {
		const tree: Node = { type: 'root', children: [words(long * 2), h2('One'), words(long * 2)] };
		rehypeNewsletterMiddle()(tree, BLOG);
		const form = tree.children![1].children!.find((n) => n.tagName === 'form')!;
		expect(form.properties).toMatchObject({
			action: 'https://newsletter.joekarlsson.com/subscription/form',
			dataLocation: 'post-middle',
		});
		expect(form.properties!.className).toContain('newsletter-signup');
	});
});
