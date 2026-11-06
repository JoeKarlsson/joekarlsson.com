// The tutorial series' stack: one cloud's assets through CloudQuery into PostgreSQL,
// with dbt transforming the data inside the warehouse.

export function elt(f, { cloud, phone }) {
	if (phone) {
		f.box({
			x: 70,
			y: 16,
			w: 220,
			h: 60,
			label: cloud.label,
			sub: 'your account',
			subSize: 13,
			logo: cloud.logo,
			size: 15,
		});
		f.arrow([
			[180, 78],
			[180, 106],
		]);
		f.box({
			x: 60,
			y: 108,
			w: 240,
			h: 80,
			kind: 'chalk',
			wordmark: 'cloudquery',
			sub: 'ELT: extract, load',
		});
		f.arrow([
			[180, 190],
			[180, 218],
		]);
		f.box({
			x: 60,
			y: 220,
			w: 240,
			h: 64,
			kind: 'pink',
			label: 'PostgreSQL',
			sub: 'warehouse',
			subSize: 13,
			logo: 'postgresql',
			size: 15,
		});
		f.arrow(
			[
				[180, 286],
				[180, 330],
			],
			{ heads: 'both' },
		);
		f.note(194, 308, 'transform in place', { size: 13 });
		f.box({
			x: 70,
			y: 332,
			w: 220,
			h: 60,
			label: 'dbt',
			sub: 'transformations',
			subSize: 13,
			logo: 'dbt',
			size: 15,
		});
		return;
	}
	f.box({
		x: 16,
		y: 52,
		w: 150,
		h: 88,
		label: cloud.label,
		sub: 'your account',
		subSize: 13,
		logo: cloud.logo,
		size: 14,
		stack: true,
	});
	f.arrow([
		[168, 96],
		[200, 96],
	]);
	f.box({
		x: 202,
		y: 52,
		w: 196,
		h: 88,
		kind: 'chalk',
		wordmark: 'cloudquery',
		sub: 'ELT: extract, load',
	});
	f.arrow([
		[400, 96],
		[432, 96],
	]);
	f.box({
		x: 434,
		y: 60,
		w: 190,
		h: 72,
		kind: 'pink',
		label: 'PostgreSQL',
		sub: 'warehouse',
		subSize: 13,
		logo: 'postgresql',
		size: 15,
	});
	f.arrow(
		[
			[529, 134],
			[529, 186],
		],
		{ heads: 'both' },
	);
	f.note(517, 160, 'transform in place', { anchor: 'end', size: 13 });
	f.box({
		x: 434,
		y: 188,
		w: 190,
		h: 64,
		label: 'dbt',
		sub: 'transformations',
		subSize: 13,
		logo: 'dbt',
		size: 15,
	});
}
