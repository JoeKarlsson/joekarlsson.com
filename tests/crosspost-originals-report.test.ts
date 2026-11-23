import { describe, expect, it } from 'vitest';
import { crosspostReport, originalState } from '../scripts/crosspost-originals-report.mjs';

const original = 'https://www.cloudquery.io/blog/steampipe-vs-cloudquery';

describe('originalState', () => {
	it('is gone on 404 or 410', () => {
		expect(originalState(original, { status: 404, url: original })).toBe('gone');
		expect(originalState(original, { status: 410, url: original })).toBe('gone');
	});

	it('is ok when the same page answers, trailing slash or not', () => {
		expect(originalState(original, { status: 200, url: `${original}/` })).toBe('ok');
	});

	it('is moved when a redirect lands on another page', () => {
		expect(originalState(original, { status: 200, url: 'https://www.cloudquery.io/blog' })).toBe(
			'moved',
		);
	});

	it('is moved when the blog moves to another domain under the same path', () => {
		const elsewhere = 'https://www.cdata.com/blog/steampipe-vs-cloudquery';
		expect(originalState(original, { status: 200, url: elsewhere })).toBe('moved');
	});

	it('is unknown when blocked or unreachable, never gone', () => {
		expect(originalState(original, { status: 403, url: original })).toBe('unknown');
		expect(originalState(original, null)).toBe('unknown');
	});
});

describe('crosspostReport', () => {
	it('is empty when nothing is gone or moved, even with blocked sites', () => {
		expect(
			crosspostReport([
				{ path: '/blog/a/', original, state: 'ok' },
				{ path: '/blog/b/', original, state: 'unknown' },
			]),
		).toBe('');
	});

	it('names each gone post and what to do', () => {
		const report = crosspostReport([
			{ path: '/blog/steampipe-vs-cloudquery/', original, state: 'gone' },
			{ path: '/blog/b/', original, state: 'unknown' },
		]);
		expect(report).toContain('- /blog/steampipe-vs-cloudquery/ (was ' + original + ')');
		expect(report).toContain('remove `canonicalUrl`');
		expect(report).toContain("Couldn't check (blocked or down), skipped: 1.");
	});
});
