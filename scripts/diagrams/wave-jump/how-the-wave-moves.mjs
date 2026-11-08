// Wave Jump's project page How it's made figure (src/data/projects.ts): how the wave
// moves and how a round is won, from src/states/Game.js in JoeKarlsson/wave-jump
export const alt =
	"How Wave Jump's wave works. The wave is 964 small sprites, one every 2 pixels across the 1920-pixel world. Every frame the game rolls a new amplitude between 100 and 200 and sets each sprite's vertical speed to the sine of 0.3 times the sprite's place in line times 0.1 plus the frame count, times the amplitude, times 2, so the wave never settles into one shape. Both players ride it: W or the up arrow jumps, A and D or the left and right arrows steer, and holding S or the down arrow dives through the wave. A checkered gate sits somewhere in the middle third of the screen, and the first player through it gets a point and the next round starts.";

const CHALK = '#ece6da';

const CODE_DESKTOP = [
	'// every frame:',
	'amp = random(100, 200)',
	'for each sprite i:  vy = sin(0.3 × (i × 0.1 + frame)) × amp × 2',
];
const CODE_PHONE = [
	'// every frame:',
	'amp = random(100, 200)',
	'// for each sprite i:',
	'vy = sin(0.3 × (i × 0.1 + frame))',
	'     × amp × 2',
];
const STEPS = [
	{ label: 'Ride', sub: ['W or ↑ jumps,', 'A D or ← → steer'], kind: 'outline', icon: 'users' },
	{ label: 'Dive', sub: ['hold S or ↓ to', 'drop through'], kind: 'outline' },
	{ label: 'Gate', sub: ['somewhere in', 'the middle third'], kind: 'chalk' },
	{ label: '+1 point', sub: ['first through it,', 'then a new round'], kind: 'pink' },
];

// A row of sprites along a sine, standing in for the 964 on screen
function wave(f, x0, x1, cy, amp, count) {
	for (let i = 0; i < count; i++) {
		const x = x0 + ((x1 - x0) * i) / (count - 1);
		f.dot(x, cy + Math.sin((i / (count - 1)) * Math.PI * 3) * amp, 3.5, CHALK);
	}
}

export const desktop = {
	height: 440,
	draw(f) {
		wave(f, 30, 610, 70, 34, 72);
		f.note(30, 136, '964 sprites, one every 2 px across a 1920 px world');
		f.code({ x: 20, y: 160, w: 600, lines: CODE_DESKTOP, size: 14, highlight: [1] });
		const xs = [8, 168, 328, 488];
		STEPS.forEach((s, i) => {
			f.box({ x: xs[i], y: 300, w: 144, h: 104, size: 16, subSize: 13, stack: true, ...s });
			if (i)
				f.arrow([
					[xs[i] - 14, 352],
					[xs[i] - 2, 352],
				]);
		});
		f.arrow([
			[320, 254],
			[320, 276],
			[80, 276],
			[80, 298],
		]);
		f.note(330, 272, 'the players land on it');
	},
};

export const phone = {
	height: 816,
	draw(f) {
		wave(f, 24, 336, 60, 28, 40);
		f.note(24, 116, '964 sprites, 2 px apart');
		f.code({ x: 12, y: 140, w: 336, lines: CODE_PHONE, size: 14, highlight: [1] });
		f.arrow([
			[180, 284],
			[180, 312],
		]);
		f.note(192, 298, 'the players land on it');
		STEPS.forEach((s, i) => {
			const y = 314 + i * 128;
			f.box({ x: 30, y, w: 300, h: 100, size: 16, subSize: 13, stack: true, ...s });
			if (i)
				f.arrow([
					[180, y - 26],
					[180, y - 2],
				]);
		});
	},
};
