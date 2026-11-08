// The IoT Kitty Litter Box project page How it's made figure (src/data/projects.ts):
// the box's loop, from src/app.js and src/helper/Scale.js in JoeKarlsson/iot-kitty-litter-box
export const alt =
	"How the litter box works. The scale under the box keeps an average of its last 20 readings. When the average goes past the empty box plus a cat-sized weight, the box waits 10 seconds for the cat to settle, writes the cat's weight to MongoDB, and recalibrates the empty weight. Lifting the lid trips a magnetic switch, which logs a cleaning to MongoDB; putting it back waits 10 seconds and recalibrates.";

const WAIT = { label: 'Waiting', sub: 'average of 20 readings', icon: 'scale', kind: 'chalk' };
const CAT = { label: 'A cat-sized weight', sub: 'past the empty box', icon: 'cat', kind: 'pink' };
const SETTLE = { label: 'Wait 10 s', sub: 'for the cat to settle', icon: 'clock', kind: 'outline' };
const SAVE = {
	label: "Save the cat's weight",
	sub: 'then recalibrate',
	logo: 'mongodb',
	kind: 'chalk',
};
const LID = { label: 'Lid off', sub: 'magnetic switch', icon: 'magnet', kind: 'dashed' };
const CLEAN = {
	label: 'Log a cleaning',
	sub: 'lid on: wait 10 s, recalibrate',
	logo: 'mongodb',
	kind: 'dashed',
};

export const desktop = {
	height: 420,
	draw(f) {
		f.group({ x: 14, y: 40, w: 612, h: 250, label: 'A visit' });
		const B = { w: 184, h: 90, size: 15, subSize: 13, stack: true };
		f.box({ x: 28, y: 70, ...B, ...WAIT });
		f.box({ x: 228, y: 70, ...B, ...CAT });
		f.box({ x: 428, y: 70, ...B, ...SETTLE });
		f.box({ x: 228, y: 190, ...B, w: 384, h: 80, stack: false, ...SAVE });
		f.arrow([
			[214, 115],
			[226, 115],
		]);
		f.arrow([
			[414, 115],
			[426, 115],
		]);
		f.arrow([
			[520, 162],
			[520, 188],
		]);
		f.arrow([
			[226, 230],
			[120, 230],
			[120, 162],
		]);
		f.note(28, 316, 'When I clean it');
		f.box({ x: 28, y: 330, w: 200, h: 80, size: 15, subSize: 13, ...LID });
		f.box({ x: 290, y: 330, w: 322, h: 80, size: 15, subSize: 13, ...CLEAN });
		f.arrow([
			[230, 370],
			[288, 370],
		]);
	},
};

export const phone = {
	height: 820,
	draw(f) {
		f.group({ x: 12, y: 40, w: 336, h: 520, label: 'A visit' });
		const B = { x: 40, w: 280, h: 84, size: 15, subSize: 13 };
		const items = [WAIT, CAT, SETTLE, SAVE];
		items.forEach((s, i) => {
			f.box({ ...B, y: 64 + i * 124, ...s });
			if (i < items.length - 1)
				f.arrow([
					[180, 150 + i * 124],
					[180, 186 + i * 124],
				]);
		});
		f.arrow([
			[38, 478],
			[24, 478],
			[24, 106],
			[38, 106],
		]);
		f.note(30, 596, 'When I clean it');
		f.box({ x: 30, y: 608, w: 300, h: 76, size: 15, subSize: 13, ...LID });
		f.arrow([
			[180, 686],
			[180, 712],
		]);
		f.box({ x: 30, y: 714, w: 300, h: 84, size: 15, subSize: 13, ...CLEAN });
	},
};
