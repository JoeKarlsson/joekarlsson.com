import { SPOILER_MARK } from '../plugins/rehype-spoilers.mjs';

// The numbers behind /reviews/stats/ (all time) and /reviews/stats/<year>/, worked out at
// build time from the reviews collection, after the sections of Letterboxd's own stats page.
// A rewatch is its own review (it counts toward reviews, ratings and hours), but a film
// counts once in the per-film lists (ranked, directors, cast, decades), as its latest review.

export interface StatsReview {
	title: string;
	year: number;
	date: Date;
	rating?: number;
	rewatch: boolean;
	director?: string;
	genres: string[];
	slug: string;
	runtime?: number;
	cast: string[];
	countries: string[];
	language?: string;
	studios: string[];
	letterboxdAverage?: number;
}

export const RATING_STEPS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
/** "Highest rated" lists only rank what I've seen this many films of, like Letterboxd's */
export const HIGHEST_RATED_MIN = 3;
const DAY = 864e5;

const average = (ratings: number[]) => ratings.reduce((a, b) => a + b, 0) / ratings.length;
const rated = (reviews: StatsReview[]) => reviews.flatMap((r) => (r.rating ? [r.rating] : []));
const byRating = <R extends StatsReview>(a: R, b: R) => (b.rating ?? 0) - (a.rating ?? 0);

/** Latest review of each film, best rated first, then by title */
export function uniqueFilms<R extends StatsReview>(reviews: R[]): R[] {
	const latest = new Map<string, R>();
	for (const r of reviews) {
		const key = `${r.title}|${r.year}`;
		const seen = latest.get(key);
		if (!seen || r.date > seen.date) latest.set(key, r);
	}
	return [...latest.values()].sort((a, b) => byRating(a, b) || a.title.localeCompare(b.title));
}

/** Most weeks in a row (Monday to Sunday, UTC) with at least one review, Letterboxd's streak */
export function longestWeekStreak(dates: Date[]): number {
	const weeks = [
		...new Set(dates.map((d) => Math.floor((d.valueOf() / DAY + 3) / 7))), // epoch was a Thursday
	].sort((a, b) => a - b);
	let best = 0;
	let run = 0;
	weeks.forEach((w, i) => {
		run = i && w - weeks[i - 1] === 1 ? run + 1 : 1;
		best = Math.max(best, run);
	});
	return best;
}

/** People, places or genres by how many films I've seen of each, and by my average for them */
function ranked<R extends StatsReview>(films: R[], keys: (r: R) => string[]) {
	const groups = new Map<string, R[]>();
	for (const r of films) for (const k of keys(r)) groups.set(k, [...(groups.get(k) ?? []), r]);
	const rows = [...groups].map(([name, list]) => ({
		name,
		films: list.sort(byRating),
		average: average(rated(list)),
	}));
	return {
		// "Most watched" means two films or more; one each isn't a pattern
		most: rows
			.filter((r) => r.films.length >= 2)
			.toSorted((a, b) => b.films.length - a.films.length || b.average - a.average)
			.slice(0, 10),
		highest: rows
			.filter((r) => r.films.length >= HIGHEST_RATED_MIN && !Number.isNaN(r.average))
			.sort((a, b) => b.average - a.average || b.films.length - a.films.length)
			.slice(0, 10),
	};
}

