import { describe, expect, it } from 'vitest';
import { auditFailures } from '../scripts/audit-gate.mjs';

const via = (url: string, severity = 'high') => ({
	name: 'picomatch',
	url,
	severity,
	range: '<=4.0.7',
	title: 'ReDoS',
});
const audit = (...vias: object[]) => ({
	vulnerabilities: { picomatch: { via: vias }, astro: { via: ['picomatch'] } },
});
const accepted = { 'GHSA-aaaa': { package: 'picomatch', why: 'build time only' } };
const unpatched = { newestIsVulnerable: () => true };

describe('audit gate', () => {
	it('passes an accepted advisory with no patch out', () => {
		expect(
			auditFailures(audit(via('https://github.com/advisories/GHSA-aaaa')), accepted, unpatched),
		).toEqual([]);
	});
	it('fails a new high or critical advisory, but not a moderate one', () => {
		const found = auditFailures(
			audit(
				via('https://github.com/advisories/GHSA-aaaa'),
				via('https://github.com/advisories/GHSA-bbbb', 'critical'),
				via('https://github.com/advisories/GHSA-cccc', 'moderate'),
			),
			accepted,
			unpatched,
		);
		expect(found).toHaveLength(1);
		expect(found[0]).toMatch(/^GHSA-bbbb/);
	});
	it('fails an exception once a patch is out, or once the audit stops reporting it', () => {
		expect(
			auditFailures(audit(via('https://github.com/advisories/GHSA-aaaa')), accepted, {
				newestIsVulnerable: () => false,
			})[0],
		).toMatch(/patched version is out/);
		expect(auditFailures(audit(), accepted, unpatched)[0]).toMatch(/no longer reports it/);
	});
	it("fails when npm audit couldn't reach the advisory service, instead of seeing no advisories", () => {
		const failed = {
			message: 'request to https://registry.npmjs.org failed',
			error: { summary: '' },
		};
		expect(auditFailures(failed, accepted, unpatched)).toEqual([
			"npm audit couldn't run: request to https://registry.npmjs.org failed",
		]);
	});
});
