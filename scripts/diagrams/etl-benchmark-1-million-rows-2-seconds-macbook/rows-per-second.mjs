import { chart, SOURCE } from './_bars.mjs';

export const alt =
	'ETL throughput in rows per second: CloudQuery 163,489, Fivetran 111,000, Talend 69,000 and Airbyte 3,000.';

const SPEC = {
	title: 'Rows per second',
	unit: 'ETL throughput, higher is better',
	bars: [
		{ label: 'CloudQuery', value: 163489, highlight: true },
		{ label: 'Fivetran', value: 111000 },
		{ label: 'Talend', value: 69000 },
		{ label: 'Airbyte', value: 3000 },
	],
	format: (v) => v.toLocaleString('en-US'),
	note: SOURCE,
};

export const desktop = { height: 390, draw: (f) => chart(f, SPEC) };
export const phone = {
	height: 340,
	draw: (f) =>
		chart(f, {
			...SPEC,
			phone: true,
			note: ['Source: CloudQuery’s benchmark;', 'competitor figures as it published them.'],
		}),
};
