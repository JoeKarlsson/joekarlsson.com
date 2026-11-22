import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// The reference Caddyfile matches the deployed provision template line for line
// (validate-caddyfile.sh), so this checks what production serves.
const caddyfile = readFileSync(resolve(import.meta.dirname, '..', 'Caddyfile'), 'utf-8');

/** Caddy's path matcher: an exact path, a `*suffix` or a `prefix*` */
function caddyPathMatches(pattern: string, path: string): boolean {
	if (pattern.startsWith('*')) return path.endsWith(pattern.slice(1));
	if (pattern.endsWith('*')) return path.startsWith(pattern.slice(0, -1));
	return path === pattern;
}

describe('Caddyfile', () => {
	// Caddy matches the request path, not the index.html it serves, so a matcher of
	// only `*.html /` left every /about/-style page without Cache-Control: browsers
	// then guess a freshness and can keep HTML whose hashed CSS a deploy deleted.
	it('sends no-cache on every page URL, directories included', () => {
		const patterns =
			caddyfile
				.match(/^\s*@html path (.+)$/m)?.[1]
				.trim()
				.split(/\s+/) ?? [];
		const uncovered = ['/', '/about/', '/blog/some-post/', '/404.html'].filter(
			(path) => !patterns.some((pattern) => caddyPathMatches(pattern, path)),
		);
		expect(uncovered).toEqual([]);
	});
});
