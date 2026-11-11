import { describe, expect, it } from 'vitest';
import { modernWebReport } from '../scripts/modern-web-report.mjs';

const clean = { targetDir: 'src', totalFindings: 0, guides: [] };
const oneFinding = {
	targetDir: 'src',
	totalFindings: 1,
	guides: [
		{
			guideId: 'dialog',
			count: 1,
			rules: [
				{
					ruleId: 'dialog',
					summary: 'Manual backdrop click listener.',
					verifierRubric: { keepWhen: ['It only closes.'], dropWhen: ['It does more.'] },
					count: 1,
					findings: [{ file: 'src/a.ts', line: 3, message: '', lineContent: '  el.onclick = x  ' }],
				},
			],
		},
	],
};

describe('modern-web-report', () => {
	it('says nothing when the scan is clean and the guides are current, so the issue closes', () => {
		expect(modernWebReport(clean, '1.0.0', '1.0.0')).toBe('');
	});

	it('flags new guides even with a clean scan', () => {
		expect(modernWebReport(clean, '1.0.0', '1.1.0')).toContain('## New guides: 1.0.0 -> 1.1.0');
	});

	it('lists each finding with its file, line and rubric', () => {
		const report = modernWebReport(oneFinding, '1.0.0', '1.0.0');
		expect(report).toContain('## 1 legacy pattern in src/');
		expect(report).toContain('### `dialog`: Manual backdrop click listener.');
		expect(report).toContain('- **Real when:** It only closes.');
		expect(report).toContain('- `src/a.ts:3` `el.onclick = x`');
	});

	it('fails loudly when the scan itself failed', () => {
		expect(() => modernWebReport({ ...clean, error: 'Target path not found' }, '1', '1')).toThrow(
			/legacy-scan failed/,
		);
	});
});
