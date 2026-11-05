import { describe, expect, it } from 'vitest';
import { parseLetterboxdFilms, truncateAtWord } from '../scripts/now-feed-parsing.mjs';

const POSTER = 'https://a.ltrbxd.com/resized/film-poster/1/2/3-0-600-0-900-crop.jpg';

function item(fields: { guid: string; title?: string; rating?: string; body?: string }): string {
	return `<item>
	<title>${fields.title ?? 'A list'}</title>
	<link>https://letterboxd.com/joekarlsson/film/x/</link>
	<guid isPermaLink="false">${fields.guid}</guid>
	${fields.title ? `<letterboxd:filmTitle>${fields.title}</letterboxd:filmTitle><letterboxd:filmYear>1984</letterboxd:filmYear><tmdb:movieId>42</tmdb:movieId>` : ''}
	${fields.rating ? `<letterboxd:memberRating>${fields.rating}</letterboxd:memberRating>` : ''}
	<description><![CDATA[ <p><img src="${POSTER}"/></p> ${fields.body ?? ''} ]]></description>
</item>`;
}

const options = { limit: 4, reviewExcerptMaxChars: 40 };

describe('parseLetterboxdFilms', () => {
	it('reads a review: decoded title, rating, poster and a spoiler-free excerpt', () => {
		const rss = item({
			guid: 'letterboxd-review-1',
			title: 'Dune &amp; Sons',
			rating: '4.5',
			body: '<p><em>This review may contain spoilers.</em></p><p>It&#39;s a long, strange trip through the desert with worms.</p>',
		});

		expect(parseLetterboxdFilms(rss, options)).toEqual([
			{
				title: 'Dune & Sons',
				year: 1984,
				rating: 4.5,
				reviewExcerpt: "It's a long, strange trip through the...",
				url: 'https://letterboxd.com/joekarlsson/film/x/',
				tmdbId: '42',
				posterUrl: POSTER,
			},
		]);
	});

	it('gives a diary entry with no rating no excerpt, and skips lists', () => {
		const rss =
			item({ guid: 'letterboxd-list-9' }) +
			item({ guid: 'letterboxd-watch-2', title: 'Alien', body: '<p>Watched on Friday</p>' });

		const [film, ...rest] = parseLetterboxdFilms(rss, options);
		expect(rest).toEqual([]);
		expect(film).toMatchObject({ title: 'Alien', rating: null, reviewExcerpt: null });
	});

	it('keeps only the newest few', () => {
		const rss = Array.from({ length: 6 }, (_, i) =>
			item({ guid: `letterboxd-watch-${i}`, title: `Film ${i}` }),
		).join('');

		expect(parseLetterboxdFilms(rss, options).map((f) => f.title)).toEqual([
			'Film 0',
			'Film 1',
			'Film 2',
			'Film 3',
		]);
	});

	it('fails loudly on a feed with no films or a film with no poster', () => {
		expect(() => parseLetterboxdFilms(item({ guid: 'letterboxd-list-1' }), options)).toThrow(
			'no film entries',
		);
		const noPoster = item({ guid: 'letterboxd-watch-1', title: 'Alien' }).replace(/<img[^>]*>/, '');
		expect(() => parseLetterboxdFilms(noPoster, options)).toThrow('No poster');
	});
});

describe('truncateAtWord', () => {
	it('leaves short text alone', () => {
		expect(truncateAtWord('Short enough', 40)).toBe('Short enough');
	});

	it('cuts at the last whole word and drops trailing punctuation', () => {
		expect(truncateAtWord('fix: Blog rows wake up, with a dotted thumbnail', 24)).toBe(
			'fix: Blog rows wake up...',
		);
	});

	it('cuts one long word at the limit', () => {
		expect(truncateAtWord('a'.repeat(100), 10)).toBe(`${'a'.repeat(10)}...`);
	});
});
