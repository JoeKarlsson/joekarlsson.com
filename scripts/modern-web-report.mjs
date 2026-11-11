// Turns Google's legacy-scan JSON (npx modern-web-guidance legacy-scan src --json) into the
// body of the monthly "Modern Web Guidance check" issue (.github/workflows/standards.yml).
// Prints nothing when there's nothing to flag, so the workflow can close the issue.
//
//   node scripts/modern-web-report.mjs scan.json <pinned version> <latest version>
import { readFileSync } from 'node:fs';

export function modernWebReport(scan, pinned, latest) {
	if (scan.error) throw new Error(`legacy-scan failed: ${scan.error}`);
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
	if (scan.totalFindings > 0) {
		sections.push(
			`## ${scan.totalFindings} legacy pattern${scan.totalFindings === 1 ? '' : 's'} in src/`,
			'',
			'Leads, not verdicts: check each against its keep/drop rubric before changing code. ' +
				'Guides are in `~/.claude/vendor/modern-web-guidance/`.',
			'',
		);
		for (const guide of scan.guides) {
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

if (import.meta.url === `file://${process.argv[1]}`) {
	const [scanPath, pinned, latest] = process.argv.slice(2);
	process.stdout.write(modernWebReport(JSON.parse(readFileSync(scanPath, 'utf8')), pinned, latest));
}
