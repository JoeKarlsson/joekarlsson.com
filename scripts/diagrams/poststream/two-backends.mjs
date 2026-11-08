// PostStream's project page How it's made figure (src/data/projects.ts): the same
// React app over the real server or the in-browser stand-in, from server/,
// app/demo/demoApi.ts and app/demo/demoData.ts in JoeKarlsson/post-stream
export const alt =
	'How PostStream runs two ways. The same React app talks to /post and /auth either way. The full app sends those requests to a Node and Express server that keeps posts, replies and follows in PostgreSQL. The archived demo at poststream.joekarlsson.com is built with npm run build:demo and has no server: a stand-in inside the browser answers the same requests from localStorage, signs you in as a sample visitor, and a sample cast posts or replies every 12 to 25 seconds and answers your own posts within 6 to 14 seconds.';

const APP = {
	label: 'The React app',
	sub: 'asks /post and /auth',
	logo: 'react',
	kind: 'pink',
};
const EXPRESS = {
	label: 'Express server',
	sub: 'Node.js',
	logo: 'express',
	kind: 'chalk',
};
const POSTGRES = {
	label: 'PostgreSQL',
	sub: ['posts, replies,', 'follows'],
	logo: 'postgresql',
	kind: 'chalk',
};
const STAND_IN = {
	label: 'Stand-in API',
	sub: ['answers inside the page,', 'signs you in'],
	icon: 'code-xml',
	kind: 'pink',
};
const STORAGE = {
	label: 'Your browser',
	sub: 'localStorage',
	icon: 'database',
	kind: 'chalk',
};
const CAST = {
	label: 'Sample cast',
	sub: ['posts or replies', 'every 12-25 s'],
	icon: 'users',
	kind: 'dashed',
};

export const desktop = {
	height: 560,
	draw(f) {
		f.group({ x: 20, y: 150, w: 290, h: 390, label: 'The full app' });
		f.group({ x: 330, y: 150, w: 290, h: 390, label: 'The archived demo' });
		f.box({ x: 170, y: 20, w: 300, h: 72, size: 17, subSize: 14, ...APP });
		f.box({ x: 40, y: 190, w: 250, h: 72, size: 17, subSize: 14, ...EXPRESS });
		f.box({ x: 40, y: 330, w: 250, h: 84, size: 17, subSize: 14, ...POSTGRES });
		f.box({ x: 350, y: 190, w: 250, h: 84, size: 17, subSize: 14, ...STAND_IN });
		f.box({ x: 350, y: 330, w: 250, h: 72, size: 17, subSize: 14, ...STORAGE });
		f.box({ x: 350, y: 444, w: 250, h: 84, size: 16, subSize: 13, ...CAST });
		f.arrow(
			[
				[240, 94],
				[240, 120],
				[165, 120],
				[165, 188],
			],
			{ heads: 'both' },
		);
		f.arrow(
			[
				[400, 94],
				[400, 120],
				[560, 120],
				[560, 188],
			],
			{ heads: 'both' },
		);
		f.arrow(
			[
				[165, 264],
				[165, 328],
			],
			{ heads: 'both' },
		);
		f.arrow(
			[
				[475, 276],
				[475, 328],
			],
			{ heads: 'both' },
		);
		f.arrow([
			[475, 442],
			[475, 404],
		]);
		f.note(40, 446, 'needs a server', { anchor: 'start' });
	},
};

export const phone = {
	height: 920,
	draw(f) {
		const x = 30;
		const w = 300;
		f.box({ x, y: 16, w, h: 72, size: 17, subSize: 14, ...APP });
		f.group({ x: 16, y: 150, w: 328, h: 270, label: 'The full app' });
		f.box({ x, y: 186, w, h: 72, size: 17, subSize: 14, ...EXPRESS });
		f.box({ x, y: 310, w, h: 84, size: 17, subSize: 14, ...POSTGRES });
		f.arrow(
			[
				[180, 90],
				[180, 184],
			],
			{ heads: 'both' },
		);
		f.arrow(
			[
				[180, 260],
				[180, 308],
			],
			{ heads: 'both' },
		);
		f.group({ x: 16, y: 470, w: 328, h: 430, label: 'The archived demo' });
		f.arrow(
			[
				[332, 52],
				[352, 52],
				[352, 450],
				[260, 450],
				[260, 504],
			],
			{ heads: 'both' },
		);
		f.box({ x, y: 506, w, h: 84, size: 17, subSize: 14, ...STAND_IN });
		f.box({ x, y: 650, w, h: 72, size: 17, subSize: 14, ...STORAGE });
		f.box({ x, y: 790, w, h: 90, size: 16, subSize: 13, ...CAST });
		f.arrow(
			[
				[180, 592],
				[180, 648],
			],
			{ heads: 'both' },
		);
		f.arrow([
			[180, 788],
			[180, 724],
		]);
	},
};
