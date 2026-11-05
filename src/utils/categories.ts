// Blog categories: the URL slug for a category page, and post counts per category.
// Kept free of astro:content so it can be unit-tested.

export interface CategoryCount {
	name: string;
	slug: string;
	count: number;
}

/** "Smart Home" -> "smart-home", as used in /blog/category/{slug}/ */
export function categorySlug(name: string): string {
	return name.toLowerCase().replace(/\s+/g, '-');
}

/** Every category across the posts with its post count, most posts first. */
export function getCategoryCounts(posts: { data: { categories: string[] } }[]): CategoryCount[] {
	const counts = new Map<string, number>();
	for (const post of posts) {
		for (const name of post.data.categories) {
			counts.set(name, (counts.get(name) ?? 0) + 1);
		}
	}
	return [...counts.entries()]
		.map(([name, count]) => ({ name, slug: categorySlug(name), count }))
		.sort((a, b) => b.count - a.count);
}
