import { describe, expect, it } from 'vitest';
import { rubberBand, rubberClamp } from '../src/utils/rubber-band';

describe('rubberClamp', () => {
	it('follows 1:1 inside the limits and resists past them, never beyond give', () => {
		expect(rubberClamp(30, -50, 50, 40)).toBe(30);
		expect(rubberClamp(90, -50, 50, 40)).toBe(70);
		expect(rubberClamp(-90, -50, 50, 40)).toBe(-70);
		expect(rubberBand(1e6, 40)).toBeLessThan(40);
	});
});
