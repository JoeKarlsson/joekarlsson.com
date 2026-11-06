export const alt =
	'Setting up the master key with a local provider: the client application creates the master key and stores it in a local key provider, such as the local filesystem.';

export const desktop = {
	height: 160,
	draw(f) {
		f.box({ x: 16, y: 40, w: 160, h: 76, label: ['Client', 'app'], icon: 'terminal', size: 15 });
		f.arrow([
			[178, 78],
			[228, 78],
		]);
		f.note(203, 62, 'creates', { anchor: 'middle', size: 13 });
		f.box({
			x: 230,
			y: 40,
			w: 150,
			h: 76,
			kind: 'pink',
			label: ['Master', 'key'],
			icon: 'key-round',
			size: 15,
		});
		f.arrow([
			[382, 78],
			[456, 78],
		]);
		f.note(419, 62, 'stored in', { anchor: 'middle', size: 13 });
		f.box({
			x: 458,
			y: 30,
			w: 166,
			h: 96,
			kind: 'chalk',
			label: ['Local key', 'provider'],
			sub: 'the filesystem',
			icon: 'vault',
			size: 15,
			subSize: 13,
		});
	},
};

export const phone = {
	height: 360,
	draw(f) {
		f.box({ x: 80, y: 16, w: 200, h: 64, label: 'Client app', icon: 'terminal', size: 15 });
		f.arrow([
			[180, 82],
			[180, 124],
		]);
		f.note(194, 103, 'creates', { size: 13 });
		f.box({
			x: 80,
			y: 126,
			w: 200,
			h: 64,
			kind: 'pink',
			label: 'Master key',
			icon: 'key-round',
			size: 15,
		});
		f.arrow([
			[180, 192],
			[180, 234],
		]);
		f.note(194, 213, 'stored in', { size: 13 });
		f.box({
			x: 60,
			y: 236,
			w: 240,
			h: 84,
			kind: 'chalk',
			label: ['Local key', 'provider'],
			sub: 'the filesystem',
			icon: 'vault',
			size: 15,
			subSize: 13,
		});
	},
};
