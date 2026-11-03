import { describe, expect, it } from 'vitest';
import { projects } from '../src/data/projects';

describe('projects data', () => {
	it('every project has a YYYY-MM date for newest-first sorting', () => {
		const badDates = projects.filter((p) => !/^\d{4}-(0[1-9]|1[0-2])$/.test(p.date));
		expect(badDates.map((p) => p.title)).toEqual([]);
	});

	it('every share title fits Hacker News (80 characters)', () => {
		const tooLong = projects.filter((p) => (p.shareTitle || p.title).length > 80);
		expect(tooLong.map((p) => p.title)).toEqual([]);
	});

	it('every project with its own page has a shareTitle', () => {
		const missing = projects.filter((p) => p.page && !p.shareTitle);
		expect(missing.map((p) => p.title)).toEqual([]);
	});
});
