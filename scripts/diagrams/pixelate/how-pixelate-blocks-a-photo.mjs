// Pixelate's project page How it's made figure (src/data/projects.ts): how the 2026
// rebuild turns a photo into blocks, from site/js/pixelate.js and pixelate-math.js in
// JoeKarlsson/Pixelate
export const alt =
	"How Pixelate turns a photo into blocks. You pick a photo, and it never leaves your device. Pixelate works on a copy whose longest side is 2,000 pixels at most. The slider sets the block size, from 1 to 120 pixels, starting at 24. Each block becomes one color, the exact average of the pixels under it, and that small grid of blocks is stretched back up with smoothing turned off, so the blocks stay square. Save PNG writes it at the photo's full size, up to 8,000 pixels a side.";

const PHOTO = {
	label: 'Your photo',
	sub: ['JPEG, PNG, WebP or GIF,', 'never uploaded'],
	icon: 'image',
	kind: 'chalk',
};
const WORKING = {
	label: 'Working copy',
	sub: ['longest side', '2,000 px at most'],
	icon: 'image-down',
	kind: 'outline',
};
const SLIDER = {
	label: 'Block size',
	sub: ['the slider, 1 to 120 px,', 'starts at 24'],
	icon: 'sliders-horizontal',
	kind: 'outline',
};
const AVERAGE = {
	label: 'Average each block',
	sub: ['one color: the exact', 'average of its pixels'],
	icon: 'grid-3x3',
	kind: 'pink',
};
const STRETCH = {
	label: 'Stretch it back up',
	sub: ['smoothing off, so', 'blocks stay square'],
	icon: 'move-up-right',
	kind: 'chalk',
};
const SAVE = {
	label: 'Save PNG',
	sub: ["the photo's full size,", 'up to 8,000 px a side'],
	icon: 'download',
	kind: 'chalk',
};

export const desktop = {
	height: 384,
	draw(f) {
		const L = 20;
		const R = 360;
		const W = 260;
		const H = 80;
		f.box({ x: L, y: 16, w: W, h: H, size: 17, subSize: 14, ...PHOTO });
		f.arrow([
			[L + W + 2, 56],
			[R - 2, 56],
		]);
		f.box({ x: R, y: 16, w: W, h: H, size: 17, subSize: 14, ...WORKING });
		f.arrow([
			[R + W / 2, 98],
			[R + W / 2, 148],
		]);
		f.box({ x: L, y: 150, w: W, h: H, size: 17, subSize: 14, ...SLIDER });
		f.arrow([
			[L + W + 2, 190],
			[R - 2, 190],
		]);
		f.box({ x: R, y: 150, w: W, h: H, size: 17, subSize: 14, ...AVERAGE });
		f.arrow([
			[R + W / 2, 232],
			[R + W / 2, 282],
		]);
		f.box({ x: R, y: 284, w: W, h: H, size: 17, subSize: 14, ...STRETCH });
		f.arrow([
			[R - 2, 324],
			[L + W + 2, 324],
		]);
		f.box({ x: L, y: 284, w: W, h: H, size: 17, subSize: 14, ...SAVE });
	},
};

export const phone = {
	height: 600,
	draw(f) {
		const X = 30;
		const W = 300;
		const H = 84;
		const rows = [
			PHOTO,
			WORKING,
			{ ...AVERAGE, sub: ['the exact average color,', 'slider: 1 to 120 px'] },
			STRETCH,
			SAVE,
		];
		rows.forEach((row, i) => {
			const y = 16 + i * 116;
			f.box({ x: X, y, w: W, h: H, size: 16, subSize: 13, ...row });
			if (i < rows.length - 1)
				f.arrow([
					[X + W / 2, y + H + 2],
					[X + W / 2, y + 114],
				]);
		});
	},
};
