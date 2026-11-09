// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { REEL_SLICE_SECONDS, REEL_VIDEO, SELECTED_WORKS, projects } from '../src/data/projects';
import { reelPieceAt } from '../src/scripts/work-reel';

describe('the /work/ hero reel', () => {
	it('names the slice on screen, holding the last one to the end', () => {
		expect(reelPieceAt(0, 2.4, 5)).toBe(0);
		expect(reelPieceAt(2.39, 2.4, 5)).toBe(0);
		expect(reelPieceAt(2.4, 2.4, 5)).toBe(1);
		expect(reelPieceAt(11.9, 2.4, 5)).toBe(4);
		expect(reelPieceAt(12.5, 2.4, 5)).toBe(4);
	});

	it('has a clip and a start for every selected work (re-run npm run media:reel after a change)', () => {
		for (const title of SELECTED_WORKS) {
			const project = projects.find((p) => p.title === title);
			expect(project?.video, title).toBeDefined();
			expect(project?.reelStart, title).toBeTypeOf('number');
		}
		expect(existsSync(join('public', REEL_VIDEO))).toBe(true);
		expect(REEL_SLICE_SECONDS).toBeGreaterThan(0);
	});
});
