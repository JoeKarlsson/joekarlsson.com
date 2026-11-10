// How AI agents use the site: which AI bots fetch it, which pages AI assistants open
// while answering someone, and who reads the Markdown copies (/about.md, /blog/<slug>.md).
// Plausible can't see any of this: it counts visits with a script, agents don't run
// scripts, and it drops bot traffic. Every request passes through Cloudflare, cache hits
// included, so this asks Cloudflare's analytics.
//   npm run analytics:agents          # last 7 days
//   npm run analytics:agents -- 30    # last 30 days
// Needs CLOUDFLARE_ZONE_ID and CLOUDFLARE_ANALYTICS_TOKEN (Zone > Analytics > Read) in .env.
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { pathToFileURL } from 'node:url';
import { inertLabel } from './untrusted-text.mjs';

// Why each AI bot comes: a person asked an assistant something and it opened the page;
// an AI search engine is indexing; or a crawler is gathering training data
export const ASKED_BY_A_PERSON = 'Asked by a person';
export const AI_SEARCH = 'AI search';
export const TRAINING = 'Training';
const AI_AGENTS = [
	['ChatGPT-User', ASKED_BY_A_PERSON],
	['Claude-User', ASKED_BY_A_PERSON],
	['Perplexity-User', ASKED_BY_A_PERSON],
	['MistralAI-User', ASKED_BY_A_PERSON],
	['OAI-SearchBot', AI_SEARCH],
	['Claude-SearchBot', AI_SEARCH],
	['PerplexityBot', AI_SEARCH],
	['DuckAssistBot', AI_SEARCH],
	['Applebot', AI_SEARCH],
	['GPTBot', TRAINING],
	['ClaudeBot', TRAINING],
	['CCBot', TRAINING],
	['Bytespider', TRAINING],
	['Amazonbot', TRAINING],
	['meta-externalagent', TRAINING],
	['cohere', TRAINING],
];

/** The AI bot a user agent belongs to, with why it comes, or null for anything else. */
export function aiAgent(userAgent) {
	const lower = userAgent.toLowerCase();
	const match = AI_AGENTS.find(([name]) => lower.includes(name.toLowerCase()));
	return match ? { name: match[0], kind: match[1] } : null;
}

/** A short name for a user agent: the bot's name, or the tool or browser it comes from. */
export function agentName(userAgent) {
	const ai = aiAgent(userAgent);
	if (ai) return ai.name;
	const bot = userAgent.match(/compatible;\s*([^;/)]+)/i)?.[1];
	// Visitor-chosen text: only a short token-like name gets through (security audit run-1)
	if (bot) return inertLabel(bot.trim(), 40) || '(other)';
	const tool = userAgent.match(
		/\b(curl|python-requests|Python-urllib|node-fetch|undici|axios|Go-http-client|Wget)\b/i,
	)?.[1];
	if (tool) return tool;
	if (/Mozilla\/5\.0/.test(userAgent)) return 'Browser';
	// An unrecognized user agent is any visitor's free text, so it's never printed
	return userAgent ? '(other)' : '(none)';
}

function tally(rows, keyOf) {
	const counts = new Map();
	for (const row of rows) {
		const key = keyOf(row);
		if (key !== null) counts.set(key, (counts.get(key) ?? 0) + row.count);
	}
	return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

const printCounts = (entries, limit = 25) => {
	for (const [label, count] of entries.slice(0, limit)) {
		console.log(`  ${String(count).padStart(6)}  ${label}`);
	}
};

async function main() {
	if (existsSync('.env')) loadEnvFile('.env');
	const { CLOUDFLARE_ZONE_ID, CLOUDFLARE_ANALYTICS_TOKEN } = process.env;
	for (const [name, value] of Object.entries({ CLOUDFLARE_ZONE_ID, CLOUDFLARE_ANALYTICS_TOKEN })) {
		if (!value) throw new Error(`${name} is missing from .env`);
	}
	const days = Number(process.argv[2] ?? 7);
	const until = new Date();
	const since = new Date(until.getTime() - days * 24 * 60 * 60 * 1000);

	// Requests grouped by the given dimensions, matching the filter, in the window
	async function requestGroups(dimensions, filter, limit) {
		const query = `query ($zone: String!, $filter: ZoneHttpRequestsAdaptiveGroupsFilter_InputObject!) {
			viewer { zones(filter: { zoneTag: $zone }) {
				httpRequestsAdaptiveGroups(limit: ${limit}, orderBy: [count_DESC], filter: $filter) {
					count dimensions { ${dimensions.join(' ')} }
				}
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
					filter: {
						datetime_geq: since.toISOString(),
						datetime_leq: until.toISOString(),
						...filter,
					},
				},
			}),
		});
		const { data, errors } = await response.json();
		if (errors?.length) throw new Error(errors.map((e) => e.message).join('; '));
		return data.viewer.zones[0].httpRequestsAdaptiveGroups.map(({ count, dimensions }) => ({
			count,
			...dimensions,
		}));
	}

	// Only pages that loaded: scanners borrow AI user agents to probe for /.env and the like
	const [everyAgent, askedPages, markdownReads] = await Promise.all([
		requestGroups(['userAgent'], { edgeResponseStatus: 200 }, 10000),
		requestGroups(
			['clientRequestPath'],
			{
				edgeResponseStatus: 200,
				OR: AI_AGENTS.filter(([, kind]) => kind === ASKED_BY_A_PERSON).map(([name]) => ({
					userAgent_like: `%${name}%`,
				})),
			},
			20,
		),
		requestGroups(
			['clientRequestPath', 'userAgent', 'edgeResponseStatus'],
			{ clientRequestPath_like: '%.md' },
			5000,
		),
	]);

	console.log(`AI agents on joekarlsson.com, last ${days} days (pages that loaded)\n`);
	for (const kind of [ASKED_BY_A_PERSON, AI_SEARCH, TRAINING]) {
		const entries = tally(everyAgent, (r) => {
			const ai = aiAgent(r.userAgent);
			return ai?.kind === kind ? ai.name : null;
		});
		const total = entries.reduce((sum, [, count]) => sum + count, 0);
		console.log(`${kind}: ${total}`);
		printCounts(entries);
		console.log();
	}

	console.log('Pages AI assistants opened while answering someone');
	printCounts(askedPages.map((r) => [inertLabel(r.clientRequestPath), r.count]));

	const markdownTotal = markdownReads.reduce((sum, row) => sum + row.count, 0);
	console.log(`\nMarkdown copies (.md): ${markdownTotal} requests\n  By agent`);
	printCounts(tally(markdownReads, (r) => agentName(r.userAgent)));
	console.log('  By page (status other than 200 in brackets)');
	printCounts(
		tally(markdownReads, (r) =>
			r.edgeResponseStatus === 200
				? inertLabel(r.clientRequestPath)
				: `${inertLabel(r.clientRequestPath)} [${r.edgeResponseStatus}]`,
		),
		15,
	);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) await main();
