import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import rehypeInlineDiagrams from '../src/plugins/rehype-inline-diagrams.mjs';

type HastNode = {
	type: string;
	tagName?: string;
	value?: string;
	properties?: Record<string, unknown>;
	children?: HastNode[];
};

const SVG = (label: string) =>
	`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" role="img" aria-label="${label}"><rect/></svg>\n`;

function publicDirWith(files: Record<string, string>): string {
	const dir = mkdtempSync(path.join(tmpdir(), 'diagrams-'));
	for (const [file, content] of Object.entries(files)) {
		mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
		writeFileSync(path.join(dir, file), content);
	}
	return dir;
}

function paragraphWithImage(src: string, alt: string): HastNode {
	return {
		type: 'root',
		children: [
			{
				type: 'element',
				tagName: 'p',
				properties: {},
				children: [{ type: 'element', tagName: 'img', properties: { src, alt }, children: [] }],
			},
		],
	};
}

function run(publicDir: string, tree: HastNode): HastNode {
	rehypeInlineDiagrams({ publicDir })(tree as never);
	return tree.children![0];
}

describe('rehype-inline-diagrams', () => {
	it('swaps the paragraph for a figure with desktop and phone SVGs, labelled with the alt', () => {
		const dir = publicDirWith({
			'images/blog/post/flow.svg': SVG('old desktop'),
			'images/blog/post/flow.phone.svg': SVG('old phone'),
		});
		const figure = run(dir, paragraphWithImage('/images/blog/post/flow.svg', 'How it "flows"'));

		expect(figure.tagName).toBe('figure');
		expect(figure.properties).toMatchObject({
			className: ['diagram'],
			dataDiagramSrc: '/images/blog/post/flow.svg',
		});
		const [wide, phone] = figure.children!;
		expect(wide.properties?.className).toEqual(['diagram-wide']);
		expect(phone.properties?.className).toEqual(['diagram-phone']);
		expect(wide.children![0].value).toContain('aria-label="How it &quot;flows&quot;"');
		expect(phone.children![0].value).not.toContain('old phone');
	});

	it('keeps dollar amounts in the alt as written', () => {
		const dir = publicDirWith({ 'images/blog/post/cost.svg': SVG('x') });
		const alt = 'Power cost: about $105 a year, then $565, and $& stays too';
		const figure = run(dir, paragraphWithImage('/images/blog/post/cost.svg', alt));
		const svg = figure.children![0].children![0].value!;
		expect(svg).toContain(`aria-label="${alt.replaceAll('&', '&amp;')}"`);
		expect(svg.match(/xmlns=/g)).toHaveLength(1);
	});

	it('inlines only the desktop SVG when there is no phone version', () => {
		const dir = publicDirWith({ 'images/blog/post/flow.svg': SVG('x') });
		const figure = run(dir, paragraphWithImage('/images/blog/post/flow.svg', 'Flow'));
		expect(figure.children).toHaveLength(1);
	});

	it('leaves other images, and SVGs missing from public/, as they are', () => {
		const dir = publicDirWith({});
		expect(run(dir, paragraphWithImage('/images/blog/post/photo.webp', 'A photo')).tagName).toBe(
			'p',
		);
		expect(run(dir, paragraphWithImage('/images/blog/post/missing.svg', 'Gone')).tagName).toBe('p');
	});
});
