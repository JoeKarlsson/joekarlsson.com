#!/usr/bin/env node
// Purges only what a deploy changed from Cloudflare, instead of the whole cache.
//
// Purging everything on every deploy sent every visitor's next page to the origin
// at once: a cold /work/ asks for ~120 files, which is how a forgotten rate limit on
// Nginx Proxy Manager blanked thumbnails (2026-11-07). Each build now ships
// deploy-manifest.json, a hash of every file; the next deploy fetches the live one
// from the origin, and purges the files that were added, changed or removed. Images
// and hashed /_astro/ files that didn't change stay cached.
//
// Usage (from deploy.sh):
//   node scripts/purge-urls.mjs write-manifest dist
//   node scripts/purge-urls.mjs urls https://www.joekarlsson.com dist old-manifest.json > list
//   node scripts/purge-urls.mjs purge list      (needs CLOUDFLARE_ZONE_ID, CLOUDFLARE_API_TOKEN)
//
// A list holding only EVERYTHING purges the whole zone: when there's no previous
// manifest to compare with, or when so much changed that a full purge is simpler.
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

export const MANIFEST_NAME = 'deploy-manifest.json';
export const PURGE_EVERYTHING = 'EVERYTHING';
// Beyond this, purge everything: it's one call instead of hundreds
export const MAX_URLS = 3000;
// Cloudflare takes at most 30 URLs per purge call below Enterprise
const URLS_PER_CALL = 30;

/** Every file under dir, as a path relative to it, mapped to its sha256 */
export function hashFiles(dir) {
	const hashes = {};
	const walk = (current) => {
		for (const entry of readdirSync(current, { withFileTypes: true })) {
			const path = join(current, entry.name);
			if (entry.isDirectory()) walk(path);
			else {
				const relativePath = relative(dir, path).split('\\').join('/');
				if (relativePath === MANIFEST_NAME) continue;
				hashes[relativePath] = createHash('sha256').update(readFileSync(path)).digest('hex');
			}
		}
	};
	walk(dir);
	return hashes;
}

/** Paths added, changed or removed between two manifests */
export function changedPaths(oldManifest, newManifest) {
	const changed = new Set();
	for (const [path, hash] of Object.entries(newManifest)) {
		if (oldManifest[path] !== hash) changed.add(path);
	}
	for (const path of Object.keys(oldManifest)) {
		if (!(path in newManifest)) changed.add(path);
	}
	return [...changed].sort();
}

/** The URLs Cloudflare may have cached a built file under */
export function urlsForPath(site, path) {
	if (path === 'index.html') return [`${site}/`, `${site}/index.html`];
	if (path.endsWith('/index.html')) {
		const dir = path.slice(0, -'index.html'.length);
		return [`${site}/${dir}`, `${site}/${path}`];
	}
	return [`${site}/${path}`];
}

/** The purge list for a deploy: URLs, or [EVERYTHING] */
export function purgeList(site, oldManifest, newManifest) {
	if (!oldManifest) return [PURGE_EVERYTHING];
	const urls = changedPaths(oldManifest, newManifest).flatMap((path) => urlsForPath(site, path));
	return urls.length > MAX_URLS ? [PURGE_EVERYTHING] : urls;
}

async function callPurge(body) {
	const { CLOUDFLARE_ZONE_ID: zone, CLOUDFLARE_API_TOKEN: token } = process.env;
	if (!zone || !token) throw new Error('CLOUDFLARE_ZONE_ID and CLOUDFLARE_API_TOKEN must be set');
	const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zone}/purge_cache`, {
		method: 'POST',
		headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	});
	const result = await response.json();
	if (!result.success) throw new Error(`Cloudflare purge failed: ${JSON.stringify(result.errors)}`);
}

async function purge(list) {
	if (list.length === 1 && list[0] === PURGE_EVERYTHING) {
		await callPurge({ purge_everything: true });
		console.log('Cache purge: everything');
		return;
	}
	for (let i = 0; i < list.length; i += URLS_PER_CALL) {
		await callPurge({ files: list.slice(i, i + URLS_PER_CALL) });
	}
	console.log(`Cache purge: ${list.length} changed URL(s), everything else stays cached`);
}

function readManifest(file) {
	try {
		return JSON.parse(readFileSync(file, 'utf8'));
	} catch {
		// No previous manifest (first deploy with one, or the fetch failed): a full
		// purge is the safe answer, and the caller sees EVERYTHING in the list
		return null;
	}
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const [command, ...args] = process.argv.slice(2);
	if (command === 'write-manifest') {
		const [dist] = args;
		writeFileSync(join(dist, MANIFEST_NAME), JSON.stringify(hashFiles(dist)));
	} else if (command === 'urls') {
		const [site, dist, oldFile] = args;
		const list = purgeList(site, readManifest(oldFile), hashFiles(dist));
		if (list.length) console.log(list.join('\n'));
	} else if (command === 'purge') {
		const list = readFileSync(args[0], 'utf8').split('\n').filter(Boolean);
		await purge(list);
	} else {
		console.error(
			'Usage: purge-urls.mjs write-manifest <dist> | urls <site> <dist> <old> | purge <list>',
		);
		process.exit(2);
	}
}
