import { describe, expect, it } from 'vitest';
import { antonWidthInEm } from '../src/utils/anton-width';

describe('antonWidthInEm', () => {
	it('measures wide capitals as wider than narrow ones of the same count', () => {
		expect(antonWidthInEm('MMMM')).toBeGreaterThan(antonWidthInEm('IIII'));
	});

	it('measures each name, where a flat 0.5em per letter guessed wrong both ways', () => {
		expect(antonWidthInEm('WOMBAT-MEMO')).toBeGreaterThan('WOMBAT-MEMO'.length * 0.5);
		expect(antonWidthInEm('IOT-KITTY-LITTER-BOX')).toBeLessThan(
			'IOT-KITTY-LITTER-BOX'.length * 0.5,
		);
	});

	it('refuses a character Anton cannot draw', () => {
		expect(() => antonWidthInEm('日本')).toThrow(/no glyph/);
	});
});
