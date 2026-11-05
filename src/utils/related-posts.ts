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

function termCounts(post: RelatablePost): Map<string, number> {
	const counts = new Map<string, number>();
	for (const token of postTokens(post)) counts.set(token, (counts.get(token) ?? 0) + 1);
	return counts;
}

interface PoolIndex {
	documentFrequency: Map<string, number>;
	size: number;
	vectors: Map<string, Vector>;
}

// A post's vector against the pool. A word no other post in the pool uses can't
// link it to anything, so it's left out. `inPool` says whether the post itself
// was counted in the pool's document frequencies.
function vectorize(
	counts: Map<string, number>,
	index: Omit<PoolIndex, 'vectors'>,
	inPool: boolean,
) {
	const vector: Vector = new Map();
	let norm = 0;
	for (const [term, count] of counts) {
		const df = index.documentFrequency.get(term) ?? 0;
		if (df - (inPool ? 1 : 0) < 1) continue;
		const weight = (1 + Math.log(count)) * Math.log(index.size / df);
		vector.set(term, weight);
		norm += weight * weight;
	}
	norm = Math.sqrt(norm) || 1;
	for (const [term, weight] of vector) vector.set(term, weight / norm);
	return vector;
}

function buildIndex(posts: RelatablePost[]): PoolIndex {
	const counts = posts.map(termCounts);
	const documentFrequency = new Map<string, number>();
	for (const postCounts of counts) {
		for (const term of postCounts.keys()) {
			documentFrequency.set(term, (documentFrequency.get(term) ?? 0) + 1);
		}
	}
	const base = { documentFrequency, size: posts.length };
	const vectors = new Map<string, Vector>();
	posts.forEach((post, i) => vectors.set(post.slug, vectorize(counts[i], base, true)));
	return { ...base, vectors };
}

function cosine(a: Vector, b: Vector): number {
	const [small, large] = a.size < b.size ? [a, b] : [b, a];
	let dot = 0;
	for (const [term, weight] of small) dot += weight * (large.get(term) ?? 0);
	return dot;
}

// Every page in a build ranks against the same pool, so it's indexed once
const indexCache = new Map<string, PoolIndex>();

function indexFor(pool: RelatablePost[]): PoolIndex {
	const key = pool.map((post) => post.slug).join('|');
	let index = indexCache.get(key);
	if (!index) {
		index = buildIndex(pool);
		indexCache.set(key, index);
	}
	return index;
}

/**
 * The slugs of the `limit` posts in `pool` closest to `current`, best first.
 * `current` can be one of the pool's posts or anything else with text, like a
 * newsletter issue. `visitorsByPath` is popular-posts.json's map of
 * "/blog/<slug>/" to visitors.
 */
export function rankRelatedPosts(
	current: RelatablePost,
	pool: RelatablePost[],
	visitorsByPath: Record<string, number>,
	limit = 3,
): string[] {
	const index = indexFor(pool);
	const currentVector =
		index.vectors.get(current.slug) ?? vectorize(termCounts(current), index, false);

	const visitors = (other: string) => visitorsByPath[`/blog/${other}/`] ?? 0;
	const mostVisitors = Math.max(1, ...pool.map((post) => visitors(post.slug)));

	return pool
		.filter((post) => post.slug !== current.slug)
		.map((post) => {
			const similarity = cosine(currentVector, index.vectors.get(post.slug)!);
			const popularity = Math.log1p(visitors(post.slug)) / Math.log1p(mostVisitors);
			return { slug: post.slug, score: similarity * (1 + POPULARITY_BOOST * popularity) };
		})
		.filter(({ score }) => score > 0)
		.sort((a, b) => b.score - a.score)
		.slice(0, limit)
		.map(({ slug: related }) => related);
}
