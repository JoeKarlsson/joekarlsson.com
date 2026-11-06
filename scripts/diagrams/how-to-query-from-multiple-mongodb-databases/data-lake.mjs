export const alt =
	'MongoDB Atlas Data Lake: a user sends a standard query to an application, which sends one federated query to the Data Lake compute plane. The compute plane spreads the work across MongoDB nodes in two clusters, three on AWS in US East and three on Google Cloud in US West, each running mongod with an agent.';

const NODES = [1, 2, 3];

/** A cluster: a container of three MongoDB nodes, each running mongod and an agent. */
function cluster(f, { x, y, w, label, nodeH, gap }) {
	const h = 30 + NODES.length * (nodeH + gap);
	f.group({ x, y, w, h, label });
	NODES.forEach((n, i) =>
		f.box({
			x: x + 12,
			y: y + 20 + i * (nodeH + gap),
			w: w - 24,
			h: nodeH,
			label: `Node ${n}`,
			sub: ['mongod', 'and agent'],
			logo: 'mongodb',
			size: 15,
		}),
	);
	return { top: y, bottom: y + h, mid: y + h / 2 };
}

export const desktop = {
	height: 440,
	draw(f) {
		cluster(f, { x: 16, y: 40, w: 180, label: 'AWS, US East', nodeH: 76, gap: 34 });
		cluster(f, { x: 444, y: 40, w: 180, label: 'Google Cloud, US West', nodeH: 76, gap: 34 });
		f.box({
			x: 222,
			y: 120,
			w: 196,
			h: 80,
			kind: 'pink',
			label: ['Data lake', 'compute plane'],
			logo: 'mongodb',
			size: 16,
		});
		f.arrow(
			[
				[220, 160],
				[198, 160],
			],
			{ heads: 'both' },
		);
		f.arrow(
			[
				[420, 160],
				[442, 160],
			],
			{ heads: 'both' },
		);
		f.arrow(
			[
				[320, 202],
				[320, 268],
			],
			{ heads: 'both' },
		);
		f.note(332, 235, 'federated query', { size: 14 });
		f.box({ x: 236, y: 270, w: 168, h: 58, label: 'Application', icon: 'app-window', size: 14 });
		f.arrow(
			[
				[320, 330],
				[320, 362],
			],
			{ heads: 'both' },
		);
		f.note(332, 346, 'standard query', { size: 14 });
		f.box({ x: 256, y: 364, w: 128, h: 54, label: 'User', icon: 'user', size: 15 });
	},
};

export const phone = {
	height: 720,
	draw(f) {
		f.box({ x: 110, y: 16, w: 140, h: 54, label: 'User', icon: 'user', size: 15 });
		f.arrow(
			[
				[180, 72],
				[180, 110],
			],
			{ heads: 'both' },
		);
		f.note(192, 91, 'standard query', { size: 14 });
		f.box({ x: 90, y: 112, w: 180, h: 58, label: 'Application', icon: 'app-window', size: 14 });
		f.arrow(
			[
				[180, 172],
				[180, 210],
			],
			{ heads: 'both' },
		);
		f.note(192, 191, 'federated query', { size: 14 });
		f.box({
			x: 70,
			y: 212,
			w: 220,
			h: 80,
			kind: 'pink',
			label: ['Data lake', 'compute plane'],
			logo: 'mongodb',
			size: 16,
		});
		f.arrow(
			[
				[120, 294],
				[120, 314],
				[86, 314],
				[86, 340],
			],
			{ heads: 'both' },
		);
		f.arrow(
			[
				[240, 294],
				[240, 314],
				[274, 314],
				[274, 340],
			],
			{ heads: 'both' },
		);
		cluster(f, { x: 6, y: 364, w: 164, label: 'AWS, US East', nodeH: 74, gap: 30 });
		cluster(f, { x: 190, y: 364, w: 164, label: 'GCP, US West', nodeH: 74, gap: 30 });
	},
};
