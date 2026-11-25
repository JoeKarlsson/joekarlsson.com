import { describe, expect, it } from 'vitest';
import { withWatermark } from '../src/utils/watermark.mjs';

describe('withWatermark', () => {
	it('adds a strip below the drawing and puts the JK mark in it, at 40%', () => {
		const out = withWatermark('<svg viewBox="0 0 640 420" width="640" height="420"><rect/></svg>');
		const [, , vbHeight] = out.match(/viewBox="0 0 (\d+) ([\d.]+)"/)!.map(Number);
		const [, x, y, scale] = out
			.match(/translate\(([\d.]+) ([\d.]+)\) scale\(([\d.]+)\)/)!
			.map(Number);
		expect(vbHeight).toBeGreaterThan(420);
		expect(out).toContain(`height="${vbHeight}"`);
		expect(y).toBeGreaterThanOrEqual(420); // below the drawing, never over it
		expect(y + 106 * scale).toBeCloseTo(vbHeight, 0);
		expect(x + 116 * scale).toBeLessThanOrEqual(640);
		expect(out).toMatch(/<g class="jk-mark" opacity="0.4"[^>]*>.*<\/g><\/svg>$/);
		expect(out).not.toMatch(/\bid=/);
	});

	it('leaves an SVG without a usable viewBox alone', () => {
		expect(withWatermark('<svg width="10"></svg>')).toBe('<svg width="10"></svg>');
		expect(withWatermark('<svg viewBox="0 0 0 0"></svg>')).toBe('<svg viewBox="0 0 0 0"></svg>');
	});
});
