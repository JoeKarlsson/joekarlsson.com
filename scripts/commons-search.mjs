#!/usr/bin/env node
/**
 * Searches Wikimedia Commons for public-domain or CC0 photos to use as a post thumbnail
 * (.claude/rules/metaphor-thumbnails.md). The search's license metadata can be wrong, so each
 * hit's own page is read too, and a hit only prints when its wikitext carries a public-domain
 * or CC0 license template.
 *
 *   node scripts/commons-search.mjs "telephone switchboard operator" [--min-width 1200]
 */
import { pathToFileURL } from 'node:url';

const API = 'https://commons.wikimedia.org/w/api.php';
const HEADERS = { 'User-Agent': 'joekarlsson.com thumbnail search' };

// {{PD-old-100}}, {{PD-US-expired}}, {{PD-art|PD-old}}, {{CC-zero}}, {{self|cc-zero}}, {{self|PD-self}}
const FREE_TEMPLATE = /\{\{\s*(?:self\s*\|[^}]*?\b)?(PD-[\w-]+|cc-zero|cc0)\b/i;

/** The public-domain or CC0 license template on a file page, or null when it has none */
export function confirmedLicense(wikitext) {
	return wikitext.match(FREE_TEMPLATE)?.[1] ?? null;
}

async function getJson(params) {
	const response = await fetch(`${API}?${new URLSearchParams({ format: 'json', ...params })}`, {
		headers: HEADERS,
	});
	if (!response.ok) throw new Error(`Commons API ${response.status} for ${params.action}`);
	return response.json();
}

async function search(query, minWidth) {
	const data = await getJson({
		action: 'query',
		generator: 'search',
		gsrsearch: `${query} filetype:bitmap`,
		gsrnamespace: '6',
		gsrlimit: '30',
		prop: 'imageinfo',
		iiprop: 'url|size|extmetadata',
		iiextmetadatafilter: 'LicenseShortName',
	});
	return Object.values(data.query?.pages ?? {})
		.map((page) => ({ title: page.title, ...page.imageinfo[0] }))
		.filter((hit) => {
			const license = hit.extmetadata.LicenseShortName?.value ?? '';
			return (/public domain/i.test(license) || /cc0/i.test(license)) && hit.width >= minWidth;
		});
}

async function wikitextByTitle(titles) {
	if (!titles.length) return new Map();
	const data = await getJson({
		action: 'query',
		prop: 'revisions',
		rvprop: 'content',
		rvslots: 'main',
		titles: titles.join('|'),
	});
	return new Map(
		Object.values(data.query.pages).map((page) => [
			page.title,
			page.revisions?.[0]?.slots.main['*'] ?? '',
		]),
	);
}

async function main() {
	const args = process.argv.slice(2);
	const widthFlag = args.indexOf('--min-width');
	const minWidth = widthFlag === -1 ? 1200 : Number(args.splice(widthFlag, 2)[1]);
	const query = args.join(' ').trim();
	if (!query || !Number.isFinite(minWidth)) {
		console.error('Usage: node scripts/commons-search.mjs "<query>" [--min-width 1200]');
		process.exit(1);
	}

	const hits = await search(query, minWidth);
	const pages = await wikitextByTitle(hits.map((hit) => hit.title));
	let rejected = 0;
	for (const hit of hits) {
		const template = confirmedLicense(pages.get(hit.title) ?? '');
		if (!template) {
			rejected++;
			continue;
		}
		const fileName = hit.title.replace(/^File:/, '').replaceAll(' ', '_');
		console.log(`${template}\t${hit.width}x${hit.height}\t${hit.descriptionurl}`);
		console.log(
			`\tdownload: https://commons.wikimedia.org/wiki/Special:FilePath/${fileName}?width=1600`,
		);
	}
	if (rejected)
		console.log(`${rejected} hit(s) dropped: their file page has no public-domain or CC0 template`);
	if (hits.length === rejected)
		console.log(`No confirmed public-domain or CC0 photos for "${query}"`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) await main();
