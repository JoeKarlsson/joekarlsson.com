import { createRequire } from 'node:module';

import { describe, expect, it } from 'vitest';

import { keepLargestPiece } from '../scripts/collage/mask.mjs';

// A classic browser script with a CommonJS export (scripts/collage/collage.cjs)
const Collage = createRequire(import.meta.url)('../scripts/collage/collage.cjs');

const scene = {
	canvas: { width: 1920, height: 1080, fps: 24 },
	cadence: { hold_frames: 2 },
	duration: 2,
};
const piece = { x: 500, y: 400, enter_at: 0.5, enter_duration: 0.6, enter_from: 'left' };

describe('collage compositor', () => {
	it('snaps past its target and settles, as pasteup does', () => {
		expect(Collage.easeOutBack(0)).toBeCloseTo(0);
		expect(Collage.easeOutBack(1)).toBeCloseTo(1);
		const peak = Math.max(...Array.from({ length: 100 }, (_, i) => Collage.easeOutBack(i / 100)));
		expect(peak).toBeGreaterThan(1.08);
		expect(peak).toBeLessThan(1.12);
	});

	it('holds each pose for two frames', () => {
		expect(Collage.poseTime(0, scene)).toBe(Collage.poseTime(1, scene));
		expect(Collage.poseTime(2, scene)).toBeCloseTo(2 / 24);
		expect(Collage.frameCount(scene)).toBe(48);
	});

	it('hides a piece until it enters, lands it on target, and settles its shadow', () => {
		expect(Collage.elementPose(piece, 0.4, 1920, 1080, 200, 100).visible).toBe(false);
		const landed = Collage.elementPose(piece, 1.2, 1920, 1080, 200, 100);
		expect([landed.x, landed.y, landed.shadowScale]).toEqual([500, 400, 1]);
		expect(Collage.elementPose(piece, 0.55, 1920, 1080, 200, 100).shadowScale).toBeGreaterThan(1.4);
	});

	it('ends a curved path on the target', () => {
		const curved = {
			...piece,
			enter_path: [
				[-200, 900],
				[400, 100],
			],
		};
		const landed = Collage.elementPose(curved, 2, 1920, 1080, 200, 100);
		expect(landed.x).toBeCloseTo(500);
		expect(landed.y).toBeCloseTo(400);
	});

	it('moves a landed piece through its moves in order, each from where the last one left it', () => {
		const split = {
			...piece,
			moves: [
				{ at: 1.5, x: 560, duration: 0.4 },
				{ at: 2.5, y: 1300, rotation: 30, ease: 'in', duration: 0.5 },
				{ at: 4, x: 500, y: 400, rotation: 0, duration: 0.5 },
			],
		};
		const at = (t: number) => Collage.elementPose(split, t, 1920, 1080, 200, 100);
		expect([at(1.4).x, at(1.4).y]).toEqual([500, 400]);
		expect([at(2).x, at(2).y, at(2).shadowScale]).toEqual([560, 400, 1]);
		expect(at(2.6).shadowScale).toBeGreaterThan(1);
		expect([at(3.2).x, at(3.2).y, at(3.2).rotation]).toEqual([560, 1300, 30]);
		expect([at(5).x, at(5).y, at(5).rotation]).toEqual([500, 400, 0]);
	});

	it('gives the same jitter for the same seed, so renders repeat', () => {
		const a = Collage.seeded(42);
		const b = Collage.seeded(42);
		expect([a(), a(), a()]).toEqual([b(), b(), b()]);
	});
});

/** The alpha of each pixel after the clean-up, for a mask given as alpha values. */
function cleaned(alpha: number[], width: number, height: number) {
	const rgba = new Uint8Array(alpha.flatMap((a) => [0, 0, 0, a]));
	keepLargestPiece(rgba, width, height);
	return [...rgba].filter((_, i) => i % 4 === 3);
}

describe('cut-out clean-up', () => {
	it('keeps the biggest piece and drops stray specks', () => {
		// A one-pixel speck, a gap, then the three-pixel subject
		expect(cleaned([255, 0, 255, 255, 255], 5, 1)).toEqual([0, 0, 255, 255, 255]);
	});

	it('does not join pieces across the end of a row', () => {
		// Row 0 ends opaque and row 1 starts opaque: neighbours in memory, not in the picture
		expect(cleaned([0, 0, 255, 255, 255, 0], 3, 2)).toEqual([0, 0, 0, 255, 255, 0]);
	});
});
