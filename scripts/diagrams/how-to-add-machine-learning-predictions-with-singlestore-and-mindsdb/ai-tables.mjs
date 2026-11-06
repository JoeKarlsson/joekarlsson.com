export const alt =
	'A user queries SingleStore with SQL. MindsDB connects to the same SingleStore cluster, trains on the data stored there, and generates AI Tables, so predictions come back through the same SQL queries.';

export const desktop = {
	height: 330,
	draw(f) {
		f.box({
			x: 16,
			y: 120,
			w: 110,
			h: 84,
			label: 'User',
			sub: 'SQL',
			subFont: 'mono',
			icon: 'user',
			size: 15,
			stack: true,
		});
		f.arrow(
			[
				[128, 162],
				[166, 162],
			],
			{ heads: 'both' },
		);
		f.group({ x: 168, y: 36, w: 230, h: 270, label: 'SingleStore' });
		f.box({
			x: 180,
			y: 116,
			w: 80,
			h: 92,
			kind: 'ink',
			logo: 'singlestore',
			label: 'Cluster',
			size: 13,
			stack: true,
		});
		['Table 1', 'Table 2', 'Table 3'].forEach((t, i) => {
			const y = 56 + i * 82;
			f.box({ x: 270, y, w: 120, h: 64, kind: 'chalk', label: t, size: 13 });
			f.arrow(
				[
					[262, 162],
					[264, 162],
					[264, y + 32],
					[268, y + 32],
				],
				{ heads: 'none' },
			);
		});
		f.arrow(
			[
				[400, 120],
				[470, 120],
			],
			{ heads: 'both' },
		);
		f.note(435, 104, 'trains on', { anchor: 'middle', size: 13 });
		f.group({ x: 472, y: 36, w: 152, h: 180, label: 'MindsDB' });
		f.box({
			x: 484,
			y: 60,
			w: 128,
			h: 110,
			kind: 'pink',
			label: ['AI', 'Tables'],
			logo: 'mindsdb',
			size: 15,
			stack: true,
		});
		f.note(548, 196, 'predictions', { anchor: 'middle', size: 13 });
		f.text(16, 316, 'Predictions are queried like any other table.', {
			font: 'serif',
			size: 16,
			anchor: 'start',
		});
	},
};

export const phone = {
	height: 600,
	draw(f) {
		f.box({
			x: 110,
			y: 16,
			w: 140,
			h: 56,
			label: 'User',
			sub: 'SQL',
			subFont: 'mono',
			icon: 'user',
			size: 15,
		});
		f.arrow(
			[
				[180, 74],
				[180, 112],
			],
			{ heads: 'both' },
		);
		f.group({ x: 8, y: 134, w: 344, h: 168, label: 'SingleStore' });
		const xs = [20, 132, 244];
		['Table 1', 'Table 2', 'Table 3'].forEach((t, i) =>
			f.box({
				x: xs[i],
				y: 158,
				w: 100,
				h: 90,
				kind: 'chalk',
				label: t,
				icon: 'database',
				size: 13,
				stack: true,
			}),
		);
		f.note(20, 280, 'your existing data', { size: 13 });
		f.logo('singlestore', 320, 280, 18);
		f.arrow(
			[
				[180, 304],
				[180, 380],
			],
			{ heads: 'both' },
		);
		f.note(194, 342, 'trains on', { size: 13 });
		f.group({ x: 60, y: 402, w: 240, h: 116, label: 'MindsDB' });
		f.box({
			x: 76,
			y: 422,
			w: 208,
			h: 76,
			kind: 'pink',
			label: 'AI Tables',
			sub: 'predictions',
			subSize: 13,
			logo: 'mindsdb',
			size: 15,
		});
		f.text(16, 560, 'Predictions are queried like', { font: 'serif', size: 16, anchor: 'start' });
		f.text(16, 582, 'any other table.', { font: 'serif', size: 16, anchor: 'start' });
	},
};
