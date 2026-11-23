import { describe, expect, it } from 'vitest';
import { cruxReport } from '../scripts/crux-report.mjs';

const origin = 'https://www.joekarlsson.com';
const record = (lcp: number, inp: number, cls: string) => ({
	metrics: {
		largest_contentful_paint: { percentiles: { p75: lcp } },
		interaction_to_next_paint: { percentiles: { p75: inp } },
		cumulative_layout_shift: { percentiles: { p75: cls } },
	},
});

describe('crux-report', () => {
	it('says nothing when every metric is good, so the issue closes', () => {
		expect(
			cruxReport(origin, { PHONE: record(1066, 61, '0.00'), DESKTOP: record(965, 59, '0.00') }),
		).toBe('');
	});

	it('names each metric past its good limit, per device', () => {
		const report = cruxReport(origin, {
			PHONE: record(2600, 61, '0.12'),
			DESKTOP: record(965, 59, '0.00'),
		});
		expect(report).toContain('Phone LCP: 2600ms');
		expect(report).toContain('Phone CLS: 0.12');
		expect(report).not.toContain('Desktop');
	});

	it('treats no field data as nothing to flag, not a failure', () => {
		expect(cruxReport(origin, { PHONE: null, DESKTOP: null })).toBe('');
	});
});
