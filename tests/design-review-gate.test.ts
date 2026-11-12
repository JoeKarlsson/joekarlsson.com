import { describe, expect, it } from 'vitest';
import { decide, isDesignPath } from '../scripts/design-review-gate.mjs';

const empty = () => ({ reviews: [], waivers: [], blocks: {} });
const change = { paths: ['src/components/Nav.astro', 'src/pages/404.astro'], hash: 'abc' };

describe('isDesignPath', () => {
	it('matches layouts, components, styles and .astro pages, nothing else', () => {
		expect(isDesignPath('src/layouts/BlogPost.astro')).toBe(true);
		expect(isDesignPath('src/components/PaperHero.astro')).toBe(true);
		expect(isDesignPath('src/styles/global.css')).toBe(true);
		expect(isDesignPath('src/pages/404.astro')).toBe(true);
		expect(isDesignPath('src/pages/work/[slug].astro')).toBe(true);
		expect(isDesignPath('src/pages/rss.xml.js')).toBe(false);
		expect(isDesignPath('src/content/blog/post.md')).toBe(false);
		expect(isDesignPath('scripts/deploy.sh')).toBe(false);
	});
});

describe('decide', () => {
	it('allows a change with no design files', () => {
		expect(decide({ paths: [], hash: 'x' }, empty())).toBe('allow');
	});

	it('blocks an unreviewed design change, then lets it through after 3 blocks', () => {
		expect(decide(change, empty())).toBe('block');
		expect(decide(change, { ...empty(), blocks: { abc: 2 } })).toBe('block');
		expect(decide(change, { ...empty(), blocks: { abc: 3 } })).toBe('capped');
	});

	it('allows a reviewed change, including later edits to the files the review covered', () => {
		const review = { hash: 'old', paths: [...change.paths, 'src/styles/global.css'] };
		expect(decide(change, { ...empty(), reviews: [{ hash: 'abc', paths: [] }] })).toBe('allow');
		expect(decide(change, { ...empty(), reviews: [review] })).toBe('allow');
	});

	it('blocks again when the change reaches a file the review never saw', () => {
		const review = { hash: 'old', paths: ['src/components/Nav.astro'] };
		expect(decide(change, { ...empty(), reviews: [review] })).toBe('block');
	});

	it('allows a waived change only for the exact change it was waived for', () => {
		expect(decide(change, { ...empty(), waivers: [{ hash: 'abc' }] })).toBe('allow');
		expect(decide(change, { ...empty(), waivers: [{ hash: 'other' }] })).toBe('block');
	});
});
