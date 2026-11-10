import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { findBackup, toTalkVideo } from '../scripts/sync-talk-videos.mjs';

const info = {
	id: 'GiNa2jen-lg',
	title: 'The Art of Computer Science',
	channel: 'TEDx Talks',
	channel_id: 'UCsT0YIqwnpJCM-mx7-gSA4Q',
	upload_date: '20211029',
	duration: 900,
};

describe('toTalkVideo', () => {
	it('maps a talk to an entry pointing at its NAS backup', () => {
		expect(toTalkVideo(info, 'Talks/2021/2021-10-29 - TEDx [GiNa2jen-lg].info.json')).toEqual({
			id: 'GiNa2jen-lg',
			title: 'The Art of Computer Science',
			channel: 'TEDx Talks',
			owner: 'organizer',
			kind: 'talk',
			date: '2021-10-29',
			durationSeconds: 900,
			backup: 'Talks/2021/2021-10-29 - TEDx [GiNa2jen-lg].mkv',
		});
	});

	it("marks Joe's own channel and the podcast kind", () => {
		const own = { ...info, channel_id: 'UCWUGSN8Bb_c2QwPUfYmHwNA' };
		expect(toTalkVideo(own, 'Podcasts/2021/x.info.json')).toMatchObject({
			owner: 'joe',
			kind: 'podcast',
		});
	});

	it('maps Tutorials & Demos to the video kind', () => {
		expect(toTalkVideo(info, 'Tutorials & Demos/CData/x.info.json')).toMatchObject({
			kind: 'video',
		});
	});

	it('skips playlists and folders the page does not embed', () => {
		expect(toTalkVideo({ ...info, _type: 'playlist' }, 'Talks/2021/x.info.json')).toBeNull();
		expect(toTalkVideo(info, 'TikTok/x.info.json')).toBeNull();
		expect(toTalkVideo({ ...info, id: 'UteuCkkTHvo' }, 'Talks/2019/x.info.json')).toBeNull();
	});
});

describe('findBackup', () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'my-videos-'));
	const folder = 'Talks/2019/2019-03-16 - Byteconf JavaScript 2019 - IoT and JS';
	fs.mkdirSync(path.join(root, folder), { recursive: true });
	fs.writeFileSync(path.join(root, folder, 'x [AAAAAAAAAAA].mkv'), '');
	fs.writeFileSync(path.join(root, folder, 'x (original).flv'), '');

	it('keeps the downloaded .mkv when it exists', () => {
		const backup = `${folder}/x [AAAAAAAAAAA].mkv`;
		expect(findBackup(root, { id: 'AAAAAAAAAAA', backup })).toBe(backup);
	});

	it('falls back to my original recording for a video I uploaded', () => {
		const video = { id: 'BBBBBBBBBBB', backup: `${folder}/x [BBBBBBBBBBB].mkv` };
		expect(findBackup(root, video)).toBe(`${folder}/x (original).flv`);
	});

	it('throws when the folder has neither', () => {
		const video = { id: 'CCCCCCCCCCC', backup: 'Talks/2019/x [CCCCCCCCCCC].mkv' };
		fs.mkdirSync(path.join(root, 'Talks/2019'), { recursive: true });
		expect(() => findBackup(root, video)).toThrow(/No backup video/);
	});
});
