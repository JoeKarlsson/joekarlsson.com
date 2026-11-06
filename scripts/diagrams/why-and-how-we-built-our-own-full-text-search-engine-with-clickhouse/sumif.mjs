import { strategy } from './_strategy.mjs';

export const alt =
	'The sumIf strategy, the default: every search term’s lookup is combined with UNION ALL, then one aggregate step sums the match weights across all terms in a single pass.';

const SPEC = {
	shared: [
		{ label: 'UNION ALL', font: 'mono', icon: 'merge' },
		{ label: 'Aggregate', sub: 'sumIf, one pass', subFont: 'mono', subSize: 13, icon: 'sigma' },
	],
};

export const desktop = {
	height: 350,
	draw(f) {
		strategy(f, {
			...SPEC,
			width: 640,
			note: ['Handles any AND/OR condition and scores every matching property.'],
		});
	},
};

export const phone = {
	height: 420,
	draw(f) {
		strategy(f, {
			...SPEC,
			width: 360,
			note: ['Handles any AND/OR condition and', 'scores every matching property.'],
		});
	},
};
