export const alt =
	'How Online Archive uses its partitions. The customers collection is archived with the partition fields /username/email, so archived documents are stored in folders by username and then by email. A query on username and email goes straight to the matching folder, /TestUsername/test@mongodb.com, instead of scanning the whole archive.';

const QUERY = [
	'db.customers.findOne({',
	'  username: "TestUsername",',
	'  email: "test@mongodb.com"',
	'})',
];

/** The archive's folder tree, with the folder the query lands in highlighted. */
function folders(f, { x, y, w }) {
	f.group({ x, y, w, h: 196, label: 'Archive partitions' });
	const rows = [
		{ depth: 0, name: '/TestUsername', icon: 'folder', hit: true },
		{ depth: 1, name: '/test@mongodb.com', icon: 'file-json', hit: true },
		{ depth: 1, name: '/demo@mongodb.com', icon: 'file-json' },
		{ depth: 0, name: '/OtherUsername', icon: 'folder' },
	];
	rows.forEach((r, i) => {
		const rx = x + 12 + r.depth * 22;
		f.box({
			x: rx,
			y: y + 18 + i * 42,
			w: w - 24 - r.depth * 22,
			h: 34,
			kind: r.hit ? 'pink' : 'ink',
			label: r.name,
			font: 'mono',
			size: 13,
			icon: r.icon,
		});
	});
}

export const desktop = {
	height: 340,
	draw(f) {
		f.text(16, 22, 'Partition fields: /username/email', {
			font: 'mono',
			size: 14,
			anchor: 'start',
			color: '#ededed',
		});
		f.code({ x: 16, y: 60, w: 284, lines: QUERY, size: 14, highlight: [1, 2] });
		f.arrow([
			[302, 112],
			[354, 112],
		]);
		f.note(328, 92, 'goes to', { anchor: 'middle', size: 13 });
		folders(f, { x: 356, y: 84, w: 268 });
		f.note(16, 316, 'Only the matching folder is read, not the whole archive.', { size: 14 });
	},
};

export const phone = {
	height: 520,
	draw(f) {
		f.text(16, 18, 'Partition fields: /username/email', {
			font: 'mono',
			size: 13,
			anchor: 'start',
			color: '#ededed',
		});
		f.code({ x: 16, y: 40, w: 328, lines: QUERY, size: 13, highlight: [1, 2] });
		f.arrow([
			[180, 160],
			[180, 214],
		]);
		f.note(194, 187, 'goes to', { size: 13 });
		folders(f, { x: 8, y: 238, w: 344 });
		f.note(16, 470, 'Only the matching folder is read,', { size: 13 });
		f.note(16, 490, 'not the whole archive.', { size: 13 });
	},
};
