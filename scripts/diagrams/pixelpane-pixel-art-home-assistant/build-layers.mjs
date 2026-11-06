export const alt =
	'Side view of the inside of the PixelPane shadow box, from the front: a two-way mirror, an optional diffuser, the 3D-printed light grid with one square cell per LED, and the 32x32 LED panel facing forward. Behind them, a ribbon cable runs to the Raspberry Pi 3B with an Adafruit RGB Matrix HAT, powered by a 5 V 4 A supply that plugs into the wall.';

const LAYERS = [
	{ n: '1', name: 'two-way mirror', kind: 'chalk', w: 14 },
	{ n: '2', name: 'diffuser (optional)', kind: 'dashed', w: 12 },
	{ n: '3', name: '3D-printed light grid, one cell per LED', kind: 'outline', w: 52, grid: true },
	{ n: '4', name: 'LED panel, 32x32, LEDs face front', kind: 'pink', w: 16 },
];

export const desktop = {
	height: 380,
	draw(f) {
		f.logo('eye', 18, 160, 22);
		f.note(30, 194, 'you', { anchor: 'middle', size: 13 });
		f.group({ x: 56, y: 44, w: 568, h: 244, label: 'Inside the shadow box, side view' });
		let x = 76;
		LAYERS.forEach((l) => {
			f.box({ x, y: 64, w: l.w, h: 196, kind: l.kind });
			if (l.grid)
				for (let gy = 84; gy < 260; gy += 24)
					f.line(
						[
							[x + 4, gy],
							[x + l.w - 4, gy],
						],
						{ color: '#ededed', width: 2 },
					);
			f.text(x + l.w / 2, 272, l.n, { font: 'display', size: 15, color: '#ededed' });
			x += l.w + 8;
		});
		const panelRight = x - 8;
		f.arrow(
			[
				[panelRight + 2, 162],
				[254, 162],
			],
			{ heads: 'both' },
		);
		f.note(233, 146, 'ribbon', { anchor: 'middle', size: 13 });
		f.box({
			x: 256,
			y: 104,
			w: 186,
			h: 116,
			kind: 'chalk',
			label: 'Raspberry Pi 3B',
			sub: ['+ Adafruit RGB', 'Matrix HAT'],
			subSize: 13,
			logo: 'raspberrypi',
			size: 14,
			stack: true,
		});
		f.arrow([
			[480, 162],
			[444, 162],
		]);
		f.note(462, 146, '5 V', { anchor: 'middle', size: 13, weight: 700 });
		f.box({
			x: 482,
			y: 112,
			w: 126,
			h: 100,
			label: '5 V 4 A',
			sub: 'power supply',
			subSize: 13,
			icon: 'plug',
			size: 15,
			stack: true,
		});
		f.arrow([
			[545, 214],
			[545, 300],
			[604, 300],
		]);
		f.note(560, 286, 'to the wall', { size: 13 });
		LAYERS.forEach((l, i) =>
			f.note(16 + (i % 2) * 300, 330 + Math.floor(i / 2) * 22, `${l.n}  ${l.name}`, { size: 13 }),
		);
	},
};

export const phone = {
	height: 560,
	draw(f) {
		// Front at the top: you look down through the layers
		f.logo('eye', 168, 22, 22);
		f.note(194, 22, 'you, in front', { size: 13 });
		let y = 80;
		LAYERS.forEach((l) => {
			const h = l.grid ? 48 : l.w + 6;
			f.box({ x: 20, y, w: 124, h, kind: l.kind });
			if (l.grid)
				for (let gx = 36; gx < 144; gx += 18)
					f.line(
						[
							[gx, y + 4],
							[gx, y + h - 4],
						],
						{ color: '#ededed', width: 2 },
					);
			const words = l.name.split(', ');
			words.forEach((wd, j) =>
				f.note(156, y + h / 2 + (j - (words.length - 1) / 2) * 17, j ? wd : `${l.n}  ${wd}`, {
					size: 13,
				}),
			);
			y += h + 22;
		});
		f.arrow(
			[
				[82, y - 20],
				[82, y + 22],
			],
			{ heads: 'both' },
		);
		f.note(96, y + 1, 'ribbon cable', { size: 13 });
		y += 24;
		f.box({
			x: 20,
			y,
			w: 320,
			h: 70,
			kind: 'chalk',
			label: 'Raspberry Pi 3B',
			sub: '+ Adafruit RGB Matrix HAT',
			subSize: 13,
			logo: 'raspberrypi',
			size: 15,
		});
		y += 70;
		f.arrow([
			[82, y + 40],
			[82, y + 2],
		]);
		f.note(96, y + 21, '5 V power', { size: 13 });
		y += 42;
		f.box({ x: 20, y, w: 320, h: 56, label: '5 V 4 A power supply', icon: 'plug', size: 15 });
		y += 56;
		// Drawn last but layered first, so it can fit what's inside
		f.group({ x: 8, y: 60, w: 344, h: y + 16 - 60, label: 'Inside the shadow box' });
		f.arrow([
			[180, y + 2],
			[180, y + 50],
		]);
		f.note(194, y + 32, 'to the wall', { size: 13 });
	},
};
