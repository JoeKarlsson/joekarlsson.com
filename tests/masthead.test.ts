import { describe, expect, it } from 'vitest';
import { mastheadFontSize, mastheadLines } from '../src/utils/masthead';

describe('mastheadLines', () => {
	it('keeps a short title on one line', () => {
		expect(mastheadLines('8 Mile (2002)')).toEqual(['8 Mile (2002)']);
	});
	it('splits a long title into three lines of similar length, keeping every word', () => {
		const title = 'Rereading Hackers and Painters as a painter who codes with AI agents';
		const lines = mastheadLines(title);
		expect(lines).toHaveLength(3);
		expect(lines.join(' ')).toBe(title);
		const lengths = lines.map((l) => l.length);
		expect(Math.max(...lengths) - Math.min(...lengths)).toBeLessThan(12);
	});
	it('never splits a single word', () => {
		expect(mastheadLines('Supercalifragilisticexpialidocious')).toHaveLength(1);
	});
});

describe('mastheadFontSize', () => {
	it('sizes to the longest line, between 2.25rem (a post h2) and 150px, so zoom still enlarges it', () => {
		expect(mastheadFontSize(['ab', 'abcd'])).toBe('clamp(2.25rem, 50.00cqi, 9.375rem)');
	});
});
