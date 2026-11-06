export const alt =
	'How a search query is parsed: the input string goes to the lexer, which breaks it into tokens; the PEG engine (Peggy) applies the grammar rules and operator precedence; that produces an abstract syntax tree; the planner walks the tree; and out comes a query plan, often SQL.';

const STEPS = [
	{ label: 'Input string', sub: 'you type a query', icon: 'search' },
	{ label: 'Lexer', sub: 'splits it into tokens', icon: 'split' },
	{ label: 'PEG engine', sub: 'Peggy applies the grammar', icon: 'braces', kind: 'pink' },
	{ label: 'AST', sub: 'a tree of meaning', icon: 'git-fork' },
	{ label: 'Planner', sub: 'works out how to run it', icon: 'settings' },
	{ label: 'Query plan', sub: 'often SQL', icon: 'database', kind: 'chalk' },
];

function column(f, { x, w, h, gap }) {
	STEPS.forEach((s, i) => {
		const y = 16 + i * (h + gap);
		f.box({ x, y, w, h, size: 15, subSize: 13, ...s });
		if (i < STEPS.length - 1)
			f.arrow([
				[x + w / 2, y + h + 2],
				[x + w / 2, y + h + gap - 2],
			]);
	});
}

export const desktop = {
	height: 490,
	draw(f) {
		column(f, { x: 170, w: 300, h: 56, gap: 24 });
	},
};

export const phone = {
	height: 490,
	draw(f) {
		column(f, { x: 30, w: 300, h: 56, gap: 24 });
	},
};
