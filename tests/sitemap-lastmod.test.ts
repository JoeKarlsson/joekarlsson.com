import { describe, expect, it } from 'vitest';
import {
	lastmodByPath,
	offSiteCanonicalPaths,
	unindexedReviewPaths,
} from '../src/integrations/sitemap-lastmod.mjs';
import { indexedReviewSlugs, reviewProseWords } from '../src/utils/review-words.mjs';

const dates = lastmodByPath(new URL('../src/content/', import.meta.url));

describe('sitemap lastmod', () => {
	it('uses updatedDate when a post has one', () => {
		expect(dates.get('/blog/how-to-get-started-with-home-assistant/')).toBe(
			'2026-11-09T00:00:00.000Z',
		);
	});

	it('falls back to the date for every collection', () => {
		expect(dates.get('/talks/building-your-first-graphql-client-in-javascript/')).toBe(
			'2020-09-15T00:00:00.000Z',
		);
		expect(dates.get('/reviews/the-long-walk-2025/')).toMatch(/^2025-10-24/);
		expect(dates.get('/newsletter/tldr-in-tech-by-joe-karlsson-issue-22-11-29/')).toMatch(
			/^2022-11-29/,
		);
	});
});

describe('sitemap crossposts', () => {
	const offSite = offSiteCanonicalPaths(new URL('../src/content/', import.meta.url));

	it('lists posts whose canonical is on another site', () => {
		expect(offSite.has('/blog/ai-gateway-for-developers/')).toBe(true);
	});

	it('keeps posts that are canonical here', () => {
		expect(offSite.has('/blog/running-devrel/')).toBe(false);
	});
});

describe('thin reviews', () => {
	it('counts only the words Joe wrote', () => {
		expect(
			reviewProseWords(
				'Loved it.\n\n![A frame](/images/x.webp "spoiler")\n\nSee [Guffman](/reviews/waiting-for-guffman/) ||twist||',
			),
		).toBe(5);
	});

	const long = 'word '.repeat(200);
	it('indexes one review per film: the longest, and only when it is not a one-liner', () => {
		const indexed = indexedReviewSlugs([
			{ slug: 'zodiac', film: 'zodiac', body: 'Great.' },
			{ slug: 'zodiac-1', film: 'zodiac', body: long },
			{ slug: 'zodiac-2', film: 'zodiac', body: `${long} more` },
			{ slug: 'alien', film: 'alien', body: 'Best anti capitalist sci-fi film.' },
		]);
		expect([...indexed]).toEqual(['zodiac-2']);
	});

	it('gives a tie to the first entry', () => {
		const tie = [
			{ slug: 'theater-camp-2023-1', film: 'theater-camp-2023', body: long },
			{ slug: 'theater-camp-2023', film: 'theater-camp-2023', body: long },
		];
		expect([...indexedReviewSlugs(tie)]).toEqual(['theater-camp-2023']);
	});

	it('leaves one-liners out of the sitemap and keeps long reviews in', () => {
		const out = unindexedReviewPaths(new URL('../src/content/', import.meta.url));
		expect(out.has('/reviews/the-silence-of-the-lambs/')).toBe(true);
		expect(out.has('/reviews/the-long-walk-2025/')).toBe(false);
	});
});
