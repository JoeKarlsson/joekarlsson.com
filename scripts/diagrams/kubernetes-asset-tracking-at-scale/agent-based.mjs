import { tradeoffs } from './_approach.mjs';

export const alt =
	'The agent-based approach: an agent runs inside each Kubernetes cluster and reports to a central platform. It gives near real-time visibility, but the agents use resources in every cluster, get harder to manage as clusters grow, and focus on metrics over configuration.';

const GOOD = ['near real-time visibility'];
const BAD = [
	'agents use cluster resources',
	'harder to manage at scale',
	'metrics over configuration',
];

export const desktop = {
	height: 330,
	draw(f) {
		const ys = [30, 118, 206];
		ys.forEach((y, i) =>
			f.box({
				x: 16,
				y,
				w: 150,
				h: 76,
				label: `Cluster ${i + 1}`,
				sub: ['runs an', 'agent'],
				logo: 'kubernetes',
				size: 14,
			}),
		);
		ys.forEach((y) =>
			f.arrow([
				[168, y + 38],
				[188, y + 38],
				[188, 150],
				[208, 150],
			]),
		);
		f.box({
			x: 210,
			y: 116,
			w: 150,
			h: 68,
			label: ['Central', 'platform'],
			icon: 'server',
			size: 15,
		});
		tradeoffs(f, { x: 384, y: 40, w: 240, good: GOOD, bad: BAD, size: 14 });
	},
};

export const phone = {
	height: 500,
	draw(f) {
		const xs = [66, 180, 294];
		xs.forEach((cx, i) =>
			f.box({
				x: cx - 54,
				y: 16,
				w: 108,
				h: 104,
				label: `Cluster ${i + 1}`,
				sub: ['runs an', 'agent'],
				logo: 'kubernetes',
				size: 14,
				stack: true,
			}),
		);
		xs.forEach((cx) =>
			f.arrow([
				[cx, 122],
				[cx, 140],
				[180, 140],
				[180, 162],
			]),
		);
		f.box({
			x: 90,
			y: 164,
			w: 180,
			h: 62,
			label: ['Central', 'platform'],
			icon: 'server',
			size: 15,
		});
		tradeoffs(f, { x: 8, y: 270, w: 344, good: GOOD, bad: BAD, size: 14 });
	},
};
