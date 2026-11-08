// Go Home Tanuki's project page How it's made figure (src/data/projects.ts): how
// drunkness and the score work, from src/js/game/states/game.js in
// JoeKarlsson/go-home-tanuki
export const alt =
	'How a run of Go Home Tanuki scores. The tanuki starts at a drunkness of 5. Small sake adds 1 and large sake adds 3, and every 3 seconds he sobers up by 1. Once his drunkness reaches 10, the street lamps come at you ten times faster and the clouds faster too, for the rest of the run, even if he sobers up. The run only ends when he hits a cloud or a rock. Then the score is his drunkness times the seconds he lasted, plus 10 points for every meter, plus a combo bonus: the sake streak times the combo, times 5. The combo goes up by one for every 3 sake in a row, up to 5, and resets after 5 seconds without sake.';

const SAKE = { label: 'Sake', sub: ['small +1,', 'large +3'], kind: 'chalk', icon: 'droplets' };
const DRUNK = { label: 'Drunkness', sub: 'starts at 5', kind: 'pink' };
const SOBER = { label: 'Every 3 s', sub: 'sober up by 1', kind: 'outline', icon: 'clock' };
const FAST = {
	label: 'Faster',
	sub: ['lamps 10× faster, clouds', 'faster, for the rest of the run'],
	kind: 'pink',
	icon: 'zap',
};
const CRASH = {
	label: 'Hit a cloud or rock',
	sub: 'the only way a run ends',
	kind: 'outline',
	icon: 'octagon-x',
};
const SCORE = [
	'score = drunkness × seconds',
	'      + meters × 10',
	'      + sake streak × combo × 5',
];
const COMBO = 'combo: +1 for every 3 sake in a row, up to 5';

export const desktop = {
	height: 540,
	draw(f) {
		f.box({ x: 16, y: 16, w: 180, h: 74, size: 17, subSize: 14, ...SAKE });
		f.box({ x: 236, y: 16, w: 168, h: 74, size: 17, subSize: 14, ...DRUNK });
		f.box({ x: 444, y: 16, w: 180, h: 74, size: 17, subSize: 14, ...SOBER });
		f.arrow([
			[198, 53],
			[234, 53],
		]);
		f.arrow([
			[442, 53],
			[406, 53],
		]);
		f.arrow([
			[320, 92],
			[320, 140],
		]);
		f.note(332, 116, 'at 10');
		f.box({ x: 150, y: 142, w: 340, h: 84, size: 17, subSize: 14, ...FAST });
		f.arrow(
			[
				[320, 228],
				[320, 270],
			],
			{ dashed: true },
		);
		f.box({ x: 170, y: 272, w: 300, h: 70, size: 17, subSize: 14, ...CRASH });
		f.arrow([
			[320, 344],
			[320, 380],
		]);
		f.code({ x: 100, y: 382, w: 440, lines: SCORE, size: 15, highlight: [0] });
		f.note(100, 496, COMBO);
		f.note(100, 518, 'resets after 5 s without sake');
	},
};

export const phone = {
	height: 672,
	draw(f) {
		f.box({ x: 12, y: 16, w: 160, h: 74, size: 16, subSize: 13, ...SAKE });
		f.box({ x: 188, y: 16, w: 160, h: 74, size: 16, subSize: 13, ...SOBER });
		f.arrow([
			[92, 92],
			[92, 112],
			[180, 112],
			[180, 126],
		]);
		f.arrow(
			[
				[268, 92],
				[268, 112],
				[180, 112],
			],
			{ heads: 'none' },
		);
		f.box({ x: 60, y: 128, w: 240, h: 64, size: 16, subSize: 13, ...DRUNK });
		f.arrow([
			[180, 194],
			[180, 232],
		]);
		f.note(192, 213, 'at 10');
		f.box({
			x: 12,
			y: 234,
			w: 336,
			h: 96,
			size: 16,
			subSize: 13,
			...FAST,
			sub: ['lamps 10× faster, clouds faster,', 'for the rest of the run'],
		});
		f.arrow(
			[
				[180, 332],
				[180, 366],
			],
			{ dashed: true },
		);
		f.box({ x: 12, y: 368, w: 336, h: 70, size: 16, subSize: 13, ...CRASH });
		f.arrow([
			[180, 440],
			[180, 470],
		]);
		f.code({
			x: 12,
			y: 472,
			w: 336,
			lines: ['score =', '  drunkness × seconds', '  + meters × 10', '  + streak × combo × 5'],
			size: 14,
			highlight: [1],
		});
		f.note(12, 608, 'combo: +1 for every 3 sake');
		f.note(12, 630, 'in a row, up to 5; resets after');
		f.note(12, 652, '5 s without sake');
	},
};
