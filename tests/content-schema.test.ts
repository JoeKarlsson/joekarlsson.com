import { readFileSync, readdirSync } from 'fs';
import { resolve, basename } from 'path';
import { describe, expect, it } from 'vitest';

const blogDir = resolve(import.meta.dirname, '..', 'src', 'content', 'blog');

function getBlogFiles(): string[] {
	return readdirSync(blogDir, { recursive: true })
		.filter((f) => typeof f === 'string' && f.endsWith('.md'))
		.map((f) => resolve(blogDir, f as string));
}

function extractFrontmatter(content: string): Record<string, string> {
	const match = content.match(/^---\n([\s\S]*?)\n---/);
	if (!match) return {};
	const fm: Record<string, string> = {};
	for (const line of match[1].split('\n')) {
		const colonIdx = line.indexOf(':');
		if (colonIdx > 0) {
			fm[line.slice(0, colonIdx).trim()] = line.slice(colonIdx + 1).trim();
		}
	}
	return fm;
}

describe('blog post frontmatter', () => {
	const files = getBlogFiles();

	it('has blog posts', () => {
		expect(files.length).toBeGreaterThan(0);
	});

	for (const file of files) {
		const name = basename(file);
		const content = readFileSync(file, 'utf-8');
		const fm = extractFrontmatter(content);

		describe(name, () => {
			it('has title', () => {
				expect(fm.title).toBeDefined();
				expect(fm.title.replace(/['"]/g, '').length).toBeGreaterThan(0);
			});

			it('has date', () => {
				expect(fm.date).toBeDefined();
			});

			it('has slug', () => {
				expect(fm.slug).toBeDefined();
				const slug = fm.slug.replace(/['"]/g, '');
				expect(slug.length).toBeGreaterThan(0);
				// Slug should be URL-safe
				expect(slug).toMatch(/^[a-z0-9-]+$/);
			});

			it('has description', () => {
				const desc = fm.description?.replace(/['"]/g, '') || '';
				if (desc.length > 0) {
					// If description exists, it shouldn't be too long for SEO
					expect(desc.length).toBeLessThan(320);
				}
			});
		});
	}
});
