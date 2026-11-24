import { describe, expect, it } from 'vitest';
import { diaryFromExport, diaryFromRss, mergeDiary } from '../scripts/letterboxd-diary.mjs';

describe('letterboxd diary', () => {
	it('reads the export and the RSS feed into the same shape', () => {
		const csv =
			'Date,Name,Year,Letterboxd URI,Rating,Rewatch,Tags,Watched Date\n' +
			'2026-11-25,"Fjord",2026,https://boxd.it/x,2.5,,,2026-11-23\n';
		const rss = `<item><pubDate>Tue, 25 Nov 2026 01:00:00 +1300</pubDate>
			<letterboxd:watchedDate>2026-11-23</letterboxd:watchedDate>
			<letterboxd:rewatch>No</letterboxd:rewatch>
			<letterboxd:filmTitle>Fjord</letterboxd:filmTitle>
			<letterboxd:filmYear>2026</letterboxd:filmYear>
			<letterboxd:memberRating>2.5</letterboxd:memberRating></item>
			<item><title>A list</title></item>`;
		const fjord = {
			title: 'Fjord',
			year: 2026,
			watched: '2026-11-23',
			rating: 2.5,
			rewatch: false,
		};
		expect(diaryFromExport(csv)).toEqual([{ ...fjord, logged: '2026-11-25' }]);
		expect(diaryFromRss(rss)).toEqual([{ ...fjord, logged: '2026-11-24' }]);
	});

	it('only adds entries it has not seen, newest watch first', () => {
		const e = (title: string, watched: string) => ({
			title,
			year: 2026,
			watched,
			logged: watched,
			rating: null,
			rewatch: false,
		});
		const { merged, added } = mergeDiary(
			[e('Old', '2026-01-01')],
			[e('Old', '2026-01-01'), e('New', '2026-02-01')],
		);
		expect(added).toBe(1);
		expect(merged.map((x) => x.title)).toEqual(['New', 'Old']);
	});
});
