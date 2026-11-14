import { describe, expect, it } from 'vitest';
import { stripDayLabels } from '../src/utils/strip-days';

describe('stripDayLabels', () => {
	it('ends on the snapshot day and crosses month ends', () => {
		expect(stripDayLabels('2026-11-02', 4)).toEqual(['Oct 30', 'Oct 31', 'Nov 1', 'Nov 2']);
	});
});
