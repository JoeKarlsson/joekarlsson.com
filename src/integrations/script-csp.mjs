// A per-page strict script policy in a <meta> CSP (Modern Web Guidance, security: hashes with
// 'strict-dynamic' for static HTML). The server's header (provision.sh.tpl) has to allow
// 'unsafe-inline' for scripts, since it's one header for every page, so this lists the hash of
// every script the page really has. Browsers enforce both policies, so an injected script runs
// under neither. 'strict-dynamic' ignores 'self' and the Plausible origin (they stay for older
// browsers), so a bundled module and each module it imports are trusted by hash: an import map
// gives every one its integrity, which the browser checks against the policy's hashes (as
// Astro's own CSP does). Plausible loads from BaseHead's script, which 'strict-dynamic' trusts.
// It also turns on Trusted Types: the only script URL the site sets at runtime goes through
// the "plausible" policy in BaseHead. Runs last, over the finished HTML, so the hashes match
// what ships.
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PLAUSIBLE_ORIGIN = 'https://plausible.joekarlsson.io';

/** The CSP source for every inline script that runs (JSON-LD is data, not script).
 * The end tag can carry spaces or junk (`</script >`), which browsers still close on. */
export function inlineScriptHashes(html) {
	const hashes = new Set();
	for (const [, attributes, body] of html.matchAll(
		/<script\b([^>]*)>([\s\S]*?)<\/script\b[^>]*>/gi,
	)) {
		if (/\ssrc=/i.test(attributes) || /type="application\/(ld\+)?json"/i.test(attributes)) continue;
		hashes.add(`'sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}'`);
	}
	return [...hashes];
}

const IMPORTS = /(?:\bfrom|\bimport\(?)\s*["'`](\.{1,2}\/[^"'`]+\.js)["'`]/g;

/** Each same-origin script the page loads and every module those import, with its SHA-384
 * integrity. `read` gives a script's text from its URL path. */
export function moduleIntegrity(html, read) {
	const integrity = {};
	const visit = (path) => {
		if (integrity[path]) return;
		const code = read(path);
		integrity[path] = `sha384-${createHash('sha384').update(code).digest('base64')}`;
		for (const [, specifier] of String(code).matchAll(IMPORTS))
			visit(new URL(specifier, `https://x${path}`).pathname);
	};
	for (const [, path] of html.matchAll(/<script\b[^>]*\ssrc="(\/[^"]+)"/gi)) visit(path);
	return integrity;
}

/** The page with its script policy, then the import map, as the first things after <meta charset>. */
export function withScriptPolicy(html, read) {
	const integrity = moduleIntegrity(html, read);
	const importMap = Object.keys(integrity).length
		? `<script type="importmap">${JSON.stringify({ integrity })}</script>`
		: '';
	const hashes = [
		...inlineScriptHashes(importMap + html),
		...Object.values(integrity).map((hash) => `'${hash}'`),
	];
	const policy = [
		`script-src 'strict-dynamic' 'report-sample' 'self' ${PLAUSIBLE_ORIGIN} ${hashes.join(' ')}`.trim(),
		"require-trusted-types-for 'script'",
		'trusted-types plausible',
	].join('; ');
	const charset = html.match(/<meta charset="[^"]*"\s*\/?>/i);
	if (!charset) {
		// Astro's redirect stubs have neither a charset nor a script
		if (!/<script\b/i.test(html)) return html;
		throw new Error('No <meta charset> to put the script policy after');
	}
	const at = charset.index + charset[0].length;
	return `${html.slice(0, at)}<meta http-equiv="Content-Security-Policy" content="${policy}">${importMap}${html.slice(at)}`;
}

function htmlFiles(dir) {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) return htmlFiles(path);
		return entry.name.endsWith('.html') ? [path] : [];
	});
}

export default function scriptCsp() {
	return {
		name: 'script-csp',
		hooks: {
			'astro:build:done': ({ dir, logger }) => {
				const root = fileURLToPath(dir);
				const files = htmlFiles(root);
				const read = (path) => readFileSync(join(root, path));
				for (const file of files)
					writeFileSync(file, withScriptPolicy(readFileSync(file, 'utf8'), read));
				logger.info(`Script policy on ${files.length} pages`);
			},
		},
	};
}
