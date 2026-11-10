#!/usr/bin/env node
/**
 * Visitor-controlled analytics strings (paths, referrers, user agents, event props)
 * go into a Claude session that has secrets and shell access (/analytics). Any
 * visitor can set them, so they're reduced to URL-ish characters and capped before
 * the model reads them, which leaves no room for sentences (security audit run-1).
 *
 * As a filter: curl ... | node scripts/untrusted-text.mjs | jq ...
 * cleans every string in a Plausible API response's results[].dimensions.
 */
import { pathToFileURL } from 'node:url';

const MAX = 100;

export function inertLabel(text, max = MAX) {
	const kept = String(text ?? '').replace(/[^A-Za-z0-9._~:/?#@!$&'()*+,;=%-]/g, '');
	return kept.length > max ? `${kept.slice(0, max)}…` : kept;
}

export function cleanPlausibleResponse(body) {
	for (const row of body?.results ?? []) {
		if (Array.isArray(row.dimensions)) row.dimensions = row.dimensions.map((d) => inertLabel(d));
	}
	return body;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
	let input = '';
	for await (const chunk of process.stdin) input += chunk;
	process.stdout.write(`${JSON.stringify(cleanPlausibleResponse(JSON.parse(input)))}\n`);
}
