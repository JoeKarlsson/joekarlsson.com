// Snapshot unique visitors per post from Plausible into src/data/popular-posts.json,
// which the blog index's "Popular" sort reads at build time. Rerun every so often:
//   npm run update:popular
import { writeFileSync } from 'node:fs';
import { loadEnvFile } from 'node:process';

loadEnvFile('.env');

const { PLAUSIBLE_BASE_URL, PLAUSIBLE_API_KEY, PLAUSIBLE_SITE_ID } = process.env;
for (const [name, value] of Object.entries({
	PLAUSIBLE_BASE_URL,
	PLAUSIBLE_API_KEY,
	PLAUSIBLE_SITE_ID,
})) {
	if (!value) throw new Error(`${name} is missing from .env`);
}

const DATE_RANGE = '12mo';
const PAGE_SIZE = 1000;

async function fetchVisitorsByPath() {
	const visitorsByPath = {};
	for (let offset = 0; ; offset += PAGE_SIZE) {
		const response = await fetch(`${PLAUSIBLE_BASE_URL}/api/v2/query`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${PLAUSIBLE_API_KEY}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				site_id: PLAUSIBLE_SITE_ID,
				metrics: ['visitors'],
				date_range: DATE_RANGE,
				dimensions: ['event:page'],
				filters: [['contains', 'event:page', ['/blog/', '/newsletter/']]],
				pagination: { limit: PAGE_SIZE, offset },
			}),
		});
		if (!response.ok) {
			throw new Error(`Plausible query failed: ${response.status} ${await response.text()}`);
		}
		const { results } = await response.json();
		for (const { dimensions, metrics } of results) {
			const path = dimensions[0].endsWith('/') ? dimensions[0] : `${dimensions[0]}/`;
			visitorsByPath[path] = (visitorsByPath[path] || 0) + metrics[0];
		}
		if (results.length < PAGE_SIZE) return visitorsByPath;
	}
}

const visitorsByPath = await fetchVisitorsByPath();
const outputPath = 'src/data/popular-posts.json';
writeFileSync(
	outputPath,
	JSON.stringify(
		{ updatedAt: new Date().toISOString().slice(0, 10), dateRange: DATE_RANGE, visitorsByPath },
		null,
		'\t',
	) + '\n',
);
console.log(`Wrote ${Object.keys(visitorsByPath).length} paths to ${outputPath}`);
