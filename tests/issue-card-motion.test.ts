import { describe, expect, it } from 'vitest';
import { cardPose, frameCount } from '../scripts/issue-card-motion.mjs';

const still = (pose: ReturnType<typeof cardPose>) =>
	pose.seed === 4 &&
	pose.photoScale === 1 &&
	pose.marks.every((m) => m.drawn === 1 && m.opacity === 1);

describe('cardPose', () => {
	// Link previews and Outlook show frame 1 only, and the loop jumps from the last frame back to it
	for (const kind of ['number', 'photo'] as const) {
		it(`starts the ${kind} loop on the still card and ends on it`, () => {
			expect(still(cardPose(kind, 0, 4))).toBe(true);
			const last = cardPose(kind, frameCount(kind) - 1, 4);
			expect(last.marks.every((m) => m.drawn === 1 && m.opacity === 1)).toBe(true);
		});
	}

	it('redraws the marks in order mid-loop', () => {
		const [first, , , last] = cardPose('number', 30, 4).marks;
		expect(first.drawn).toBeGreaterThan(last.drawn);
	});
});
