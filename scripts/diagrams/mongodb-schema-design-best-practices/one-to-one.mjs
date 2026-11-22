import { DESKTOP, PHONE, doc, docHeight, id } from './_doc.mjs';

export const alt =
	'One-to-one: a single user document in the users collection holds every one-to-one fact as a key-value pair: _id, name "Joe Karlsson", company "MongoDB", x, twitch, tiktok and website. One user, one name, so each is a plain field.';

const ROWS = [
	`_id: ${id('0001')}`,
	'name: "Joe Karlsson"',
	'company: "MongoDB"',
	'x: "@JoeKarlsson1"',
	'twitch: "joe_karlsson"',
	'tiktok: "joekarlsson"',
	'website: "joekarlsson.com"',
];
export const desktop = {
	height: 262,
	draw(f) {
		f.group({ x: 170, y: 40, w: 300, h: docHeight(ROWS, DESKTOP) + 20, label: 'users' });
		doc(f, { x: 180, y: 50, w: 280, rows: ROWS, s: DESKTOP });
	},
};

export const phone = {
	height: 240,
	draw(f) {
		f.group({ x: 16, y: 40, w: 328, h: docHeight(ROWS, PHONE) + 20, label: 'users' });
		doc(f, { x: 26, y: 50, w: 308, rows: ROWS, s: PHONE });
	},
};
