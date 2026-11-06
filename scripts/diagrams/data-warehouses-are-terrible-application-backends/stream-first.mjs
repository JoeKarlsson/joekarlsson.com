import { apps, sources } from './_sources.mjs';

export const alt =
	'The second approach: event streams, APIs and databases go straight into Tinybird as the data is created, so it transforms the data and serves the applications with no freshness lag. The data warehouse can still receive the same data in parallel, or be skipped entirely.';

export const desktop = {
	height: 340,
	draw(f) {
		const outs = sources(f, {});
		outs.forEach(([x, y]) =>
			f.arrow([
				[x, y],
				[250, y],
				[250, 112],
				[282, 112],
			]),
		);
		f.box({
			x: 284,
			y: 76,
			w: 140,
			h: 72,
			kind: 'pink',
			label: 'Tinybird',
			logo: 'tinybird-mark',
			size: 15,
		});
		const ins = apps(f, {});
		ins.forEach(([x, y]) =>
			f.arrow(
				[
					[426, 112],
					[470, 112],
					[470, y],
					[x, y],
				],
				{ heads: 'both' },
			),
		);
		f.arrow(
			[
				[250, 252],
				[250, 280],
				[282, 280],
			],
			{ dashed: true },
		);
		f.box({
			x: 284,
			y: 240,
			w: 160,
			h: 80,
			kind: 'dashed',
			label: ['Data', 'warehouse'],
			sub: 'optional',
			subSize: 13,
			icon: 'warehouse',
			size: 14,
		});
		f.note(354, 196, 'or in parallel', { anchor: 'middle', size: 13 });
	},
};

export const phone = {
	height: 560,
	draw(f) {
		const outs = sources(f, { phone: true });
		outs.forEach(([x, y]) =>
			f.arrow([
				[x, y],
				[x, 126],
				[180, 126],
				[180, 144],
			]),
		);
		f.box({
			x: 90,
			y: 146,
			w: 180,
			h: 60,
			kind: 'pink',
			label: 'Tinybird',
			logo: 'tinybird-mark',
			size: 15,
		});
		f.arrow(
			[
				[180, 208],
				[180, 228],
			],
			{ heads: 'none' },
		);
		const ins = apps(f, { phone: true, y: 254 });
		ins.forEach(([x, y]) =>
			f.arrow(
				[
					[180, 228],
					[x, 228],
					[x, y],
				],
				{ heads: 'both' },
			),
		);
		f.note(16, 372, 'Or, in parallel, the same data', { size: 13 });
		f.note(16, 392, 'can still go to the warehouse:', { size: 13 });
		f.box({
			x: 88,
			y: 412,
			w: 184,
			h: 84,
			kind: 'dashed',
			label: ['Data', 'warehouse'],
			sub: 'optional',
			subSize: 13,
			icon: 'warehouse',
			size: 14,
		});
	},
};
