import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { inlineScriptHashes, withScriptPolicy } from '../src/integrations/script-csp.mjs';

const sha = (body: string) =>
	`'sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}'`;

describe('script-csp', () => {
	it('hashes inline scripts, once each, and skips external scripts and JSON-LD', () => {
		const html = [
			'<script>a()</script>',
			'<script type="module">b()</script>',
			'<script>a()</script>',
			'<script type="module" src="/_astro/x.js"></script>',
			'<script type="application/ld+json">{"@type":"Person"}</script>',
			'<script type="speculationrules">{"prefetch":[]}</script>',
		].join('');

		expect(inlineScriptHashes(html)).toEqual([sha('a()'), sha('b()'), sha('{"prefetch":[]}')]);
	});

	it('puts the policy right after <meta charset>, before any script runs', () => {
		const out = withScriptPolicy(
			'<html><head><meta charset="utf-8"><script>a()</script></head></html>',
		);

		expect(out).toMatch(
			/^<html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="script-src 'self' 'report-sample' https:\/\/plausible\.joekarlsson\.io 'sha256-[^']+'; require-trusted-types-for 'script'; trusted-types plausible"><script>/,
		);
		expect(out).not.toContain('unsafe-inline');
	});

	it('leaves a script-free redirect stub alone, and fails loudly on a page it cannot cover', () => {
		const stub =
			'<!doctype html><title>Redirecting</title><meta http-equiv="refresh" content="0;url=/x/">';
		expect(withScriptPolicy(stub)).toBe(stub);
		expect(() => withScriptPolicy('<head><script>a()</script></head>')).toThrow(/meta charset/);
	});
});
