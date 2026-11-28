import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { create } from 'fontkitten';

// The Joe Pastel subsets hold only the letters their lines use (src/styles/joe-pastel.css).
// Reword a line without regenerating its subset and the new letters would fall back to
// another font in the middle of Joe's handwriting.
const LINES = [
	{ file: 'src/pages/index.astro', cls: 'pastel-hand', font: 'joe-pastel-hand.woff2' },
	{ file: 'src/pages/404.astro', cls: 'pastel-hand', font: 'joe-pastel-hand.woff2' },
	{ file: 'src/layouts/BlogPost.astro', cls: 'pastel-label', font: 'joe-pastel-tldr.woff2' },
];

function textOf(file: string, cls: string): string {
	const source = readFileSync(file, 'utf8');
	const match = source.match(new RegExp(`class="${cls}[^"]*">([^<]+)<`));
	if (!match) throw new Error(`${file} has no element with class ${cls}`);
	return match[1]
		.replace(/&nbsp;/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

describe('Joe Pastel subsets', () => {
	for (const { file, cls, font } of LINES) {
		it(`${font} has every letter of the ${cls} line in ${file}`, () => {
			const face = create(readFileSync(`src/assets/fonts/${font}`));
			if (!('glyphsForString' in face)) throw new Error(`${font} is a font collection`);
			const text = textOf(file, cls);
			const missing = [...new Set(text.replace(/ /g, ''))].filter(
				(ch) => face.glyphsForString(ch)[0]?.id === 0,
			);
			expect(text.length).toBeGreaterThan(0);
			expect(missing).toEqual([]);
		});
	}
});

describe("Joe's hand in diagram callouts", () => {
	it("says which letters it doesn't have yet, so render.mjs can write the post in Kalam", async () => {
		const { handwritingWidth, MissingGlyph } = await import('../scripts/diagrams/handwriting.mjs');
		expect(handwritingWidth('Fast, but only as fresh', 19, 'joe')).toBeGreaterThan(0);
		expect(() => handwritingWidth('8,076 marks kept', 19, 'joe')).toThrow(MissingGlyph);
		expect(handwritingWidth('8,076 marks kept', 19, 'kalam')).toBeGreaterThan(0);
	});
});

describe('the Joe Pastel boil clock', () => {
	it('steps three frames every half second, in step with the #boil filter', async () => {
		const { boilFrameAt } = await import('../src/utils/paper-hero-motion');
		expect(boilFrameAt(0)).toEqual({ frame: 0, untilNext: 500 / 3 });
		expect(boilFrameAt(200).frame).toBe(1);
		expect(boilFrameAt(400).frame).toBe(2);
		expect(boilFrameAt(510).frame).toBe(0);
		expect(boilFrameAt(200).untilNext).toBeCloseTo((500 / 3) * 2 - 200);
	});
});
