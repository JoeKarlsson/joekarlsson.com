export const alt =
	'An application sends its requests to an AI gateway, which handles routes, rate limits, caching and observability, and passes each request on to OpenAI, Anthropic or an open-source model.';

const PROVIDERS = [
	{ label: 'OpenAI', logo: 'openai' },
	{ label: 'Anthropic', logo: 'anthropic' },
	{ label: ['Open-source', 'models'], icon: 'git-fork' },
];

export const desktop = {
	height: 300,
	draw(f) {
		f.box({ x: 16, y: 116, w: 150, h: 64, label: 'Application', icon: 'app-window', size: 14 });
		f.arrow(
			[
				[168, 148],
				[206, 148],
			],
			{ heads: 'both' },
		);
		f.box({
			x: 208,
			y: 70,
			w: 210,
			h: 156,
			kind: 'pink',
			label: 'AI gateway',
			sub: ['routes', 'rate limits', 'caching', 'observability'],
			icon: 'route',
		});
		const ys = [30, 116, 202];
		ys.forEach((y) =>
			f.arrow(
				[
					[420, 148],
					[440, 148],
					[440, y + 32],
					[460, y + 32],
				],
				{ heads: 'both' },
			),
		);
		PROVIDERS.forEach((p, i) => f.box({ x: 462, y: ys[i], w: 162, h: 64, size: 15, ...p }));
	},
};

export const phone = {
	height: 520,
	draw(f) {
		f.box({ x: 90, y: 16, w: 180, h: 58, label: 'Application', icon: 'app-window', size: 15 });
		f.arrow(
			[
				[180, 76],
				[180, 110],
			],
			{ heads: 'both' },
		);
		f.box({
			x: 60,
			y: 112,
			w: 240,
			h: 150,
			kind: 'pink',
			label: 'AI gateway',
			sub: ['routes', 'rate limits', 'caching', 'observability'],
			icon: 'route',
		});
		const xs = [64, 180, 296];
		xs.forEach((cx) =>
			f.arrow(
				[
					[180, 264],
					[180, 290],
					[cx, 290],
					[cx, 318],
				],
				{ heads: 'both' },
			),
		);
		PROVIDERS.forEach((p, i) =>
			f.box({ x: xs[i] - 54, y: 320, w: 108, h: 112, size: 14, stack: true, ...p }),
		);
	},
};
