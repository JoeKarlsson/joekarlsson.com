// Builds src/data/talk-videos.json, the YouTube videos the talk archive embeds, from the
// yt-dlp .info.json files in the NAS archive (Talks/, Podcasts/, Livestreams/, Tutorials & Demos/ of
// "My Videos"). The talk-videos health check reads this file from GitHub and emails when
// one of these videos goes private or is deleted; the NAS copy in `backup` is what gets
// re-uploaded (unlisted) to Joe's channel in its place.
// Usage: npm run talks:videos [-- <My Videos root>]
import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_ROOT = '/Volumes/data/media/My Videos';
const OUT_FILE = 'src/data/talk-videos.json';
const JOE_CHANNEL_ID = 'UCWUGSN8Bb_c2QwPUfYmHwNA';
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
	for (const video of videos) {
		if (!fs.existsSync(path.join(root, video.backup))) {
			throw new Error(`No backup video for ${video.id}: ${video.backup}`);
		}
	}
	fs.writeFileSync(OUT_FILE, `${JSON.stringify(videos, null, '\t')}\n`);
	console.log(`${videos.length} videos -> ${OUT_FILE}`);
}
