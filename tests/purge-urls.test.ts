import { describe, expect, it } from 'vitest';
import {
	changedPaths,
	MAX_URLS,
	PURGE_EVERYTHING,
	purgeList,
	urlsForPath,
} from '../scripts/purge-urls.mjs';

const SITE = 'https://www.joekarlsson.com';

describe('purge-urls', () => {
	it('lists added, changed and removed files, not unchanged ones', () => {
		const old = { 'a.webp': '1', 'b.webp': '2', 'gone.mp4': '3' };
		const next = { 'a.webp': '1', 'b.webp': 'changed', 'new.webp': '4' };
		expect(changedPaths(old, next)).toEqual(['b.webp', 'gone.mp4', 'new.webp']);
	});

	it('purges a page under its directory URL and its index.html', () => {
		expect(urlsForPath(SITE, 'index.html')).toEqual([`${SITE}/`, `${SITE}/index.html`]);
		expect(urlsForPath(SITE, 'work/pixelpane/index.html')).toEqual([
			`${SITE}/work/pixelpane/`,
			`${SITE}/work/pixelpane/index.html`,
		]);
		expect(urlsForPath(SITE, 'images/a.webp')).toEqual([`${SITE}/images/a.webp`]);
	});

	it('purges everything with no previous manifest or too many changes', () => {
		expect(purgeList(SITE, null, { 'a.webp': '1' })).toEqual([PURGE_EVERYTHING]);
		const many = Object.fromEntries(
			Array.from({ length: MAX_URLS + 1 }, (_, i) => [`f${i}.webp`, '1']),
		);
		expect(purgeList(SITE, {}, many)).toEqual([PURGE_EVERYTHING]);
	});

	it('purges nothing when nothing changed', () => {
		expect(purgeList(SITE, { 'a.webp': '1' }, { 'a.webp': '1' })).toEqual([]);
	});
});
