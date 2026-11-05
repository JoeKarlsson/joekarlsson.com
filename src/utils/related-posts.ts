// Picks the posts closest to a given post for "Keep reading" at the end of every
// post. Each post becomes a TF-IDF vector of its words (title, tags and
// description weighted up, plus the full body), and posts are ranked by cosine
// similarity, so two posts about Home Assistant match even when their titles
// share no words. Popular posts (src/data/popular-posts.json) get up to a 10%
// boost, which only changes the order between near ties.

export interface RelatablePost {
	slug: string;
	title: string;
	description?: string;
	tags?: string[];
	body?: string;
}

type Vector = Map<string, number>;

// Words too common in these posts to say anything about what one is about
const STOP_WORDS = new Set(
	`the and for that this with you your are was were but not have has had from they them their
	there what when where which who will would can could should just like into about than then
	also its it's i'm i've don't doesn't didn't isn't it’s i’m i’ve don’t one two all any some
	more most other out over our off only very much many get got make made use used using how
	why our we're you're been being because does did here these those each such own same too
	need want way thing things really still even every first new now well back after before
	while again though through want something going know think see time post`.split(/\s+/),
);

const TITLE_WEIGHT = 3;
const TAG_WEIGHT = 3;
const DESCRIPTION_WEIGHT = 2;
const POPULARITY_BOOST = 0.1;

function tokenize(text: string): string[] {
	const words = text
		.toLowerCase()
		.replace(/```[\s\S]*?```/g, ' ') // code blocks
		.replace(/\]\([^)]*\)/g, ' ') // link targets
		.replace(/<[^>]+>/g, ' ') // html tags
		.match(/[a-z][a-z0-9+#’'-]*[a-z0-9+#]/g);
	return (words ?? []).filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

function postTokens(post: RelatablePost): string[] {
	const repeat = (text: string, times: number) => Array(times).fill(tokenize(text)).flat();
	return [
		...repeat(post.title, TITLE_WEIGHT),
		...repeat((post.tags ?? []).join(' '), TAG_WEIGHT),
		...repeat(post.description ?? '', DESCRIPTION_WEIGHT),
		...tokenize(post.body ?? ''),
	];
}

function buildVectors(posts: RelatablePost[]): Map<string, Vector> {
	const counts = posts.map((post) => {
		const termCounts = new Map<string, number>();
		for (const token of postTokens(post)) termCounts.set(token, (termCounts.get(token) ?? 0) + 1);
		return termCounts;
	});

	const documentFrequency = new Map<string, number>();
	for (const termCounts of counts) {
		for (const term of termCounts.keys()) {
			documentFrequency.set(term, (documentFrequency.get(term) ?? 0) + 1);
		}
	}

	const vectors = new Map<string, Vector>();
	posts.forEach((post, index) => {
		const vector: Vector = new Map();
		let norm = 0;
		for (const [term, count] of counts[index]) {
			const df = documentFrequency.get(term)!;
			// A word in only this post can't link it to another, so it's left out
			if (df < 2) continue;
			const weight = (1 + Math.log(count)) * Math.log(posts.length / df);
			vector.set(term, weight);
			norm += weight * weight;
		}
		norm = Math.sqrt(norm) || 1;
		for (const [term, weight] of vector) vector.set(term, weight / norm);
		vectors.set(post.slug, vector);
	});
	return vectors;
}

function cosine(a: Vector, b: Vector): number {
	const [small, large] = a.size < b.size ? [a, b] : [b, a];
	let dot = 0;
	for (const [term, weight] of small) dot += weight * (large.get(term) ?? 0);
	return dot;
}

// Every page in a build ranks against the same pool, so its vectors are built once
const vectorCache = new Map<string, Map<string, Vector>>();

function vectorsFor(pool: RelatablePost[]): Map<string, Vector> {
	const key = pool.map((post) => post.slug).join('|');
	let vectors = vectorCache.get(key);
	if (!vectors) {
		vectors = buildVectors(pool);
		vectorCache.set(key, vectors);
	}
	return vectors;
}

/**
 * The slugs of the `limit` posts in `pool` closest to the post `slug`, best first.
 * `visitorsByPath` is popular-posts.json's map of "/blog/<slug>/" to visitors.
 */
export function rankRelatedPosts(
	slug: string,
	pool: RelatablePost[],
	visitorsByPath: Record<string, number>,
	limit = 3,
): string[] {
	const vectors = vectorsFor(pool);
	const current = vectors.get(slug);
	if (!current) throw new Error(`rankRelatedPosts: "${slug}" is not in the pool`);

	const visitors = (other: string) => visitorsByPath[`/blog/${other}/`] ?? 0;
	const mostVisitors = Math.max(1, ...pool.map((post) => visitors(post.slug)));

	return pool
		.filter((post) => post.slug !== slug)
		.map((post) => {
			const similarity = cosine(current, vectors.get(post.slug)!);
			const popularity = Math.log1p(visitors(post.slug)) / Math.log1p(mostVisitors);
			return { slug: post.slug, score: similarity * (1 + POPULARITY_BOOST * popularity) };
		})
		.filter(({ score }) => score > 0)
		.sort((a, b) => b.score - a.score)
		.slice(0, limit)
		.map(({ slug: related }) => related);
}
