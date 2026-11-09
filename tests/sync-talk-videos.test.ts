import { describe, expect, it } from 'vitest';
import { toTalkVideo } from '../scripts/sync-talk-videos.mjs';

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

	it('skips playlists and folders the page does not embed', () => {
		expect(toTalkVideo({ ...info, _type: 'playlist' }, 'Talks/2021/x.info.json')).toBeNull();
		expect(toTalkVideo(info, 'TikTok/x.info.json')).toBeNull();
	});
});
