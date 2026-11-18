// Is every site in Plausible still being tracked? For each Plausible site: does the
// home page load, does it load the Plausible tag, when did Plausible last record a
// pageview, and is the site linked to its Search Console property. Traffic size
// doesn't matter here, only that tracking works.
//   npm run analytics:sites
// Needs PLAUSIBLE_API_KEY and PLAUSIBLE_BASE_URL in .env, and the home LAN: the site
// list and Search Console links come from Plausible's database (CE has no Sites API).
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { loadEnvFile } from 'node:process';
import { pathToFileURL } from 'node:url';

const QUIET_DAYS = 14;
const PSQL_RO = join(homedir(), 'claude-skills/domains/proxmox/scripts/utils/ct-psql-ro.sh');

/** What's wrong with one site's tracking, as a list of problems (empty when healthy). */
export function trackingProblems({
	domain,
	homeStatus,
	tagFound,
	created,
	lastPageview,
	searchConsole,
	today,
}) {
	const problems = [];
	if (homeStatus !== 200) problems.push(`home page returns ${homeStatus || 'no response'}`);
	else if (!tagFound) problems.push('no Plausible tag on the home page');
	const quietSince = new Date(Date.parse(today) - QUIET_DAYS * 86_400_000)
		.toISOString()
		.slice(0, 10);
	if (!lastPageview || lastPageview < quietSince) {
		problems.push(
			created >= quietSince
				? `no pageview since it was added on ${created}: open the site and check Plausible's realtime view`
				: `no pageview in ${QUIET_DAYS} days${lastPageview ? ` (last ${lastPageview})` : ''}: tracking may be broken`,
		);
	}
	if (!searchConsole && (domain === 'joekarlsson.com' || domain.endsWith('.joekarlsson.com'))) {
		problems.push('not linked to Search Console (Plausible: Settings, Integrations)');
	}
	return problems;
}

async function fetchText(url) {
	try {
		const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(15_000) });
		return { status: response.status, url: response.url, text: await response.text() };
	} catch {
		return { status: 0, url, text: '' };
	}
}

// The tag is inline on some sites and in a same-origin analytics.js on others.
async function hasPlausibleTag(home) {
	if (/plausible/i.test(home.text)) return true;
	const scripts = [...home.text.matchAll(/<script[^>]*\ssrc="([^"]+)"/gi)]
		.map((m) => new URL(m[1], home.url))
		.filter((src) => src.origin === new URL(home.url).origin)
		.slice(0, 5);
	for (const src of scripts) if (/plausible/i.test((await fetchText(src.href)).text)) return true;
	return false;
}

async function lastPageviewDay(domain, today) {
	const from = new Date(Date.parse(today) - 90 * 86_400_000).toISOString().slice(0, 10);
	const response = await fetch(`${process.env.PLAUSIBLE_BASE_URL}/api/v2/query`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${process.env.PLAUSIBLE_API_KEY}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			site_id: domain,
			metrics: ['pageviews'],
			date_range: [from, today],
			dimensions: ['time:day'],
		}),
	});
	if (!response.ok)
		throw new Error(
			`Plausible query for ${domain} failed: ${response.status} ${await response.text()}`,
		);
	const days = (await response.json()).results
		.filter((r) => r.metrics[0] > 0)
		.map((r) => r.dimensions[0]);
	return days.sort().at(-1) ?? null;
}

function plausibleSites() {
	if (!existsSync(PSQL_RO))
		throw new Error(`${PSQL_RO} not found: it reads the site list from Plausible's database`);
	const rows = execFileSync(
		PSQL_RO,
		[
			'192.168.0.236',
			'240',
			'plausible-plausible_db-1',
			"select s.domain, s.inserted_at::date, coalesce(g.property, '') from sites s left join google_auth g on g.site_id = s.id order by s.domain",
			'plausible_db',
		],
		{ encoding: 'utf8' },
	);
	return rows
		.trim()
		.split('\n')
		.map((line) => {
			const [domain, created, searchConsole] = line.split('|');
			return { domain, created, searchConsole };
		});
}

async function main() {
	if (existsSync('.env')) loadEnvFile('.env');
	if (!process.env.PLAUSIBLE_API_KEY || !process.env.PLAUSIBLE_BASE_URL)
		throw new Error('PLAUSIBLE_API_KEY and PLAUSIBLE_BASE_URL must be set in .env');
	const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Chicago' });
	const sites = plausibleSites();
	let unhealthy = 0;
	for (const site of sites) {
		const home = await fetchText(`https://${site.domain}/`);
		const problems = trackingProblems({
			...site,
			homeStatus: home.status,
			tagFound: home.status === 200 && (await hasPlausibleTag(home)),
			lastPageview: await lastPageviewDay(site.domain, today),
			today,
		});
		if (problems.length) unhealthy++;
		console.log(
			`${problems.length ? 'CHECK' : 'OK   '} ${site.domain}${site.searchConsole ? `  (Search Console: ${site.searchConsole})` : ''}`,
		);
		for (const problem of problems) console.log(`      - ${problem}`);
	}
	console.log(`\n${sites.length - unhealthy} of ${sites.length} sites tracking cleanly.`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) await main();
