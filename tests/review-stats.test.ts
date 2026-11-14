import { describe, expect, it } from 'vitest';
import {
	longestWeekStreak,
	oneLiner,
	reviewStats,
	type StatsReview,
} from '../src/utils/review-stats';
import { swellScale } from '../src/scripts/review-stats';

const review = (over: Partial<StatsReview>): StatsReview => ({
	title: 'Film',
	year: 2000,
	date: new Date('2026-03-01'),
	rating: 3,
	rewatch: false,
	director: 'Someone',
	genres: [],
	slug: 'film',
	cast: [],
	countries: [],
	studios: [],
	...over,
});

describe('reviewStats', () => {
	const reviews = [
		review({
			title: 'Fargo',
			year: 1996,
			rating: 5,
			director: 'Joel Coen',
			slug: 'fargo',
			date: new Date('2025-01-02'),
		}),
		review({
			title: 'Fargo',
			year: 1996,
			rating: 4.5,
			director: 'Joel Coen',
			slug: 'fargo-1',
			rewatch: true,
			date: new Date('2026-05-01'),
		}),
		review({
			title: 'Barton Fink',
			year: 1991,
			rating: 4,
			director: 'Joel Coen',
			slug: 'barton-fink',
		}),
		review({
			title: 'New',
			year: 2024,
			rating: 2,
			director: 'Other',
			slug: 'new',
			date: new Date('2026-02-10'),
		}),
	];
	const stats = reviewStats(reviews);

	it('counts a rewatch as a review but the film once', () => {
		expect(stats.reviews).toBe(4);
		expect(stats.films).toBe(3);
		expect(stats.rewatches).toBe(1);
		const coen = stats.directorList.most.find((d) => d.name === 'Joel Coen')!;
		expect(coen.films.map((f) => f.slug)).toEqual(['fargo-1', 'barton-fink']);
	});

	it('lists decades newest first, each film once, with its best film', () => {
		expect(stats.decades.map((d) => d.decade)).toEqual([2020, 1990]);
		expect(stats.decades[1]).toMatchObject({ count: 2, best: { slug: 'fargo-1' } });
	});

	it("limits a year to its own reviews and runs its months to the newest review's", () => {
		const year = reviewStats(reviews, 2026);
		expect(year.reviews).toBe(3);
		expect(year.months.map((m) => m.count)).toEqual([0, 1, 1, 0, 1]);
		expect(year.milestones.first.slug).toBe('new');
		// A finished year runs all twelve months
		expect(reviewStats(reviews, 2025).months).toHaveLength(12);
		expect(stats.years.map((y) => [y.year, y.count])).toEqual([
			[2025, 1],
			[2026, 3],
		]);
	});

	it('ranks highest rated only past three films, and finds my biggest gaps from Letterboxd', () => {
		const many = [4, 4.5, 5].map((rating, i) =>
			review({ title: `C${i}`, rating, cast: ['Frances McDormand'], slug: `c${i}` }),
		);
		const two = [5, 5].map((rating, i) =>
			review({ title: `D${i}`, rating, cast: ['Steve Buscemi'], slug: `d${i}` }),
		);
		const s = reviewStats([
			...many,
			...two,
			review({ title: 'Loved', rating: 5, letterboxdAverage: 3, slug: 'loved' }),
			review({ title: 'Hated', rating: 1, letterboxdAverage: 4, slug: 'hated' }),
		]);
		expect(s.cast.most.map((c) => c.name)).toEqual(['Frances McDormand', 'Steve Buscemi']);
		expect(s.cast.highest.map((c) => c.name)).toEqual(['Frances McDormand']);
		expect(s.higher[0].slug).toBe('loved');
		expect(s.lower[0].slug).toBe('hated');
	});

	it('never lists a film I rated below the crowd as rated higher, or one above as lower', () => {
		const s = reviewStats(
			[3, 2, 4].map((rating, i) =>
				review({ title: `B${i}`, rating, letterboxdAverage: 4.2, slug: `b${i}` }),
			),
		);
		expect(s.higher).toEqual([]);
		expect(s.lower.map((r) => r.slug)).toEqual(['b1', 'b0', 'b2']);
	});

	it('keeps a five-star film only while its latest review is five stars', () => {
		expect(stats.fiveStars).toEqual([]);
		expect(stats.ratings.find((r) => r.step === 5)!.count).toBe(1);
	});
});

describe('longestWeekStreak', () => {
	it('counts Monday-to-Sunday weeks in a row and restarts after a gap', () => {
		const d = (s: string) => new Date(`${s}T00:00:00Z`);
		// Sun Jan 4 and Mon Jan 5 2026 are different weeks; then a week off, then two more
		expect(
			longestWeekStreak([d('2026-01-04'), d('2026-01-05'), d('2026-01-12'), d('2026-01-26')]),
		).toBe(3);
		expect(longestWeekStreak([d('2026-01-05'), d('2026-01-11')])).toBe(1);
	});
});

describe('swellScale', () => {
	it('grows a wall tile most under the pointer and not at all past the radius', () => {
		expect(swellScale(0)).toBeCloseTo(1.9);
		expect(swellScale(35)).toBeGreaterThan(1);
		expect(swellScale(35)).toBeLessThan(1.9);
		expect(swellScale(70)).toBe(1);
	});
});

describe('oneLiner', () => {
	it('never shows a spoiler: marked ones are cut, flagged reviews show nothing', () => {
		expect(oneLiner({ spoilers: false, description: 'Great until ||he dies|| at the end.' })).toBe(
			'Great until (spoiler) at the end.',
		);
		expect(oneLiner({ spoilers: true, description: 'The twist is he was dead.' })).toBe('');
	});
});
