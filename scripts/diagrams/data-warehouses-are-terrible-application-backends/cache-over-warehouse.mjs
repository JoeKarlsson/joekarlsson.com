import { apps, sources } from './_sources.mjs';

export const alt =
	'The first approach: event streams, APIs and databases still load into the data warehouse, and Tinybird syncs from it through a native connector, on a schedule or on ingestion, and serves the applications. It works like a cache over the warehouse with no custom ORM code, but the data is only as fresh as the last sync.';

export const desktop = {
	height: 340,
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
		f.box({
			x: 184,
			y: 126,
			w: 140,
			h: 72,
			label: ['Data', 'warehouse'],
			icon: 'warehouse',
			size: 14,
		});
		f.arrow([
			[326, 162],
			[348, 162],
		]);
		f.note(337, 108, 'native connector', { anchor: 'middle', size: 12 });
		f.box({
			x: 350,
			y: 126,
			w: 130,
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
					[482, 162],
					[494, 162],
					[494, y],
					[x, y],
				],
				{ heads: 'both' },
			),
		);
		f.text(16, 316, 'Fresh only as of the last sync.', {
			font: 'serif',
			size: 16,
			anchor: 'start',
		});
		f.crayonArrow([270, 302], [380, 202], 30);
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
		f.box({ x: 90, y: 146, w: 180, h: 60, label: 'Data warehouse', icon: 'warehouse', size: 14 });
		f.arrow([
			[180, 208],
			[180, 252],
		]);
		f.note(194, 230, 'native connector', { size: 13 });
		f.box({
			x: 90,
			y: 254,
			w: 180,
			h: 60,
			kind: 'pink',
			label: 'Tinybird',
			logo: 'tinybird-mark',
			size: 15,
		});
		f.arrow(
			[
				[180, 316],
				[180, 396],
			],
			{ heads: 'none' },
		);
		const ins = apps(f, { phone: true, y: 420 });
		ins.forEach(([x, y]) =>
			f.arrow(
				[
					[180, 396],
					[x, 396],
					[x, y],
				],
				{ heads: 'both' },
			),
		);
		f.text(196, 342, 'Fresh only as of', { font: 'serif', size: 16, anchor: 'start' });
		f.text(196, 364, 'the last sync.', { font: 'serif', size: 16, anchor: 'start' });
		f.crayonArrow([290, 330], [272, 300], 12);
	},
};
