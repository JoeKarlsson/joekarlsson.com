// Checks that every crosspost's original (its canonicalUrl on CData, CloudQuery, Tinybird,
// SingleStore...) still exists, as the body of the monthly "Crosspost originals check"
// issue (.github/workflows/standards.yml). A post whose original is gone should drop its
// canonicalUrl, so it's indexed here and back in the sitemap. Prints nothing when every
// original that answered is still there, so the workflow can close the issue. A site that
// blocks the check (CData answers bots with 403) is noted, never flagged.
//
//   node scripts/crosspost-originals-report.mjs
import { pathToFileURL } from 'node:url';
import { crossposts } from '../src/integrations/sitemap-lastmod.mjs';

const HEADERS = {
	'User-Agent':
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36',
};

/**
 * What a fetch of the original says about it: gone (404/410), moved (a redirect to another
 * page, often a blog index), unknown (blocked, rate-limited, down) or ok.
 * @param {string} original @param {{ status: number, url: string } | null} response null when the request failed
 */
export function originalState(original, response) {
	if (!response) return 'unknown';
	if (response.status === 404 || response.status === 410) return 'gone';
	if (response.status !== 200) return 'unknown';
	const path = (u) => new URL(u).pathname.replace(/\/$/, '');
	return path(response.url) === path(original) ? 'ok' : 'moved';
}

/** @param {{ path: string, original: string, state: string, finalUrl?: string }[]} results */
export function crosspostReport(results) {
	const gone = results.filter((r) => r.state === 'gone');
	const moved = results.filter((r) => r.state === 'moved');
	if (!gone.length && !moved.length) return '';
	const unknown = results.filter((r) => r.state === 'unknown');
	return [
		'Crossposts whose original has changed. For each, check the original by hand:',
		'',
		...(gone.length
			? [
					'**Gone** (404): remove `canonicalUrl` from the post so it is indexed here.',
					...gone.map((r) => `- ${r.path} (was ${r.original})`),
					'',
				]
			: []),
		...(moved.length
			? [
					'**Redirected**: if it landed on the same article under a new URL, update `canonicalUrl`; if it landed on a blog index or home page, the article is gone, so remove `canonicalUrl`.',
					...moved.map((r) => `- ${r.path}: ${r.original} now goes to ${r.finalUrl}`),
					'',
				]
			: []),
		...(unknown.length
			? [`${unknown.length} originals couldn't be checked (blocked or down), so they were skipped.`]
			: []),
	].join('\n');
}

async function check({ path, original }) {
	try {
		const res = await fetch(original, {
			headers: HEADERS,
			redirect: 'follow',
			signal: AbortSignal.timeout(20_000),
		});
		return { path, original, state: originalState(original, res), finalUrl: res.url };
	} catch {
		return { path, original, state: 'unknown' };
	}
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
	const queue = crossposts(new URL('../src/content/', import.meta.url));
	const results = [];
	// A few at a time, so no site sees a burst
	await Promise.all(
		Array.from({ length: 4 }, async () => {
			for (let next = queue.shift(); next; next = queue.shift()) results.push(await check(next));
		}),
	);
	results.sort((a, b) => a.path.localeCompare(b.path));
	process.stdout.write(crosspostReport(results));
	const counts = Object.groupBy(results, (r) => r.state);
	console.error(
		Object.entries(counts)
			.map(([state, rows]) => `${state}: ${rows.length}`)
			.join(', '),
	);
}
