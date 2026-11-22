import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { LEAD_STORY, coverage, papers } from '../src/data/coverage';

describe('coverage.ts', () => {
	it('highlights a part of each paper’s reference line', () => {
		for (const paper of papers) expect(paper.reference, paper.title).toContain(paper.highlight);
	});

	it('lists each link once', () => {
		const urls = [...papers, ...coverage].map((entry) => entry.url);
		expect(new Set(urls).size).toBe(urls.length);
	});

	// DECISIONS.md 2026-11-21: Written about never repeats As seen on, whose podcasts and
	// appearances are written straight into about.astro, while Written about reads this file
	it('repeats nothing from About’s As seen on', () => {
		const about = readFileSync('src/pages/about.astro', 'utf8');
		for (const { url } of [LEAD_STORY, ...papers, ...coverage])
			expect(about, url).not.toContain(url);
	});

	it('has the lead story’s picture', () => {
		expect(existsSync(`public${LEAD_STORY.image}`)).toBe(true);
	});
});
