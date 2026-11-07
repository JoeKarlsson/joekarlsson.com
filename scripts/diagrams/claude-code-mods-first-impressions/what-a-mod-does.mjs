export const alt =
	'What a Claude Code mod does. Inside Claude Code, Claude is about to run a command, edit a file or answer. A mod sees it first and can stop it, change it, or let it through. The mod can also put things on your screen: a status line, a side panel, a pop-up and its own slash commands. Hooks could already stop Claude; they couldn’t show you anything.';

const OUTCOMES = [
	{ label: 'Stop', icon: 'octagon-x' },
	{ label: 'Change', icon: 'refresh-cw' },
	{ label: 'Let through', icon: 'check' },
];
const SCREEN = ['status line', 'side panel', 'pop-up', ['slash', 'commands']];

function claude(f, x, y, w, h) {
	f.box({
		x,
		y,
		w,
		h,
		kind: 'chalk',
		label: 'Claude',
		sub: ['about to run a command,', 'edit a file or answer'],
		subSize: 14,
		logo: 'claude',
	});
}
function mod(f, x, y, w, h) {
	f.box({ x, y, w, h, kind: 'pink', label: 'Mod', icon: 'plug' });
}

export const desktop = {
	height: 470,
	draw(f) {
		f.group({ x: 12, y: 36, w: 416, h: 124, label: 'Claude Code' });
		claude(f, 22, 54, 252, 88);
		f.arrow([
			[276, 98],
			[290, 98],
		]);
		mod(f, 292, 54, 120, 88);
		const ys = [22, 74, 126];
		ys.forEach((y, i) => f.box({ x: 470, y, w: 156, h: 48, size: 15, ...OUTCOMES[i] }));
		ys.forEach((y) =>
			f.arrow([
				[414, 98],
				[446, 98],
				[446, y + 24],
				[468, y + 24],
			]),
		);
		f.arrow([
			[352, 144],
			[352, 238],
		]);
		f.group({ x: 100, y: 240, w: 526, h: 96, label: 'Your screen' });
		SCREEN.forEach((label, i) =>
			f.box({
				x: 116 + i * 126,
				y: 262,
				w: 116,
				h: 56,
				kind: 'ink',
				label,
				size: 15,
				font: 'sans',
			}),
		);
		f.text(100, 392, 'Hooks could already stop Claude.', {
			font: 'serif',
			size: 17,
			anchor: 'start',
		});
		f.note(100, 416, 'They couldn’t show me anything.');
		f.crayonArrow([360, 384], [420, 340], -18);
	},
};

export const phone = {
	height: 760,
	draw(f) {
		f.group({ x: 8, y: 34, w: 344, h: 236, label: 'Claude Code' });
		claude(f, 22, 50, 316, 80);
		f.arrow([
			[180, 132],
			[180, 164],
		]);
		mod(f, 110, 166, 140, 80);
		const xs = [14, 124, 234];
		xs.forEach((x, i) =>
			f.box({ x, y: 318, w: 104, h: 78, size: 13, stack: true, ...OUTCOMES[i] }),
		);
		xs.forEach((x) =>
			f.arrow([
				[180, 248],
				[180, 290],
				[x + 52, 290],
				[x + 52, 316],
			]),
		);
		f.arrow([
			[252, 206],
			[350, 206],
			[350, 420],
			[180, 420],
			[180, 456],
		]);
		f.group({ x: 8, y: 458, w: 344, h: 160, label: 'Your screen' });
		SCREEN.forEach((label, i) =>
			f.box({
				x: 24 + (i % 2) * 160,
				y: 478 + Math.floor(i / 2) * 66,
				w: 152,
				h: 56,
				kind: 'ink',
				label,
				size: 15,
				font: 'sans',
			}),
		);
		f.text(14, 670, 'Hooks could already stop Claude.', {
			font: 'serif',
			size: 16,
			anchor: 'start',
		});
		f.note(14, 694, 'They couldn’t show me anything.', { size: 14 });
		f.crayonArrow([250, 660], [300, 622], -14);
	},
};
