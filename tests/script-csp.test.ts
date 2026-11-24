import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
	inlineScriptHashes,
	moduleIntegrity,
	withScriptPolicy,
} from '../src/integrations/script-csp.mjs';

const sha = (body: string) =>
	`'sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}'`;
const sri = (body: string) => `sha384-${createHash('sha384').update(body).digest('base64')}`;

// A bundled entry that imports a shared chunk, which loads another on demand
const files: Record<string, string> = {
	'/_astro/entry.js': 'import{a}from"./chunk.js";a()',
	'/_astro/chunk.js': 'export const a=()=>import(`./lazy.js`)',
	'/_astro/lazy.js': 'export default 1',
};
const read = (path: string) => {
	if (!(path in files)) throw new Error(`no ${path}`);
	return files[path];
};

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

	it('ends a script at an end tag with spaces or junk in it, as browsers do', () => {
		expect(inlineScriptHashes('<script>a()</script >x<script>b()</SCRIPT\t foo>')).toEqual([
			sha('a()'),
			sha('b()'),
		]);
	});

	it('puts the policy right after <meta charset>, before any script runs', () => {
		const out = withScriptPolicy(
			'<html><head><meta charset="utf-8"><script>a()</script></head></html>',
			read,
		);

		expect(out).toMatch(
			/^<html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="script-src 'strict-dynamic' 'report-sample' 'self' https:\/\/plausible\.joekarlsson\.io 'sha256-[^']+'; require-trusted-types-for 'script'; trusted-types plausible"><script>/,
		);
		expect(out).not.toContain('unsafe-inline');
		expect(out).not.toContain('importmap');
	});

	// 'strict-dynamic' ignores 'self', so a bundled script and its imports run only by hash
	it('trusts each bundled module and everything it imports by hash, through an import map', () => {
		const html =
			'<head><meta charset="utf-8"><script type="module" src="/_astro/entry.js"></script></head>';
		const integrity = {
			'/_astro/entry.js': sri(files['/_astro/entry.js']),
			'/_astro/chunk.js': sri(files['/_astro/chunk.js']),
			'/_astro/lazy.js': sri(files['/_astro/lazy.js']),
		};
		expect(moduleIntegrity(html, read)).toEqual(integrity);

		const out = withScriptPolicy(html, read);
		const importMap = `<script type="importmap">${JSON.stringify({ integrity })}</script>`;
		// The map comes before any module script, and the policy allows the map and each module
		expect(out).toContain(`content="script-src 'strict-dynamic'`);
		expect(out).toContain(`">${importMap}<script type="module" src="/_astro/entry.js">`);
		expect(out).toContain(sha(JSON.stringify({ integrity })));
		for (const hash of Object.values(integrity)) expect(out).toContain(`'${hash}'`);
	});

	it('leaves a script-free redirect stub alone, and fails loudly on a page it cannot cover', () => {
		const stub =
			'<!doctype html><title>Redirecting</title><meta http-equiv="refresh" content="0;url=/x/">';
		expect(withScriptPolicy(stub, read)).toBe(stub);
		expect(() => withScriptPolicy('<head><script>a()</script></head>', read)).toThrow(/meta charset/);
	});
});
