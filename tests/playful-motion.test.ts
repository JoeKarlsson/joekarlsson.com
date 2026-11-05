import { describe, it, expect } from 'vitest';
import { hasCursorTrail, livePoints, TRAIL_LIFETIME_MS } from '../src/scripts/cursor-trail';
import { distanceToRect } from '../src/scripts/scribble-notice';

describe('hasCursorTrail', () => {
	it('is off across the blog and the newsletter, and on everywhere else', () => {
		for (const path of [
			'/blog/',
			'/blog/a-post/',
			'/blog/category/ai/',
			'/newsletter/',
			'/newsletter/an-issue/',
		])
			expect(hasCursorTrail(path)).toBe(false);
		for (const path of ['/', '/about/', '/work/', '/blogroll/', '/uses/'])
			expect(hasCursorTrail(path)).toBe(true);
	});
});

describe('distanceToRect', () => {
	const rect = { left: 10, top: 10, right: 20, bottom: 20 };

	it('is zero inside the rectangle', () => {
		expect(distanceToRect(15, 15, rect)).toBe(0);
	});

	it('measures straight out from an edge, and diagonally from a corner', () => {
		expect(distanceToRect(25, 15, rect)).toBe(5);
		expect(distanceToRect(23, 24, rect)).toBe(5);
	});
});

describe('livePoints', () => {
	it('drops points older than the trail lifetime', () => {
		const points = [
			{ x: 0, y: 0, time: 0 },
			{ x: 1, y: 1, time: 500 },
		];
		expect(livePoints(points, TRAIL_LIFETIME_MS + 100)).toEqual([points[1]]);
	});
});
