import { elt } from './_elt.mjs';

export const alt =
	'The stack for a Azure cloud asset inventory: CloudQuery extracts asset data from your Azure account and loads it into a PostgreSQL data warehouse, where dbt transforms it in place.';

const CLOUD = { label: 'Azure', logo: 'microsoftazure' };

export const desktop = {
	height: 270,
	draw(f) {
		elt(f, { cloud: CLOUD });
	},
};

export const phone = {
	height: 410,
	draw(f) {
		elt(f, { cloud: CLOUD, phone: true });
	},
};