/** `year` limits everything to reviews from that year; without it, all time */
export function reviewStats<R extends StatsReview>(all: R[], year?: number) {
	const reviews = year ? all.filter((r) => r.date.getUTCFullYear() === year) : all;
	const latestYear = Math.max(...all.map((r) => r.date.getUTCFullYear()));
	const films = uniqueFilms(reviews);
	const chronological = reviews.toSorted((a, b) => a.date.valueOf() - b.date.valueOf());
	const newest = chronological.at(-1)!;
	const days = Map.groupBy(reviews, (r) => r.date.toISOString().slice(0, 10));
	const byDecade = Map.groupBy(films, (r) => Math.floor(r.year / 10) * 10);
	const releaseYears = films.map((r) => r.year);
	const firstRelease = Math.min(...releaseYears);
	// My stars against Letterboxd's average, biggest gap first
	const gap = (r: R) => r.rating! - r.letterboxdAverage!;
	const compared = films.filter((r) => r.rating && r.letterboxdAverage);

	return {
		reviews: reviews.length,
		films: films.length,
		hours: Math.round(reviews.reduce((a, r) => a + (r.runtime ?? 0), 0) / 60),
		average: average(rated(reviews)),
		directors: new Set(films.flatMap((r) => (r.director ? [r.director] : []))).size,
		countries: new Set(films.flatMap((r) => r.countries)).size,
		streak: longestWeekStreak(reviews.map((r) => r.date)),
		multiFilmDays: [...days.values()].filter((d) => d.length >= 2).length,
		rewatches: reviews.filter((r) => r.rewatch).length,
		ratings: RATING_STEPS.map((step) => ({
			step,
			count: reviews.filter((r) => r.rating === step).length,
		})),
		// The latest year runs January through its newest review's month, a past year all
		// twelve; all time runs by year
		months: year
			? Array.from(
					{ length: year === latestYear ? newest.date.getUTCMonth() + 1 : 12 },
					(_, m) => ({
						month: m,
						count: reviews.filter((r) => r.date.getUTCMonth() === m).length,
					}),
				)
			: [],
		years: year
			? []
			: [...Map.groupBy(chronological, (r) => r.date.getUTCFullYear())].map(([y, list]) => ({
					year: y,
					count: list.length,
					average: average(rated(list)),
				})),
		weekdays: WEEKDAYS.map((day, i) => ({
			day,
			count: reviews.filter((r) => (r.date.getUTCDay() + 6) % 7 === i).length,
		})),
		releaseYears: Array.from({ length: Math.max(...releaseYears) - firstRelease + 1 }, (_, i) => ({
			year: firstRelease + i,
			count: releaseYears.filter((y) => y === firstRelease + i).length,
		})),
		// Newest decade first (DECISIONS.md)
		decades: [...byDecade]
			.sort(([a], [b]) => b - a)
			.map(([decade, list]) => ({
				decade,
				count: list.length,
				average: average(rated(list)),
				best: uniqueFilms(list)[0],
			})),
		// Ties go to the film I saw first
		top: films
			.filter((r) => r.rating)
			.sort((a, b) => byRating(a, b) || a.date.valueOf() - b.date.valueOf())
			.slice(0, 10),
		milestones: {
			first: chronological[0],
			hundredth: chronological[99],
			last: newest,
			longest: films.toSorted((a, b) => (b.runtime ?? 0) - (a.runtime ?? 0))[0],
		},
		higher: compared
			.filter((r) => gap(r) > 0)
			.sort((a, b) => gap(b) - gap(a))
			.slice(0, 5),
		lower: compared
			.filter((r) => gap(r) < 0)
			.sort((a, b) => gap(a) - gap(b))
			.slice(0, 5),
		genres: ranked(films, (r) => r.genres),
		countryList: ranked(films, (r) => r.countries),
		languages: ranked(films, (r) => (r.language ? [r.language] : [])),
		directorList: ranked(films, (r) => (r.director ? [r.director] : [])),
		cast: ranked(films, (r) => r.cast),
		studios: ranked(films, (r) => r.studios),
		// By each film's latest rating, so a rewatch that dropped a star takes it off
		fiveStars: films
			.filter((r) => r.rating === 5)
			.sort((a, b) => b.date.valueOf() - a.date.valueOf()),
	};
}

/** The years that have reviews, newest first */
export const reviewYears = (reviews: StatsReview[]) =>
	[...new Set(reviews.map((r) => r.date.getUTCFullYear()))].sort((a, b) => b - a);

/** The one-liner a hover card or hero may show. Neither can blur, so a review flagged as
 * spoilers shows none and a ||marked|| spoiler reads (spoiler). */
export function oneLiner(review: { spoilers: boolean; description: string }): string {
	return review.spoilers ? '' : review.description.replace(SPOILER_MARK, '(spoiler)');
}
