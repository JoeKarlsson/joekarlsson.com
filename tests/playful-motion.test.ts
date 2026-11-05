import { describe, it, expect } from 'vitest';
import {
	advanceCurl,
	curledPoint,
	hasCursorTrail,
	livePoints,
	newCurl,
	pointsAlongMove,
	TRAIL_LIFETIME_MS,
} from '../src/scripts/cursor-trail';
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
			{ x: 0, y: 0, time: 0, angle: 0, reach: 10 },
			{ x: 1, y: 1, time: 500, angle: 0, reach: 10 },
		];
		expect(livePoints(points, TRAIL_LIFETIME_MS + 100)).toEqual([points[1]]);
	});
});

describe('curledPoint', () => {
	it('sits on the cursor path when new and swings out to its reach as it ages', () => {
		const point = { x: 100, y: 100, time: 0, angle: 0, reach: 12 };
		expect(curledPoint(point, 0)).toEqual([100, 100]);
		expect(curledPoint(point, TRAIL_LIFETIME_MS)).toEqual([112, 100]);
	});
});

describe('advanceCurl', () => {
	it('holds its course until the stretch runs out, then heads somewhere new', () => {
		const random = () => 0.9;
		const curl = newCurl(random);
		const firstTurn = curl.targetTurn;
		advanceCurl(curl, curl.untilChange - 1, () => 0.1);
		expect(curl.targetTurn).toBe(firstTurn);
		advanceCurl(curl, 2, () => 0.1);
		expect(curl.targetTurn).not.toBe(firstTurn);
	});
});

describe('pointsAlongMove', () => {
	it('fills a long jump in with close points, turning round the curl as it goes', () => {
		const curl = newCurl(() => 0.5);
		const last = { x: 0, y: 0, time: 0, angle: 0, reach: curl.reach };
		const filled = pointsAlongMove(last, 40, 0, 100, curl, () => 0.5);
		expect(filled).toHaveLength(10);
		expect(filled.at(-1)).toMatchObject({ x: 40, y: 0, time: 100 });
		expect(filled.at(-1)!.angle).not.toBe(0);
	});
});
