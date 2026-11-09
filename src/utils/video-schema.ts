// schema.org VideoObject JSON-LD for a YouTube video on a page, from what talk-videos.json
// knows about it (title, upload date, length) and the page's local poster. Chapters become
// Clip parts, so search can link straight to a section of the talk.
import talkVideos from '../data/talk-videos.json';
import { SITE_URL } from '../consts';

export interface Chapter {
	// "14:39" or "1:02:03", from the start of this video
	at: string;
	name: string;
}

/** "14:39" -> 879 */
export function chapterSeconds(at: string): number {
	return at.split(':').reduce((total, part) => total * 60 + Number(part), 0);
}

/** 879 -> "PT14M39S" */
export function isoDuration(seconds: number): string {
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = seconds % 60;
	return `PT${h ? `${h}H` : ''}${m ? `${m}M` : ''}${s || (!h && !m) ? `${s}S` : ''}`;
}

export function videoObject(
	id: string,
	{ description, chapters = [] }: { description: string; chapters?: Chapter[] },
): Record<string, unknown> {
	const video = talkVideos.find((v) => v.id === id);
	if (!video) throw new Error(`videoObject: ${id} is not in talk-videos.json`);
	const watch = `https://www.youtube.com/watch?v=${id}`;
	const starts = chapters.map((c) => chapterSeconds(c.at));
	return {
		'@type': 'VideoObject',
		'@id': `${watch}#video`,
		name: video.title,
		description,
		thumbnailUrl: `${SITE_URL}/images/youtube/${id}.webp`,
		uploadDate: video.date,
		duration: isoDuration(video.durationSeconds),
		embedUrl: `https://www.youtube.com/embed/${id}`,
		url: watch,
		...(chapters.length > 0
			? {
					hasPart: chapters.map((chapter, i) => ({
						'@type': 'Clip',
						name: chapter.name,
						startOffset: starts[i],
						endOffset: starts[i + 1] ?? video.durationSeconds,
						url: `${watch}&t=${starts[i]}s`,
					})),
				}
			: {}),
	};
}
