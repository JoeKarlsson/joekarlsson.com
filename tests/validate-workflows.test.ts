import { describe, expect, it } from 'vitest';
import { findWorkflowErrors } from '../scripts/validate-workflows.mjs';

describe('findWorkflowErrors', () => {
	it('accepts a normal workflow', () => {
		expect(findWorkflowErrors('on: push\njobs:\n  build:\n    runs-on: ubuntu-latest\n')).toEqual(
			[],
		);
	});

	it('catches a job defined twice', () => {
		const text = 'on: push\njobs:\n  e2e:\n    runs-on: a\n  e2e:\n    runs-on: b\n';
		expect(findWorkflowErrors(text).join(' ')).toMatch(/unique/i);
	});

	it('catches an action pinned to a tag instead of a commit', () => {
		const job = (uses: string) =>
			`on: push\njobs:\n  a:\n    runs-on: x\n    steps:\n      - uses: ${uses}\n`;
		expect(findWorkflowErrors(job('actions/checkout@v7')).join(' ')).toMatch(/SHA/);
		expect(
			findWorkflowErrors(job('actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7')),
		).toEqual([]);
		expect(findWorkflowErrors(job('./local-action'))).toEqual([]);
	});
});
