// Links each review to its film's page on Bechdel Script Test (bechdel.joekarlsson.com) when the
// film is in that corpus: adds `bechdelUrl` to the review's front matter, which
// ReviewCredits.astro shows beside the Letterboxd link. A film matches on its title and
// a year at most one off (release dates differ between OMDb and Letterboxd).
//
//   node scripts/link-bechdel.mjs        add the link to every review that lacks one
//   node scripts/link-bechdel.mjs --dry  only list the matches
//
// Safe to re-run: reviews that already have a bechdelUrl are skipped, so new reviews and
// films added to Bechdel Script Test later get linked by running it again.
// `npm run update:reviews` runs it after every import.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { parse } from 'yaml';

const SITE = 'https://bechdel.joekarlsson.com';
const CONTENT = 'src/content/reviews';

/** "The Lord of the Rings: The Two Towers" -> "lord of the rings the two towers" */
export function normalizeTitle(title) {
	return title
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/&/g, ' and ')
		.replace(/['’]/g, '')
		.replace(/[^a-z0-9]+/g, ' ')
		.trim()
		.replace(/^(the|a|an) /, '');
}

/** The shelf film for a review's title and year, or undefined */
export function findFilm(shelf, title, year) {
	const name = normalizeTitle(title);
	const candidates = shelf.filter((f) => normalizeTitle(f.title) === name);
	return (
		candidates.find((f) => f.year === year) ?? candidates.find((f) => Math.abs(f.year - year) === 1)
	);
}

/** Front matter with `bechdelUrl` added after `letterboxdUrl` */
export function addBechdelUrl(markdown, url) {
	return markdown.replace(/^(letterboxdUrl: .*)$/m, `$1\nbechdelUrl: '${url}'`);
}

/** Adds `bechdelUrl` to every review that lacks one and whose film is on the shelf; returns the count */
export async function linkBechdel({ dry = false } = {}) {
	const res = await fetch(`${SITE}/shelf.json`);
	if (!res.ok) throw new Error(`${res.status} for ${SITE}/shelf.json`);
	const shelf = await res.json();
	let linked = 0;
	for (const file of readdirSync(CONTENT).filter((f) => f.endsWith('.md'))) {
		const path = `${CONTENT}/${file}`;
		const markdown = readFileSync(path, 'utf8');
		const data = parse(markdown.split(/^---$/m)[1]);
		if (data.bechdelUrl) continue;
		const film = findFilm(shelf, String(data.title), data.year);
		if (!film) continue;
		const url = `${SITE}/films/${film.slug}/`;
		console.log(`${file.padEnd(50)} ${film.title} (${film.year}) -> ${url}`);
		linked++;
		if (!dry) writeFileSync(path, addBechdelUrl(markdown, url));
	}
	return linked;
}

if (import.meta.url === `file://${process.argv[1]}`) {
	const dry = process.argv.includes('--dry');
	console.log(`${dry ? 'Would link' : 'Linked'} ${await linkBechdel({ dry })} reviews`);
}
