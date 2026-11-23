import { describe, expect, it } from 'vitest';
import {
	lastmodByPath,
	offSiteCanonicalPaths,
	thinReviewPaths,
} from '../src/integrations/sitemap-lastmod.mjs';
import { reviewProseWords } from '../src/utils/review-words.mjs';

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

	it('leaves one-liners out of search and keeps long reviews in', () => {
		const thin = thinReviewPaths(new URL('../src/content/', import.meta.url));
		expect(thin.has('/reviews/the-silence-of-the-lambs/')).toBe(true);
		expect(thin.has('/reviews/the-long-walk-2025/')).toBe(false);
	});
});
