import { describe, expect, it } from 'vitest';
import {
	filmStats,
	fromRss,
	parseCsv,
	parseReviewUrl,
	reviewToMarkdown,
	slugFromReviewUrl,
	stars,
} from '../scripts/update-reviews.mjs';

describe('parseReviewUrl', () => {
	it("keeps a number that is part of the film's slug, so the right film page is fetched", () => {
		expect(parseReviewUrl('https://letterboxd.com/joekarlsson/film/toy-story-2/')).toEqual({
			film: 'toy-story-2',
			index: undefined,
		});
		expect(parseReviewUrl('https://letterboxd.com/joekarlsson/film/paddington-2/1/')).toEqual({
			film: 'paddington-2',
			index: '1',
		});
	});
});

describe('slugFromReviewUrl', () => {
	it("mirrors Letterboxd's review path, rewatch index included", () => {
		expect(slugFromReviewUrl('https://letterboxd.com/joekarlsson/film/zodiac/')).toBe('zodiac');
		expect(slugFromReviewUrl('https://letterboxd.com/joekarlsson/film/paddington-2/1/')).toBe(
			'paddington-2-1',
		);
	});
});

describe('reviewToMarkdown', () => {
	it('drops the RSS poster paragraph and keeps the review as Markdown paragraphs', () => {
		const rss =
			'<p><img src="https://a.ltrbxd.com/p.jpg"/></p> <p>I don&#039;t think she was <i>acting</i>.<br />Line two.</p><p>Second &amp; last.</p>';
		expect(reviewToMarkdown(rss)).toBe(
			"I don't think she was *acting*.  \nLine two.\n\nSecond & last.",
		);
	});

	it('keeps an escaped tag as text, since Markdown would render it as HTML', () => {
		expect(reviewToMarkdown('<p>The &lt;b&gt;best&lt;/b&gt; &lt;3</p>')).toBe(
			'The &lt;b>best&lt;/b> &lt;3',
		);
	});

	it('splits the export text on blank lines', () => {
		expect(reviewToMarkdown('One.\n\nTwo.')).toBe('One.\n\nTwo.');
	});
});

describe('fromRss', () => {
	const item = (guid: string, body: string) =>
		`<item><title>Resident Evil, 2026 - ★★★★</title><link>https://letterboxd.com/joekarlsson/film/resident-evil-2026/1/</link><guid isPermaLink="false">${guid}</guid><letterboxd:filmTitle>Resident Evil</letterboxd:filmTitle><letterboxd:filmYear>2026</letterboxd:filmYear><description><![CDATA[ ${body} ]]></description></item>`;

	it('imports reviews and skips a diary log that has no review text', () => {
		const rss =
			item('letterboxd-watch-1', '<p>Watched on Friday November 13, 2026.</p>') +
			item('letterboxd-review-2', '<p>Better the second time.</p>');
		expect(fromRss(rss).map((r) => r.html.trim())).toEqual(['<p>Better the second time.</p>']);
	});
});

describe('parseCsv', () => {
	it('handles quoted commas, doubled quotes and newlines inside a field', () => {
		const rows = parseCsv('Name,Review\nZodiac,"Furious, then ""fine"".\n\nNow I love it."\n');
		expect(rows).toEqual([{ Name: 'Zodiac', Review: 'Furious, then "fine".\n\nNow I love it.' }]);
	});
});

describe('stars', () => {
	it('writes half stars as ½', () => {
		expect(stars(3.5)).toBe('★★★½');
		expect(stars(5)).toBe('★★★★★');
	});
});

describe('filmStats', () => {
	it("reads a film page's runtime, top-billed six, countries, language and Letterboxd average", () => {
		const ld = {
			duration: 'PT2H37M',
			actor: 'ABCDEFG'.split('').map((name) => ({ name })),
			countryOfOrigin: [{ name: 'USA' }],
			productionCompany: [{ name: 'Paramount Pictures' }],
			aggregateRating: { ratingValue: 4.03 },
		};
		const html = '<a href="/films/language/persianfarsi/" class="text-slug">Persian (Farsi)</a>';
		expect(filmStats(ld, html)).toEqual({
			runtime: 157,
			cast: ['A', 'B', 'C', 'D', 'E', 'F'],
			countries: ['USA'],
			language: 'Persian (Farsi)',
			studios: ['Paramount Pictures'],
			letterboxdAverage: 4.03,
		});
		expect(filmStats({ duration: 'PT45M' }, '').runtime).toBe(45);
		expect(filmStats({}, '').runtime).toBeUndefined();
	});
});
