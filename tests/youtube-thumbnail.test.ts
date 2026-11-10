import { describe, expect, it } from 'vitest';
import { fillHoles } from '../scripts/youtube-thumbnail.mjs';

// A 200x200 mask: Joe is a solid square with a one-pixel hole (teeth) and a 10x10 gap
// (background seen through him; holes up to 0.03% of the image, 12px here, count as teeth)
function mask() {
	const w = 200;
	const alpha = new Uint8Array(w * w);
	for (let y = 5; y < 195; y++) for (let x = 5; x < 195; x++) alpha[y * w + x] = 255;
	alpha[10 * w + 10] = 0; // one-pixel hole, small enough to be teeth
	for (let y = 20; y < 30; y++) for (let x = 20; x < 30; x++) alpha[y * w + x] = 0; // 100px gap
	return { w, alpha };
}

describe('fillHoles', () => {
	it('fills small enclosed holes and keeps big gaps and the outside clear', () => {
		const { w, alpha } = mask();
		const solid = fillHoles(alpha, w, w);
		expect(solid[10 * w + 10]).toBe(255);
		expect(solid[25 * w + 25]).toBe(0);
		expect(solid[0]).toBe(0);
	});

	it('fills a big hole when it sits on his face', () => {
		const { w, alpha } = mask();
		const solid = fillHoles(alpha, w, w, [25, 25, 8, 8]);
		expect(solid[25 * w + 25]).toBe(255);
	});
});
