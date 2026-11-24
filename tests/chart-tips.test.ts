import { afterEach, describe, expect, it, vi } from 'vitest';
import { tappedChartDot } from '../src/scripts/chart-tips';

describe('tappedChartDot', () => {
	afterEach(() => vi.restoreAllMocks());

	// performance.now() counts from page load, so a click in the first 600ms used to read as a
	// dot tap and the lightbox ignored it (the flaky "enlarged collage" e2e test)
	it('is false before any dot was tapped, even right after the page loads', () => {
		vi.spyOn(performance, 'now').mockReturnValue(100);
		expect(tappedChartDot()).toBe(false);
	});
});
