export const alt =
	'A linked list in computer memory: three nodes sit wherever there was room, not side by side. The head node holds a reference to the next node, which holds a reference to the tail.';

export const desktop = {
	height: 380,
	draw(f) {
		f.group({ x: 16, y: 40, w: 608, h: 320, label: 'Computer memory' });
		f.box({ x: 50, y: 70, w: 140, h: 60, kind: 'chalk', label: 'Node', icon: 'memory-stick' });
		f.note(204, 100, 'head', { weight: 700 });
		f.box({ x: 250, y: 260, w: 140, h: 60, kind: 'chalk', label: 'Node', icon: 'memory-stick' });
		f.box({ x: 440, y: 100, w: 140, h: 60, kind: 'chalk', label: 'Node', icon: 'memory-stick' });
		f.note(510, 82, 'tail', { anchor: 'middle', weight: 700 });
		f.arrow([
			[120, 132],
			[120, 290],
			[248, 290],
		]);
		f.note(132, 210, 'reference');
		f.arrow([
			[392, 290],
			[510, 290],
			[510, 162],
		]);
		f.note(522, 230, 'reference');
	},
};

export const phone = {
	height: 470,
	draw(f) {
		f.group({ x: 8, y: 40, w: 344, h: 410, label: 'Computer memory' });
		f.box({ x: 26, y: 70, w: 140, h: 58, kind: 'chalk', label: 'Node', icon: 'memory-stick' });
		f.note(180, 99, 'head', { weight: 700 });
		f.box({ x: 194, y: 230, w: 140, h: 58, kind: 'chalk', label: 'Node', icon: 'memory-stick' });
		f.box({ x: 26, y: 370, w: 140, h: 58, kind: 'chalk', label: 'Node', icon: 'memory-stick' });
		f.note(180, 399, 'tail', { weight: 700 });
		f.arrow([
			[96, 130],
			[96, 259],
			[192, 259],
		]);
		f.note(108, 196, 'reference', { size: 14 });
		f.arrow([
			[264, 290],
			[264, 330],
			[96, 330],
			[96, 368],
		]);
		f.note(108, 350, 'reference', { size: 14 });
	},
};
