export const alt =
	'The StarTech 25U rack, top to bottom: the StarTech PDU (1U), the MikroTik CRS317 10G switch (1U), the UniFi US24 24-port 1G switch (1U), a shelf with the UniFi Cloud Gateway Ultra and a 4-bay Synology NAS, an empty space for a future NAS, the Dell R730 prxbox1 with a Quadro RTX 4000 8GB (2U), the Dell R730 prxbox2 with an RTX A4000 16GB (2U), and two UPS units (2U each).';

/** Rack rows top to bottom; a 1U row is 52 high, a 2U row 84. */
const ROWS = [
	{ u: '1U', h: 52, label: 'StarTech PDU', icon: 'plug' },
	{ u: '1U', h: 52, label: 'MikroTik CRS317', sub: '10G switch', logo: 'mikrotik' },
	{ u: '1U', h: 52, label: 'UniFi US24', sub: '24-port 1G', logo: 'ubiquiti' },
	{
		u: 'shelf',
		h: 64,
		shelf: [
			{ label: 'Cloud Gateway', sub: 'UniFi, Ultra', logo: 'ubiquiti' },
			{ label: 'Synology NAS', sub: '4-bay', logo: 'synology' },
		],
	},
	{ u: '', h: 52, label: 'Empty: a future NAS', kind: 'dashed' },
	{
		u: '2U',
		h: 84,
		label: 'Dell R730, prxbox1',
		sub: 'Quadro RTX 4000, 8GB',
		logo: 'dell',
		kind: 'pink',
	},
	{
		u: '2U',
		h: 84,
		label: 'Dell R730, prxbox2',
		sub: 'RTX A4000, 16GB',
		logo: 'dell',
		kind: 'pink',
	},
	{ u: '2U', h: 84, label: 'UPS', icon: 'battery' },
	{ u: '2U', h: 84, label: 'UPS', icon: 'battery' },
];

function rack(f, { x, w, labelX, size, stackShelf }) {
	let y = 50;
	const total = ROWS.reduce((sum, r) => sum + (r.shelf && stackShelf ? 104 : r.h) + 6, 0) + 14;
	f.group({ x: x - 12, y: y - 14, w: w + 24, h: total, label: 'StarTech 25U rack' });
	ROWS.forEach((r) => {
		if (r.shelf) {
			const half = (w - 6) / 2;
			const shelfH = stackShelf ? 104 : r.h;
			r.shelf.forEach((s, i) =>
				f.box({
					x: x + i * (half + 6),
					y,
					w: half,
					h: shelfH,
					size: size - 1,
					subSize: 13,
					stack: stackShelf,
					...s,
				}),
			);
			if (r.u) f.note(labelX, y + shelfH / 2, r.u, { size: 14, weight: 700 });
			y += shelfH + 6;
			return;
		} else {
			f.box({ x, y, w, h: r.h, size, subSize: 13, ...r });
		}
		if (r.u) f.note(labelX, y + r.h / 2, r.u, { size: 14, weight: 700 });
		y += r.h + 6;
	});
}

export const desktop = {
	height: 780,
	draw(f) {
		rack(f, { x: 130, w: 380, labelX: 536, size: 15 });
	},
};

export const phone = {
	height: 820,
	draw(f) {
		rack(f, { x: 20, w: 268, labelX: 312, size: 14, stackShelf: true });
	},
};
