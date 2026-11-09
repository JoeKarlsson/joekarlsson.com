// Saves the thumbnail of every YouTube link that stands alone in a post or issue
// (the ones rehype-youtube-embed turns into click-to-play buttons), and of every video
// on /talks/ (src/data/talks.ts), as public/images/youtube/<id>.webp, so pages never
// load images from YouTube.
// Skips thumbnails already saved. Usage: npm run youtube:thumbnails
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const CONTENT_DIR = 'src/content';
const TALKS_FILE = 'src/data/talks.ts';
const OUT_DIR = 'public/images/youtube';
// A line (or list item) holding only a YouTube link: bare, <angle-bracketed>,
// [text](url) or [![image](src)](url). A loose list wraps an item in a paragraph, so
// the plugin turns it into a button too.
const STANDALONE_LINK =
	/^\s*(?:(?:[-*+]|\d+\.)\s+)?(?:\[.*\]\(|<)?https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})[^\s)>]*(?:\)|>)?\s*$/gm;

export function findStandaloneVideoIds(markdown) {
	return [...markdown.matchAll(STANDALONE_LINK)].map((match) => match[1]);
}

/** The IDs in talks.ts's `videos: [...]` lists */
export function findTalkVideoIds(source) {
	return [...source.matchAll(/videos: \[([^\]]*)\]/g)].flatMap((match) =>
		[...match[1].matchAll(/'([\w-]{11})'/g)].map((id) => id[1]),
	);
}

function contentFiles(dir) {
	return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) return contentFiles(full);
		return /\.mdx?$/.test(entry.name) ? [full] : [];
	});
}

async function saveThumbnail(videoId) {
	const response = await fetch(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`);
	if (!response.ok) throw new Error(`YouTube thumbnail ${videoId}: HTTP ${response.status}`);
	const jpeg = Buffer.from(await response.arrayBuffer());
	await sharp(jpeg)
		.webp({ quality: 80 })
		.toFile(path.join(OUT_DIR, `${videoId}.webp`));
}

if (import.meta.url === `file://${process.argv[1]}`) {
	const ids = new Set([
		...contentFiles(CONTENT_DIR).flatMap((file) =>
			findStandaloneVideoIds(fs.readFileSync(file, 'utf8')),
		),
		...findTalkVideoIds(fs.readFileSync(TALKS_FILE, 'utf8')),
	]);
	fs.mkdirSync(OUT_DIR, { recursive: true });
	const missing = [...ids].filter((id) => !fs.existsSync(path.join(OUT_DIR, `${id}.webp`)));
	for (const id of missing) await saveThumbnail(id);
	console.log(`${ids.size} videos, saved ${missing.length} new thumbnails`);
}
