// Builds src/data/talk-videos.json, the YouTube videos the talk archive embeds, from the
// yt-dlp .info.json files in the NAS archive (Talks/, Podcasts/, Livestreams/, Tutorials & Demos/ of
// "My Videos"; one folder per talk, see the README there). The talk-videos health check
// reads this file from GitHub and emails when one of these videos goes private or is deleted; the NAS copy in `backup` is what gets
// re-uploaded (unlisted) to Joe's channel in its place.
// Usage: npm run talks:videos [-- <My Videos root>]
import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_ROOT = '/Volumes/data/media/My Videos';
const OUT_FILE = 'src/data/talk-videos.json';
const JOE_CHANNEL_ID = 'UCWUGSN8Bb_c2QwPUfYmHwNA';
// Archived on the NAS but not talks: duplicate uploads of a talk already listed, CascadiaJS 2019
// proposal pitches, and side-project demos Joe doesn't want on /talks/
export const NOT_ON_TALKS = new Set([
	'UteuCkkTHvo', // Byteconf JavaScript 2019, older copy of ur3H2yZ8XHE
	'ZnVd3UCyVAU', // Web Rebels 2018, copy of JNs1ZvRzOYM
	'SKF1XI12qMI', // Node.js 2018, copy of xJYOipHkwNM
	'NWzxIF7h0mI', // CascadiaJS 2019 proposals
	'WEB9BAB--BY',
	'UBuouIu8zy0',
	'LW4alOKZCC8',
	'HVgx9DXKRkg', // StreamRoll
	'1OuDyDdTDFw', // Cloud Code demo
	'pX0F4eJb4lM', // A Gentle Introduction to Async Await, deleted duplicate of FB4JQPUS9Bs
	'I2yMKgKkKvk', // Moodlite, deleted duplicate of Eje1EPiiI5M
	'CBkHaIm-K9I', // Meta Muse demo, deleted; CData's cut RxXiOeSHrBA stays
	'FxeQ5eck3tw', // Atlas credit how-to, deleted (offer expired)
]);

const KIND_BY_FOLDER = {
	Talks: 'talk',
	Podcasts: 'podcast',
	Livestreams: 'livestream',
	'Tutorials & Demos': 'video',
};

/** One info.json (path relative to the archive root) to a talk-videos.json entry, or null. */
export function toTalkVideo(info, relativePath) {
	const kind = KIND_BY_FOLDER[relativePath.split('/')[0]];
	if (!kind || info._type === 'playlist' || !/^[\w-]{11}$/.test(info.id ?? '')) return null;
	if (NOT_ON_TALKS.has(info.id)) return null;
	const date = info.upload_date;
	return {
		id: info.id,
		title: info.title,
		channel: info.channel,
		owner: info.channel_id === JOE_CHANNEL_ID ? 'joe' : 'organizer',
		kind,
		date: `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`,
		durationSeconds: info.duration,
		backup: relativePath.replace(/\.info\.json$/, '.mkv'),
	};
}

/** The NAS file to re-upload: the downloaded .mkv, or for a video I uploaded myself (no
 * .mkv), my original recording in the same talk folder. */
export function findBackup(root, video) {
	if (fs.existsSync(path.join(root, video.backup))) return video.backup;
	const folder = path.dirname(video.backup);
	const original = fs
		.readdirSync(path.join(root, folder))
		.find((name) => /\(original\)\.(mp4|mkv|mov|flv|webm)$/.test(name));
	if (!original) throw new Error(`No backup video for ${video.id}: ${video.backup}`);
	return path.join(folder, original);
}

function infoFiles(dir, root) {
	return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) return entry.name === '@eaDir' ? [] : infoFiles(full, root);
		return entry.name.endsWith('.info.json') ? [path.relative(root, full)] : [];
	});
}

if (import.meta.url === `file://${process.argv[1]}`) {
	const root = process.argv[2] ?? DEFAULT_ROOT;
	const videos = Object.keys(KIND_BY_FOLDER)
		.flatMap((folder) => infoFiles(path.join(root, folder), root))
		.map((file) => toTalkVideo(JSON.parse(fs.readFileSync(path.join(root, file), 'utf8')), file))
		.filter(Boolean)
		.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
	for (const video of videos) video.backup = findBackup(root, video);
	fs.writeFileSync(OUT_FILE, `${JSON.stringify(videos, null, '\t')}\n`);
	console.log(`${videos.length} videos -> ${OUT_FILE}`);
}
