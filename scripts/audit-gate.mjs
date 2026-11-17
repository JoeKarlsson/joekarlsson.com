#!/usr/bin/env node
// CI's security gate (.github/workflows/ci.yml): `npm audit --omit=dev`, failing on any high or
// critical advisory except the ones in scripts/audit-exceptions.json, each kept with its reason.
// An exception fails too once a patched version is out (upgrade, then drop it) or once the audit
// no longer reports it, so the list only holds what still needs it.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const BLOCKING = new Set(['high', 'critical']);
const ghsa = (url) => url.match(/GHSA-[\w-]+/)?.[0] ?? url;

/** What fails the gate, given the audit's JSON, the exceptions and a lookup of the newest version. */
export function auditFailures(audit, exceptions, { newestIsVulnerable }) {
	const found = new Map();
	for (const vulnerability of Object.values(audit.vulnerabilities ?? {})) {
		for (const via of vulnerability.via) {
			if (typeof via === 'string' || !BLOCKING.has(via.severity)) continue;
			found.set(ghsa(via.url), via);
		}
	}
	const failures = [];
	for (const [id, via] of found) {
		if (!exceptions[id])
			failures.push(
				`${id} (${via.name}, ${via.severity}): ${via.title}. Fix it, or add it to scripts/audit-exceptions.json with why it can't reach the site.`,
			);
		else if (!newestIsVulnerable(via.name, via.range))
			failures.push(
				`${id} (${via.name}): a patched version is out. Upgrade, then drop its exception.`,
			);
	}
	for (const id of Object.keys(exceptions))
		if (!found.has(id)) failures.push(`${id}: the audit no longer reports it. Drop its exception.`);
	return failures;
}

function npmJson(args) {
	try {
		return JSON.parse(execFileSync('npm', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }));
	} catch (error) {
		// npm audit exits 1 when it finds anything; its JSON is still on stdout
		if (error.stdout) return JSON.parse(error.stdout);
		throw error;
	}
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const exceptions = JSON.parse(
		readFileSync(new URL('./audit-exceptions.json', import.meta.url), 'utf8'),
	);
	const audit = npmJson(['audit', '--omit=dev', '--json']);
	const failures = auditFailures(audit, exceptions, {
		newestIsVulnerable: (name, range) => {
			// npm view's --json gives one version as a string or a one-item list, by npm version
			const [newest] = [npmJson(['view', name, 'version', '--json'])].flat();
			return [npmJson(['view', `${name}@${range}`, 'version', '--json'])].flat().includes(newest);
		},
	});
	if (failures.length) {
		console.error(`Security audit failed:\n${failures.map((f) => `  ${f}`).join('\n')}`);
		process.exit(1);
	}
	console.log(
		`Security audit passed (${Object.keys(exceptions).length} accepted, see scripts/audit-exceptions.json)`,
	);
}
