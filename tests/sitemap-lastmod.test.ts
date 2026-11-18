import { describe, expect, it } from 'vitest';
import { lastmodByPath } from '../src/integrations/sitemap-lastmod.mjs';

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
