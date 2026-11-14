import { describe, expect, it } from 'vitest';
import { reviewStats, type StatsReview } from '../src/utils/review-stats';
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
		const coen = stats.topDirectors.find((d) => d.name === 'Joel Coen')!;
		expect(coen.films.map((f) => f.slug)).toEqual(['fargo-1', 'barton-fink']);
	});

	it('lists decades newest first, each with its best film', () => {
		expect(stats.decades.map((d) => d.decade)).toEqual([2020, 1990]);
		expect(stats.decades[1]).toMatchObject({ count: 3, best: { slug: 'fargo-1' } });
	});

	it("runs the months from January to the newest review's month", () => {
		expect(stats.thisYear).toBe(2026);
		expect(stats.months.map((m) => m.count)).toEqual([0, 1, 1, 0, 1]);
	});

	it('keeps a five-star film only while its latest review is five stars', () => {
		expect(stats.fiveStars).toEqual([]);
		expect(stats.ratings.find((r) => r.step === 5)!.count).toBe(1);
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
