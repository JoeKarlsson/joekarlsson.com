// GAPTCHA's project page How it's made figure (src/data/projects.ts): how a hunt works in
// the 2026 rebuild, from public/js/checkpoint.js, play.js, home.js and play.html in
// JoeKarlsson/GAPTCHA
export const alt =
	"How a GAPTCHA hunt works. You scan a printed marker, held with its name on top and facing north, and AR.js finds it in the camera. Your phone's location and the checkpoint go into a compass bearing: near the original spot in Honolulu the checkpoint is the 2017 one, anywhere else it's a demo checkpoint 100 to 300 meters from you. A green 3D arrow on the marker turns to that bearing. An arrow gives a direction but no distance, so you scan markers in a few places and walk to where the arrows cross, then tap Did I Win. Within 20 meters you win, and it tells you how many tries everyone took since the last win; farther away, you scan another marker.";

const MARKER = {
	label: 'Printed marker',
	sub: ['name on top,', 'facing north'],
	icon: 'qr-code',
	kind: 'chalk',
};
const SCAN = {
	label: 'Scan it',
	sub: ['AR.js finds it', 'in the camera'],
	logo: 'aframe',
	kind: 'outline',
};
const WHERE = {
	label: 'Your location',
	sub: ["the phone's GPS"],
	icon: 'locate-fixed',
	kind: 'outline',
};
const CHECKPOINT = {
	label: 'The checkpoint',
	sub: ['the 2017 spot, or', '100-300 m from you'],
	icon: 'map-pin',
	kind: 'outline',
};
const BEARING = {
	label: 'Bearing',
	sub: ['compass direction from', 'you to the checkpoint'],
	icon: 'compass',
	kind: 'pink',
};
const ARROW = {
	label: 'A green 3D arrow',
	sub: ['on the marker, turned', 'to the bearing'],
	icon: 'navigation',
	kind: 'chalk',
};
const WIN = {
	label: 'Did I Win',
	sub: ['within 20 m', 'of the checkpoint?'],
	icon: 'trophy',
	kind: 'pink',
};

export const desktop = {
	height: 510,
	draw(f) {
		const xs = [40, 250, 460];
		const W = 160;
		const H = 104;
		const box = (x, y, spec) =>
			f.box({ x, y, w: W, h: H, size: 16, subSize: 13, stack: true, ...spec });
		box(xs[0], 16, MARKER);
		f.arrow([
			[xs[0] + W + 2, 68],
			[xs[1] - 2, 68],
		]);
		box(xs[1], 16, SCAN);
		f.arrow([
			[330, 122],
			[330, 168],
		]);
		box(xs[0], 170, WHERE);
		f.arrow([
			[xs[0] + W + 2, 222],
			[xs[1] - 2, 222],
		]);
		box(xs[1], 170, BEARING);
		f.arrow([
			[xs[2] - 2, 222],
			[xs[1] + W + 2, 222],
		]);
		box(xs[2], 170, CHECKPOINT);
		f.arrow([
			[330, 276],
			[330, 318],
		]);
		box(xs[1], 320, ARROW);
		f.arrow([
			[xs[1] + W + 2, 372],
			[xs[2] - 2, 372],
		]);
		box(xs[2], 320, WIN);
		f.arrow(
			[
				[xs[1] - 2, 400],
				[16, 400],
				[16, 40],
				[xs[0] - 2, 40],
			],
			{ dashed: true },
		);
		f.note(30, 452, 'No distance, just a direction:');
		f.note(30, 474, 'scan a few, walk to where they cross');
		f.crayonArrow([150, 440], [244, 412], -20);
		f.note(460, 452, 'within 20 m: you win');
		f.note(460, 474, 'farther: scan another');
	},
};

export const phone = {
	height: 850,
	draw(f) {
		const X = 50;
		const W = 290;
		const H = 92;
		const rows = [
			MARKER,
			SCAN,
			{ ...BEARING, sub: ['from your GPS to the checkpoint:', 'the 2017 spot or 100-300 m away'] },
			ARROW,
			WIN,
		];
		const ys = rows.map((_, i) => 16 + i * 124);
		rows.forEach((row, i) => {
			f.box({ x: X, y: ys[i], w: W, h: H, size: 16, subSize: 13, ...row });
			if (i < rows.length - 1)
				f.arrow([
					[X + W / 2, ys[i] + H + 2],
					[X + W / 2, ys[i + 1] - 2],
				]);
		});
		f.arrow(
			[
				[X - 2, ys[3] + H / 2],
				[18, ys[3] + H / 2],
				[18, ys[0] + H / 2],
				[X - 2, ys[0] + H / 2],
			],
			{ dashed: true },
		);
		f.note(X, 664, 'No distance, just a direction:');
		f.note(X, 686, 'scan a few markers and walk');
		f.note(X, 708, 'to where the arrows cross.');
		f.note(X, 750, 'Within 20 m: you win, and it shows');
		f.note(X, 772, 'how many tries everyone took.');
		f.note(X, 814, 'Farther: scan another marker.');
	},
};
