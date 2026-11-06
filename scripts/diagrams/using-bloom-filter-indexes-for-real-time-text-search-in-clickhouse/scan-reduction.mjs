import { chart } from './_bars.mjs';

export const alt =
	'How many times less data each Bloom filter configuration scans than no index: ngrambf_v1(4, 1024, 1, 0) 324.2x, (4, 1024, 2, 0) 318.0x, (4, 4096, 1, 0) 678.1x and (4, 8192, 1, 0) 710.7x.';

const SPEC = {
	title: 'Scan size: times less data read',
	values: [324.2, 318.0, 678.1, 710.7],
	unit: 'x',
	best: 3,
};

export const desktop = { height: 290, draw: (f) => chart(f, SPEC) };
export const phone = { height: 290, draw: (f) => chart(f, { ...SPEC, phone: true }) };
