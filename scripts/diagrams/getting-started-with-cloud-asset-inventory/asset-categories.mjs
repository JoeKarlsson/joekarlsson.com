export const alt =
	'What a cloud asset inventory covers. IAM policies (user roles, permissions, access levels) govern four kinds of resources: compute instances (containers, virtual machines, serverless functions), storage resources (buckets, block storage volumes, archival storage), databases (SQL, NoSQL, data warehouses) and network configurations (VPCs, subnets, IP addresses, firewalls, DNS settings).';

const CATEGORIES = [
	{
		label: 'Compute',
		icon: 'cpu',
		items: ['Containers', 'Virtual machines', 'Serverless functions'],
	},
	{ label: 'Storage', icon: 'hard-drive', items: ['Buckets', 'Block volumes', 'Archival storage'] },
	{ label: 'Databases', icon: 'database', items: ['SQL', 'NoSQL', 'Data warehouses'] },
	{ label: 'Network', icon: 'network', items: ['VPCs, subnets', 'IP addresses', 'Firewalls, DNS'] },
];

/** A category: its name box, then its items as notes underneath. */
function category(f, { x, y, w, c, size }) {
	f.box({ x, y, w, h: 50, kind: 'chalk', label: c.label, icon: c.icon, size });
	c.items.forEach((item, i) => f.note(x + 8, y + 70 + i * 20, item, { size: 13 }));
}

export const desktop = {
	height: 330,
	draw(f) {
		f.group({ x: 16, y: 34, w: 608, h: 280, label: 'Cloud asset inventory' });
		f.box({
			x: 200,
			y: 52,
			w: 240,
			h: 76,
			kind: 'pink',
			label: 'IAM policies',
			sub: ['roles, permissions,', 'access levels'],
			subSize: 13,
			icon: 'key-round',
			size: 15,
		});
		const xs = [28, 178, 328, 478];
		xs.forEach((x) =>
			f.arrow(
				[
					[320, 130],
					[320, 140],
					[x + 67, 140],
					[x + 67, 152],
				],
				{ dashed: true },
			),
		);
		f.note(452, 90, 'governs all four', { size: 13 });
		CATEGORIES.forEach((c, i) => category(f, { x: xs[i], y: 154, w: 134, c, size: 14 }));
	},
};

export const phone = {
	height: 510,
	draw(f) {
		f.group({ x: 8, y: 34, w: 344, h: 462, label: 'Cloud asset inventory' });
		f.box({
			x: 40,
			y: 52,
			w: 280,
			h: 76,
			kind: 'pink',
			label: 'IAM policies',
			sub: ['roles, permissions,', 'access levels'],
			subSize: 13,
			icon: 'key-round',
			size: 15,
		});
		const spots = [
			[20, 164],
			[186, 164],
			[20, 320],
			[186, 320],
		];
		f.arrow(
			[
				[180, 130],
				[180, 146],
				[87, 146],
				[87, 162],
			],
			{ dashed: true },
		);
		f.arrow(
			[
				[180, 146],
				[253, 146],
				[253, 162],
			],
			{ dashed: true },
		);
		f.note(192, 138, 'govern', { size: 13 });
		CATEGORIES.forEach((c, i) =>
			category(f, { x: spots[i][0], y: spots[i][1], w: 154, c, size: 14 }),
		);
		f.note(180, 478, 'IAM governs all four.', { anchor: 'middle', size: 13 });
	},
};
