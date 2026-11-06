import { chart, SOURCE } from './_bars.mjs';

export const alt =
	'Memory usage during the ETL benchmark, in GB: CloudQuery 0.8, Fivetran 4.2, AWS Glue 6.5 and Airbyte 2.1.';

const SPEC = {
	title: 'Memory usage',
	unit: 'GB of memory, lower is better',
	bars: [
		{ label: 'CloudQuery', value: 0.8, highlight: true },
		{ label: 'Fivetran', value: 4.2 },
		{ label: 'AWS Glue', value: 6.5 },
		{ label: 'Airbyte', value: 2.1 },
	],
	format: (v) => `${v} GB`,
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
