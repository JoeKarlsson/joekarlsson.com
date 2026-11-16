import { describe, it, expect } from 'vitest';
import { existsSync, statSync } from 'fs';
import { join } from 'path';
import { projects } from '../src/data/projects';
import imagesWithText from '../src/data/images-with-text.json';
import { cardClip, halftoneMode } from '../src/utils/halftone';

// /work autoplays every card clip in view; together they must fit its 1.5MB page budget
const MAX_CARD_CLIP_BYTES = 450 * 1024;

describe('halftoneMode', () => {
	it('draws every picture in the clear pink tone, never dots', () => {
		expect(halftoneMode('/images/not-in-the-list.webp')).toBe('flat');
	});

	it('leaves generated work-post thumbnails alone, everywhere', () => {
		expect(halftoneMode('/images/blog/soc2/thumb-0a1b2c3d.webp')).toBeUndefined();
		expect(halftoneMode('/images/blog/soc2/thumbnail.webp')).toBe('flat');
		expect(halftoneMode('/images/blog/soc2/nested/thumb-0a1b2c3d.webp')).toBe('flat');
		// Boiling diagram cards for projects are animated; a live canvas copy would freeze them
		expect(halftoneMode('/images/projects/data-structures/thumb-0a1b2c3d.webp')).toBeUndefined();
		expect(halftoneMode('/images/projects/data-structures.webp')).toBe('flat');
	});

	it("leaves /talks/' pre-graded covers and posters alone, but not other video posters", () => {
		expect(halftoneMode('/images/talks/events/confoo-2020.webp')).toBeUndefined();
		expect(halftoneMode('/images/talks/posters/12IppjSDVCQ.webp')).toBeUndefined();
		expect(halftoneMode('/images/youtube/12IppjSDVCQ.webp')).toBe('flat');
		expect(halftoneMode('/images/talks/tedx-art-of-computer-science-still.webp')).toBe('flat');
	});

	it('lists only files that exist (re-run npm run media:text after moving one)', () => {
		expect(imagesWithText.filter((src) => !existsSync(join('public', src)))).toEqual([]);
	});
});

describe('card clips', () => {
	it('names the card copy next to its clip', () => {
		expect(cardClip('/images/projects/demo.mp4')).toBe('/images/projects/demo-card.mp4');
	});

	it('every project clip has a card copy under the size limit (npm run media:cards)', () => {
		const problems = projects
			.flatMap((p) => (p.video ? [cardClip(p.video)] : []))
			.flatMap((clip) => {
				const file = join('public', clip);
				if (!existsSync(file)) return [`${clip} is missing`];
				const size = statSync(file).size;
				return size > MAX_CARD_CLIP_BYTES ? [`${clip} is ${Math.round(size / 1024)}KB`] : [];
			});
		expect(problems).toEqual([]);
	});
});
