export const alt =
	'CloudQuery’s pipeline in five steps: sync cloud data from AWS, Azure and Google Cloud; sync and transform it with CloudQuery; persist it in ClickHouse; analyze it; and visualize it.';

const CLOUDS = [
	['AWS', 'amazonwebservices'],
	['Azure', 'microsoftazure'],
	[['Google', 'Cloud'], 'googlecloud'],
];

export const desktop = {
	height: 330,
	draw(f) {
		f.group({ x: 16, y: 40, w: 128, h: 266, label: '1. Sync' });
		CLOUDS.forEach(([name, logo], i) =>
			f.box({
				x: 26,
				y: 54 + i * 82,
				w: 108,
				h: 78,
				kind: 'ink',
				label: name,
				logo,
				size: 13,
				stack: true,
			}),
		);
		f.arrow([
			[146, 150],
			[164, 150],
		]);
		f.box({
			x: 166,
			y: 104,
			w: 176,
			h: 92,
			wordmark: 'cloudquery-on-dark',
			sub: ['2. sync and', 'transform'],
		});
		f.arrow([
			[344, 150],
			[362, 150],
		]);
		f.box({
			x: 364,
			y: 98,
			w: 128,
			h: 104,
			kind: 'pink',
			label: 'ClickHouse',
			sub: '3. persist',
			logo: 'clickhouse',
			size: 14,
			stack: true,
		});
		f.arrow([
			[494, 150],
			[504, 150],
			[504, 96],
			[512, 96],
		]);
		f.box({
			x: 514,
			y: 48,
			w: 110,
			h: 100,
			label: 'Analyze',
			sub: 'step 4',
			icon: 'search',
			size: 14,
			stack: true,
		});
		f.arrow([
			[569, 150],
			[569, 174],
		]);
		f.box({
			x: 514,
			y: 176,
			w: 110,
			h: 100,
			label: 'Visualize',
			sub: 'step 5',
			icon: 'chart-line',
			size: 14,
			stack: true,
		});
	},
};

export const phone = {
	height: 680,
	draw(f) {
		f.group({ x: 8, y: 40, w: 344, h: 112, label: '1. Sync cloud data' });
		CLOUDS.forEach(([name, logo], i) =>
			f.box({
				x: 18 + i * 110,
				y: 52,
				w: 104,
				h: 92,
				kind: 'ink',
				label: name,
				logo,
				size: 13,
				stack: true,
			}),
		);
		f.arrow([
			[180, 152],
			[180, 186],
		]);
		f.box({
			x: 60,
			y: 188,
			w: 240,
			h: 92,
			wordmark: 'cloudquery-on-dark',
			sub: '2. sync and transform',
		});
		f.arrow([
			[180, 282],
			[180, 312],
		]);
		f.box({
			x: 60,
			y: 314,
			w: 240,
			h: 64,
			kind: 'pink',
			label: 'ClickHouse',
			sub: '3. persist',
			logo: 'clickhouse',
			size: 15,
		});
		f.arrow([
			[180, 380],
			[180, 410],
		]);
		f.box({
			x: 60,
			y: 412,
			w: 240,
			h: 64,
			label: 'Analyze',
			sub: 'step 4',
			icon: 'search',
			size: 15,
		});
		f.arrow([
			[180, 478],
			[180, 508],
		]);
		f.box({
			x: 60,
			y: 510,
			w: 240,
			h: 64,
			label: 'Visualize',
			sub: 'step 5',
			icon: 'chart-line',
			size: 15,
		});
	},
};
