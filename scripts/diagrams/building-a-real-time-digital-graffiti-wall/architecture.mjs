export const alt =
	'The graffiti wall: a canvas UI in the browser (a 32 by 32 grid of divs, pointer events, optimistic updates) writes pixels through the MongoDB Realm SDK with anonymous auth to MongoDB Atlas, which holds 1,024 pixel documents, each with a color and an x, y coordinate. A microcontroller reads that pixel state and updates the WS2812B LED matrix on stage.';

const PARTS = [
	{
		label: 'Browser',
		sub: ['canvas UI: 32×32 div grid,', 'pointer events, optimistic updates'],
		icon: 'monitor',
	},
	{
		label: 'MongoDB Atlas',
		sub: ['1,024 pixel documents,', '{ color, coord: { x, y } }'],
		logo: 'mongodb',
		kind: 'chalk',
	},
	{
		label: 'LED controller',
		sub: ['a microcontroller reads pixel state', 'and drives the WS2812B matrix'],
		icon: 'cpu',
		kind: 'pink',
	},
];

export const desktop = {
	height: 430,
	draw(f) {
		const ys = [16, 156, 296];
		PARTS.forEach((p, i) =>
			f.box({ x: 140, y: ys[i], w: 360, h: 96, size: 17, subSize: 14, ...p }),
		);
		f.arrow(
			[
				[320, 114],
				[320, 154],
			],
			{ heads: 'both' },
		);
		f.note(334, 128, 'MongoDB Realm SDK,', { size: 14 });
		f.note(334, 146, 'anonymous auth', { size: 14 });
		f.arrow([
			[320, 254],
			[320, 294],
		]);
		f.note(334, 274, 'reads pixel state', { size: 14 });
	},
};

export const phone = {
	height: 470,
	draw(f) {
		const ys = [16, 172, 328];
		PARTS.forEach((p, i) =>
			f.box({ x: 12, y: ys[i], w: 336, h: 108, size: 16, subSize: 13, ...p }),
		);
		f.arrow(
			[
				[60, 126],
				[60, 170],
			],
			{ heads: 'both' },
		);
		f.note(74, 140, 'MongoDB Realm SDK, anonymous auth', { size: 13 });
		f.arrow([
			[60, 282],
			[60, 326],
		]);
		f.note(74, 304, 'reads pixel state', { size: 13 });
	},
};
