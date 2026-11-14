// The numbers behind /reviews/stats/, worked out at build time from the reviews collection.
// A rewatch is its own review (it counts toward reviews and ratings), but a film counts
// once in the per-film lists (directors, decades, five stars), as its latest review.

export interface StatsReview {
	title: string;
	year: number;
	date: Date;
	rating?: number;
	rewatch: boolean;
	director?: string;
	genres: string[];
	slug: string;
}

export const RATING_STEPS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

const average = (ratings: number[]) => ratings.reduce((a, b) => a + b, 0) / ratings.length;
const rated = (reviews: StatsReview[]) => reviews.flatMap((r) => (r.rating ? [r.rating] : []));

/** Latest review of each film, best rated first, then by title */
export function uniqueFilms<R extends StatsReview>(reviews: R[]): R[] {
	const latest = new Map<string, R>();
	for (const r of reviews) {
		const key = `${r.title}|${r.year}`;
		const seen = latest.get(key);
		if (!seen || r.date > seen.date) latest.set(key, r);
	}
	return [...latest.values()].sort(
		(a, b) => (b.rating ?? 0) - (a.rating ?? 0) || a.title.localeCompare(b.title),
	);
}

export function reviewStats<R extends StatsReview>(reviews: R[]) {
	const newest = reviews.reduce((a, b) => (b.date > a.date ? b : a));
	const thisYear = newest.date.getUTCFullYear();
	const byDecade = Map.groupBy(reviews, (r) => Math.floor(r.year / 10) * 10);
	const byDirector = Map.groupBy(
		reviews.filter((r) => r.director),
		(r) => r.director!,
	);
	const byGenre = Map.groupBy(
		reviews.flatMap((r) => r.genres.map((genre) => ({ genre, r }))),
		(g) => g.genre,
	);

	return {
		reviews: reviews.length,
		films: uniqueFilms(reviews).length,
		average: average(rated(reviews)),
		directors: byDirector.size,
		rewatches: reviews.filter((r) => r.rewatch).length,
		ratings: RATING_STEPS.map((step) => ({
			step,
			count: reviews.filter((r) => r.rating === step).length,
		})),
		thisYear,
		// January through the newest review's month
		months: Array.from({ length: newest.date.getUTCMonth() + 1 }, (_, m) => ({
			month: m,
			count: reviews.filter(
				(r) => r.date.getUTCFullYear() === thisYear && r.date.getUTCMonth() === m,
			).length,
		})),
		// Newest decade first (DECISIONS.md)
		decades: [...byDecade]
			.sort(([a], [b]) => b - a)
			.map(([decade, list]) => ({ decade, count: list.length, best: uniqueFilms(list)[0] })),
		topDirectors: [...byDirector]
			.map(([name, list]) => {
				const films = uniqueFilms(list);
				return { name, films, average: average(rated(films)) };
			})
			.sort((a, b) => b.films.length - a.films.length || b.average - a.average)
			.slice(0, 6),
		genres: [...byGenre]
			.map(([genre, list]) => ({
				genre,
				count: list.length,
				average: average(rated(list.map((g) => g.r))),
			}))
			.filter((g) => g.count >= 10)
			.sort((a, b) => b.count - a.count)
			.slice(0, 12),
		// By each film's latest rating, so a rewatch that dropped a star takes it off
		fiveStars: uniqueFilms(reviews)
			.filter((r) => r.rating === 5)
			.sort((a, b) => b.date.valueOf() - a.date.valueOf()),
	};
}
