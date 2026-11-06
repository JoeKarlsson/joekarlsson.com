import { strategy } from './_strategy.mjs';

export const alt =
	'The ungrouped strategy: any number of search terms run through one string-match step, their matches are combined with UNION ALL, and a single aggregate step scores the results.';

const SPEC = {
	shared: [
		{ label: 'String match', icon: 'search' },
		{ label: 'UNION ALL', font: 'mono', icon: 'merge' },
		{ label: 'Aggregate', icon: 'sigma' },
	],
};

export const desktop = {
	height: 430,
	draw(f) {
		strategy(f, { ...SPEC, width: 640 });
	},
};

export const phone = {
	height: 470,
	draw(f) {
		strategy(f, { ...SPEC, width: 360 });
	},
};
