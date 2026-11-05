import { describe, it, expect } from 'vitest';
import { existsSync } from 'fs';
import { join } from 'path';
import imagesWithText from '../src/data/images-with-text.json';
import { halftoneMode } from '../src/utils/halftone';

describe('halftoneMode', () => {
	it('draws images with text flat, everything else in dots', () => {
		expect(halftoneMode(imagesWithText[0])).toBe('flat');
		expect(halftoneMode('/images/not-in-the-list.webp')).toBe('dots');
	});

	it('lists only files that exist (re-run npm run media:text after moving one)', () => {
		expect(imagesWithText.filter((src) => !existsSync(join('public', src)))).toEqual([]);
	});
});
