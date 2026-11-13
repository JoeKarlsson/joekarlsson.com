import { describe, expect, it } from 'vitest';
import { contextMeta, readingProgress } from '../src/scripts/reading-context';

describe('reading progress', () => {
	// A 2000px body under a bar ending at 60px, in an 844px window: 1216px to scroll
	it('runs from 0 at the body top to 1 when its bottom is on screen', () => {
		expect(readingProgress(500, 2000, 60, 844)).toBe(0);
		expect(readingProgress(60 - 608, 2000, 60, 844)).toBe(0.5);
		expect(readingProgress(60 - 5000, 2000, 60, 844)).toBe(1);
	});

	it('is done at once when the whole body fits on screen', () => {
		expect(readingProgress(100, 300, 60, 844)).toBe(1);
	});
});

describe('context meta', () => {
	it('says the category and the minutes left, rounding up', () => {
		expect(contextMeta('Homelab', 23, 0.35)).toBe('Homelab, 15 min left');
		expect(contextMeta('Homelab', 23, 1)).toBe('Homelab, Done');
	});

	it('drops what a post does not have', () => {
		expect(contextMeta(undefined, 8, 0)).toBe('8 min left');
		expect(contextMeta('AI', 0, 0.5)).toBe('AI');
	});
});
