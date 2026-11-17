import { describe, expect, it } from 'vitest';
import { curlEveryString, curlyApostrophes } from '../src/utils/curly-apostrophes.mjs';

describe('curlyApostrophes', () => {
	it("leaves an HTML tag's attribute quotes and an inch mark straight", () => {
		expect(curlyApostrophes(`<a href="/x" data-text-link>Joe's</a> 27" monitor`)).toBe(
			'<a href="/x" data-text-link>Joe’s</a> 27" monitor',
		);
	});

	it('opens and closes single quotes', () => {
		expect(curlyApostrophes("Type 'google.com' Into")).toBe('Type ‘google.com’ Into');
	});
});

describe('curlEveryString', () => {
	it('curls nested strings but not the kept keys, and refuses a Date', () => {
		expect(curlEveryString({ a: ["it's"], code: "it's", n: 2 }, new Set(['code']))).toEqual({
			a: ['it’s'],
			code: "it's",
			n: 2,
		});
		expect(() => curlEveryString({ when: new Date() })).toThrow(/Date/);
	});
});
