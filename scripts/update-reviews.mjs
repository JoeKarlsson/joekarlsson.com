// Imports Joe's Letterboxd reviews into src/content/reviews/ (one Markdown file per review)
// with the film's poster and backdrop in public/images/reviews/<slug>/.
//
//   node scripts/update-reviews.mjs                       new reviews from the RSS feed
//   node scripts/update-reviews.mjs --export reviews.csv  backfill from a Letterboxd export
//
// A review already imported is never touched, so Joe's later edits on the site stay. Only
// letterboxd.com is read: the RSS feed or export for the text, rating and dates, and the
// film's own page for its poster, backdrop and director.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';
// 157 + the "..." truncateAtWord adds = the 160 characters search results show
import { truncateAtWord } from './now-feed-parsing.mjs';

const USER = 'joekarlsson';
const CONTENT = 'src/content/reviews';
const IMAGES = 'public/images/reviews';
const HEADERS = { 'User-Agent': 'Mozilla/5.0 (joekarlsson.com review import)' };

const decode = (s) =>
	s
		.replace(/&#0?39;/g, "'")
		.replace(/&quot;/g, '"')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&');

async function get(url) {
	const res = await fetch(url, { headers: HEADERS });
	if (!res.ok) throw new Error(`${res.status} for ${url}`);
	return res;
}

/** Review URL -> the film's Letterboxd slug and the review's index (a second review of a film is /1/) */
export function parseReviewUrl(url) {
	const m = new URL(url).pathname.match(/\/film\/([^/]+)\/(?:(\d+)\/)?$/);
	if (!m) throw new Error(`Not a Letterboxd review URL: ${url}`);
	return { film: m[1], index: m[2] };
}

/** Site slug, mirroring Letterboxd's: /film/zodiac/ -> zodiac, /film/zodiac/1/ -> zodiac-1 */
export function slugFromReviewUrl(url) {
	const { film, index } = parseReviewUrl(url);
	return index ? `${film}-${index}` : film;
}

/** Letterboxd's review HTML (RSS description or export) -> Markdown paragraphs */
export function reviewToMarkdown(htmlText) {
	const paragraphs = htmlText.includes('<p>')
		? [...htmlText.matchAll(/<p>([\s\S]*?)<\/p>/g)]
				.map((m) => m[1])
				.filter((p) => !p.includes('<img'))
		: htmlText.split(/\n\s*\n/);
	return paragraphs
		.map((p) =>
			decode(
				p
					.replace(/<br\s*\/?>/g, '  \n')
					.replace(/<\/?(?:i|em)>/g, '*')
					.replace(/<\/?(?:b|strong)>/g, '**')
					.replace(/<[^>]+>/g, ''),
			)
				// Decoded text is Markdown, which renders raw HTML: an escaped tag stays text
				.replace(/</g, '&lt;')
				.trim(),
		)
		.filter(Boolean)
		.join('\n\n');
}

/** Rating 0.5-5 -> "★★★½" */
export const stars = (rating) =>
	rating ? '★'.repeat(Math.floor(rating)) + (rating % 1 ? '½' : '') : '';

export async function filmDetails(filmSlug) {
	const html = await (await get(`https://letterboxd.com/film/${filmSlug}/`)).text();
	const ld = JSON.parse(
		html.match(
			/<script type="application\/ld\+json">\s*(?:\/\*.*?\*\/)?\s*([\s\S]*?)\s*(?:\/\*.*?\*\/)?\s*<\/script>/,
		)[1],
	);
	return {
		poster: ld.image,
		backdrop: decode(html.match(/data-backdrop="([^"]+)"/)?.[1] ?? '') || undefined,
		director: (ld.director || []).map((d) => d.name).join(', '),
		genres: ld.genre || [],
	};
}

// The site's pink (#ff4fd8) as a share of white: black stays black, white turns pink
const PINK = [1, 0x4f / 0xff, 0xd8 / 0xff];

/** A poster is graded pink and black here, like the talk cards (scripts/fetch-talk-event-covers.mjs),
 * so a wall of hundreds doesn't each cost a phone a live WebGL canvas (isPretreatedThumbnail) */
export function gradePink(image) {
	return image
		.greyscale()
		.normalise()
		.toColourspace('srgb')
		.recomb([
			[PINK[0], 0, 0],
			[PINK[1], 0, 0],
			[PINK[2], 0, 0],
		]);
}

async function saveImage(url, path, width, { pink = false } = {}) {
	const buffer = Buffer.from(await (await get(url)).arrayBuffer());
	const image = sharp(buffer).resize({ width, withoutEnlargement: true });
	await (pink ? gradePink(image) : image).webp({ quality: 72 }).toFile(path);
}

const yamlString = (s) => `'${String(s).replace(/'/g, "''")}'`;

async function importReview(r) {
	const slug = slugFromReviewUrl(r.url);
	const file = `${CONTENT}/${slug}.md`;
	if (existsSync(file)) return false;
	const body = reviewToMarkdown(r.html);
	if (!body) return false;
	// Never strip a number off the slug to find the film: "oddity-2024" is a film, not a rewatch
	const film = await filmDetails(parseReviewUrl(r.url).film);
	mkdirSync(`${IMAGES}/${slug}`, { recursive: true });
	const front = [
		`title: ${yamlString(r.title)}`,
		`year: ${r.year}`,
		`date: ${r.watched}`,
		r.rating ? `rating: ${r.rating}` : null,
		r.rewatch ? 'rewatch: true' : null,
		r.spoilers ? 'spoilers: true' : null,
		film.director ? `director: ${yamlString(film.director)}` : null,
		film.genres.length ? `genres: [${film.genres.map(yamlString).join(', ')}]` : null,
		`slug: ${yamlString(slug)}`,
		`description: ${yamlString(truncateAtWord(body.split('\n\n')[0].replace(/[*]/g, '').replace(/\s+/g, ' '), 157))}`,
		`letterboxdUrl: ${yamlString(r.url)}`,
	];
	if (film.poster) {
		await saveImage(film.poster, `${IMAGES}/${slug}/poster.webp`, 400, { pink: true });
		front.push(`poster: '/images/reviews/${slug}/poster.webp'`);
	}
	if (film.backdrop) {
		await saveImage(film.backdrop, `${IMAGES}/${slug}/backdrop.webp`, 1200);
		front.push(`heroImage: '/images/reviews/${slug}/backdrop.webp'`);
		front.push(`heroAlt: ${yamlString(`A still from ${r.title} (${r.year})`)}`);
	}
	writeFileSync(file, `---\n${front.filter(Boolean).join('\n')}\n---\n\n${body}\n`);
	return true;
}

function fromRss(xml) {
	return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
		.map(([, item]) => {
			const tag = (t) =>
				decode(item.match(new RegExp(`<${t}>([\\s\\S]*?)</${t}>`))?.[1]?.trim() ?? '');
			const description =
				item.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/)?.[1] ?? '';
			return {
				url: tag('link'),
				title: tag('letterboxd:filmTitle'),
				year: tag('letterboxd:filmYear'),
				watched: tag('letterboxd:watchedDate'),
				rating: Number(tag('letterboxd:memberRating')) || undefined,
				rewatch: tag('letterboxd:rewatch') === 'Yes',
				spoilers: tag('title').includes('(contains spoilers)'),
				html: description,
			};
		})
		.filter((r) => r.title && r.url.includes('/film/'));
}

