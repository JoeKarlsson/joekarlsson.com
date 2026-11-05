import { describe, it, expect } from 'vitest';
import { categorySlug, getCategoryCounts, getWrittenForCounts } from '../src/utils/categories';

const post = (...categories: string[]) => ({ data: { categories } });

describe('categorySlug', () => {
	it('lowercases and hyphenates anything that is not a letter or digit', () => {
		expect(categorySlug('Smart Home')).toBe('smart-home');
		expect(categorySlug('IoT')).toBe('iot');
		expect(categorySlug('Cloud & Security')).toBe('cloud-security');
	});
});

describe('getWrittenForCounts', () => {
	const by = (writtenFor?: string) => ({ data: { writtenFor } });

	it('puts Personal first, then employers newest first, skipping employers with no posts', () => {
		expect(
			getWrittenForCounts([by('MongoDB'), by(), by('CloudQuery'), by(), by('CloudQuery')]),
		).toEqual([
			{ name: 'Personal', slug: 'personal', count: 2 },
			{ name: 'CloudQuery', slug: 'cloudquery', count: 2 },
			{ name: 'MongoDB', slug: 'mongodb', count: 1 },
		]);
	});
});

describe('getCategoryCounts', () => {
	it('counts posts per category, most posts first, with slugs', () => {
		const counts = getCategoryCounts([
			post('Homelab', 'Smart Home'),
			post('Homelab'),
			post('Dev Tools', 'Homelab'),
			post('Smart Home'),
		]);
		expect(counts).toEqual([
			{ name: 'Homelab', slug: 'homelab', count: 3 },
			{ name: 'Smart Home', slug: 'smart-home', count: 2 },
			{ name: 'Dev Tools', slug: 'dev-tools', count: 1 },
		]);
	});

	it('returns nothing for no posts', () => {
		expect(getCategoryCounts([])).toEqual([]);
	});
});
