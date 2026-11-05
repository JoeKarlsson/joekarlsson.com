import { describe, it, expect } from 'vitest';
import { smoothPath } from '../src/scripts/drawing-board';

describe('smoothPath', () => {
	it('is empty with no points and a bare move with one', () => {
		expect(smoothPath([])).toBe('');
		expect(smoothPath([[1, 2]])).toBe('M1.0,2.0');
	});

	it('curves through each interior point to the next midpoint', () => {
		expect(
			smoothPath([
				[0, 0],
				[10, 0],
				[10, 10],
				[20, 10],
			]),
		).toBe('M0.0,0.0 Q10.0,0.0 10.0,5.0 Q10.0,10.0 15.0,10.0');
	});
});
