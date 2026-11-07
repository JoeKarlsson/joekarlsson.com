export const alt =
	'How the Bechdel Test Visualizer reads a screenplay. It takes the title from the first line of the text file and asks myapifilms.com for the cast, their characters and each one’s gender. Then it splits the script into scenes using 10 to 12 keywords like int. and ext., and collects each character’s dialogue. A scene fails if fewer than two women are in it. If two or more are, it checks their dialogue for words about a man, like he, him, father or king: if it finds one, the scene fails, and if not, the scene passes.';

const TITLE = { label: 'Read the title', sub: 'from the first line', icon: 'search', kind: 'pink' };
const API = {
	label: 'myapifilms.com',
	sub: ['cast, characters', 'and their genders'],
	icon: 'film',
	kind: 'chalk',
};
const SPLIT = {
	label: 'Split into scenes',
	sub: ['10-12 keywords', 'like int. and ext.'],
	icon: 'split',
	kind: 'pink',
};
const DIALOGUE = {
	label: 'Collect dialogue',
	sub: 'by character',
	icon: 'messages-square',
	kind: 'pink',
};
const CHECK = {
	label: 'Check their dialogue',
	icon: 'search',
	kind: 'pink',
};
const FAILS = { label: ['Scene', 'fails'], icon: 'x', kind: 'outline', stack: true };

export const desktop = {
	height: 850,
	draw(f) {
		const cx = 190;
		f.box({
			x: 70,
			y: 16,
			w: 240,
			h: 58,
			kind: 'chalk',
			label: 'Screenplay',
			sub: 'a plain text file',
			icon: 'file-text',
		});
		f.arrow([
			[190, 76],
			[190, 138],
		]);
		f.box({ x: 60, y: 140, w: 260, h: 60, size: 16, subSize: 14, ...TITLE });
		f.arrow(
			[
				[322, 170],
				[402, 170],
			],
			{ heads: 'both' },
		);
		f.note(338, 160, 'title');
		f.box({ x: 404, y: 128, w: 220, h: 84, size: 16, subSize: 14, ...API });
		f.arrow([
			[cx, 202],
			[cx, 232],
		]);
		f.box({ x: 60, y: 234, w: 260, h: 74, size: 16, subSize: 14, ...SPLIT });
		f.arrow([
			[cx, 310],
			[cx, 336],
		]);
		f.box({ x: 60, y: 338, w: 260, h: 60, size: 16, subSize: 14, ...DIALOGUE });
		f.arrow([
			[cx, 400],
			[cx, 426],
		]);
		f.diamond({ cx, cy: 470, w: 270, h: 84, label: 'two+ women?', size: 15 });
		f.arrow([
			[325, 470],
			[516, 470],
			[516, 543],
		]);
		f.note(338, 458, 'no');
		f.arrow([
			[cx, 514],
			[cx, 544],
		]);
		f.note(202, 530, 'yes');
		f.box({
			x: 60,
			y: 546,
			w: 260,
			h: 74,
			size: 16,
			subSize: 14,
			sub: ['for he, him,', 'father, king...'],
			...CHECK,
		});
		f.arrow([
			[cx, 622],
			[cx, 646],
		]);
		f.diamond({ cx, cy: 690, w: 270, h: 84, label: 'about a man?', size: 15 });
		f.arrow([
			[325, 690],
			[516, 690],
			[516, 637],
		]);
		f.note(338, 678, 'yes');
		f.box({ x: 456, y: 545, w: 120, h: 90, size: 16, ...FAILS });
		f.arrow([
			[cx, 734],
			[cx, 770],
		]);
		f.note(202, 754, 'no');
		f.pill({ x: 100, y: 772, w: 180, h: 42, label: 'Scene passes' });
	},
};

export const phone = {
	height: 916,
	draw(f) {
		const cx = 130;
		f.box({
			x: 100,
			y: 16,
			w: 160,
			h: 58,
			kind: 'chalk',
			label: 'Screenplay',
			sub: '.txt file',
			size: 15,
			icon: 'file-text',
		});
		f.arrow([
			[180, 76],
			[180, 136],
		]);
		f.box({ x: 30, y: 138, w: 300, h: 56, size: 15, subSize: 14, ...TITLE });
		f.arrow(
			[
				[180, 196],
				[180, 226],
			],
			{ heads: 'both' },
		);
		f.note(192, 214, 'title');
		f.box({ x: 30, y: 228, w: 300, h: 80, size: 15, subSize: 14, ...API });
		f.arrow([
			[180, 310],
			[180, 336],
		]);
		f.box({ x: 30, y: 338, w: 300, h: 74, size: 15, subSize: 14, ...SPLIT });
		f.arrow([
			[180, 414],
			[180, 438],
		]);
		f.box({ x: 30, y: 440, w: 300, h: 56, size: 15, subSize: 14, ...DIALOGUE });
		f.arrow([
			[cx, 498],
			[cx, 522],
		]);
		f.diamond({ cx, cy: 562, w: 200, h: 76, label: 'two+ women?', size: 14 });
		f.arrow([
			[230, 562],
			[294, 562],
			[294, 604],
		]);
		f.note(238, 550, 'no');
		f.arrow([
			[cx, 600],
			[cx, 630],
		]);
		f.note(142, 616, 'yes');
		f.box({
			x: 30,
			y: 632,
			w: 200,
			h: 70,
			size: 14,
			subSize: 13,
			sub: ['for he, him,', 'father, king...'],
			...CHECK,
			label: 'Check dialogue',
		});
		f.box({ x: 246, y: 606, w: 96, h: 90, size: 14, ...FAILS });
		f.arrow([
			[cx, 704],
			[cx, 728],
		]);
		f.diamond({ cx, cy: 768, w: 200, h: 76, label: 'about a man?', size: 14 });
		f.arrow([
			[230, 768],
			[294, 768],
			[294, 698],
		]);
		f.note(238, 756, 'yes');
		f.arrow([
			[cx, 806],
			[cx, 836],
		]);
		f.note(142, 822, 'no');
		f.pill({ x: 50, y: 838, w: 160, h: 40, label: 'Scene passes', size: 15 });
	},
};
