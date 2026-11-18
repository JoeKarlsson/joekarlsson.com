export const alt =
	"Flowchart for deciding where a rule goes, asked in order and stopping at the first yes. Would breaking it once cost something I can't undo, or have I said it three times? A hook. Does every session in every repo need it? The global CLAUDE.md. Is it a judgment call with a reason? Memory or DECISIONS.md. Is it steps I'd explain again? A skill. Does it need fresh eyes? A subagent. Does it only matter for one kind of task? A knowledge file with an index line. No to all of them: leave it in chat.";

const STEPS = [
	{ q: ["Can't undo it, or", 'said it three times?'], a: 'Hook', kind: 'pink' },
	{ q: ['Every session, every', 'repo needs it?'], a: ['Global', 'CLAUDE.md'], kind: 'chalk' },
	{ q: ['A judgment call', 'with a reason?'], a: 'Memory', kind: 'chalk' },
	{ q: ["Steps I'd explain", 'again next time?'], a: 'Skill', kind: 'chalk' },
	{ q: ['Needs eyes that', "haven't seen the work?"], a: 'Subagent', kind: 'chalk' },
	{ q: ['Only matters for', 'one kind of task?'], a: ['Knowledge', 'file'], kind: 'chalk' },
];

function flow(f, { qx, qw, ax, aw, top, rowH, gap, size }) {
	const step = rowH + gap;
	STEPS.forEach((s, i) => {
		const y = top + i * step;
		f.box({ x: qx, y, w: qw, h: rowH, kind: 'outline', label: s.q, size });
		f.arrow([
			[qx + qw + 2, y + rowH / 2],
			[ax - 2, y + rowH / 2],
		]);
		f.box({ x: ax, y, w: aw, h: rowH, kind: s.kind, label: s.a, size });
		f.arrow([
			[qx + qw / 2, y + rowH + 2],
			[qx + qw / 2, y + step - 2],
		]);
	});
	const endY = top + STEPS.length * step;
	f.pill({ x: qx + qw / 2 - 90, y: endY, w: 180, h: 44, label: 'Leave it in chat', size: 15 });
	return endY;
}

export const desktop = {
	height: 640,
	draw(f) {
		flow(f, { qx: 16, qw: 330, ax: 430, aw: 190, top: 40, rowH: 62, gap: 30, size: 16 });
		f.note(372, 60, 'yes');
		f.note(190, 120, 'no');
	},
};

export const phone = {
	height: 700,
	draw(f) {
		flow(f, { qx: 8, qw: 210, ax: 244, aw: 108, top: 36, rowH: 72, gap: 30, size: 14 });
		f.note(220, 62, 'yes', { size: 13 });
		f.note(122, 124, 'no', { size: 13 });
	},
};
