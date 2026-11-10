import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import talkVideos from '../src/data/talk-videos.json';
import type { Talk } from '../src/data/talks';
import {
	TALK_ERAS,
	countByGroup,
	eraIndexFor,
	foldSeries,
	formatTalkDate,
	newestLinkedTalk,
	posterPath,
	talkMainLink,
	talks,
} from '../src/data/talks';

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
			if (t.otherRecording && !t.videos?.length && !ownVideos.has(t.otherRecording))
				return [`${name}: otherRecording ${t.otherRecording} is in no talk's videos`];
			const video = t.videos?.[0] ?? t.otherRecording;
			if (video)
				return existsSync(`public${posterPath(video)}`)
					? []
					: [`${name}: no poster for ${video}, run npm run talks:covers`];
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

describe('foldSeries', () => {
	const run = (title: string, event: string, kind: Talk['kind'] = 'talk'): Talk => ({
		title,
		event,
		kind,
		date: '2020-01-01',
	});

	it('folds repeat runs of a talk into one item where the newest sits, and keeps the rest', () => {
		const list = [
			run('IoT and JS(?!)', 'Conf42'),
			run('Schema Design Best Practices', 'MidwestPHP'),
			run('An Introduction to IoT', 'CodeLand'),
			run('Building an IoT Kitty Litter Box', 'Twitch', 'livestream'),
		];
		const items = foldSeries(list);
		expect(items).toHaveLength(3);
		expect(items[0]).toMatchObject({ runs: [list[0], list[2]] });
		// One schema run in this era stays an ordinary card, and the livestream doesn't fold in
		expect(items[1]).toEqual({ talk: list[1] });
		expect(items[2]).toEqual({ talk: list[3] });
	});

	it('links a talk to my page for it, else its recording, else the episode', () => {
		const base: Talk = { title: 'T', kind: 'talk', event: 'E', date: '2026-01-01' };
		expect(talkMainLink({ ...base, writeup: '/talks/t/', videos: ['abc'] })).toBe('/talks/t/');
		expect(talkMainLink({ ...base, otherRecording: 'xyz' })).toBe(
			'https://www.youtube.com/watch?v=xyz',
		);
		expect(talkMainLink({ ...base, listen: 'https://pod.example/1' })).toBe(
			'https://pod.example/1',
		);
		expect(talkMainLink(base)).toBeUndefined();
	});

	it('features the newest talk that has a link', () => {
		const { talk, href } = newestLinkedTalk();
		const newerWithLinks = talks.filter((t) => t.date > talk.date && talkMainLink(t));
		expect(newerWithLinks).toEqual([]);
		expect(href).toBe(talkMainLink(talk));
	});
});
