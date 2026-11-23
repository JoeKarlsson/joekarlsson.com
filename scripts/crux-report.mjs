// Real visitors' Core Web Vitals (Chrome UX Report, a rolling 28 days) as the body of the
// monthly "Field speed check" issue (.github/workflows/standards.yml). Prints nothing when
// every metric is "good" at p75 on phone and desktop, so the workflow can close the issue.
// Too little traffic for CrUX is noted in the issue, never a failure.
//
//   CRUX_API_KEY=... node scripts/crux-report.mjs https://www.joekarlsson.com
import { pathToFileURL } from 'node:url';

// web.dev's "good" limits at p75 (~/.claude/knowledge/web-performance.md)
const GOOD = {
	largest_contentful_paint: { name: 'LCP', limit: 2500, unit: 'ms' },
	interaction_to_next_paint: { name: 'INP', limit: 200, unit: 'ms' },
	cumulative_layout_shift: { name: 'CLS', limit: 0.1, unit: '' },
};

/** `records` maps PHONE and DESKTOP to a CrUX record, or null when CrUX has no data */
export function cruxReport(origin, records) {
	const slow = [];
	const noData = [];
	for (const [formFactor, record] of Object.entries(records)) {
		const device = formFactor === 'PHONE' ? 'Phone' : 'Desktop';
		if (!record) {
			noData.push(`- ${device}: no field data (too few Chrome visits in 28 days)`);
			continue;
		}
		for (const [metric, { name, limit, unit }] of Object.entries(GOOD)) {
			const p75 = record.metrics[metric]?.percentiles.p75;
			if (p75 !== undefined && Number(p75) > limit)
				slow.push(`- ${device} ${name}: ${p75}${unit} at p75 (good is ${limit}${unit} or less)`);
		}
	}
	if (slow.length === 0) return '';
	return [
		`Real Chrome visitors to ${origin} over the last 28 days, from the Chrome UX Report:`,
		'',
		...slow,
		...noData,
		'',
		'Run the `performance-reviewer` agent on the live site to find the cause.',
		'',
	].join('\n');
}

async function fetchRecord(origin, formFactor, key) {
	const response = await fetch(
		`https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=${key}`,
		{ method: 'POST', body: JSON.stringify({ origin, formFactor }) },
	);
	if (response.status === 404) return null; // CrUX's answer for "not enough data"
	if (!response.ok)
		throw new Error(`CrUX ${formFactor}: ${response.status} ${await response.text()}`);
	return (await response.json()).record;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
	const origin = process.argv[2];
	const key = process.env.CRUX_API_KEY;
	if (!origin || !key)
		throw new Error('Usage: CRUX_API_KEY=... node scripts/crux-report.mjs <origin>');
	const records = {};
	for (const formFactor of ['PHONE', 'DESKTOP'])
		records[formFactor] = await fetchRecord(origin, formFactor, key);
	process.stdout.write(cruxReport(origin, records));
}
