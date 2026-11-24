// Keeps src/data/letterboxd-diary.json, every film Joe logged on Letterboxd, reviewed or
// not, for /reviews/stats/ (DECISIONS.md 2026-11-24). Entries are only ever added.
//
//   node scripts/letterboxd-diary.mjs --export diary.csv   all of it, from a Letterboxd export
//   node scripts/letterboxd-diary.mjs                      the newest entries, from the RSS feed
//
// update-reviews.mjs runs the RSS sync too, so every review import keeps the diary current.
import { readFileSync, writeFileSync } from 'node:fs';
import { decode, parseCsv } from './update-reviews.mjs';

export const DIARY = 'src/data/letterboxd-diary.json';
const RSS = 'https://letterboxd.com/joekarlsson/rss/';
const HEADERS = { 'User-Agent': 'Mozilla/5.0 (joekarlsson.com diary import)' };

const entry = ({ title, year, watched, logged, rating, rewatch }) => ({
	title,
	year: Number(year),
	watched,
	logged,
	rating: Number(rating) || null,
	rewatch,
});

/** Letterboxd export diary.csv -> entries */
export function diaryFromExport(csv) {
	return parseCsv(csv).map((row) =>
		entry({
			title: row.Name,
			year: row.Year,
			watched: row['Watched Date'],
			logged: row.Date,
			rating: row.Rating,
			rewatch: row.Rewatch === 'Yes',
		}),
	);
}

/** RSS feed -> entries: reviews and plain logs both carry a watched date; lists don't */
export function diaryFromRss(xml) {
	return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
		.map(([, item]) => {
			const tag = (t) =>
				decode(item.match(new RegExp(`<${t}>([\\s\\S]*?)</${t}>`))?.[1]?.trim() ?? '');
			const published = new Date(tag('pubDate'));
			return entry({
				title: tag('letterboxd:filmTitle'),
				year: tag('letterboxd:filmYear'),
				watched: tag('letterboxd:watchedDate'),
				logged: Number.isNaN(published.valueOf()) ? '' : published.toISOString().slice(0, 10),
				rating: tag('letterboxd:memberRating'),
				rewatch: tag('letterboxd:rewatch') === 'Yes',
			});
		})
		.filter((e) => e.title && e.watched);
}

const key = (e) => `${e.title}|${e.year}|${e.watched}`;

/** Adds the entries not already in the diary, newest watch first */
export function mergeDiary(diary, incoming) {
	const seen = new Set(diary.map(key));
	const added = incoming.filter((e) => !seen.has(key(e)) && seen.add(key(e)));
	const merged = [...diary, ...added].sort(
		(a, b) => b.watched.localeCompare(a.watched) || a.title.localeCompare(b.title),
	);
	return { merged, added: added.length };
}

export function saveDiary(incoming) {
	const diary = JSON.parse(readFileSync(DIARY, 'utf8'));
	const { merged, added } = mergeDiary(diary, incoming);
	if (added) writeFileSync(DIARY, `${JSON.stringify(merged, null, '\t')}\n`);
	return added;
}

export async function syncDiaryFromRss(xml) {
	xml ??= await (await fetch(RSS, { headers: HEADERS })).text();
	return saveDiary(diaryFromRss(xml));
}

if (import.meta.url === `file://${process.argv[1]}`) {
	const exportAt = process.argv.indexOf('--export');
	const added =
		exportAt > 0
			? saveDiary(diaryFromExport(readFileSync(process.argv[exportAt + 1], 'utf8')))
			: await syncDiaryFromRss();
	console.log(`${added} new diary entries`);
}
