export const alt =
	'Growing a linked list: the existing nodes stay scattered where they are in old memory, and adding one item allocates room for just one new node, with nothing copied.';

/** The existing nodes, scattered as they fell in memory. */
const OLD = [
	[60, 120],
	[120, 100],
	[178, 132],
	[86, 170],
	[150, 186],
	[214, 178],
	[64, 228],
	[124, 240],
	[196, 236],
];

export const desktop = {
	height: 320,
	draw(f) {
		f.group({ x: 16, y: 40, w: 608, h: 260, label: 'Computer memory' });
		f.note(140, 76, 'old memory', { anchor: 'middle', weight: 700 });
		OLD.forEach(([cx, cy]) => f.box({ x: cx - 16, y: cy - 16, w: 32, h: 32, kind: 'chalk' }));
		f.note(470, 76, 'new memory', { anchor: 'middle', weight: 700 });
		f.box({ x: 454, y: 154, w: 32, h: 32, kind: 'pink' });
		f.text(340, 260, 'One new item, one new node.', { font: 'serif', size: 17, anchor: 'start' });
		f.note(340, 284, 'Nothing gets copied.');
		f.crayonArrow([460, 244], [468, 194], -10);
	},
};

export const phone = {
	height: 460,
	draw(f) {
		f.group({ x: 8, y: 40, w: 344, h: 300, label: 'Computer memory' });
		f.note(100, 76, 'old memory', { anchor: 'middle', weight: 700 });
		OLD.forEach(([cx, cy]) => f.box({ x: cx - 30, y: cy - 16, w: 28, h: 28, kind: 'chalk' }));
		f.note(286, 76, 'new memory', { anchor: 'middle', weight: 700 });
		f.box({ x: 272, y: 160, w: 28, h: 28, kind: 'pink' });
		f.text(16, 384, 'One new item, one new node.', { font: 'serif', size: 17, anchor: 'start' });
		f.note(16, 408, 'Nothing gets copied.');
		f.crayonArrow([250, 376], [284, 196], -20);
	},
};
