export const alt =
	'A typical architecture for an app over streaming data: Kafka feeds Flink, which feeds ClickHouse, which feeds a backend and ORM, which serves APIs to the frontend. Six systems to build and run.';

const STEPS = [
	{ label: 'Kafka', logo: 'apachekafka' },
	{ label: 'Flink', logo: 'apacheflink' },
	{ label: 'ClickHouse', logo: 'clickhouse' },
	{ label: ['Backend,', 'ORM'], icon: 'code-xml' },
	{ label: 'APIs', icon: 'plug' },
	{ label: 'Frontend', icon: 'monitor' },
];

export const desktop = {
	height: 280,
	draw(f) {
		// Two rows of three, read left to right, then down and left to right again
		const xs = [16, 232, 448];
		STEPS.forEach((s, i) =>
			f.box({ x: xs[i % 3], y: i < 3 ? 40 : 170, w: 176, h: 64, size: 15, ...s }),
		);
		[0, 1].forEach((i) =>
			f.arrow([
				[xs[i] + 178, 72],
				[xs[i + 1] - 2, 72],
			]),
		);
		f.arrow([
			[536, 106],
			[536, 136],
			[104, 136],
			[104, 168],
		]);
		[0, 1].forEach((i) =>
			f.arrow([
				[xs[i] + 178, 202],
				[xs[i + 1] - 2, 202],
			]),
		);
		f.note(320, 258, 'Six systems to build, connect and run.', { anchor: 'middle' });
	},
};

export const phone = {
	height: 560,
	draw(f) {
		STEPS.forEach((s, i) => {
			f.box({ x: 90, y: 16 + i * 84, w: 180, h: 58, size: 15, ...s });
			if (i < STEPS.length - 1)
				f.arrow([
					[180, 16 + i * 84 + 60],
					[180, 16 + (i + 1) * 84 - 2],
				]);
		});
		f.note(180, 536, 'Six systems to build, connect and run.', { anchor: 'middle', size: 14 });
	},
};
