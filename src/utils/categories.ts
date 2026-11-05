// Blog categories and who a post was written for: the fixed lists the content
// schema enforces, URL slugs, and post counts. Kept free of astro:content so it
// can be unit-tested.

/** The only blog categories; anything else fails the build (src/content.config.ts). */
export const BLOG_CATEGORIES = ['Homelab', 'Web Dev', 'Career', 'AI', 'Cloud', 'Life'] as const;

/** Employers a post can be written for (`writtenFor`), newest first. Posts without one are personal. */
export const EMPLOYERS = ['CData', 'CloudQuery', 'Tinybird', 'SingleStore', 'MongoDB'] as const;

/** The label for posts with no `writtenFor`. */
export const PERSONAL = 'Personal';

export interface CategoryCount {
	name: string;
	slug: string;
	count: number;
}

/** "Web Dev" -> "web-dev", as used in /blog/category/{slug}/ and /blog/written-for/{slug}/ */
export function categorySlug(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}

function countBy(names: string[][]): Map<string, number> {
	const counts = new Map<string, number>();
	for (const list of names) {
		for (const name of list) counts.set(name, (counts.get(name) ?? 0) + 1);
	}
	return counts;
}

/** Every category across the posts with its post count, most posts first. */
export function getCategoryCounts(posts: { data: { categories: string[] } }[]): CategoryCount[] {
	return [...countBy(posts.map((p) => p.data.categories)).entries()]
		.map(([name, count]) => ({ name, slug: categorySlug(name), count }))
		.sort((a, b) => b.count - a.count);
}

/** Personal first, then each employer that has posts, newest employer first. */
export function getWrittenForCounts(posts: { data: { writtenFor?: string } }[]): CategoryCount[] {
	const counts = countBy(posts.map((p) => [p.data.writtenFor ?? PERSONAL]));
	return [PERSONAL, ...EMPLOYERS]
		.filter((name) => counts.has(name))
		.map((name) => ({ name, slug: categorySlug(name), count: counts.get(name)! }));
}
