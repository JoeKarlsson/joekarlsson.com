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

describe('handwritten callouts', () => {
	it('moves the pen from rest to rest: none before it starts, all of it by the end', async () => {
		const { moveDistance, moveTime } = await import('../scripts/diagrams/handwriting.mjs');
		const T = moveTime(100, 300, 12000);
		expect(moveDistance(100, 300, 12000, -1)).toBe(0);
		expect(moveDistance(100, 300, 12000, T / 2)).toBeCloseTo(50, 5);
		expect(moveDistance(100, 300, 12000, T + 1)).toBe(100);
	});

	it('gives reduced motion the finished note with no animation', async () => {
		const { handwritingLayers } = await import('../scripts/diagrams/handwriting.mjs');
		const { live, still } = handwritingLayers(
			[{ x: 10, y: 40, content: 'Hi there.', size: 19, color: '#ff4fd8' }],
			{ id: 't', width: 200, height: 80 },
		);
		expect(live).toContain('<animate');
		expect(still).toContain('class="anim-still"');
		expect(still).not.toContain('<animate');
		expect(still.match(/<path /g)).toHaveLength(8); // one outline per letter of "Hithere."
	});

	it('writes a full line in about a second, so it lands while the reader scrolls past', async () => {
		const { writeTime } = await import('../scripts/diagrams/handwriting.mjs');
		expect(writeTime('Fast,butonlyasfreshasthelastETLrun.'.length)).toBeLessThanOrEqual(1.2);
		expect(writeTime(3)).toBe(0.5);
	});

	it('writes a three-line note in about a second, like a one-line note', async () => {
		const { handwritingLayers } = await import('../scripts/diagrams/handwriting.mjs');
		const line = (y: number, arrow?: object) => ({
			x: 10,
			y,
			content: 'Two friends vote on it.',
			size: 19,
			color: '#ff4fd8',
			arrow,
		});
		const arrow = { d: 'M10,90 Q20,80 30,70', tip: [30, 70], markup: '<path d="M10,90"/>' };
		const { live } = handwritingLayers([line(20), line(44), line(68, arrow)], {
			id: 'b',
			width: 300,
			height: 100,
		});
		// When each pen stroke first shows: the last one must start within the note's 1.2 s budget
		const starts = [
			...live
				.slice(0, live.indexOf('id="b-arrow-'))
				.matchAll(/values="hidden;visible[^"]*" keyTimes="0\.0000;([\d.]+)[^"]*" dur="([\d.]+)s"/g),
		].map(([, key, dur]) => Number(key) * Number(dur));
		expect(starts.length).toBeGreaterThan(20);
		// One drawing of slack: a stroke shows on the next 12 fps drawing after it starts
		expect(Math.max(...starts)).toBeLessThan(0.15 + 1.2 + 1 / 12);
	});
});
