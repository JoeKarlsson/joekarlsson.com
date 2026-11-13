import { describe, expect, it } from 'vitest';
import {
	coverFileName,
	httpsUrlOn,
	nextGitHubPage,
	summarizeGitHubProfile,
	truncateAtWord,
} from '../scripts/now-feed-parsing.mjs';

describe('truncateAtWord', () => {
	it('leaves short text alone', () => {
		expect(truncateAtWord('Short enough', 40)).toBe('Short enough');
	});

	it('cuts at the last whole word and drops trailing punctuation', () => {
		expect(truncateAtWord('fix: Blog rows wake up, with a dotted thumbnail', 24)).toBe(
			'fix: Blog rows wake up...',
		);
	});

	it('cuts one long word at the limit', () => {
		expect(truncateAtWord('a'.repeat(100), 10)).toBe(`${'a'.repeat(10)}...`);
	});
});

describe('summarizeGitHubProfile', () => {
	const repo = (name: string, stars: number, extra: Record<string, unknown> = {}) => ({
		name,
		html_url: `https://github.com/JoeKarlsson/${name}`,
		description: `${name} repo`,
		stargazers_count: stars,
		forks_count: 2,
		fork: false,
		private: false,
		...extra,
	});

	it('counts own public repos only and ranks the top ones by stars', () => {
		const summary = summarizeGitHubProfile(
			{ followers: 540 },
			[
				repo('small', 5),
				repo('big', 185),
				repo('forked', 900, { fork: true }),
				repo('secret', 700, { private: true }),
				repo('mid', 90),
			],
			{ topRepoCount: 2 },
		);
		expect(summary).toMatchObject({ followers: 540, publicRepos: 3, stars: 280, forks: 6 });
		expect(summary.topRepos.map((r: { name: string }) => r.name)).toEqual(['big', 'mid']);
	});
});

// Security audit run-1: feed URLs become hrefs, image fetches and token-carrying
// requests, so each is pinned to https on its expected host.
describe('now-feed URL and id guards', () => {
	it('accepts https on the expected host and its subdomains', () => {
		expect(
			httpsUrlOn('https://podcasts.apple.com/us/podcast/x/id1?uo=4', ['podcasts.apple.com'], 'p'),
		).toContain('apple');
		const cover = 'https://is1-ssl.mzstatic.com/image/thumb/x.jpg';
		expect(httpsUrlOn(cover, ['mzstatic.com'], 'cover')).toBe(cover);
	});

	it('rejects other schemes and hosts', () => {
		for (const url of [
			'javascript:alert(1)',
			'http://podcasts.apple.com/x',
			'https://podcasts.apple.com.evil.example/x',
			'https://192.168.0.1/x',
			'not a url',
		]) {
			expect(() => httpsUrlOn(url, ['podcasts.apple.com'], 'p')).toThrow();
		}
	});

	it('follows GitHub pagination only on api.github.com', () => {
		expect(nextGitHubPage('<https://api.github.com/x?page=2>; rel="next"')).toBe(
			'https://api.github.com/x?page=2',
		);
		expect(nextGitHubPage(undefined)).toBeUndefined();
		expect(() => nextGitHubPage('<https://evil.example/x>; rel="next"')).toThrow();
	});

	it('only turns plain ids into cover file names', () => {
		expect(coverFileName('podcast', '22fc3916-1f4a-42a4-890f-ff8c09a6030c')).toBe(
			'podcast-22fc3916-1f4a-42a4-890f-ff8c09a6030c.webp',
		);
		for (const id of ['../../x', 'a/b', '', 'undefined/..'])
			expect(() => coverFileName('film', id)).toThrow();
	});
});
