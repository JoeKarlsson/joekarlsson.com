import { describe, expect, it } from 'vitest';
import { chapterSeconds, isoDuration, videoObject } from '../src/utils/video-schema';

describe('video-schema', () => {
	it('reads chapter times and writes ISO 8601 durations', () => {
		expect(chapterSeconds('14:39')).toBe(879);
		expect(chapterSeconds('1:02:03')).toBe(3723);
		expect(isoDuration(879)).toBe('PT14M39S');
		expect(isoDuration(3600)).toBe('PT1H');
		expect(isoDuration(0)).toBe('PT0S');
	});

	it('turns chapters into Clips that end where the next one starts', () => {
		const video = videoObject('7az78FYgwx4', {
			description: 'x',
			chapters: [
				{ at: '0:00', name: 'Start' },
				{ at: '1:06', name: 'Agenda' },
			],
		});
		expect(video.hasPart).toEqual([
			expect.objectContaining({ name: 'Start', startOffset: 0, endOffset: 66 }),
			expect.objectContaining({ name: 'Agenda', startOffset: 66, endOffset: 877 }),
		]);
	});

	it('refuses a video the health check does not watch', () => {
		expect(() => videoObject('xxxxxxxxxxx', { description: 'x' })).toThrow(/talk-videos.json/);
	});
});
