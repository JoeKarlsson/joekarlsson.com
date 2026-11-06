import { describe, expect, it } from 'vitest';
import { glyphPath } from '../scripts/generate-brand.mjs';

// Anton's capitals are 1760 font units tall; the brand script maps them to 100 units,
// with y flipped so the baseline sits at 100
describe('glyphPath', () => {
	it('scales font units to cap units, flips y onto the baseline and shifts x', () => {
		expect(glyphPath('M0 0L1760 1760Q880 880 0 1760Z', 10)).toBe('M10 100 L110 0 Q60 50 10 0 Z');
	});

	it('refuses path commands it does not transform', () => {
		expect(() => glyphPath('M0 0H100', 0)).toThrow('Unexpected path command H');
	});
});
