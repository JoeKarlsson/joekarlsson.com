/**
 * Additional feed content validation tests
 * Verifies that blog posts are properly included in RSS and sitemap
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { describe, expect, it } from 'vitest';

const dist = resolve(import.meta.dirname, '..', 'dist');
const blogDir = resolve(import.meta.dirname, '..', 'src', 'content', 'blog');

function readDist(path: string): string {
	return readFileSync(resolve(dist, path), 'utf-8');
}

function getBlogPostSlugs(): string[] {
	return readdirSync(blogDir)
		.filter((f) => f.endsWith('.md'))
		.map((f) => f.replace('.md', ''));
}

describe('RSS Feed Content', () => {
	const rss = readDist('rss.xml');

	it('contains recent blog posts', () => {
		// RSS should have multiple items
		const items = rss.match(/<item>/g) || [];
		expect(items.length).toBeGreaterThan(10);
	});

	it('RSS items have descriptions', () => {
		const descriptions = rss.match(/<description>/g) || [];
		expect(descriptions.length).toBeGreaterThan(5);
	});

	it('RSS items have guids', () => {
		const guids = rss.match(/<guid/g) || [];
		expect(guids.length).toBeGreaterThan(5);
	});

	it('RSS pubDates are valid format', () => {
		const pubDates = rss.match(/<pubDate>(.*?)<\/pubDate>/g) || [];
		for (const dateTag of pubDates.slice(0, 5)) {
			const dateStr = dateTag.replace(/<\/?pubDate>/g, '');
			const date = new Date(dateStr);
			expect(date.getTime()).not.toBeNaN();
		}
	});

	it('RSS feed is sorted by date (newest first)', () => {
		const pubDates = rss.match(/<pubDate>(.*?)<\/pubDate>/g) || [];
		const dates = pubDates.map((tag) => {
			const dateStr = tag.replace(/<\/?pubDate>/g, '');
			return new Date(dateStr).getTime();
		});

		// Check that first few dates are in descending order
		for (let i = 0; i < Math.min(dates.length - 1, 5); i++) {
			expect(dates[i]).toBeGreaterThanOrEqual(dates[i + 1]);
		}
	});
});

describe('Sitemap Content', () => {
	const sitemap = readDist('sitemap-0.xml');
	const blogSlugs = getBlogPostSlugs();

	it('sitemap includes most blog posts', () => {
		// Count how many blog slugs appear in sitemap
		let foundCount = 0;
		for (const slug of blogSlugs) {
			if (sitemap.includes(`/blog/${slug}/`)) {
				foundCount++;
			}
		}

		// At least 80% of posts should be in sitemap
		const percentage = foundCount / blogSlugs.length;
		expect(percentage).toBeGreaterThan(0.8);
	});

	it('sitemap URLs are properly encoded', () => {
		const urls = sitemap.match(/<loc>(.*?)<\/loc>/g) || [];
		for (const urlTag of urls) {
			const url = urlTag.replace(/<\/?loc>/g, '');
			// Should not have unencoded special chars
			expect(url).not.toContain(' ');
			expect(url).not.toContain('<');
			expect(url).not.toContain('>');
		}
	});

	it('sitemap has lastmod dates', () => {
		const lastmods = sitemap.match(/<lastmod>/g) || [];
		// Should have some lastmod entries
		expect(lastmods.length).toBeGreaterThan(0);
	});

	it('sitemap does not include draft or private pages', () => {
		expect(sitemap).not.toContain('/draft');
		expect(sitemap).not.toContain('/private');
		expect(sitemap).not.toContain('/test');
	});
});

describe('Blog Post Pages', () => {
	it('blog directory has posts', () => {
		const posts = getBlogPostSlugs();
		expect(posts.length).toBeGreaterThan(50);
	});

	it('each blog post has a generated HTML page', () => {
		const slugs = getBlogPostSlugs().slice(0, 10); // Check first 10

		for (const slug of slugs) {
			const pagePath = resolve(dist, 'blog', slug, 'index.html');
			expect(existsSync(pagePath)).toBe(true);
		}
	});

	it('blog post pages have content', () => {
		const slugs = getBlogPostSlugs().slice(0, 3); // Check first 3

		for (const slug of slugs) {
			const content = readDist(`blog/${slug}/index.html`);
			expect(content.length).toBeGreaterThan(5000); // Should have substantial content
		}
	});
});

describe('Category Pages', () => {
	it('category directory exists', () => {
		const categoryDir = resolve(dist, 'blog', 'category');
		expect(existsSync(categoryDir)).toBe(true);
	});

	it('has multiple category pages', () => {
		const categoryDir = resolve(dist, 'blog', 'category');
		const categories = readdirSync(categoryDir).filter((f) =>
			existsSync(resolve(categoryDir, f, 'index.html')),
		);
		expect(categories.length).toBeGreaterThan(3);
	});

	it('category pages have content', () => {
		const categoryDir = resolve(dist, 'blog', 'category');
		const categories = readdirSync(categoryDir).slice(0, 3);

		for (const cat of categories) {
			const pagePath = resolve(categoryDir, cat, 'index.html');
			if (existsSync(pagePath)) {
				const content = readFileSync(pagePath, 'utf-8');
				expect(content.length).toBeGreaterThan(1000);
			}
		}
	});
});
