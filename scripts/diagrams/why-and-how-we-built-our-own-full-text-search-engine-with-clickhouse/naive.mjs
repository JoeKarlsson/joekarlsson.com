import { strategy } from './_strategy.mjs';

export const alt =
	'The naive strategy: a search query splits into its search terms, each term is looked up on its own and returns its own result set, and the result sets are joined together at the end.';

const SPEC = {
	terms: 2,
	perTerm: [{ label: 'Results', sub: 'one lookup per term', icon: 'database', kind: 'chalk' }],
	shared: [{ label: 'Join', icon: 'git-merge' }],
};

export const desktop = {
	height: 330,
	draw(f) {
		strategy(f, {
			...SPEC,
			width: 640,
			note: ['Scans everything each term matches, then joins: slow at scale.'],
		});
	},
};

export const phone = {
	height: 410,
	draw(f) {
		strategy(f, {
			...SPEC,
			width: 360,
			note: ['Scans everything each term matches,', 'then joins: slow at scale.'],
		});
	},
};
