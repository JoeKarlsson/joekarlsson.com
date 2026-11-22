#!/usr/bin/env node
/**
 * Checks every link on /featured/ (src/data/coverage.ts: the lead story, the papers and the
 * coverage) and lists the ones that no longer load, each with the newest Wayback Machine copy to
 * swap in (note it as "archived copy"). The coverage-scan skill runs it on every scan, since the
 * pages other people wrote about Joe die on their own schedule.
 *
 * Usage: npm run coverage:links
 *
 * Some sites refuse scripts (403, 429) though they work in a browser; those are listed apart as
 * "check by hand", not as dead. Exits 1 when a link is dead, so nothing gets missed.
 */
import { execFileSync } from 'node:child_process';
import { LEAD_STORY, coverage, papers } from '../src/data/coverage.ts';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15';
// 419 is Hacker News saying too many requests
const REFUSED = new Set([401, 403, 405, 419, 429, 451, 999]);

const links = [LEAD_STORY, ...papers, ...coverage]
	.map((entry) => entry.url)
	.filter((url) => !url.startsWith('https://web.archive.org/'));

// GitHub, Hacker News and Stack Overflow refuse scripted page loads but answer their APIs
const GITHUB_TOKEN =
	process.env.GITHUB_TOKEN ?? execFileSync('gh', ['auth', 'token']).toString().trim();

function apiFor(url) {
	const { hostname, pathname, searchParams } = new URL(url);
	if (hostname === 'github.com') {
		const [, owner, repo, kind, ref, ...path] = pathname.split('/');
		const where =
			kind === 'blob' || kind === 'tree' ? `/contents/${path.join('/')}?ref=${ref}` : '';
		return {
			url: `https://api.github.com/repos/${owner}/${repo}${where}`,
			headers: { Authorization: `Bearer ${GITHUB_TOKEN}` },
		};
	}
	if (hostname === 'news.ycombinator.com')
		return {
			url: `https://hacker-news.firebaseio.com/v0/item/${searchParams.get('id')}.json`,
			// null: never existed; a deleted or flagged-dead item still answers, marked so
			gone: (body) => body === 'null' || /"(deleted|dead)":true/.test(body),
		};
	if (hostname === 'stackoverflow.com') {
		const id = pathname.match(/^\/(?:a|q|questions)\/(\d+)/)?.[1];
		return {
			url: `https://api.stackexchange.com/2.3/posts/${id}?site=stackoverflow`,
			gone: (body) => body.includes('"items":[]'),
		};
	}
	return { url, headers: { 'User-Agent': UA } };
}

async function status(url) {
	const probe = apiFor(url);
	try {
		const res = await fetch(probe.url, {
			redirect: 'follow',
			headers: probe.headers,
			signal: AbortSignal.timeout(20_000),
		});
		// A deleted item still answers 200, with nothing in it
		if (probe.gone) return probe.gone(await res.text()) ? 404 : res.status;
		await res.body?.cancel();
		return res.status;
	} catch (error) {
		return error.name === 'TimeoutError' ? 'timeout' : 'no answer';
	}
}

async function archived(url) {
	const api = `https://archive.org/wayback/available?url=${encodeURIComponent(url)}`;
	try {
		const res = await fetch(api, { signal: AbortSignal.timeout(30_000) });
		const snapshot = (await res.json()).archived_snapshots?.closest;
		return snapshot?.available ? snapshot.url.replace(/^http:/, 'https:') : 'no archived copy';
	} catch {
		return 'Wayback lookup failed, try again';
	}
}

const dead = [];
const refused = [];
// One request at a time per site, sites in parallel: GitHub and Hacker News refuse bursts
const bySite = Map.groupBy(links, (url) => new URL(url).hostname);
await Promise.all(
	[...bySite.values()].map(async (urls) => {
		for (const url of urls) {
			const code = await status(url);
			if (typeof code === 'number' && code < 400) continue;
			if (REFUSED.has(code)) refused.push(`${code}  ${url}`);
			else dead.push({ url, code });
		}
	}),
);

for (const entry of dead) entry.copy = await archived(entry.url);
console.log(
	`Checked ${links.length} links: ${dead.length} dead, ${refused.length} refused the script.`,
);
for (const { url, code, copy } of dead) console.log(`\nDEAD ${code}  ${url}\n  swap in: ${copy}`);
if (refused.length)
	console.log(`\nCheck by hand (the site refuses scripts):\n  ${refused.join('\n  ')}`);
process.exitCode = dead.length ? 1 : 0;
