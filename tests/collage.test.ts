import { createRequire } from 'node:module';

import { describe, expect, it } from 'vitest';

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

	it('gives the same jitter for the same seed, so renders repeat', () => {
		const a = Collage.seeded(42);
		const b = Collage.seeded(42);
		expect([a(), a(), a()]).toEqual([b(), b(), b()]);
	});
});
