import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { findShorts } from '../scripts/fetch-talk-event-covers.mjs';
import { shortPosterPath, shorts } from '../src/data/shorts';

describe('shorts.ts', () => {
	it('has a drawn poster for every Short, once each', () => {
		expect(new Set(shorts.map((s) => s.id)).size).toBe(shorts.length);
		const missing = shorts.filter((s) => !existsSync(`public${shortPosterPath(s)}`));
		expect(missing.map((s) => `${s.id}: run npm run talks:covers`)).toEqual([]);
	});

	it('is read by the poster script the same way the site reads it', () => {
		const parsed = findShorts(readFileSync('src/data/shorts.ts', 'utf8'));
		expect(parsed).toEqual(shorts.map(({ id, posterAt }) => ({ id, posterAt })));
	});

	it('refuses a Short with no posterAt', () => {
		const source = `{ id: 'RoeJPTY7maI', title: 'a', date: '2022-11-14', posterAt: 1 },
			{ id: 'PiQKYgw_gZk', title: 'b', date: '2022-12-20' },`;
		expect(() => findShorts(source)).toThrow('2 Shorts but 1 with a posterAt');
	});
});
