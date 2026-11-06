import { tradeoffs } from './_approach.mjs';

export const alt =
	'The script-based approach: cron jobs and custom scripts run kubectl against each Kubernetes cluster. It falls short on maintenance, breaks when cluster configurations change, struggles with authentication and rate limits, and slows down at scale.';

const BAD = ['hard to maintain', 'breaks on change', 'auth and rate limits', 'slows down at scale'];

export const desktop = {
	height: 300,
	draw(f) {
		f.box({
			x: 12,
			y: 104,
			w: 150,
			h: 76,
			label: ['Cron jobs,', 'scripts'],
			icon: 'calendar-clock',
			size: 14,
		});
		f.arrow(
			[
				[164, 142],
				[184, 142],
			],
			{ heads: 'both' },
		);
		f.box({ x: 186, y: 114, w: 96, h: 56, label: 'kubectl', font: 'mono', size: 15 });
		const ys = [30, 114, 198];
		ys.forEach((y) =>
			f.arrow(
				[
					[284, 142],
					[296, 142],
					[296, y + 28],
					[308, y + 28],
				],
				{ heads: 'both' },
			),
		);
		ys.forEach((y, i) =>
			f.box({ x: 310, y, w: 140, h: 56, label: `Cluster ${i + 1}`, logo: 'kubernetes', size: 14 }),
		);
		tradeoffs(f, { x: 464, y: 54, w: 160, bad: BAD, size: 14 });
	},
};

export const phone = {
	height: 470,
	draw(f) {
		f.box({
			x: 90,
			y: 16,
			w: 180,
			h: 60,
			label: ['Cron jobs,', 'scripts'],
			icon: 'calendar-clock',
			size: 15,
		});
		f.arrow(
			[
				[180, 78],
				[180, 104],
			],
			{ heads: 'both' },
		);
		f.box({ x: 120, y: 106, w: 120, h: 50, label: 'kubectl', font: 'mono', size: 15 });
		const xs = [66, 180, 294];
		xs.forEach((cx) =>
			f.arrow(
				[
					[180, 158],
					[180, 176],
					[cx, 176],
					[cx, 196],
				],
				{ heads: 'both' },
			),
		);
		xs.forEach((cx, i) =>
			f.box({
				x: cx - 54,
				y: 198,
				w: 108,
				h: 86,
				label: `Cluster ${i + 1}`,
				logo: 'kubernetes',
				size: 14,
				stack: true,
			}),
		);
		tradeoffs(f, { x: 8, y: 326, w: 344, bad: BAD, size: 14 });
	},
};
