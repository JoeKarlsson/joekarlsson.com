export const alt =
	'Four best practices for Kubernetes asset management: centralized visibility across every cluster, a consistent labeling strategy (team, app, env), automated data collection, and governance of custom resources.';

const PRACTICES = [
	{
		label: ['Centralized', 'visibility'],
		sub: 'every cluster in one view',
		icon: 'layout-dashboard',
		kind: 'pink',
	},
	{ label: ['Consistent', 'labels'], sub: 'team, app, env', icon: 'tags' },
	{ label: ['Automated', 'collection'], sub: 'no manual scripts', icon: 'refresh-cw' },
	{ label: ['Governed', 'CRDs'], sub: 'custom resources under policy', icon: 'shield-check' },
];

export const desktop = {
	height: 300,
	draw(f) {
		f.logo('kubernetes', 16, 24, 26);
		f.heading(52, 24, 'Asset management best practices', { size: 22 });
		PRACTICES.forEach((p, i) =>
			f.box({
				x: 16 + (i % 2) * 308,
				y: 56 + Math.floor(i / 2) * 118,
				w: 300,
				h: 106,
				size: 16,
				subSize: 14,
				...p,
			}),
		);
	},
};

export const phone = {
	height: 560,
	draw(f) {
		f.logo('kubernetes', 8, 20, 22);
		f.heading(38, 20, 'Best practices', { size: 20 });
		PRACTICES.forEach((p, i) =>
			f.box({ x: 8, y: 46 + i * 126, w: 344, h: 112, size: 16, subSize: 14, ...p }),
		);
	},
};
