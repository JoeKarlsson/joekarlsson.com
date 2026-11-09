// Who reads the Markdown copies of the site (/about.md, /blog/<slug>.md). Plausible
// can't see them: it counts visits with a script, and agents don't run scripts. Every
// request passes through Cloudflare, cache hits included, so this asks its analytics.
//   npm run analytics:agents          # last 7 days
//   npm run analytics:agents -- 3     # last 3 days
// Needs CLOUDFLARE_ZONE_ID and CLOUDFLARE_ANALYTICS_TOKEN (Zone > Analytics > Read) in .env.
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { pathToFileURL } from 'node:url';

/** A short name for a user agent: the bot's name, or the tool or browser it comes from. */
export function agentName(userAgent) {
	const bot = userAgent.match(/compatible;\s*([^;/)]+)/i)?.[1];
	if (bot) return bot.trim();
	const known = userAgent.match(
		/\b(ChatGPT-User|GPTBot|OAI-SearchBot|ClaudeBot|Claude-User|Claude-SearchBot|PerplexityBot|Perplexity-User|CCBot|Applebot|Bytespider|meta-externalagent|curl|python-requests|Python-urllib|node-fetch|undici|axios|Go-http-client|Wget)\b/i,
	)?.[1];
	if (known) return known;
	if (/Mozilla\/5\.0/.test(userAgent)) return 'Browser';
	return userAgent || '(none)';
}

function tally(rows, keyOf) {
	const counts = new Map();
	for (const row of rows) counts.set(keyOf(row), (counts.get(keyOf(row)) ?? 0) + row.count);
	return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

async function main() {
	if (existsSync('.env')) loadEnvFile('.env');
	const { CLOUDFLARE_ZONE_ID, CLOUDFLARE_ANALYTICS_TOKEN } = process.env;
	for (const [name, value] of Object.entries({ CLOUDFLARE_ZONE_ID, CLOUDFLARE_ANALYTICS_TOKEN })) {
		if (!value) throw new Error(`${name} is missing from .env`);
	}
	const days = Number(process.argv[2] ?? 7);
	const until = new Date();
	const since = new Date(until.getTime() - days * 24 * 60 * 60 * 1000);

	const query = `query ($zone: String!, $since: Time!, $until: Time!) {
		viewer { zones(filter: { zoneTag: $zone }) {
			httpRequestsAdaptiveGroups(limit: 5000, orderBy: [count_DESC], filter: {
				datetime_geq: $since, datetime_leq: $until, clientRequestPath_like: "%.md"
			}) { count dimensions { clientRequestPath userAgent edgeResponseStatus } }
		} }
	}`;
	const response = await fetch('https://api.cloudflare.com/client/v4/graphql', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${CLOUDFLARE_ANALYTICS_TOKEN}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			query,
			variables: {
				zone: CLOUDFLARE_ZONE_ID,
				since: since.toISOString(),
				until: until.toISOString(),
			},
		}),
	});
	const { data, errors } = await response.json();
	if (errors?.length) throw new Error(errors.map((e) => e.message).join('; '));
	const rows = data.viewer.zones[0].httpRequestsAdaptiveGroups.map(({ count, dimensions }) => ({
		count,
		...dimensions,
	}));

	const total = rows.reduce((sum, row) => sum + row.count, 0);
	console.log(`${total} requests for .md pages in the last ${days} days\n`);
	console.log('By agent');
	for (const [name, count] of tally(rows, (r) => agentName(r.userAgent))) {
		console.log(`  ${String(count).padStart(5)}  ${name}`);
	}
	console.log('\nBy page (status other than 200 shown in brackets)');
	for (const [page, count] of tally(rows, (r) =>
		r.edgeResponseStatus === 200
			? r.clientRequestPath
			: `${r.clientRequestPath} [${r.edgeResponseStatus}]`,
	).slice(0, 25)) {
		console.log(`  ${String(count).padStart(5)}  ${page}`);
	}
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) await main();
