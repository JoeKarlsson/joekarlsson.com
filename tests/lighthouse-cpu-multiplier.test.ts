import { describe, expect, it } from 'vitest';
import { cpuMultiplier } from '../scripts/lighthouse-cpu-multiplier.mjs';

describe('cpuMultiplier', () => {
	it('keeps 4x on the fast runners the gates were measured on, and scales the slow ones down', () => {
		expect(cpuMultiplier(4000)).toBe(4);
		expect(cpuMultiplier(2450)).toBe(2.45);
		expect(cpuMultiplier(4320)).toBe(4.32);
	});
	it('never speeds the CPU up, and refuses a missing benchmark', () => {
		expect(cpuMultiplier(500)).toBe(1);
		expect(() => cpuMultiplier(Number.NaN)).toThrow();
		expect(() => cpuMultiplier(0)).toThrow();
	});
});
