// Best Buy Product Locator's project page How it's made figure (src/data/projects.ts):
// from the product page to the banner, from chrome/extension/inject.js and
// chrome/extension/util/ in JoeKarlsson/best-buy-product-locator-chrome-extension
export const alt =
	"How the Best Buy Product Locator finds a store. On a product page on Amazon, Walmart or Target, it reads the model number out of the spec table, or the UPC on Target, and if it finds no code within 3 seconds it searches by the product's title instead. It asks the Best Buy API for that product and takes the first match. Then it takes your location, asks the Best Buy API for stores within 15 miles, and picks the nearest Big Box store. A banner drops onto the page with the price, the store, its hours today and a button to buy it on BestBuy.com, and the toolbar icon gets a badge and a popup that shows the same.";

const PAGE = {
	label: 'Product page',
	sub: ['Amazon, Walmart', 'or Target'],
	icon: 'shopping-cart',
	kind: 'chalk',
};
const CODE = {
	label: 'Read the specs',
	sub: ['model number,', 'or UPC on Target'],
	icon: 'search',
	kind: 'pink',
};
const STORE = {
	label: 'Your location',
	sub: ['stores within', '15 miles'],
	icon: 'map',
	kind: 'pink',
};
const PRODUCTS = { label: 'Best Buy API', sub: '/products', logo: 'bestbuy', kind: 'chalk' };
const STORES = { label: 'Best Buy API', sub: '/stores', logo: 'bestbuy', kind: 'chalk' };
const BANNER = {
	label: 'Banner on the page',
	sub: ["price, store, today's hours,", 'Buy on BestBuy.com'],
	icon: 'app-window',
	kind: 'pink',
};
const POPUP = {
	label: 'Toolbar popup',
	sub: ['the same, with a badge', 'on the icon'],
	logo: 'googlechrome',
	kind: 'pink',
};

export const desktop = {
	height: 470,
	draw(f) {
		f.box({ x: 20, y: 20, w: 190, h: 84, size: 17, subSize: 14, ...PAGE });
		f.box({ x: 250, y: 20, w: 200, h: 84, size: 17, subSize: 14, ...CODE });
		f.box({ x: 490, y: 14, w: 130, h: 96, size: 15, subSize: 14, stack: true, ...PRODUCTS });
		f.arrow([
			[212, 62],
			[248, 62],
		]);
		f.arrow(
			[
				[452, 62],
				[488, 62],
			],
			{ heads: 'both' },
		);
		f.note(340, 132, 'no code in 3 s?', { anchor: 'end' });
		f.note(340, 150, 'search the title', { anchor: 'end' });
		f.note(492, 130, 'first match', { anchor: 'start' });
		f.arrow([
			[350, 106],
			[350, 166],
		]);
		f.box({ x: 250, y: 168, w: 200, h: 84, size: 17, subSize: 14, ...STORE });
		f.box({ x: 490, y: 162, w: 130, h: 96, size: 15, subSize: 14, stack: true, ...STORES });
		f.arrow(
			[
				[452, 210],
				[488, 210],
			],
			{ heads: 'both' },
		);
		f.note(492, 272, 'nearest Big Box', { anchor: 'start' });
		f.arrow([
			[350, 254],
			[350, 310],
			[160, 310],
			[160, 346],
		]);
		f.arrow([
			[350, 310],
			[480, 310],
			[480, 346],
		]);
		f.box({ x: 20, y: 348, w: 290, h: 90, size: 17, subSize: 14, ...BANNER });
		f.box({ x: 340, y: 348, w: 280, h: 90, size: 17, subSize: 14, ...POPUP });
	},
};

export const phone = {
	height: 900,
	draw(f) {
		const x = 30;
		const w = 314;
		const down = (y1, y2) =>
			f.arrow([
				[187, y1],
				[187, y2],
			]);
		f.box({ x, y: 16, w, h: 80, size: 17, subSize: 14, ...PAGE });
		down(98, 132);
		f.box({ x, y: 134, w, h: 80, size: 17, subSize: 14, ...CODE });
		f.arrow(
			[
				[187, 216],
				[187, 270],
			],
			{ heads: 'both' },
		);
		f.note(197, 236, 'no code in 3 s?');
		f.note(197, 254, 'search the title');
		f.box({ x, y: 272, w, h: 72, size: 17, subSize: 14, ...PRODUCTS });
		down(346, 400);
		f.note(197, 376, 'first match');
		f.box({ x, y: 402, w, h: 80, size: 17, subSize: 14, ...STORE });
		f.arrow(
			[
				[187, 484],
				[187, 538],
			],
			{ heads: 'both' },
		);
		f.box({ x, y: 540, w, h: 72, size: 17, subSize: 14, ...STORES });
		down(614, 668);
		f.note(197, 644, 'nearest Big Box');
		f.box({ x, y: 670, w, h: 90, size: 17, subSize: 14, ...BANNER });
		down(762, 790);
		f.box({ x, y: 792, w, h: 90, size: 17, subSize: 14, ...POPUP });
	},
};
