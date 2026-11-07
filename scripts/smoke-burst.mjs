#!/usr/bin/env node
// After a deploy, sends a burst of simultaneous requests for one static file, each
// with its own query string so Cloudflare passes it to the origin, and fails unless
// every one comes back 200.
//
// A page like /work/ asks for ~120 files at once, and on a cold Cloudflare cache they
// all reach the origin under one visitor. On 2026-11-07 Nginx Proxy Manager's proxy
// host 15 still had a WordPress-era limit_req (10r/s, burst 20) on location /, so 76
// of 100 such requests got 429 and visitors saw blank thumbnails. This catches that
// limit, or any new one, coming back. It doesn't depend on the cache being cold.
//
// Usage: node scripts/smoke-burst.mjs https://www.joekarlsson.com
const site = process.argv[2];
if (!site) {
	console.error('Usage: node scripts/smoke-burst.mjs <site url>');
	process.exit(2);
}

// Comfortably more than /work/'s images and clips arrive at once on a phone
const BURST_SIZE = 60;
const STATIC_FILE = '/favicon-192x192.png';
const runId = Date.now();

const statuses = await Promise.all(
	Array.from({ length: BURST_SIZE }, (_, i) =>
		fetch(`${site}${STATIC_FILE}?burst=${runId}-${i}`, { cache: 'no-store' }).then(
			async (response) => {
				await response.arrayBuffer();
				return response.status;
			},
			(error) => `network error: ${error.message}`,
		),
	),
);

const counts = {};
for (const status of statuses) counts[status] = (counts[status] ?? 0) + 1;
const summary = Object.entries(counts)
	.map(([status, count]) => `${count} x ${status}`)
	.join(', ');

if (counts[200] !== BURST_SIZE) {
	console.error(
		`Burst check failed: ${BURST_SIZE} simultaneous requests for ${STATIC_FILE} got ${summary}.`,
	);
	console.error(
		'  A 429 means a rate limit in front of the site is back (Nginx Proxy Manager, proxy host 15).',
	);
	process.exit(1);
}
console.log(`  ${BURST_SIZE} simultaneous requests all returned 200`);
