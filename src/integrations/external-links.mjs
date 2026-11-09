// Every link that leaves joekarlsson.com opens in a new tab. This runs over the built
// HTML instead of in a rehype plugin so it covers everything with one rule: Markdown
// posts and newsletter issues, Astro components, and the trusted HTML strings in
// src/data (uses.ts, projects.ts). Links built at runtime by client scripts are not
// covered; set target="_blank" there by hand.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_HOSTS = new Set(['joekarlsson.com', 'www.joekarlsson.com']);

/** True for an http(s) or protocol-relative URL on a host other than this site. */
export function isExternalHref(href) {
	if (!/^(https?:)?\/\//i.test(href)) return false;
	try {
		return !SITE_HOSTS.has(new URL(href, 'https://www.joekarlsson.com').hostname.toLowerCase());
	} catch {
		return false;
	}
}

function openInNewTab(tag) {
	const href = tag.match(/\shref="([^"]*)"/)?.[1];
	if (!href || !isExternalHref(href)) return tag;
	let out = /\starget="/.test(tag)
		? tag.replace(/\starget="[^"]*"/, ' target="_blank"')
		: tag.replace(/^<a\b/, '<a target="_blank"');
	const rel = out.match(/\srel="([^"]*)"/);
	if (!rel) out = out.replace(/^<a\b/, '<a rel="noopener"');
	else if (!rel[1].split(/\s+/).includes('noopener'))
		out = out.replace(/\srel="([^"]*)"/, ` rel="${`${rel[1]} noopener`.trim()}"`);
	return out;
}

/** Adds target="_blank" and rel="noopener" to every external <a>, leaving <script> blocks alone. */
export function openExternalLinksInNewTab(html) {
	return html
		.split(/(<script\b[\s\S]*?<\/script>)/i)
		.map((part, i) => (i % 2 ? part : part.replace(/<a\b[^>]*>/g, openInNewTab)))
		.join('');
}

function htmlFiles(dir) {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) return htmlFiles(path);
		return entry.name.endsWith('.html') ? [path] : [];
	});
}

export default function externalLinks() {
	return {
		name: 'external-links',
		hooks: {
			'astro:build:done': ({ dir, logger }) => {
				let changed = 0;
				for (const file of htmlFiles(fileURLToPath(dir))) {
					const html = readFileSync(file, 'utf8');
					const out = openExternalLinksInNewTab(html);
					if (out !== html) {
						writeFileSync(file, out);
						changed++;
					}
				}
				logger.info(`external links open in a new tab on ${changed} pages`);
			},
		},
	};
}
