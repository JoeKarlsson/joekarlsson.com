import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { jsonForScript } from '../src/utils/json-for-script';

describe('jsonForScript', () => {
	it('cannot close the script element it sits in', () => {
		const out = jsonForScript({ title: 'x </script><script>alert(1)</script>', faq: '<!-- y' });
		expect(out).not.toMatch(/<\/script|<!--/i);
		expect(out).not.toContain('<');
	});

	it('round-trips to the same value', () => {
		const value = { a: '</script>', b: 'line\u2028sep\u2029', c: [1, 'é'] };
		expect(JSON.parse(jsonForScript(value))).toEqual(value);
	});
});

// Every JSON-in-<script> sink goes through jsonForScript: a bare JSON.stringify in
// set:html is how imported text broke out of the JSON-LD block (security audit run-1).
describe('set:html JSON sinks', () => {
	const files: string[] = [];
	const walk = (dir: string) => {
		for (const name of readdirSync(dir)) {
			const file = join(dir, name);
			if (statSync(file).isDirectory()) walk(file);
			else if (/\.(astro|tsx?|jsx?|mjs)$/.test(name)) files.push(file);
		}
	};
	walk('src');

	it('never pass raw JSON.stringify to set:html', () => {
		const offenders = files.filter((file) =>
			/set:html=\{\s*JSON\.stringify/.test(readFileSync(file, 'utf8')),
		);
		expect(offenders).toEqual([]);
	});
});
