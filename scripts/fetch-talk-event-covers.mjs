#!/usr/bin/env node
/**
 * Covers for the /talks/ cards that have no video of their own, graded pink and black ahead
 * of time so they don't each cost a phone a live WebGL canvas (isPretreatedThumbnail in
 * src/utils/halftone.ts skips these folders):
 *
 * - public/images/talks/events/<name>.webp: the event's own picture, the og:image of the page
 *   in scripts/talk-event-covers.json (a talk's event page, a podcast episode's page), for a
 *   talk with no recording anywhere. Downloads are kept in media-sources/talk-event-covers/.
 * - public/images/talks/recorded/<id>.webp: the YouTube poster (npm run youtube:thumbnails)
 *   of every `otherRecording` in src/data/talks.ts, a talk recorded at another event.
 *
 * Square podcast art is letterboxed on black instead of cropped, so the show's name survives.
 * Skips covers already drawn. Usage: npm run talks:covers
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import sharp from 'sharp';

const ROOT = resolve(import.meta.dirname, '..');
const PLAN = JSON.parse(readFileSync(join(ROOT, 'scripts/talk-event-covers.json'), 'utf8'));
const CACHE = join(ROOT, 'media-sources/talk-event-covers');
const WIDTH = 640;
const HEIGHT = 360;
// The site's pink (#ff4fd8), as a share of white: black stays black, white turns pink
const PINK = [1, 0x4f / 0xff, 0xd8 / 0xff];
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

/** Pink and black at card size. An event picture is cropped when it's near 16:9 and
 * letterboxed when it's not; a YouTube poster (4:3 with the video's bars) is always cropped */
async function gradePink(input, { poster = false } = {}) {
	const { width, height } = await sharp(input).metadata();
	const fit = poster || Math.abs(width / height - 16 / 9) < 0.25 ? 'cover' : 'contain';
	return sharp(input)
		.resize(WIDTH, HEIGHT, { fit, background: '#000000' })
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
	const recordedDir = join(ROOT, 'public/images/talks/recorded');
	mkdirSync(eventsDir, { recursive: true });
	mkdirSync(recordedDir, { recursive: true });
	mkdirSync(CACHE, { recursive: true });
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
	for (const [, id] of talks.matchAll(/otherRecording: '([\w-]{11})'/g)) {
		const out = join(recordedDir, `${id}.webp`);
		if (existsSync(out)) continue;
		const poster = join(ROOT, 'public/images/youtube', `${id}.webp`);
		if (!existsSync(poster)) throw new Error(`No poster for ${id}: run npm run youtube:thumbnails`);
		writeFileSync(out, await gradePink(readFileSync(poster), { poster: true }));
		drawn++;
	}
	console.log(`Drew ${drawn} talk covers`);
}
