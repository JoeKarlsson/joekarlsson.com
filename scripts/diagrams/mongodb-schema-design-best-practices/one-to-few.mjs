import { DESKTOP, PHONE, callout, doc, docHeight, id } from './_doc.mjs';

export const alt =
	'One-to-few: a user document in the users collection with its addresses embedded inside it. After _id, name and company comes an addresses array holding two small address documents, 123 Sesame St in Anytown and 123 Avenue Q in New York. The addresses live inside the user, so one read gets both.';

const ROWS = [
	`_id: ${id('0001')}`,
	'name: "Joe Karlsson"',
	'company: "MongoDB"',
	'addresses: [',
	{ embed: ['street: "123 Sesame St"', 'city: "Anytown", cc: "USA"'] },
	{ embed: ['street: "123 Avenue Q"', 'city: "New York", cc: "USA"'] },
	']',
];

export const desktop = {
	height: 300,
	draw(f) {
		const h = docHeight(ROWS, DESKTOP);
		f.group({ x: 40, y: 40, w: 320, h: h + 20, label: 'users' });
		const user = doc(f, { x: 50, y: 50, w: 300, rows: ROWS, s: DESKTOP });
		callout(f, 412, 76, ['The addresses live', 'inside the user:', 'one read gets them'], {
			arrow: [[440, 140], [user.right + 6, 190], 20],
		});
	},
};

export const phone = {
	height: 380,
	draw(f) {
		const h = docHeight(ROWS, PHONE);
		f.group({ x: 16, y: 112, w: 328, h: h + 20, label: 'users' });
		const user = doc(f, { x: 26, y: 122, w: 308, rows: ROWS, s: PHONE });
		callout(f, 16, 22, ['The addresses live inside', 'the user: one read gets them'], {
			arrow: [[274, 44], [user.right + 6, 236], -90],
		});
	},
};
