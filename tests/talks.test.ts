import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import talkVideos from '../src/data/talk-videos.json';
import { TALK_ERAS, countByGroup, eraIndexFor, formatTalkDate, talks } from '../src/data/talks';

describe('talks.ts', () => {
	it('has every video the health check watches, once', () => {
		const ids = talks.flatMap((t) => t.videos ?? []);
		expect(new Set(ids).size).toBe(ids.length);
		expect(talkVideos.map((v) => v.id).filter((id) => !ids.includes(id))).toEqual([]);
	});

	it('gives every card a picture: its video, another recording, or the event picture', () => {
		const ownVideos = new Set(talks.flatMap((t) => t.videos ?? []));
		const problems = talks.flatMap((t) => {
			const name = `${t.title} (${t.event})`;
			if (t.videos?.length) {
				const missing = t.videos.filter((id) => !existsSync(`public/images/youtube/${id}.webp`));
				return missing.map((id) => `${name}: no poster for ${id}, run npm run youtube:thumbnails`);
			}
			if (t.otherRecording) {
				if (!ownVideos.has(t.otherRecording))
					return [`${name}: otherRecording ${t.otherRecording} is in no talk's videos`];
				return existsSync(`public/images/talks/recorded/${t.otherRecording}.webp`)
					? []
					: [`${name}: run npm run talks:covers`];
			}
			if (t.cover) return existsSync(`public${t.cover}`) ? [] : [`${name}: no file at ${t.cover}`];
			return t.paperScrap ? [] : [`${name}: no video, otherRecording, cover or paperScrap flag`];
		});
		expect(problems).toEqual([]);
	});

	it('starts MongoDB in August 2019, after KCDC and ACH in July', () => {
		const era = (date: string) => TALK_ERAS[eraIndexFor(date)].label;
		expect(era('2019-07-25')).toBe('Best Buy');
		expect(era('2019-08-07')).toBe('MongoDB');
	});

	it('puts every talk in exactly one era', () => {
		expect(TALK_ERAS.reduce((n, era) => n + era.talks.length, 0)).toBe(talks.length);
	});

	it('splits a year two jobs share by the month', () => {
		const era = (date: string) => TALK_ERAS[eraIndexFor(date)].label;
		expect(era('2024-01-09')).toBe('Tinybird');
		expect(era('2024-12-19')).toBe('CloudQuery');
		expect(era('2019')).toBe('Best Buy');
	});

	it('formats each date precision', () => {
		expect(formatTalkDate({ date: '2025' })).toBe('2025');
		expect(formatTalkDate({ date: '2022-03' })).toBe('Mar 2022');
		expect(formatTalkDate({ date: '2026-11-05' })).toBe('Nov 5, 2026');
		expect(formatTalkDate({ date: '2026-04-20', end: '2026-04-24' })).toBe('Apr 20-24, 2026');
		expect(formatTalkDate({ date: '2019-08-30', end: '2019-09-01' })).toBe('Aug 30-Sep 1, 2019');
	});

	it('counts panels as talks and skips kinds with none', () => {
		expect(
			countByGroup([
				{ title: 'a', kind: 'panel', event: 'x', date: '2021' },
				{ title: 'b', kind: 'talk', event: 'x', date: '2021' },
				{ title: 'c', kind: 'podcast', event: 'x', date: '2021' },
				{ title: 'd', kind: 'demo', event: 'x', date: '2021' },
			]),
		).toBe('2 talks, 1 podcast, 1 demo');
	});
});
