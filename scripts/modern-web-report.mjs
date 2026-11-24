// Turns Google's legacy-scan JSON (npx modern-web-guidance legacy-scan src --json) into the
// body of the monthly "Modern Web Guidance check" issue (.github/workflows/standards.yml).
// Prints nothing when there's nothing to flag, so the workflow can close the issue.
//
//   node scripts/modern-web-report.mjs scan.json <pinned version> <latest version>
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

// Leads checked against their rubric and judged fine, keyed by file and line text so a line
// shift doesn't bring them back. The issue only looks at open issues, so a closed false lead
// would be re-filed every month without this.
export const REVIEWED_FINE = [
	// Spread of a Map (Map.groupBy): the rubric's "fine when", and Map has no toSorted()
	{ file: 'utils/review-stats.ts', lineContent: 'decades: [...byDecade]' },
];

export function modernWebReport(scan, pinned, latest, reviewedFine = REVIEWED_FINE) {
	if (scan.error) throw new Error(`legacy-scan failed: ${scan.error}`);
	const isReviewed = (f) =>
		reviewedFine.some((r) => r.file === f.file && r.lineContent === f.lineContent.trim());
	const guides = scan.guides
		.map((guide) => ({
			...guide,
			rules: guide.rules
				.map((rule) => ({ ...rule, findings: rule.findings.filter((f) => !isReviewed(f)) }))
				.filter((rule) => rule.findings.length > 0),
		}))
		.filter((guide) => guide.rules.length > 0);
	const total = guides.reduce((n, g) => n + g.rules.reduce((m, r) => m + r.findings.length, 0), 0);
	const sections = [];
	if (latest !== pinned) {
		sections.push(
			`## New guides: ${pinned} -> ${latest}`,
			'',
			'Google published new Modern Web Guidance. Run `~/.claude/scripts/update-modern-web-guidance.sh`, ' +
				'have the `web-standards-reviewer` agent do a full review of the live site, then bump ' +
				'`MODERN_WEB_GUIDANCE` in `.github/workflows/standards.yml`.',
			'',
		);
	}
	if (total > 0) {
		sections.push(
			`## ${total} legacy pattern${total === 1 ? '' : 's'} in src/`,
			'',
			'Leads, not verdicts: check each against its keep/drop rubric before changing code. ' +
				'Guides are in `~/.claude/vendor/modern-web-guidance/`.',
			'',
		);
		for (const guide of guides) {
			for (const rule of guide.rules) {
				sections.push(`### \`${guide.guideId}\`: ${rule.summary}`, '');
				if (rule.verifierRubric) {
					sections.push(`- **Real when:** ${rule.verifierRubric.keepWhen.join(' ')}`);
					sections.push(`- **Fine when:** ${rule.verifierRubric.dropWhen.join(' ')}`, '');
				}
				for (const { file, line, lineContent } of rule.findings)
					sections.push(`- \`${file}:${line}\` \`${lineContent.trim().slice(0, 120)}\``);
				sections.push('');
			}
		}
	}
	return sections.join('\n');
}

// pathToFileURL, not a hand-built file:// string: a path it encodes differently would
// print nothing, which the workflow reads as a clean scan and closes the issue
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
	const [scanPath, pinned, latest] = process.argv.slice(2);
	process.stdout.write(modernWebReport(JSON.parse(readFileSync(scanPath, 'utf8')), pinned, latest));
}
