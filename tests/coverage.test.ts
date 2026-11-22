import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
	BUILT_ON_GROUPS,
	COVERAGE_GROUPS,
	LEAD_STORY,
	SHARE_CARD,
	coverage,
	papers,
	papersNewestFirst,
} from '../src/data/coverage';

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

	// /featured/ renders only the kinds in these groups; any other kind's entries never show
	it('puts every entry in a group /featured/ shows', () => {
		const shown = new Set([...BUILT_ON_GROUPS, ...COVERAGE_GROUPS].map((group) => group.kind));
		for (const entry of coverage) expect(shown, entry.url).toContain(entry.kind);
	});

	it('lists /featured/’s papers newest first, keeping the written order within a year', () => {
		const years = papersNewestFirst.map((paper) => paper.year);
		expect(years).toEqual([...years].sort((a, b) => b - a));
		expect(papersNewestFirst).toHaveLength(papers.length);
		const first2025 = papers.find((paper) => paper.year === 2025);
		expect(papersNewestFirst.find((paper) => paper.year === 2025)).toBe(first2025);
	});

	it('has the lead story’s picture and the share card', () => {
		expect(existsSync(`public${LEAD_STORY.image}`)).toBe(true);
		expect(existsSync(`public${SHARE_CARD}`), 'run npm run featured:card').toBe(true);
	});
});
