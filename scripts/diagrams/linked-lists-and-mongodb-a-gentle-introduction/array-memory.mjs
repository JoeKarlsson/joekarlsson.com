export const alt =
	'Growing a full array: the array of 1 million items fills its block of memory, so adding one more item means allocating a bigger block and copying all 1 million items into it.';

export const desktop = {
	height: 360,
	draw(f) {
		f.group({ x: 16, y: 40, w: 608, h: 300, label: 'Computer memory' });
		f.note(130, 88, 'old memory', { anchor: 'middle', weight: 700 });
		f.box({ x: 40, y: 110, w: 180, h: 110, kind: 'chalk', label: 'Array', sub: '1 million items' });
		f.arrow([
			[222, 165],
			[300, 165],
		]);
		f.note(261, 148, 'copy all', { anchor: 'middle', weight: 700 });
		f.note(460, 72, 'new memory', { anchor: 'middle', weight: 700 });
		f.box({
			x: 302,
			y: 92,
			w: 300,
			h: 220,
			kind: 'pink',
			label: 'Array',
			sub: ['1 million', 'and 1 items'],
		});
	},
};

export const phone = {
	height: 470,
	draw(f) {
		f.group({ x: 8, y: 40, w: 344, h: 410, label: 'Computer memory' });
		f.note(180, 80, 'old memory', { anchor: 'middle', weight: 700 });
		f.box({ x: 80, y: 96, w: 200, h: 90, kind: 'chalk', label: 'Array', sub: '1 million items' });
		f.arrow([
			[180, 188],
			[180, 238],
		]);
		f.note(194, 213, 'copy all', { weight: 700 });
		f.note(180, 258, 'new memory', { anchor: 'middle', weight: 700 });
		f.box({
			x: 40,
			y: 276,
			w: 280,
			h: 156,
			kind: 'pink',
			label: 'Array',
			sub: ['1 million', 'and 1 items'],
		});
	},
};
