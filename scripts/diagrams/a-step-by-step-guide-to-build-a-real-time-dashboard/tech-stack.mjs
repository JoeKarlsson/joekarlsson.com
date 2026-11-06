export const alt =
	'The dashboard’s stack: events stream into Tinybird, which processes them with SQL in real time and publishes the results as APIs. A Next.js app polls those APIs, and Tremor components turn the responses into the dashboard’s charts.';

export const desktop = {
	height: 330,
	draw(f) {
		f.box({ x: 16, y: 40, w: 120, h: 64, label: 'Events', icon: 'activity', size: 15 });
		f.arrow([
			[138, 72],
			[176, 72],
		]);
		f.group({ x: 178, y: 30, w: 200, h: 266, label: 'Tinybird', logo: 'tinybird' });
		f.box({
			x: 190,
			y: 44,
			w: 176,
			h: 70,
			kind: 'pink',
			label: ['Real-time', 'processing'],
			sub: 'SQL',
			subFont: 'mono',
			icon: 'zap',
			size: 14,
		});
		f.arrow([
			[278, 116],
			[278, 140],
		]);
		f.box({
			x: 190,
			y: 142,
			w: 176,
			h: 60,
			kind: 'pink',
			label: ['Serverless', 'database'],
			icon: 'database',
			size: 14,
		});
		f.arrow([
			[278, 204],
			[278, 222],
		]);
		f.box({
			x: 190,
			y: 224,
			w: 176,
			h: 56,
			kind: 'pink',
			label: 'Real-time APIs',
			icon: 'plug',
			size: 14,
		});
		f.arrow(
			[
				[368, 252],
				[398, 252],
			],
			{ heads: 'both' },
		);
		f.note(383, 300, 'polls', { anchor: 'middle', size: 13 });
		f.box({ x: 400, y: 220, w: 140, h: 64, label: 'Next.js', logo: 'nextdotjs', size: 15 });
		f.arrow([
			[470, 218],
			[470, 160],
		]);
		f.box({
			x: 400,
			y: 96,
			w: 224,
			h: 62,
			kind: 'chalk',
			label: 'Tremor',
			sub: 'charts',
			logo: 'tremor',
			size: 15,
			subSize: 13,
		});
		f.arrow([
			[515, 94],
			[515, 74],
		]);
		f.box({ x: 446, y: 16, w: 178, h: 56, label: 'Dashboard', icon: 'layout-dashboard', size: 15 });
	},
};

export const phone = {
	height: 640,
	draw(f) {
		f.box({ x: 110, y: 16, w: 140, h: 56, label: 'Events', icon: 'activity', size: 15 });
		f.arrow([
			[180, 74],
			[180, 104],
		]);
		f.group({ x: 8, y: 126, w: 344, h: 214, label: 'Tinybird', logo: 'tinybird' });
		f.box({
			x: 20,
			y: 144,
			w: 320,
			h: 54,
			kind: 'pink',
			label: 'Real-time processing',
			sub: 'SQL',
			subFont: 'mono',
			icon: 'zap',
			size: 14,
		});
		f.arrow([
			[180, 200],
			[180, 212],
		]);
		f.box({
			x: 20,
			y: 214,
			w: 320,
			h: 50,
			kind: 'pink',
			label: 'Serverless database',
			icon: 'database',
			size: 14,
		});
		f.arrow([
			[180, 266],
			[180, 278],
		]);
		f.box({
			x: 20,
			y: 280,
			w: 320,
			h: 50,
			kind: 'pink',
			label: 'Real-time APIs',
			icon: 'plug',
			size: 14,
		});
		f.arrow(
			[
				[180, 342],
				[180, 384],
			],
			{ heads: 'both' },
		);
		f.note(194, 363, 'Next.js polls the APIs', { size: 13 });
		f.box({ x: 90, y: 386, w: 180, h: 56, label: 'Next.js', logo: 'nextdotjs', size: 15 });
		f.arrow([
			[180, 444],
			[180, 470],
		]);
		f.box({
			x: 60,
			y: 472,
			w: 240,
			h: 64,
			kind: 'chalk',
			label: 'Tremor',
			sub: 'chart components',
			logo: 'tremor',
			size: 15,
			subSize: 13,
		});
		f.arrow([
			[180, 538],
			[180, 564],
		]);
		f.box({ x: 90, y: 566, w: 180, h: 56, label: 'Dashboard', icon: 'layout-dashboard', size: 15 });
	},
};
