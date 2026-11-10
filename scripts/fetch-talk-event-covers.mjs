#!/usr/bin/env node
/**
 * Every /talks/ card picture, graded pink and black ahead of time with no halftone dots, so
 * they don't each cost a phone a live WebGL canvas (isPretreatedThumbnail in
 * src/utils/halftone.ts skips these folders):
 *
 * - public/images/talks/events/<name>.webp: the event's own picture, the og:image of the page
 *   in scripts/talk-event-covers.json (a talk's event page, a podcast episode's page), for a
 *   talk with no recording anywhere. Downloads are kept in media-sources/talk-event-covers/.
 * - public/images/talks/posters/<id>.webp: the poster of every video a card plays (a talk's
 *   first video, or its `otherRecording` from another event), from YouTube's biggest
 *   thumbnail so it stays sharp at card size. Downloads are kept in media-sources/talk-posters/.
 *
 *   A video in src/data/talk-posters.json uses a frame of my NAS copy of it (`at` seconds in,
 *   cut over SSH, so drawing a new one needs the home LAN) or an event picture (`image`)
 *   instead of YouTube's thumbnail, at a file name of its own (posterPath in talks.ts).
 *
 * Square podcast art is letterboxed on black instead of cropped, so the show's name survives.
 * Skips covers already drawn. Usage: npm run talks:covers
 */
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import sharp from 'sharp';

const ROOT = resolve(import.meta.dirname, '..');
const PLAN = JSON.parse(readFileSync(join(ROOT, 'scripts/talk-event-covers.json'), 'utf8'));
const CACHE = join(ROOT, 'media-sources/talk-event-covers');
const POSTER_CACHE = join(ROOT, 'media-sources/talk-posters');
const WIDTH = 640;
const HEIGHT = 360;
// Video posters fill a desktop card about 380px wide, so twice that on a 2x screen
const POSTER_WIDTH = 800;
const POSTER_HEIGHT = 450;
// YouTube's thumbnails, biggest first: not every video has the 1280px one
const POSTER_SIZES = ['maxresdefault', 'sddefault', 'hqdefault'];
// The site's pink (#ff4fd8), as a share of white: black stays black, white turns pink
const PINK = [1, 0x4f / 0xff, 0xd8 / 0xff];
const POSTER_OVERRIDES = JSON.parse(readFileSync(join(ROOT, 'src/data/talk-posters.json'), 'utf8'));
const NAS = ['-p', '24', 'joeKarlsson@192.168.0.182'];
const NAS_VIDEOS = '/volume1/data/media/My Videos';
const USER_AGENT = 'Mozilla/5.0 (Macintosh) joekarlsson.com talk covers';

