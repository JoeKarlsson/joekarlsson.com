import { describe, expect, it } from 'vitest';
import { summaryTable } from '../scripts/lighthouse-summary.mjs';

const run = (url: string, performance: number, bytes: number) => ({
	requestedUrl: url,
	categories: {
		performance: { score: performance },
		accessibility: { score: 1 },
		'best-practices': { score: 0.96 },
		seo: { score: 0.92 },
	},
	audits: { 'total-byte-weight': { numericValue: bytes } },
});

describe('lighthouse summary', () => {
	it('gives each page one row of median scores across its runs', () => {
		const table = summaryTable([
			run('http://localhost:4000/', 0.7, 300_000),
			run('http://localhost:4000/about/', 0.99, 100_000),
			run('http://localhost:4000/', 0.95, 200_000),
			run('http://localhost:4000/', 0.81, 250_000),
		]);
		expect(table.split('\n').slice(2)).toEqual([
			'| / | 81 | 100 | 96 | 92 | 244 KB |',
			'| /about/ | 99 | 100 | 96 | 92 | 98 KB |',
		]);
	});
});
