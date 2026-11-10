// The 404's "Looking for...?" line: the post whose slug is closest to the URL that
// missed, so a typo or an old URL shape (/2019/05/slug/, a missing /blog/) still
// lands somewhere.

export interface PostLink {
	href: string;
	title: string;
}

const lastSegment = (path: string) =>
	decodeURIComponent(path)
		.toLowerCase()
		.replace(/\.html?$/, '')
		.split('/')
		.filter(Boolean)
		.pop() ?? '';

function editDistance(a: string, b: string): number {
	let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
	for (let i = 1; i <= a.length; i++) {
		const current = [i];
		for (let j = 1; j <= b.length; j++) {
			current[j] = Math.min(
				previous[j] + 1,
				current[j - 1] + 1,
				previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
			);
		}
		previous = current;
	}
	return previous[b.length];
}

/** The closest post, or null when nothing is at least 70% the same slug */
export function findClosestPost(path: string, posts: PostLink[]): PostLink | null {
	const wanted = lastSegment(path);
	if (wanted.length < 4) return null;
	let best: PostLink | null = null;
	let bestSimilarity = 0.7;
	for (const post of posts) {
		const slug = lastSegment(post.href);
		const similarity = 1 - editDistance(wanted, slug) / Math.max(wanted.length, slug.length);
		if (similarity >= bestSimilarity) {
			best = post;
			bestSimilarity = similarity;
		}
	}
	return best;
}
