import { DESKTOP, PHONE, callout, doc, docHeight, id } from './_doc.mjs';

export const alt =
	'One-to-squillions: log message documents in the logmsg collection, the first with time 2014-03-28 and message "cpu is on fire!", and millions more after it. Each one holds a host field with the same ObjectId, and every one of those references points to the single host document in the hosts collection: goofy.example.com at 127.66.66.66. The host keeps no array of its messages, because that array would never stop growing.';

const HOST = id('0201');
const LOGS = [
	[
		'time: ISODate("2014-03-28…")',
		'message: "cpu is on fire!"',
		{ key: 'host:', chip: HOST, to: 'right' },
	],
	['…', { key: 'host:', chip: HOST, to: 'right' }],
	['…', { key: 'host:', chip: HOST, to: 'right' }],
];
const HOST_ROWS = [`_id: ${HOST}`, 'name: "goofy.example.com"', 'ipaddr: "127.66.66.66"'];

/** The logmsg collection, its documents stacked from y, 12 apart, and the line under it. */
function logCollection(f, { x, y, w, s, size }) {
	const h = LOGS.reduce((sum, rows) => sum + docHeight(rows, s) + 12, -12);
	f.group({ x, y: y - 10, w, h: h + 20, label: 'logmsg' });
	const logs = LOGS.map((rows) => {
		const log = doc(f, { x: x + 10, y, w: w - 20, rows, s });
		y = log.bottom + 12;
		return log;
	});
	f.note(x + 10, y + 22, '…and millions more', { size });
	return logs;
}

export const desktop = {
	height: 400,
	draw(f) {
		const s = DESKTOP;
		const logs = logCollection(f, { x: 16, y: 50, w: 290, s, size: 15 });
		const chips = logs.map((log) => log.chips[0]);
		// The host's _id sits level with the middle message's reference
		const top = chips[1].y - s.pad - s.line / 2;
		f.group({ x: 370, y: top - 10, w: 254, h: docHeight(HOST_ROWS, s) + 20, label: 'hosts' });
		const host = doc(f, { x: 380, y: top, w: 234, rows: HOST_ROWS, s });
		// Many references, one host: the outer two join the middle one's arrow
		const trunk = 338;
		f.arrow(
			[
				[chips[0].edge, chips[0].y],
				[trunk, chips[0].y],
				[trunk, chips[1].y],
			],
			{ heads: 'none' },
		);
		f.arrow(
			[
				[chips[2].edge, chips[2].y],
				[trunk, chips[2].y],
				[trunk, chips[1].y],
			],
			{ heads: 'none' },
		);
		f.arrow([
			[chips[1].edge, chips[1].y],
			[host.x - 2, chips[1].y],
		]);
		callout(f, 380, 70, ['No array on the host:', 'it would never stop growing']);
		f.crayonArrow([520, 106], [500, host.y - 26], -14);
	},
};

export const phone = {
	height: 600,
	draw(f) {
		const s = PHONE;
		const logs = logCollection(f, { x: 16, y: 50, w: 328, s, size: 14 });
		const chips = logs.map((log) => log.chips[0]);
		const top = logs[2].bottom + 96;
		f.group({ x: 16, y: top - 10, w: 300, h: docHeight(HOST_ROWS, s) + 20, label: 'hosts' });
		const host = doc(f, { x: 26, y: top, w: 280, rows: HOST_ROWS, s });
		const into = host.y + host.h / 2;
		f.arrow(
			[
				[chips[0].edge, chips[0].y],
				[348, chips[0].y],
				[348, chips[2].y],
			],
			{ heads: 'none' },
		);
		f.arrow(
			[
				[chips[1].edge, chips[1].y],
				[348, chips[1].y],
			],
			{ heads: 'none' },
		);
		f.arrow([
			[chips[2].edge, chips[2].y],
			[348, chips[2].y],
			[348, into],
			[host.right + 2, into],
		]);
		callout(f, 16, host.bottom + 44, ['No array on the host:', 'it would never stop growing'], 17);
		f.crayonArrow([250, host.bottom + 34], [220, host.bottom + 6], 14);
	},
};
