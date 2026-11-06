export const alt =
	'The three strategic focus areas a Cloud Center of Excellence brings together: cloud innovation, security and compliance, and cost governance. The CCOE sits where all three meet.';

const AREAS = [
	{ label: ['Cloud', 'innovation'], icon: 'lightbulb' },
	{ label: ['Security,', 'compliance'], icon: 'shield-check' },
	{ label: ['Cost', 'governance'], icon: 'coins' },
];

export const desktop = {
	height: 330,
	draw(f) {
		const spots = [
			[40, 30],
			[440, 30],
			[240, 230],
		];
		f.box({
			x: 250,
			y: 106,
			w: 140,
			h: 70,
			kind: 'pink',
			label: 'CCOE',
			icon: 'landmark',
			size: 20,
		});
		// The CCOE is where the three meet: plain joining lines, not flows
		f.arrow(
			[
				[200, 86],
				[248, 120],
			],
			{ heads: 'none' },
		);
		f.arrow(
			[
				[440, 86],
				[392, 120],
			],
			{ heads: 'none' },
		);
		f.arrow(
			[
				[320, 228],
				[320, 178],
			],
			{ heads: 'none' },
		);
		AREAS.forEach((a, i) =>
			f.box({ x: spots[i][0], y: spots[i][1], w: 160, h: 70, kind: 'chalk', size: 16, ...a }),
		);
	},
};

export const phone = {
	height: 470,
	draw(f) {
		f.box({ x: 8, y: 16, w: 166, h: 92, kind: 'chalk', size: 15, stack: true, ...AREAS[0] });
		f.box({ x: 186, y: 16, w: 166, h: 92, kind: 'chalk', size: 15, stack: true, ...AREAS[1] });
		f.arrow(
			[
				[91, 110],
				[91, 170],
				[118, 170],
			],
			{ heads: 'none' },
		);
		f.arrow(
			[
				[269, 110],
				[269, 170],
				[242, 170],
			],
			{ heads: 'none' },
		);
		f.box({
			x: 120,
			y: 138,
			w: 120,
			h: 64,
			kind: 'pink',
			label: 'CCOE',
			icon: 'landmark',
			size: 18,
		});
		f.arrow(
			[
				[180, 204],
				[180, 260],
			],
			{ heads: 'none' },
		);
		f.box({ x: 97, y: 262, w: 166, h: 92, kind: 'chalk', size: 15, stack: true, ...AREAS[2] });
		f.note(180, 400, 'A mature CCOE balances all three.', { anchor: 'middle', size: 14 });
	},
};
