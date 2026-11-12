export const alt =
	'Before and after splitting into concepts. Before: home-assistant/CLAUDE.md was 65 KB and loaded in every session. After: home-assistant/CLAUDE.md is a 2 KB stub of rules plus a pointer, and knowledge/home-assistant/ holds an index with one line per concept and small concept files like critical-alerts-to-phone.md, dashboard-conventions.md and voice-assistant-setup.md, 1 to 2 KB each, opened on demand.';

const CONCEPTS = [
	'critical-alerts-to-phone.md',
	'dashboard-conventions.md',
	'voice-assistant-setup.md',
	'...',
];

/** Before: one big always-on file. */
function before(f, { x, y, w }) {
	f.group({ x, y, w, h: 232, label: 'Before' });
	f.text(x + 14, y + 20, 'home-assistant/', { font: 'mono', size: 14, anchor: 'start' });
	f.box({
		x: x + 14,
		y: y + 42,
		w: w - 28,
		h: 170,
		kind: 'pink',
		label: 'CLAUDE.md',
		font: 'mono',
		size: 16,
		sub: ['65 KB', 'loads every session'],
		subSize: 14,
		icon: 'file-text',
		stack: true,
	});
}

/** After: a tiny stub that points at an index of small files. */
function after(f, { x, y, w }) {
	f.group({ x, y, w, h: 344, label: 'After' });
	f.text(x + 14, y + 20, 'home-assistant/', { font: 'mono', size: 14, anchor: 'start' });
	f.box({
		x: x + 14,
		y: y + 34,
		w: w - 28,
		h: 54,
		kind: 'pink',
		label: 'CLAUDE.md',
		font: 'mono',
		size: 15,
		sub: '2 KB: rules + pointer',
		subSize: 13,
		icon: 'file-text',
	});
	f.arrow([
		[x + w / 2, y + 90],
		[x + w / 2, y + 116],
	]);
	f.text(x + 14, y + 132, 'knowledge/home-assistant/', { font: 'mono', size: 14, anchor: 'start' });
	f.box({
		x: x + 14,
		y: y + 146,
		w: w - 28,
		h: 50,
		kind: 'chalk',
		label: 'index.md',
		font: 'mono',
		size: 15,
		sub: 'one line per concept',
		subSize: 13,
		icon: 'list-checks',
	});
	f.arrow([
		[x + w / 2, y + 198],
		[x + w / 2, y + 220],
	]);
	CONCEPTS.forEach((c, i) =>
		f.box({
			x: x + 14,
			y: y + 222 + i * 36,
			w: w - 28,
			h: 30,
			kind: c === '...' ? 'dashed' : 'outline',
			label: c,
			font: 'mono',
			size: 13,
		}),
	);
	f.note(x + 14, y + 376, '1-2 KB each, opened on demand', { size: 13 });
}

export const desktop = {
	height: 430,
	draw(f) {
		before(f, { x: 16, y: 34, w: 250 });
		after(f, { x: 304, y: 34, w: 320 });
		f.arrow([
			[268, 150],
			[300, 150],
		]);
	},
};

export const phone = {
	height: 700,
	draw(f) {
		before(f, { x: 8, y: 34, w: 344 });
		f.arrow([
			[180, 268],
			[180, 294],
		]);
		after(f, { x: 8, y: 296 + 0, w: 344 });
	},
};
