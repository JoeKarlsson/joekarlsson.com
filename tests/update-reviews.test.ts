import { describe, expect, it } from 'vitest';
import {
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
