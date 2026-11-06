import { apps, sources } from './_sources.mjs';

export const alt =
	'The common cache-layer approach: event streams, APIs and databases load into the data warehouse, an ETL job copies data into a cache like Redis, an ORM reads the cache, and an API serves the applications. Queries get fast, but the data is only as fresh as the last ETL run.';

const MIDDLE = [
	{ label: ['Data', 'warehouse'], icon: 'warehouse' },
	{ label: 'Cache', icon: 'layers' },
	{ label: 'API', icon: 'plug', kind: 'pink' },
];

export const desktop = {
	height: 340,
	draw(f) {
		const outs = sources(f, {});
		outs.forEach(([x, y]) =>
			f.arrow([
				[x, y],
				[166, y],
				[166, 162],
				[176, 162],
			]),
		);
		const xs = [178, 290, 398];
		const ws = [92, 90, 84];
		MIDDLE.forEach((m, i) =>
			f.box({ x: xs[i], y: 120, w: ws[i], h: 84, size: 13, stack: true, ...m }),
		);
		f.arrow([
			[272, 162],
			[288, 162],
		]);
		f.note(280, 110, 'ETL', { anchor: 'middle', size: 13, weight: 700 });
		f.arrow([
			[382, 162],
			[396, 162],
		]);
		f.note(389, 110, 'ORM', { anchor: 'middle', size: 13, weight: 700 });
		const ins = apps(f, {});
		ins.forEach(([x, y]) =>
			f.arrow(
				[
					[484, 162],
					[496, 162],
					[496, y],
					[x, y],
				],
				{ heads: 'both' },
			),
		);
		f.text(16, 316, 'Fast, but only as fresh as the last ETL run.', {
			font: 'serif',
			size: 16,
			anchor: 'start',
		});
		f.crayonArrow([300, 302], [282, 206], 24);
	},
};

export const phone = {
	height: 700,
	draw(f) {
		const outs = sources(f, { phone: true });
		outs.forEach(([x, y]) =>
			f.arrow([
				[x, y],
				[x, 124],
				[180, 124],
				[180, 144],
			]),
		);
		f.box({ x: 90, y: 146, w: 180, h: 60, size: 14, ...MIDDLE[0] });
		f.arrow([
			[180, 208],
			[180, 246],
		]);
		f.note(194, 227, 'ETL', { size: 13, weight: 700 });
		f.box({ x: 90, y: 248, w: 180, h: 60, size: 14, ...MIDDLE[1] });
		f.arrow([
			[180, 310],
			[180, 348],
		]);
		f.note(194, 329, 'ORM', { size: 13, weight: 700 });
		f.box({ x: 90, y: 350, w: 180, h: 60, size: 14, ...MIDDLE[2] });
		const ins = apps(f, { phone: true, y: 450 });
		ins.forEach(([x, y]) =>
			f.arrow(
				[
					[180, 412],
					[180, 430],
					[x, 430],
					[x, y],
				],
				{ heads: 'both' },
			),
		);
		f.text(16, 590, 'Fast, but only as fresh as', { font: 'serif', size: 16, anchor: 'start' });
		f.text(16, 612, 'the last ETL run.', { font: 'serif', size: 16, anchor: 'start' });
		f.crayonArrow([200, 586], [196, 538], 6);
	},
};
