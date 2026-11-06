import { steps } from './_csfle.mjs';

export const alt =
	'Reading encrypted fields, in order: mongocryptd validates the query against the automatic encryption configuration (a JSON Schema), the client queries the MongoDB data collection and gets back results with encrypted fields, fetches the data encryption keys from the key vault collection, has the KMS provider decrypt those keys, and then decrypts the fields itself with the data keys.';

const LIST = [
	{
		does: 'validates the query',
		to: { label: 'mongocryptd', sub: 'checks the JSON Schema', subSize: 13, icon: 'lock' },
	},
	{ does: 'queries the data', to: { label: ['Data', 'collection'], logo: 'mongodb' } },
	{
		does: 'fetches the data keys',
		to: { label: 'Key vault', sub: 'a collection', subSize: 13, logo: 'mongodb' },
	},
	{ does: 'decrypts the data keys', to: { label: 'KMS provider', icon: 'vault', kind: 'chalk' } },
	{
		does: 'decrypts the fields itself',
		to: { label: ['Readable', 'results'], icon: 'binary', kind: 'pink' },
	},
];

export const desktop = {
	height: 390,
	draw(f) {
		steps(f, { list: LIST });
	},
};

export const phone = {
	height: 590,
	draw(f) {
		steps(f, { list: LIST, phone: true });
	},
};
