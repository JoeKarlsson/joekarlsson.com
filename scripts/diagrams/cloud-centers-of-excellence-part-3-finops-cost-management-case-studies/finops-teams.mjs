export const alt =
	'Organizations saying their FinOps team does some or all FinOps tasks: 51% in 2024 and 59% in 2025.';

const BARS = [
	{ label: '2024', value: 51 },
	{ label: '2025', value: 59, highlight: true },
];
const format = (v) => `${v}%`;

export const desktop = {
	height: 250,
	draw(f) {
		f.heading(16, 24, 'Organizations with a FinOps team', { size: 22 });
		f.note(16, 52, '“Yes, our FinOps team does some or all of these tasks”', { size: 14 });
		f.barChart({
			x: 16,
			y: 72,
			w: 608,
			h: 120,
			bars: BARS,
			format,
			max: 100,
			horizontal: true,
			labelW: 70,
			size: 16,
		});
		f.note(16, 220, 'Bars run to 100%. Source: Flexera State of the Cloud.', { size: 13 });
	},
};

export const phone = {
	height: 260,
	draw(f) {
		f.heading(16, 24, 'Orgs with a FinOps team', { size: 20 });
		f.note(16, 52, 'does some or all FinOps tasks', { size: 14 });
		f.barChart({
			x: 8,
			y: 72,
			w: 344,
			h: 120,
			bars: BARS,
			format,
			max: 100,
			horizontal: true,
			labelW: 60,
			size: 15,
		});
		f.note(16, 214, 'Bars run to 100%.', { size: 13 });
		f.note(16, 234, 'Source: Flexera State of the Cloud.', { size: 13 });
	},
};
