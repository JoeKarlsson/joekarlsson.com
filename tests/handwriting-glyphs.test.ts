import { describe, expect, it } from 'vitest';

import { thin, walk } from '../scripts/diagrams/handwriting-glyphs.mjs';

/** A bitmap from rows of '#' and '.', with the 1-px empty border thin() expects. */
function bitmap(rows: string[]) {
	const w = rows[0].length + 2;
	const h = rows.length + 2;
	const img = new Uint8Array(w * h);
	rows.forEach((row, y) =>
		[...row].forEach((c, x) => (img[(y + 1) * w + x + 1] = c === '#' ? 1 : 0)),
	);
	return { img, w, h };
}

describe('handwriting glyph strokes', () => {
	it('walks a thick L as one pen stroke, with no stubs left at the corner', () => {
		const { img, w, h } = bitmap([
			'###.......',
			'###.......',
			'###.......',
			'###.......',
			'###.......',
			'##########',
			'##########',
			'##########',
		]);
		const strokes = walk(thin(img, w, h), w, h);
		expect(strokes).toHaveLength(1);
	});
	it('leaves no stub where a centre line steps two pixels thick', () => {
		const { img, w, h } = bitmap(['#....', '#....', '##...', '.####']);
		expect(walk(img, w, h)).toHaveLength(1);
	});
});
