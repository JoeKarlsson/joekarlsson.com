export const alt =
	'The five MCP roadmap priorities plotted by migration cost and urgency. Priority 3, agent identity and security, is high cost and the one to act on now. Priorities 2 (HTTP-native transport) and 4 (improved primitives) are medium cost and above the midline. Priorities 1 (agentic messaging) and 5 (SDK developer experience) are low cost and ones to watch. Already shipped in the 2026-07-28 release, and not plotted: the stateless core, the Tasks extension and multi round-trip requests.';

const POINTS = [
	{ n: 'P3', lines: ['Agent identity', 'and security'], cost: 0.84, urgency: 0.9, kind: 'pink' },
	{ n: 'P2', lines: ['HTTP-native', 'transport'], cost: 0.55, urgency: 0.72, kind: 'chalk' },
	{ n: 'P4', lines: ['Improved', 'primitives'], cost: 0.6, urgency: 0.56, kind: 'chalk' },
	{ n: 'P1', lines: ['Agentic', 'messaging'], cost: 0.2, urgency: 0.33, kind: 'outline' },
	{ n: 'P5', lines: ['SDK developer', 'experience'], cost: 0.2, urgency: 0.1, kind: 'outline' },
];

function dashes(f, from, to) {
	const [x1, y1] = from;
	const [x2, y2] = to;
	const len = Math.hypot(x2 - x1, y2 - y1);
	for (let d = 0; d < len; d += 12) {
		const a = d / len;
		const b = Math.min(d + 6, len) / len;
		f.line(
			[
				[x1 + (x2 - x1) * a, y1 + (y2 - y1) * a],
				[x1 + (x2 - x1) * b, y1 + (y2 - y1) * b],
			],
			{ color: '#3a3a3a', width: 1.5 },
		);
	}
}

function matrix(f, { x0, x1, y0, y1, bw, bh, size, shipped }) {
	f.line(
		[
			[x0, y0],
			[x0, y1],
			[x1, y1],
		],
		{ color: '#a3a3a3', width: 2 },
	);
	dashes(f, [(x0 + x1) / 2, y0], [(x0 + x1) / 2, y1]);
	dashes(f, [x0, (y0 + y1) / 2], [x1, (y0 + y1) / 2]);
	f.note(x0 - 8, y0 + 6, 'act now', { anchor: 'end', size: 12, weight: 700 });
	f.note(x0 - 8, y1 - 6, 'watch', { anchor: 'end', size: 12, weight: 700 });
	f.note(x0, y1 + 18, 'low cost', { size: 12, weight: 700 });
	f.note(x1, y1 + 18, 'high cost', { anchor: 'end', size: 12, weight: 700 });
	f.note((x0 + x1) / 2, y1 + 18, 'migration cost', { anchor: 'middle', size: 12 });
	POINTS.forEach((p) => {
		const cx = Math.min(x1 - bw / 2 - 4, Math.max(x0 + bw / 2 + 6, x0 + p.cost * (x1 - x0)));
		const cy = y1 - p.urgency * (y1 - y0);
		const ink = p.kind === 'outline' ? '#ededed' : '#000000';
		f.box({ x: cx - bw / 2, y: cy - bh / 2, w: bw, h: bh, kind: p.kind });
		f.text(cx - bw / 2 + 12, cy, p.n, {
			font: 'display',
			size: size + 6,
			anchor: 'start',
			color: ink,
		});
		p.lines.forEach((line, i) =>
			f.text(cx - bw / 2 + 50, cy + (i - 0.5) * (size + 4), line, {
				size,
				anchor: 'start',
				weight: 600,
				color: ink,
			}),
		);
	});
	const s = shipped;
	f.box({ x: s.x, y: s.y, w: s.w, h: 70, kind: 'dashed' });
	f.text(s.x + 14, s.y + 20, 'Already shipped, 2026-07-28', {
		size: 13,
		anchor: 'start',
		weight: 700,
	});
	f.note(s.x + 14, s.y + 42, 'stateless core, Tasks, MRTR', { size: 13 });
}

export const desktop = {
	height: 440,
	draw(f) {
		matrix(f, {
			x0: 76,
			x1: 624,
			y0: 20,
			y1: 400,
			bw: 180,
			bh: 52,
			size: 14,
			shipped: { x: 380, y: 300, w: 240 },
		});
	},
};

export const phone = {
	height: 560,
	draw(f) {
		matrix(f, {
			x0: 60,
			x1: 352,
			y0: 20,
			y1: 440,
			bw: 160,
			bh: 52,
			size: 13,
			shipped: { x: 8, y: 482, w: 344 },
		});
	},
};
