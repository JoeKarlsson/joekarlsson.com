export const alt =
	'Chomsky’s grammar hierarchy as nested sets: Type 3, regular, sits inside Type 2, context-free, inside Type 1, context-sensitive, inside Type 0, unrestricted. CloudQuery’s search language moved from Type 3 (regex) to Type 2 (PEG.js) to support nested parentheses and operator precedence.';

const LEVELS = [
	['Type 0', 'unrestricted'],
	['Type 1', 'context-sensitive'],
	['Type 2', 'context-free'],
	['Type 3', 'regular'],
];

const RECTS = {
	desktop: [
		[16, 40, 400, 360],
		[36, 84, 360, 300],
		[56, 128, 320, 240],
		[76, 172, 170, 120],
	],
	phone: [
		[8, 40, 344, 300],
		[24, 84, 312, 240],
		[40, 128, 280, 180],
		[56, 172, 140, 100],
	],
};

/** Each level a container inside the one before; the name sits on its tab. */
function nest(f, rects) {
	LEVELS.forEach(([type, name], i) => {
		const [x, y, w, h] = rects[i];
		f.box({ x, y, w, h, kind: i === 2 ? 'dashed' : 'outline' });
		f.text(x + 12, y + 18, `${type}: ${name}`, {
			font: 'display',
			size: 15,
			anchor: 'start',
			upper: true,
			color: '#ededed',
		});
	});
}

export const desktop = {
	height: 420,
	draw(f) {
		nest(f, RECTS.desktop);
		f.box({ x: 88, y: 200, w: 146, h: 48, kind: 'chalk', label: 'regex', font: 'mono', size: 15 });
		f.box({ x: 262, y: 200, w: 100, h: 48, kind: 'pink', label: 'PEG.js', font: 'mono', size: 15 });
		f.handwrite(418, 150, 'From regex to PEG.js:', { size: 17 });
		f.handwrite(418, 174, 'one level up, so queries', { size: 17 });
		f.handwrite(418, 198, 'can nest parentheses', { size: 17 });
		f.handwrite(418, 222, 'and respect precedence.', { size: 17 });
	},
};

export const phone = {
	height: 450,
	draw(f) {
		nest(f, RECTS.phone);
		f.box({ x: 66, y: 200, w: 120, h: 44, kind: 'chalk', label: 'regex', font: 'mono', size: 14 });
		f.box({ x: 208, y: 200, w: 100, h: 44, kind: 'pink', label: 'PEG.js', font: 'mono', size: 14 });
		f.handwrite(8, 378, 'From regex to PEG.js: one level up,', { size: 16 });
		f.handwrite(8, 400, 'so queries can nest parentheses', { size: 16 });
		f.handwrite(8, 422, 'and respect operator precedence.', { size: 16 });
	},
};
