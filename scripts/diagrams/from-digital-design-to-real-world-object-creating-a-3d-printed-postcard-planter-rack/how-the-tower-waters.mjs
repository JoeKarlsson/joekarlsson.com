// The Postcard Rack Planter's project page How it's made figure (src/data/projects.ts):
// how one watering at the top reaches every pot, from the post
export const alt =
	'How the planter tower waters itself. Pots I drew in Tinkercad and printed in black ABS on a Prusa MK3 hang in the pockets of a secondhand wire postcard rack, one above the other. I water the top pot, and holes in the bottom of each pot drip into the pot below, so the water works its way down the whole tower.';

const POUR = { label: 'Water the top', icon: 'droplets', kind: 'chalk' };
const POT = { label: 'Pot', icon: 'sprout', kind: 'outline' };
const DRAW = { label: 'Drawn in Tinkercad', logo: 'tinkercad', kind: 'chalk' };
const PRINT = {
	label: 'Printed in black ABS',
	sub: 'on a Prusa MK3',
	icon: 'printer',
	kind: 'chalk',
};

export const desktop = {
	height: 470,
	draw(f) {
		f.box({ x: 100, y: 16, w: 200, h: 56, size: 16, ...POUR });
		f.arrow([
			[200, 74],
			[200, 132],
		]);
		f.group({ x: 20, y: 110, w: 280, h: 340, label: 'The wire rack' });
		const ys = [134, 210, 286, 362];
		ys.forEach((y, i) => {
			f.box({ x: 115, y, w: 170, h: 56, size: 16, ...POT });
			if (i < ys.length - 1)
				f.arrow([
					[200, y + 58],
					[200, ys[i + 1] - 2],
				]);
		});
		f.box({ x: 340, y: 110, w: 280, h: 64, size: 15, ...DRAW });
		f.arrow([
			[480, 176],
			[480, 214],
		]);
		f.box({ x: 340, y: 216, w: 280, h: 80, size: 15, subSize: 13, ...PRINT });
		f.arrow([
			[338, 256],
			[287, 256],
		]);
		f.note(345, 348, 'holes in each pot drip');
		f.note(345, 370, 'into the one below');
		f.crayonArrow([338, 352], [212, 352], 0);
	},
};

export const phone = {
	height: 720,
	draw(f) {
		f.box({ x: 80, y: 16, w: 200, h: 56, size: 16, ...POUR });
		f.arrow([
			[180, 74],
			[180, 132],
		]);
		f.group({ x: 12, y: 110, w: 336, h: 340, label: 'The wire rack' });
		const ys = [134, 210, 286, 362];
		ys.forEach((y, i) => {
			f.box({ x: 95, y, w: 170, h: 56, size: 16, ...POT });
			if (i < ys.length - 1)
				f.arrow([
					[180, y + 58],
					[180, ys[i + 1] - 2],
				]);
		});
		f.note(20, 478, 'Holes in each pot drip into the one below.');
		f.box({ x: 30, y: 504, w: 300, h: 60, size: 15, ...DRAW });
		f.arrow([
			[180, 566],
			[180, 600],
		]);
		f.box({ x: 30, y: 602, w: 300, h: 80, size: 15, subSize: 13, ...PRINT });
	},
};
