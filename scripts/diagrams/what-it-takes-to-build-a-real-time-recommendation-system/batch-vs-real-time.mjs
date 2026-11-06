export const alt =
	'Batch versus real-time recommendations. In a batch system, user events land in a data warehouse, a scheduled batch ETL job feeds the recommendation system, and the application gets recommendations minutes or hours later. In a real-time system, user events go straight into a streaming data platform, the real-time recommendation system reads them immediately, and the application gets recommendations in milliseconds.';

/** One row of the comparison: a container of steps joined by labelled arrows. */
function row(f, { y, label, steps, notes, result, kind, phone }) {
	if (phone) {
		const h = 34 + steps.length * 72 + 28;
		f.group({ x: 8, y, w: 344, h, label });
		steps.forEach((s, i) => {
			const sy = y + 18 + i * 72;
			f.box({
				x: 40,
				y: sy,
				w: 280,
				h: 50,
				size: 14,
				kind: i === steps.length - 2 ? kind : 'outline',
				...s,
			});
			if (i < steps.length - 1) {
				f.arrow([
					[180, sy + 52],
					[180, sy + 70],
				]);
				if (notes[i]) f.note(192, sy + 61, notes[i], { size: 13 });
			}
		});
		f.text(20, y + h - 16, result, { size: 14, anchor: 'start', weight: 700 });
		return;
	}
	const n = steps.length;
	const w = (592 - (n - 1) * 34) / n;
	f.group({ x: 16, y, w: 608, h: 160, label });
	steps.forEach((s, i) => {
		const x = 24 + i * (w + 34);
		f.box({
			x,
			y: y + 18,
			w,
			h: 100,
			size: 13,
			kind: i === n - 2 ? kind : 'outline',
			stack: true,
			...s,
		});
		if (i < n - 1) {
			f.arrow([
				[x + w + 2, y + 68],
				[x + w + 32, y + 68],
			]);
			if (notes[i]) f.note(x + w + 17, y + 132, notes[i], { anchor: 'middle', size: 12 });
		}
	});
	f.text(608, y + 148, result, { size: 14, anchor: 'end', weight: 700 });
}

const BATCH = {
	label: 'Batch',
	steps: [
		{ label: 'Users', icon: 'users' },
		{ label: ['Data', 'warehouse'], icon: 'warehouse' },
		{ label: ['Batch', 'ETL'], icon: 'settings' },
		{ label: ['Recommen-', 'dations'], icon: 'sparkles' },
		{ label: 'App', icon: 'app-window' },
	],
	notes: ['events', 'scheduled', '', 'high latency'],
	result: 'minutes or hours',
	kind: 'chalk',
};
const REAL_TIME = {
	label: 'Real-time',
	steps: [
		{ label: 'Users', icon: 'users' },
		{ label: ['Streaming', 'platform'], logo: 'apachekafka' },
		{ label: ['Live recs'], sub: 'real-time', icon: 'sparkles' },
		{ label: 'App', icon: 'app-window' },
	],
	notes: ['events', 'immediate', 'low latency'],
	result: 'milliseconds',
	kind: 'pink',
};

export const desktop = {
	height: 430,
	draw(f) {
		row(f, { y: 36, ...BATCH });
		row(f, { y: 250, ...REAL_TIME });
	},
};

export const phone = {
	height: 860,
	draw(f) {
		const flat = (r) => ({
			...r,
			steps: r.steps.map((s) => ({ ...s, label: [s.label].flat().join(' ').replace('- ', '') })),
		});
		row(f, { y: 36, phone: true, ...flat(BATCH) });
		row(f, { y: 500, phone: true, ...flat(REAL_TIME) });
	},
};
