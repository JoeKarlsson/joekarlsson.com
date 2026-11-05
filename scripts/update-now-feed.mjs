// Snapshot what I've recently watched (Letterboxd) and listened to (Audiobookshelf
// podcasts) into src/data/now-feed.json, with covers saved as WebP under
// public/images/now/. The about page reads the snapshot at build time, so visitors
// never reach Audiobookshelf. deploy.sh runs this before every build:
//   npm run update:now
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import sharp from 'sharp';

loadEnvFile('.env');

const { AUDIOBOOKSHELF_URL, AUDIOBOOKSHELF_API_TOKEN } = process.env;
for (const [name, value] of Object.entries({ AUDIOBOOKSHELF_URL, AUDIOBOOKSHELF_API_TOKEN })) {
	if (!value) throw new Error(`${name} is missing from .env`);
}

const LETTERBOXD_RSS_URL = 'https://letterboxd.com/joekarlsson/rss/';
const ITEMS_PER_FEED = 4;
const REVIEW_EXCERPT_MAX_CHARS = 160;
const COVER_WIDTH_PX = 200;
const COVER_DIR = 'public/images/now';
const OUTPUT_PATH = 'src/data/now-feed.json';

async function fetchOrThrow(url, options) {
	const response = await fetch(url, options);
	if (!response.ok) throw new Error(`${url} returned ${response.status}`);
	return response;
}

function decodeEntities(text) {
	return text
		.replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
		.replace(/&quot;/g, '"')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&');
}

function truncateAtWord(text, maxChars) {
	if (text.length <= maxChars) return text;
	return `${text.slice(0, text.lastIndexOf(' ', maxChars)).replace(/[\s,.;:-]+$/, '')}...`;
}

function readTag(itemXml, tag) {
	return itemXml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`))?.[1].trim();
}

async function saveCoverAsWebp(imageUrl, fileName, fetchOptions) {
	const response = await fetchOrThrow(imageUrl, fetchOptions);
	await sharp(Buffer.from(await response.arrayBuffer()))
		.resize({ width: COVER_WIDTH_PX })
		.webp({ quality: 80 })
		.toFile(`${COVER_DIR}/${fileName}`);
	return `/images/now/${fileName}`;
}

async function fetchRecentFilms() {
	const rss = await (await fetchOrThrow(LETTERBOXD_RSS_URL)).text();
	const items = [...rss.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((match) => match[1]);
	// The feed also carries lists, which have no film title.
	const filmItems = items.filter((item) => readTag(item, 'letterboxd:filmTitle'));
	if (filmItems.length === 0) throw new Error('Letterboxd feed has no film entries');

	const films = [];
	for (const item of filmItems.slice(0, ITEMS_PER_FEED)) {
		const description = readTag(item, 'description');
		const posterUrl = description.match(/<img src="([^"]+)"/)?.[1];
		if (!posterUrl) throw new Error(`No poster in Letterboxd item: ${readTag(item, 'link')}`);
		const isReview = readTag(item, 'guid').startsWith('letterboxd-review-');
		const reviewText = decodeEntities(
			description
				.replace(/<p><img[^>]*\/><\/p>/, '')
				.replace(/<p><em>This review may contain spoilers\.<\/em><\/p>/, '')
				.replace(/<[^>]+>/g, ' ')
				.replace(/\]\]>|<!\[CDATA\[/g, ''),
		)
			.replace(/\s+/g, ' ')
			.trim();
		const tmdbId = readTag(item, 'tmdb:movieId');
		const rating = readTag(item, 'letterboxd:memberRating');
		films.push({
			title: decodeEntities(readTag(item, 'letterboxd:filmTitle')),
			year: Number(readTag(item, 'letterboxd:filmYear')),
			watchedDate: readTag(item, 'letterboxd:watchedDate'),
			rating: rating ? Number(rating) : null,
			reviewExcerpt: isReview ? truncateAtWord(reviewText, REVIEW_EXCERPT_MAX_CHARS) : null,
			url: readTag(item, 'link'),
			poster: await saveCoverAsWebp(posterUrl, `film-${tmdbId}.webp`),
		});
	}
	return films;
}

async function fetchRecentPodcastEpisodes() {
	const authHeaders = { headers: { Authorization: `Bearer ${AUDIOBOOKSHELF_API_TOKEN}` } };
	const response = await fetchOrThrow(
		`${AUDIOBOOKSHELF_URL}/api/me/listening-sessions?itemsPerPage=100&page=0`,
		authHeaders,
	);
	const { sessions } = await response.json();
	const podcastSessions = sessions
		.filter((session) => session.mediaType === 'podcast' && session.episodeId)
		.sort((a, b) => b.updatedAt - a.updatedAt);

	const episodes = [];
	const seenEpisodeIds = new Set();
	for (const session of podcastSessions) {
		if (episodes.length === ITEMS_PER_FEED) break;
		if (seenEpisodeIds.has(session.episodeId)) continue;
		seenEpisodeIds.add(session.episodeId);
		// A session's mediaMetadata.title is the episode title; the show's own
		// metadata lives on the library item.
		const libraryItem = await (
			await fetchOrThrow(`${AUDIOBOOKSHELF_URL}/api/items/${session.libraryItemId}`, authHeaders)
		).json();
		const podcastMetadata = libraryItem.media.metadata;
		episodes.push({
			episodeTitle: session.displayTitle,
			podcastTitle: podcastMetadata.title,
			listenedDate: new Date(session.updatedAt).toLocaleDateString('en-CA'),
			// Only public pages: never link to the Audiobookshelf server itself.
			url: podcastMetadata.itunesPageUrl || null,
			cover: await saveCoverAsWebp(
				`${AUDIOBOOKSHELF_URL}/api/items/${session.libraryItemId}/cover`,
				`podcast-${session.libraryItemId}.webp`,
				authHeaders,
			),
		});
	}
	if (episodes.length === 0) throw new Error('Audiobookshelf has no podcast listening sessions');
	return episodes;
}

mkdirSync(COVER_DIR, { recursive: true });
const [films, podcastEpisodes] = await Promise.all([
	fetchRecentFilms(),
	fetchRecentPodcastEpisodes(),
]);
// Delete covers the new snapshot no longer uses, only after both feeds succeeded.
const coversInUse = new Set(
	[...films.map((film) => film.poster), ...podcastEpisodes.map((episode) => episode.cover)].map(
		(path) => path.split('/').pop(),
	),
);
for (const file of readdirSync(COVER_DIR)) {
	if (!coversInUse.has(file)) rmSync(`${COVER_DIR}/${file}`);
}
writeFileSync(
	OUTPUT_PATH,
	JSON.stringify(
		{ updatedAt: new Date().toLocaleDateString('en-CA'), films, podcastEpisodes },
		null,
		'\t',
	) + '\n',
);
console.log(
	`Wrote ${films.length} films and ${podcastEpisodes.length} podcast episodes to ${OUTPUT_PATH}`,
);
