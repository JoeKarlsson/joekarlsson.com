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
});
