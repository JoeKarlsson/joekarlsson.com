export const alt =
	'My AI setup as a stack of six layers, from the top: always-on rules ("Don\'t hide failures"), knowledge read on demand (design rules, read before building a page), skills (the health check, decommissioning a service), subagents (reviewers who never compare notes), memory and decisions ("Never swap the site font unasked") and, at the bottom in pink, hooks (no writes inside an immutable container). An arrow down the side says a rule that keeps failing moves down a layer.';

// sub is one line on desktop; the phone box is too narrow, so it gets two
const LAYERS = [
	{
		label: 'Always-on rules',
		sub: ['"Don\'t hide failures"'],
		icon: 'scroll-text',
		kind: 'outline',
	},
	{
		label: 'Knowledge on demand',
		sub: ['Design rules,', 'read before a page'],
		icon: 'book-open',
		kind: 'outline',
	},
	{
		label: 'Skills',
		sub: ['The health check,', 'decommissioning'],
		icon: 'list-checks',
		kind: 'chalk',
	},
	{ label: 'Subagents', sub: ['Reviewers who never', 'compare notes'], icon: 'bot', kind: 'chalk' },
	{
		label: 'Memory and decisions',
		sub: ['"Never swap the', 'site font unasked"'],
		icon: 'history',
		kind: 'chalk',
	},
	{
		label: 'Hooks',
		sub: ['No writes inside an', 'immutable container'],
		icon: 'octagon-x',
		kind: 'pink',
	},
];

function stack(f, { x, w, top, rowH, gap, arrowX, phone }) {
	LAYERS.forEach((l, i) => {
		const sub = phone ? l.sub : l.sub.join(' ');
		f.box({ x, y: top + i * (rowH + gap), w, h: rowH, size: phone ? 14 : 15, ...l, sub });
	});
	const bottom = top + LAYERS.length * (rowH + gap) - gap;
	f.arrow(
		[
			[arrowX, top + 8],
			[arrowX, bottom - 8],
		],
		{},
	);
}

export const desktop = {
	height: 520,
	draw(f) {
		stack(f, { x: 24, w: 470, top: 24, rowH: 66, gap: 12, arrowX: 524 });
		['Keeps', 'failing?', 'Move it', 'down.'].forEach((line, i) => f.note(540, 230 + i * 20, line));
	},
};

export const phone = {
	height: 640,
	draw(f) {
		stack(f, { x: 8, w: 316, top: 16, rowH: 92, gap: 10, arrowX: 342, phone: true });
	},
};
