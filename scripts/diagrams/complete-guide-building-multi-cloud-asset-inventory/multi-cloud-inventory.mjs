export const alt =
	'A multi-cloud asset inventory powered by CloudQuery: asset data from AWS, Google Cloud and Microsoft Azure goes through CloudQuery’s ETL into a PostgreSQL database, which feeds analytics and visualizations.';

const CLOUDS = [
	{ label: 'AWS', logo: 'amazonwebservices' },
	{ label: 'Google Cloud', logo: 'googlecloud' },
	{ label: 'Azure', logo: 'microsoftazure' },
];

export const desktop = {
	height: 290,
	draw(f) {
		f.group({ x: 8, y: 36, w: 168, h: 226, label: 'Your clouds' });
		CLOUDS.forEach((c, i) =>
			f.box({ x: 16, y: 54 + i * 68, w: 152, h: 56, kind: 'ink', size: 13, ...c }),
		);
		f.arrow([
			[178, 149],
			[196, 149],
		]);
		f.box({ x: 198, y: 104, w: 176, h: 90, kind: 'chalk', wordmark: 'cloudquery', sub: 'ETL' });
		f.arrow([
			[376, 149],
			[392, 149],
		]);
		f.box({
			x: 394,
			y: 104,
			w: 116,
			h: 90,
			kind: 'pink',
			label: 'PostgreSQL',
			logo: 'postgresql',
			size: 13,
			stack: true,
		});
		f.arrow([
			[512, 149],
			[520, 149],
			[520, 90],
			[530, 90],
		]);
		f.arrow([
			[520, 149],
			[520, 212],
			[530, 212],
		]);
		f.box({
			x: 532,
			y: 48,
			w: 92,
			h: 84,
			label: 'Analytics',
			icon: 'chart-line',
			size: 12,
			stack: true,
		});
		f.box({
			x: 532,
			y: 166,
			w: 92,
			h: 96,
			label: ['Visuali-', 'zations'],
			icon: 'chart-pie',
			size: 12,
			stack: true,
		});
	},
};

export const phone = {
	height: 620,
	draw(f) {
		f.group({ x: 8, y: 36, w: 344, h: 124, label: 'Your clouds' });
		CLOUDS.forEach((c, i) =>
			f.box({
				x: 18 + i * 110,
				y: 52,
				w: 104,
				h: 96,
				kind: 'ink',
				size: 13,
				stack: true,
				...c,
				label: c.label === 'Google Cloud' ? ['Google', 'Cloud'] : c.label,
			}),
		);
		f.arrow([
			[180, 162],
			[180, 196],
		]);
		f.box({ x: 70, y: 198, w: 220, h: 84, kind: 'chalk', wordmark: 'cloudquery', sub: 'ETL' });
		f.arrow([
			[180, 284],
			[180, 318],
		]);
		f.box({
			x: 90,
			y: 320,
			w: 180,
			h: 60,
			kind: 'pink',
			label: 'PostgreSQL',
			logo: 'postgresql',
			size: 15,
		});
		f.arrow([
			[180, 382],
			[180, 406],
			[96, 406],
			[96, 430],
		]);
		f.arrow([
			[180, 406],
			[264, 406],
			[264, 430],
		]);
		f.box({
			x: 16,
			y: 432,
			w: 160,
			h: 90,
			label: 'Analytics',
			icon: 'chart-line',
			size: 14,
			stack: true,
		});
		f.box({
			x: 184,
			y: 432,
			w: 160,
			h: 90,
			label: ['Visuali-', 'zations'],
			icon: 'chart-pie',
			size: 14,
			stack: true,
		});
	},
};
