// Prints a Markdown table of each audited page's median Lighthouse scores and page
// weight, from the reports lhci collect leaves in .lighthouseci/. CI appends it to the
// run's summary page, so a slipping score shows before it fails the assertion.
// Usage: node scripts/lighthouse-summary.mjs [.lighthouseci]
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo'];

const median = (values) => values.toSorted((a, b) => a - b)[Math.floor(values.length / 2)];

/** reports: parsed Lighthouse results, several runs per page */
export function summaryTable(reports) {
	const byPage = Map.groupBy(reports, (report) => new URL(report.requestedUrl).pathname);
	const rows = [...byPage].map(([path, runs]) => {
		const scores = CATEGORIES.map((id) =>
			Math.round(median(runs.map((run) => run.categories[id].score)) * 100),
		);
		const kb = Math.round(
			median(runs.map((run) => run.audits['total-byte-weight'].numericValue)) / 1024,
		);
		return `| ${path} | ${scores.join(' | ')} | ${kb} KB |`;
	});
	return [
		'| Page | Performance | Accessibility | Best practices | SEO | Weight |',
		'| --- | --- | --- | --- | --- | --- |',
		...rows,
	].join('\n');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const dir = process.argv[2] ?? '.lighthouseci';
	const reports = readdirSync(dir)
		.filter((name) => /^lhr-.*\.json$/.test(name))
		.map((name) => JSON.parse(readFileSync(join(dir, name), 'utf8')));
	if (reports.length === 0) throw new Error(`No Lighthouse reports in ${dir}`);
	console.log(summaryTable(reports));
}
