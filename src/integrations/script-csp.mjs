// A per-page script policy in a <meta> CSP: the server's header (provision.sh.tpl) has to
// allow 'unsafe-inline' for scripts, since it's one header for every page, so this adds
// the SHA-256 of each inline script the page really has. Browsers enforce both policies,
// so an injected inline script runs under neither. It also turns on Trusted Types: the
// only script URL the site sets at runtime goes through the "plausible" policy in BaseHead.
// Runs last, over the finished HTML, so the hashes match what ships.
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PLAUSIBLE_ORIGIN = 'https://plausible.joekarlsson.io';

/** The CSP source for every inline script that runs (JSON-LD is data, not script). */
export function inlineScriptHashes(html) {
	const hashes = new Set();
	for (const [, attributes, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
		if (/\ssrc=/i.test(attributes) || /type="application\/(ld\+)?json"/i.test(attributes)) continue;
		hashes.add(`'sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}'`);
	}
	return [...hashes];
}

/** The page with its script policy as the first thing after <meta charset>. */
export function withScriptPolicy(html) {
	const policy = [
		`script-src 'self' 'report-sample' ${PLAUSIBLE_ORIGIN} ${inlineScriptHashes(html).join(' ')}`.trim(),
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
	return `${html.slice(0, at)}<meta http-equiv="Content-Security-Policy" content="${policy}">${html.slice(at)}`;
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
				const files = htmlFiles(fileURLToPath(dir));
				for (const file of files) writeFileSync(file, withScriptPolicy(readFileSync(file, 'utf8')));
				logger.info(`Script policy on ${files.length} pages`);
			},
		},
	};
}
