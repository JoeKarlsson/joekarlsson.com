import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { create } from 'fontkitten';

// Anton's real letter widths, so a headline can shrink exactly enough to fit its box.
// Read at build time from the same file scripts/generate-brand.mjs draws the logo from.
const file = create(readFileSync(join(process.cwd(), 'brand/source/Anton-Regular.ttf')));
if (file.isCollection) throw new Error('Anton-Regular.ttf should be one font, not a collection');
const anton = file;

/** Width of `text` set in Anton, in em (1 = the font size) */
export function antonWidthInEm(text: string): number {
	let units = 0;
	for (const char of text) {
		const glyph = anton.glyphForCodePoint(char.codePointAt(0)!);
		if (!glyph.id) throw new Error(`Anton has no glyph for "${char}"`);
		units += glyph.advanceWidth;
	}
	return units / anton.unitsPerEm;
}
