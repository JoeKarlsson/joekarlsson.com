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
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
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
	const films = uniqueFilms(reviews);
	const chronological = reviews.toSorted((a, b) => a.date.valueOf() - b.date.valueOf());
	const newest = chronological.at(-1)!;
	const byDecade = Map.groupBy(films, (r) => Math.floor(r.year / 10) * 10);
	const releaseYears = films.map((r) => r.year);
	const firstRelease = Math.min(...releaseYears);
	// My stars against Letterboxd's average, biggest gap first
	const gap = (r: R) => r.rating! - r.letterboxdAverage!;
	const compared = films.filter((r) => r.rating && r.letterboxdAverage);

	return {
		reviews: reviews.length,
		hours: Math.round(reviews.reduce((a, r) => a + (r.runtime ?? 0), 0) / 60),
		directors: new Set(films.flatMap((r) => (r.director ? [r.director] : []))).size,
		countries: new Set(films.flatMap((r) => r.countries)).size,
		streak: longestWeekStreak(reviews.map((r) => r.date)),
		ratings: RATING_STEPS.map((step) => ({
			step,
			count: reviews.filter((r) => r.rating === step).length,
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

export interface DiaryEntry {
	title: string;
	year: number;
	watched: string;
	logged: string;
	rating: number | null;
	rewatch: boolean;
}

/** False for a backfill logged on the film's release date because the real date was lost
 * (Nosferatu "watched" 1922-02-16): it counts all time, never in a year, month or weekday */
export const hasRealWatchDate = (e: DiaryEntry) =>
	!(
		Number(e.watched.slice(0, 4)) === e.year &&
		Date.parse(e.logged) - Date.parse(e.watched) > 60 * DAY
	);

/** Watches a year page counts: every one with a real date in that year */
export const watchesIn = (diary: DiaryEntry[], year: number) =>
	diary.filter((e) => hasRealWatchDate(e) && e.watched.startsWith(`${year}-`));

/** Everything logged (the diary) next to what got a review, for the stats page's headline
 * numbers and its split bars. A bar never shows fewer watches than reviews: a review whose
 * diary entry differs (another date or rating) still counts. */
export function watchStats(diary: DiaryEntry[], reviews: StatsReview[], year?: number) {
	const watches = year ? watchesIn(diary, year) : diary;
	const revs = year ? reviews.filter((r) => r.date.getUTCFullYear() === year) : reviews;
	const dated = watches.filter(hasRealWatchDate);
	const pair = (w: number, r: number) => ({ watched: Math.max(w, r), reviewed: r });
	const day = (s: string) => new Date(`${s}T00:00:00Z`);
	const ratings = watches.flatMap((e) => (e.rating ? [e.rating] : []));
	// The latest year runs January through its newest month, a past year all twelve
	const latest = Math.max(
		...diary.filter(hasRealWatchDate).map((e) => Number(e.watched.slice(0, 4))),
	);
	const lastMonth =
		year && year < latest
			? 11
			: Math.max(
					...dated.map((e) => day(e.watched).getUTCMonth()),
					...revs.map((r) => r.date.getUTCMonth()),
				);
	const years = [...new Set(dated.map((e) => Number(e.watched.slice(0, 4))))].sort((a, b) => a - b);
	return {
		watched: watches.length,
		reviewed: revs.length,
		rewatches: watches.filter((e) => e.rewatch).length,
		average: average(ratings),
		ratings: RATING_STEPS.map((step) => ({
			step,
			...pair(
				watches.filter((e) => e.rating === step).length,
				revs.filter((r) => r.rating === step).length,
			),
		})),
		months: year
			? Array.from({ length: lastMonth + 1 }, (_, m) =>
					pair(
						dated.filter((e) => day(e.watched).getUTCMonth() === m).length,
						revs.filter((r) => r.date.getUTCMonth() === m).length,
					),
				)
			: [],
		years: year
			? []
			: years.map((y) => ({
					year: y,
					average: average(
						dated.flatMap((e) => (e.rating && e.watched.startsWith(`${y}-`) ? [e.rating] : [])),
					),
					...pair(
						dated.filter((e) => e.watched.startsWith(`${y}-`)).length,
						revs.filter((r) => r.date.getUTCFullYear() === y).length,
					),
				})),
		weekdays: WEEKDAYS.map((name, i) => ({
			name,
			...pair(
				dated.filter((e) => (day(e.watched).getUTCDay() + 6) % 7 === i).length,
				revs.filter((r) => (r.date.getUTCDay() + 6) % 7 === i).length,
			),
		})),
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
