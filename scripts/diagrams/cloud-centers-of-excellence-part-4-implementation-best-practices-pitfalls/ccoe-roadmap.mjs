export const alt =
	'A 12-stage roadmap for building a Cloud Center of Excellence: 1 executive sponsorship and objectives, 2 charter and governance model, 3 cross-functional core team, 4 key workstreams and domains, 5 governance frameworks and tools, 6 self-service enablement (landing zone), 7 pilot projects and iteration, 8 communication and collaboration, 9 training and upskilling, 10 metrics and monitoring, 11 scale and evolve, 12 avoid common pitfalls.';

const STAGES = [
	['Executive', 'sponsorship,', 'objectives'],
	['Charter and', 'governance', 'model'],
	['Cross-', 'functional', 'core team'],
	['Key workstreams', 'and domains'],
	['Governance', 'frameworks', 'and tools'],
	['Self-service', 'enablement', '(landing zone)'],
	['Pilot projects', 'and iteration'],
	['Communication', 'and', 'collaboration'],
	['Training and', 'upskilling'],
	['Metrics and', 'monitoring'],
	['Scale and', 'evolve'],
	['Avoid common', 'pitfalls'],
];
const PHONE = [
	'Executive sponsorship, objectives',
	'Charter and governance model',
	'Cross-functional core team',
	'Key workstreams and domains',
	'Governance frameworks and tools',
	'Self-service enablement',
	'Pilot projects and iteration',
	'Communication, collaboration',
	'Training and upskilling',
	'Metrics and monitoring',
	'Scale and evolve',
	'Avoid common pitfalls',
];

export const desktop = {
	height: 420,
	draw(f) {
		// Three rows of four that snake: left to right, back right to left, then left to right
		const w = 128;
		const gap = 32;
		const h = 100;
		const rowGap = 34;
		const xs = [16, 16 + w + gap, 16 + 2 * (w + gap), 16 + 3 * (w + gap)];
		const spot = (i) => {
			const row = Math.floor(i / 4);
			const col = row % 2 ? 3 - (i % 4) : i % 4;
			return { x: xs[col], y: 16 + row * (h + rowGap) };
		};
		STAGES.forEach((lines, i) => {
			const { x, y } = spot(i);
			f.box({
				x,
				y,
				w,
				h,
				kind: i === 0 ? 'pink' : 'chalk',
				label: `${i + 1}`,
				sub: lines,
				size: 18,
				subSize: 13,
			});
		});
		for (let i = 0; i < STAGES.length - 1; i++) {
			const a = spot(i);
			const b = spot(i + 1);
			if (a.y === b.y) {
				const left = a.x < b.x;
				f.arrow([
					[left ? a.x + w + 2 : a.x - 2, a.y + h / 2],
					[left ? b.x - 2 : b.x + w + 2, b.y + h / 2],
				]);
			} else {
				f.arrow([
					[a.x + w / 2, a.y + h + 2],
					[b.x + w / 2, b.y - 2],
				]);
			}
		}
	},
};

export const phone = {
	height: 760,
	draw(f) {
		PHONE.forEach((text, i) => {
			const y = 16 + i * 62;
			f.box({ x: 16, y, w: 328, h: 44, kind: i === 0 ? 'pink' : 'chalk' });
			f.text(36, y + 22, `${i + 1}`, {
				font: 'display',
				size: 20,
				anchor: 'start',
				color: '#000000',
			});
			f.text(70, y + 22, text, { size: 14, anchor: 'start', weight: 600, color: '#000000' });
			if (i < PHONE.length - 1)
				f.arrow([
					[180, y + 46],
					[180, y + 60],
				]);
		});
	},
};
