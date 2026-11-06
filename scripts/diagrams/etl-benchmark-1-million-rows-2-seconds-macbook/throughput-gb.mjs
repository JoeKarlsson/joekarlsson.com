import { chart, SOURCE } from './_bars.mjs';

export const alt =
	'Data volume throughput in GB per hour: CloudQuery 842 on an 11-core MacBook, Fivetran 500 and Airbyte 200.';

const SPEC = {
	title: 'GB per hour',
	unit: 'Data volume throughput, higher is better',
	bars: [
		{ label: 'CloudQuery', value: 842, highlight: true },
		{ label: 'Fivetran', value: 500 },
		{ label: 'Airbyte', value: 200 },
	],
	note: SOURCE,
};

export const desktop = { height: 390, draw: (f) => chart(f, SPEC) };
export const phone = {
	height: 290,
	draw: (f) =>
		chart(f, {
			...SPEC,
			phone: true,
			note: ['Source: CloudQuery’s benchmark;', 'competitor figures as it published them.'],
		}),
};
