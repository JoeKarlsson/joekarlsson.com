import { chart, SOURCE } from './_bars.mjs';

export const alt =
	'CPU utilization during the ETL benchmark: CloudQuery 47%, Fivetran 85%, AWS Glue 92% and Airbyte 88%.';

const SPEC = {
	title: 'CPU utilization',
	unit: 'Percent of CPU used, lower is better',
	bars: [
		{ label: 'CloudQuery', value: 47, highlight: true },
		{ label: 'Fivetran', value: 85 },
		{ label: 'AWS Glue', value: 92 },
		{ label: 'Airbyte', value: 88 },
	],
	max: 100,
	format: (v) => `${v}%`,
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
