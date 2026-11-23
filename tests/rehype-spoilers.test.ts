import { describe, expect, it } from 'vitest';
import rehypeSpoilers from '../src/plugins/rehype-spoilers.mjs';

type HastNode = {
	type: string;
	tagName?: string;
	properties?: Record<string, unknown>;
	children?: HastNode[];
	value?: string;
};

const text = (value: string): HastNode => ({ type: 'text', value });
const el = (tagName: string, ...children: HastNode[]): HastNode => ({
	type: 'element',
	tagName,
	properties: {},
	children,
});
function run(root: HastNode): HastNode {
	(rehypeSpoilers() as (t: HastNode) => void)(root);
	return root;
}
const textOf = (n: HastNode): string => n.value ?? (n.children ?? []).map(textOf).join('');

describe('rehype-spoilers', () => {
	it('wraps each ||marked|| phrase in a focusable spoiler with a spoken label', () => {
		const p = el('p', text('That jump is where ||Amanda Seyfried walks in||. Then ||Billy||.'));
		run(el('root', p));
		const spoilers = p.children!.filter((c) => c.tagName === 'span');
		expect(spoilers.map(textOf)).toEqual(['Spoiler: Amanda Seyfried walks in', 'Spoiler: Billy']);
		expect(spoilers[0].properties).toMatchObject({
			className: ['spoiler'],
			tabIndex: 0,
			ariaPressed: 'false',
		});
		expect(textOf(p)).toBe(
			'That jump is where Spoiler: Amanda Seyfried walks in. Then Spoiler: Billy.',
		);
	});

	it('turns the paragraph of a picture titled "spoiler" into a spoiler frame', () => {
		const img: HastNode = {
			type: 'element',
			tagName: 'img',
			properties: { src: '/end.webp', alt: 'The last shot', title: 'spoiler' },
			children: [],
		};
		const p = el('p', img);
		run(el('root', p));
		expect(p.properties).toEqual({ className: ['spoiler-frame'] });
		const button = p.children!.at(-1)!;
		expect(button).toMatchObject({
			tagName: 'button',
			properties: { type: 'button', className: ['spoiler-show'] },
		});
		expect(img.properties).not.toHaveProperty('title');
		expect(textOf(p)).toBe('Spoiler picture: Show spoiler');
	});

	it('clears the title from both pictures of a spoiler pair', () => {
		const frame = (src: string): HastNode => ({
			type: 'element',
			tagName: 'img',
			properties: { src, alt: 'A frame', title: 'spoiler' },
			children: [],
		});
		const pair = [frame('/a.webp'), frame('/b.webp')];
		run(el('root', el('p', pair[0], text(' '), pair[1])));
		expect(pair.map((img) => img.properties)).toEqual([
			{ src: '/a.webp', alt: 'A frame' },
			{ src: '/b.webp', alt: 'A frame' },
		]);
	});

	it('leaves a picture with any other title alone', () => {
		const img: HastNode = {
			type: 'element',
			tagName: 'img',
			properties: { src: '/a.webp', title: 'A caption' },
			children: [],
		};
		const p = el('p', img);
		run(el('root', p));
		expect(p.properties).toEqual({});
		expect(img.properties).toHaveProperty('title', 'A caption');
	});

	it('leaves code alone, where || is an or', () => {
		const code = el('code', text('a ||b|| c'));
		run(el('root', el('p', code)));
		expect(code.children).toEqual([text('a ||b|| c')]);
	});

	it('ignores pipes that hug spaces, like a table-ish "x || y || z"', () => {
		const p = el('p', text('x || y || z'));
		run(el('root', p));
		expect(p.children).toEqual([text('x || y || z')]);
	});
});
