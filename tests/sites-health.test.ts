import { describe, expect, it } from 'vitest';
import { trackingProblems } from '../scripts/sites-health.mjs';

const healthy = {
	domain: 'punc.joekarlsson.com',
	homeStatus: 200,
	tagFound: true,
	created: '2026-11-05',
	lastPageview: '2026-11-18',
	searchConsole: 'https://punc.joekarlsson.com',
	noindex: false,
	today: '2026-11-18',
};

describe('trackingProblems', () => {
	it('passes a site that loads, has the tag, got a recent pageview and is linked', () => {
		expect(trackingProblems(healthy)).toEqual([]);
	});

	it('flags a missing tag, a quiet site and a missing Search Console link', () => {
		expect(
			trackingProblems({
				...healthy,
				tagFound: false,
				created: '2026-09-01',
				lastPageview: '2026-10-01',
				searchConsole: '',
			}),
		).toEqual([
			'no Plausible tag on the home page',
			'no pageview in 14 days (last 2026-10-01): tracking may be broken',
			'not linked to Search Console (Plausible: Settings, Integrations)',
		]);
	});

	it('asks for a first visit on a new site instead of calling it broken', () => {
		expect(trackingProblems({ ...healthy, created: '2026-11-18', lastPageview: null })).toEqual([
			"no pageview since it was added on 2026-11-18: open the site and check Plausible's realtime view",
		]);
	});

	it('keeps public infrastructure (noindex) out of Search Console', () => {
		expect(
			trackingProblems({
				...healthy,
				domain: 'postiz.joekarlsson.com',
				searchConsole: '',
				noindex: true,
			}),
		).toEqual([]);
	});

	it('reports a site that is down, and skips the Search Console link off joekarlsson.com', () => {
		expect(
			trackingProblems({
				...healthy,
				domain: 'streamroll.vercel.app',
				homeStatus: 0,
				searchConsole: '',
			}),
		).toEqual(['home page returns no response']);
	});
});
