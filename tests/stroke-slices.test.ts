import { describe, expect, it } from 'vitest';
import { strokeSlices } from '../src/utils/stroke-slices';

describe('strokeSlices', () => {
	it('gives each stroke a share of the pen run by its length, one after another', () => {
		// A 300-long line, then a 100-long one
		const [long, short] = strokeSlices(['M0,0 L300,0', 'M0,10 L100,10']);
		expect(long).toEqual({ at: 0, share: 0.75 });
		expect(short).toEqual({ at: 0.75, share: 0.25 });
	});

	it('still gives a dot a sliver, so its time is never zero', () => {
		const [, dot] = strokeSlices(['M0,0 L1000,0', 'M5,5']);
		expect(dot.share).toBeGreaterThan(0);
	});
});