/** The og:image (or twitter:image) a page shares, made absolute */
function findShareImage(html, pageUrl) {
	const meta = (attr, name) =>
		html.match(
			new RegExp(`<meta[^>]+${attr}=["']${name}["'][^>]+content=["']([^"']+)`, 'i'),
		)?.[1] ??
		html.match(
			new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+${attr}=["']${name}["']`, 'i'),
		)?.[1];
	const found = meta('property', 'og:image') ?? meta('name', 'twitter:image');
	return found && new URL(found.replace(/&amp;/g, '&'), pageUrl).href;
}

async function get(url) {
	const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
	if (!response.ok) throw new Error(`${response.status} fetching ${url}`);
	return response;
}

/** The first video ID in each `videos: [...]` list (the one its card plays), plus every
 * `otherRecording` */
export function findCardVideoIds(source) {
	return [
		...[...source.matchAll(/videos: \[\s*'([\w-]{11})'/g)].map((match) => match[1]),
		...[...source.matchAll(/otherRecording: '([\w-]{11})'/g)].map((match) => match[1]),
	];
}

/** The biggest thumbnail YouTube has for a video */
async function downloadPoster(id) {
	for (const size of POSTER_SIZES) {
		const response = await fetch(`https://i.ytimg.com/vi/${id}/${size}.jpg`, {
			headers: { 'User-Agent': USER_AGENT },
		});
		if (response.ok) return Buffer.from(await response.arrayBuffer());
		if (response.status !== 404) throw new Error(`${response.status} fetching ${size} for ${id}`);
	}
	throw new Error(`YouTube has no thumbnail for ${id}`);
}

/** The file name a card's poster lives at; matches posterPath in src/data/talks.ts */
function posterName(id) {
	const override = POSTER_OVERRIDES[id];
	const suffix = !override ? '' : override.at !== undefined ? `-t${override.at}` : '-art';
	return `${id}${suffix}`;
}

/** One frame of my NAS copy of a video, `at` seconds in. The NAS's ffmpeg can't write images,
 * so it cuts a second of the stream and the frame is decoded here */
function downloadFrame(id, at) {
	const video = JSON.parse(readFileSync(join(ROOT, 'src/data/talk-videos.json'), 'utf8')).find(
		(v) => v.id === id,
	);
	if (!video?.backup) throw new Error(`${id} has no NAS backup in talk-videos.json`);
	const quoted = `'${join(NAS_VIDEOS, video.backup).replace(/'/g, `'\\''`)}'`;
	const clip = execFileSync(
		'ssh',
		[
			...NAS,
			`/usr/bin/ffmpeg -nostdin -loglevel error -ss ${at} -i ${quoted} -t 1 -an -sn -c:v copy -f matroska -`,
		],
		{ maxBuffer: 1 << 28 },
	);
	// A file, not a pipe: ffmpeg stops reading after one frame, which breaks a pipe
	const clipFile = join(POSTER_CACHE, `${id}-clip.mkv`);
	writeFileSync(clipFile, clip);
	try {
		return execFileSync(
			'ffmpeg',
			[
				'-nostdin',
				'-loglevel',
				'error',
				'-i',
				clipFile,
				'-frames:v',
				'1',
				'-f',
				'image2',
				'-c:v',
				'png',
				'pipe:1',
			],
			{ maxBuffer: 1 << 28 },
		);
	} finally {
		rmSync(clipFile);
	}
}

/** Pink and black at card size, no dots. An event picture is cropped when it's near 16:9 and
 * letterboxed when it's not; a YouTube poster (4:3 with the video's bars) is always cropped */
async function gradePink(input, { poster = false, youtube = poster } = {}) {
	const { width, height } = await sharp(input).metadata();
	// Only YouTube's own thumbnails are always cropped (their bars); a frame I picked is
	// letterboxed when it isn't 16:9, so a Short or a square show logo stays whole
	const fit = youtube || Math.abs(width / height - 16 / 9) < 0.25 ? 'cover' : 'contain';
	return sharp(input)
		.resize(poster ? POSTER_WIDTH : WIDTH, poster ? POSTER_HEIGHT : HEIGHT, {
			fit,
			background: '#000000',
		})
		.flatten({ background: '#000000' })
		.greyscale()
		.normalise()
		.toColourspace('srgb')
		.recomb([
			[PINK[0], 0, 0],
			[PINK[1], 0, 0],
			[PINK[2], 0, 0],
		])
		.webp({ quality: 78 })
		.toBuffer();
}

if (import.meta.url === `file://${process.argv[1]}`) {
	const eventsDir = join(ROOT, 'public/images/talks/events');
	const postersDir = join(ROOT, 'public/images/talks/posters');
	mkdirSync(eventsDir, { recursive: true });
	mkdirSync(postersDir, { recursive: true });
	mkdirSync(CACHE, { recursive: true });
	mkdirSync(POSTER_CACHE, { recursive: true });
	let drawn = 0;

	// A plan entry is the page's URL, or { page, image } when its og:image is broken and the
	// cover is another picture from the same page
	for (const [name, entry] of Object.entries(PLAN)) {
		const out = join(eventsDir, `${name}.webp`);
		if (existsSync(out)) continue;
		const cached = join(CACHE, name);
		if (!existsSync(cached)) {
			const page = entry.page ?? entry;
			const image = entry.image ?? findShareImage(await (await get(page)).text(), page);
			if (!image) throw new Error(`${name}: ${page} shares no og:image`);
			writeFileSync(cached, Buffer.from(await (await get(image)).arrayBuffer()));
		}
		writeFileSync(out, await gradePink(readFileSync(cached)));
		drawn++;
	}

	const talks = readFileSync(join(ROOT, 'src/data/talks.ts'), 'utf8');
	for (const id of new Set(findCardVideoIds(talks))) {
		const name = posterName(id);
		const out = join(postersDir, `${name}.webp`);
		if (existsSync(out)) continue;
		const override = POSTER_OVERRIDES[id];
		const cached = join(POSTER_CACHE, override ? name : `${id}.jpg`);
		if (!existsSync(cached))
			writeFileSync(
				cached,
				override?.at !== undefined
					? downloadFrame(id, override.at)
					: override
						? Buffer.from(await (await get(override.image)).arrayBuffer())
						: await downloadPoster(id),
			);
		writeFileSync(out, await gradePink(readFileSync(cached), { poster: true, youtube: !override }));
		drawn++;
	}
	console.log(`Drew ${drawn} talk covers`);
}
