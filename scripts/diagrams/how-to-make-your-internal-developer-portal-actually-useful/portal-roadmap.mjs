export const alt =
	'A developer portal roadmap in three phases. Phase 1, foundation (months 0 to 3): asset discovery, CloudQuery setup and governance, ending with a complete inventory. Phase 2, deployment (months 3 to 12): Backstage deployment, the service catalog and plugins, developer onboarding, then automation and compliance, ending with the portal live. Phase 3, maturity (12 months and on): advanced analytics and AI optimization, reaching platform maturity around month 18.';

const PHASES = [
	{
		label: 'Phase 1: foundation, months 0–3',
		kind: 'outline',
		tasks: [
			['Asset discovery', 0, 2.5],
			['CloudQuery setup', 1, 3],
			['Governance', 1.5, 3],
		],
	},
	{
		label: 'Phase 2: deployment, months 3–12',
		kind: 'chalk',
		tasks: [
			['Backstage deployment', 3, 6],
			['Service catalog, plugins', 4, 8],
			['Developer onboarding', 5, 9],
			['Automation, compliance', 6, 12],
		],
	},
	{
		label: 'Phase 3: maturity, months 12+',
		kind: 'pink',
		tasks: [
			['Advanced analytics', 12, 17],
			['AI optimization', 13, 18],
		],
	},
];
const MILESTONES = [
	[3, 'inventory complete'],
	[12, 'portal live'],
	[18, 'platform maturity'],
];
const TICKS = [0, 3, 6, 9, 12, 15, 18];

/** A dashed vertical guide, drawn first so the bars sit on top. */
function guide(f, x, y0, y1) {
	for (let y = y0; y < y1; y += 12)
		f.line(
			[
				[x, y],
				[x, Math.min(y + 6, y1)],
			],
			{ color: '#3a3a3a', width: 1.5 },
		);
}

function chart(f, { left, right, labelX, rowH, phone }) {
	const scale = (right - left) / 18;
	const mx = (m) => left + m * scale;
	const axisY = 26;
	TICKS.forEach((m) =>
		f.text(mx(m), axisY, m === 18 ? '18+' : `${m}`, { size: 13, weight: 700, color: '#a3a3a3' }),
	);
	f.note(phone ? 16 : labelX, phone ? 9 : axisY, 'month', { size: 13 });
	let y = 76;
	const rows = [];
	PHASES.forEach((phase) => {
		const h = 14 + phase.tasks.length * rowH;
		rows.push({ phase, y, h });
		y += h + 40;
	});
	const bottom = y - 30;
	MILESTONES.forEach(([m]) => guide(f, mx(m), axisY + 14, bottom));
	rows.forEach(({ phase, y: gy, h }) => {
		f.group({ x: 8, y: gy, w: phone ? 344 : 616, h, label: phase.label });
		phase.tasks.forEach(([name, start, end], i) => {
			const ty = gy + 10 + i * rowH;
			if (phone) {
				f.note(16, ty + 8, name, { size: 13, color: '#ededed' });
				f.box({
					x: mx(start),
					y: ty + 18,
					w: Math.max(12, (end - start) * scale),
					h: 16,
					kind: phase.kind,
				});
			} else {
				f.note(labelX, ty + rowH / 2 - 2, name, { size: 13, color: '#ededed' });
				f.box({
					x: mx(start),
					y: ty + 4,
					w: (end - start) * scale,
					h: rowH - 12,
					kind: phase.kind,
				});
			}
		});
	});
	MILESTONES.forEach(([m, name], i) => {
		f.dot(mx(m), bottom + 6, 6, '#ff4fd8');
		// Alternate rows so neighbouring labels never collide
		f.text(mx(m), bottom + 26 + (i % 2) * 20, name, {
			size: 13,
			weight: 700,
			anchor: i === 0 && phone ? 'start' : i === 2 ? 'end' : 'middle',
			color: '#ededed',
		});
	});
}

export const desktop = {
	height: 610,
	draw(f) {
		chart(f, { left: 210, right: 610, labelX: 22, rowH: 38 });
	},
};

export const phone = {
	height: 740,
	draw(f) {
		chart(f, { left: 24, right: 336, labelX: 16, rowH: 44, phone: true });
	},
};