/** Minimal RFC 4180 parser: quoted fields with commas, doubled quotes and newlines */
export function parseCsv(text) {
	const rows = [];
	let row = [''];
	let quoted = false;
	for (let i = 0; i < text.length; i++) {
		const c = text[i];
		if (quoted) {
			if (c === '"' && text[i + 1] === '"') row[row.length - 1] += text[i++];
			else if (c === '"') quoted = false;
			else row[row.length - 1] += c;
		} else if (c === '"') quoted = true;
		else if (c === ',') row.push('');
		else if (c === '\n') (rows.push(row), (row = ['']));
		else if (c !== '\r') row[row.length - 1] += c;
	}
	if (row.length > 1 || row[0]) rows.push(row);
	const [head, ...data] = rows;
	return data.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ''])));
}

// boxd.it short links redirect to the review's own URL
async function resolveShortLink(shortUrl) {
	const res = await fetch(shortUrl, { headers: HEADERS, redirect: 'manual' });
	const url = res.headers.get('location');
	if (!url) throw new Error(`${shortUrl} did not redirect (${res.status})`);
	return url;
}

function fromExport(path) {
	const reviews = [];
	for (const row of parseCsv(readFileSync(path, 'utf8'))) {
		if (!row.Review.trim()) continue;
		reviews.push({
			shortUrl: row['Letterboxd URI'],
			title: row.Name,
			year: row.Year,
			watched: row['Watched Date'] || row.Date,
			rating: Number(row.Rating) || undefined,
			rewatch: row.Rewatch === 'Yes',
			spoilers: false,
			html: row.Review,
		});
	}
	return reviews;
}

if (import.meta.url === `file://${process.argv[1]}`) {
	const exportAt = process.argv.indexOf('--export');
	const reviews =
		exportAt > 0
			? fromExport(process.argv[exportAt + 1])
			: fromRss(await (await get(`https://letterboxd.com/${USER}/rss/`)).text());
	mkdirSync(CONTENT, { recursive: true });
	let added = 0;
	for (const r of reviews) {
		try {
			r.url ??= await resolveShortLink(r.shortUrl);
			if (await importReview(r)) (console.log(`added ${slugFromReviewUrl(r.url)}`), added++);
			// Letterboxd resets the connection when hit back to back
			await new Promise((done) => setTimeout(done, 500));
		} catch (err) {
			console.error(`FAILED ${r.title} (${r.year}): ${err.message}`);
			process.exitCode = 1;
		}
	}
	console.log(`${added} new reviews, ${reviews.length} checked`);
}
