import { steps } from './_csfle.mjs';

export const alt =
	'Writing encrypted field data, in order: the client application reads the automatic encryption configuration (a JSON Schema), mongocryptd validates the encryption commands, the client fetches the data encryption keys from the key vault collection, the KMS provider decrypts those keys, and the client writes the encrypted document to the MongoDB data collection.';

const LIST = [
	{
		does: 'reads',
		to: { label: 'Encryption config', sub: 'JSON Schema', subSize: 13, icon: 'braces' },
	},
	{ does: 'validates the commands', to: { label: 'mongocryptd', icon: 'lock' } },
	{
		does: 'fetches the data keys',
		to: { label: 'Key vault', sub: 'a collection', subSize: 13, logo: 'mongodb' },
	},
	{ does: 'decrypts the data keys', to: { label: 'KMS provider', icon: 'vault', kind: 'chalk' } },
	{
		does: 'writes the encrypted document',
		to: { label: ['Data', 'collection'], logo: 'mongodb', kind: 'pink' },
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
