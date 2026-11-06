import { apps, sources } from './_sources.mjs';

export const alt =
	'Tinybird in one piece: event streams, APIs and databases flow in through native connectors, and Tinybird stores the data for OLAP queries, transforms it with SQL, and publishes the results as low-latency APIs that the applications call, with no glue code in between.';

const STEPS = [
	{ label: 'Store', sub: 'OLAP', icon: 'database' },
	{ label: 'Transform', sub: 'SQL', icon: 'zap' },
	{ label: 'Publish', sub: 'APIs', icon: 'plug' },
];

export const desktop = {
	height: 330,
	draw(f) {
		const outs = sources(f, {});
		outs.forEach(([x, y]) =>
			f.arrow([
				[x, y],
				[170, y],
				[170, 162],
				[182, 162],
			]),
		);
		f.group({ x: 184, y: 46, w: 300, h: 232, label: 'Tinybird', logo: 'tinybird' });
		STEPS.forEach((s, i) => {
			const y = 64 + i * 70;
			f.box({ x: 214, y, w: 240, h: 58, kind: 'pink', size: 15, subSize: 13, ...s });
			if (i < 2)
				f.arrow([
					[334, y + 60],
					[334, y + 68],
				]);
		});
		const ins = apps(f, {});
		ins.forEach(([x, y]) =>
			f.arrow(
				[
					[456, 233],
					[494, 233],
					[494, y],
					[x, y],
				],
				{ heads: 'both' },
			),
		);
		f.note(320, 308, 'No glue code: no ETL into a cache, no ORM.', { anchor: 'middle', size: 14 });
	},
};

export const phone = {
	height: 620,
	draw(f) {
		const outs = sources(f, { phone: true });
		outs.forEach(([x, y]) =>
			f.arrow([
				[x, y],
				[x, 126],
				[180, 126],
				[180, 158],
			]),
		);
		f.group({ x: 8, y: 160, w: 344, h: 240, label: 'Tinybird', logo: 'tinybird' });
		STEPS.forEach((s, i) => {
			const y = 178 + i * 74;
			f.box({ x: 40, y, w: 280, h: 60, kind: 'pink', size: 15, subSize: 13, ...s });
			if (i < 2)
				f.arrow([
					[180, y + 62],
					[180, y + 72],
				]);
		});
		f.arrow(
			[
				[180, 402],
				[180, 432],
			],
			{ heads: 'none' },
		);
		const ins = apps(f, { phone: true, y: 458 });
		ins.forEach(([x, y]) =>
			f.arrow(
				[
					[180, 432],
					[x, 432],
					[x, y],
				],
				{ heads: 'both' },
			),
		);
		f.note(180, 572, 'No glue code: no ETL, no ORM.', { anchor: 'middle', size: 14 });
	},
};
