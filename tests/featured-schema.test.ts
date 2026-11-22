import { describe, expect, it } from 'vitest';
import { coverage, papers, papersNewestFirst } from '../src/data/coverage';
import { featuredItemList } from '../src/utils/featured-schema';

describe('featuredItemList', () => {
	it('lists every paper and every coverage entry once, papers as scholarly articles', () => {
		const list = featuredItemList();
		const items = list.itemListElement.map((element) => element.item);
		expect(list.numberOfItems).toBe(papers.length + coverage.length);
		expect(items.map((item) => item.url)).toEqual([...new Set(items.map((item) => item.url))]);
		expect(
			items.filter((item) => item['@type'] === 'ScholarlyArticle').map((item) => item.url),
		).toEqual(papersNewestFirst.map((paper) => paper.url));
	});
});
