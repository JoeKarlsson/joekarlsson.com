import { chart } from './_bars.mjs';

export const alt =
	'How many times faster each Bloom filter configuration made the query than no index (11.11 s): ngrambf_v1(4, 1024, 1, 0) 87.7x, (4, 1024, 2, 0) 79.9x, (4, 4096, 1, 0) 46.3x and (4, 8192, 1, 0) 24.8x.';

const SPEC = {
	title: 'Query speedup: times faster',
	values: [87.7, 79.9, 46.3, 24.8],
	unit: 'x',
	best: 0,
};

export const desktop = { height: 290, draw: (f) => chart(f, SPEC) };
export const phone = { height: 290, draw: (f) => chart(f, { ...SPEC, phone: true }) };
