// Movie Script Scraper's project page How it's made figure (src/data/projects.ts):
// a genre in, a folder of scripts out, from src/genre, src/getScript and
// src/helper/api.js in JoeKarlsson/movie-script-scraper
export const alt =
	"How Movie Script Scraper gets scripts. You run it from the command line or as an npm package with a genre, like Action, and a total, 10 by default. It loads that genre's page on IMSDB, the Internet Movie Script Database, and finds every link to a script. It fetches five scripts at a time, retrying a failed request up to three times and waiting 1, 2 and then 4 seconds. From each page it keeps the script text and skips anything under 500 characters. Each script is saved as a text file in a folder named for the genre. Bechdel.io's scripts came from it.";

const START = {
	label: 'A genre',
	sub: ['CLI or npm package:', '--genre Action'],
	logo: 'npm',
	kind: 'outline',
};
const IMSDB = { label: 'IMSDB', sub: 'imsdb.com/genre/Action', icon: 'globe', kind: 'chalk' };
const LINKS = {
	label: 'Find the scripts',
	sub: ['every script link', 'on the genre page'],
	icon: 'search',
	kind: 'pink',
};
const FETCH = {
	label: 'Fetch 5 at a time',
	sub: ['3 retries, waiting', '1, 2, then 4 s'],
	icon: 'refresh-cw',
	kind: 'pink',
};
const KEEP = {
	label: 'Keep the script',
	sub: ['the text in <pre>,', 'if it has 500+ characters'],
	icon: 'file-text',
	kind: 'pink',
};
const FILES = {
	label: 'scripts/Action/',
	sub: 'one .txt per movie',
	icon: 'folder',
	kind: 'chalk',
};
const BECHDEL = {
	label: 'Bechdel.io',
	sub: 'got its scripts here',
	icon: 'film',
	kind: 'outline',
};

export const desktop = {
	height: 468,
	draw(f) {
		const L = 20;
		const R = 360;
		const W = 260;
		const H = 80;
		f.box({ x: L, y: 16, w: W, h: H, size: 17, subSize: 14, ...START });
		f.arrow([
			[L + W + 2, 56],
			[R - 2, 56],
		]);
		f.box({ x: R, y: 16, w: W, h: H, size: 17, subSize: 14, ...IMSDB });
		f.arrow([
			[R + W / 2, 98],
			[R + W / 2, 132],
		]);
		f.box({ x: R, y: 134, w: W, h: H, size: 17, subSize: 14, ...LINKS });
		f.arrow([
			[R - 2, 174],
			[L + W + 2, 174],
		]);
		f.box({ x: L, y: 134, w: W, h: H, size: 17, subSize: 14, ...FETCH });
		f.arrow([
			[L + W / 2, 216],
			[L + W / 2, 250],
		]);
		f.box({ x: L, y: 252, w: W, h: H, size: 17, subSize: 14, ...KEEP });
		f.arrow([
			[L + W + 2, 292],
			[R - 2, 292],
		]);
		f.box({ x: R, y: 252, w: W, h: H, size: 17, subSize: 14, ...FILES });
		f.arrow([
			[R + W / 2, 334],
			[R + W / 2, 368],
		]);
		f.box({ x: R, y: 370, w: W, h: 76, size: 17, subSize: 14, ...BECHDEL });
	},
};

export const phone = {
	height: 720,
	draw(f) {
		const X = 30;
		const W = 300;
		const H = 76;
		const STEP = 100;
		[START, IMSDB, LINKS, FETCH, KEEP, FILES, BECHDEL].forEach((row, i, rows) => {
			const y = 16 + i * STEP;
			f.box({ x: X, y, w: W, h: H, size: 16, subSize: 13, ...row });
			if (i < rows.length - 1) {
				f.arrow([
					[X + W / 2, y + H + 2],
					[X + W / 2, y + STEP - 2],
				]);
			}
		});
	},
};
