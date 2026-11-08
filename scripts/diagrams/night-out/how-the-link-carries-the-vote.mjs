// Night Out's project page How it's made figure (src/data/projects.ts): how the 2026
// rebuild runs a vote with no server, from src/plan.js, src/places.js and src/main.js in
// JoeKarlsson/night-out
export const alt =
	'How Night Out runs a vote with no server. It finds bars, pubs, beer gardens and breweries on OpenStreetMap within 2.6 kilometers of you, and you pick 2 to 12 of them. The whole plan, the bars and the votes, goes into the link itself. A friend opens the link and votes, the link on their screen updates, and they send the new link back to the group. Every vote page ranks the bars by votes, and ties keep the order you picked them in. If friends vote on the same old link, a phone that opens both links keeps the higher count for each bar.';

const BARS = {
	label: 'Bars near you',
	sub: ['OpenStreetMap,', 'within 2.6 km'],
	logo: 'openstreetmap',
	kind: 'chalk',
};
const PICK = {
	label: 'Pick them',
	sub: ['2 to 12 bars', 'in the running'],
	icon: 'list-checks',
	kind: 'outline',
};
const LINK = {
	label: 'The link',
	sub: ['holds the bars and', 'the votes, no server'],
	icon: 'link',
	kind: 'pink',
};
const VOTE = {
	label: 'A friend votes',
	sub: ['the link on their', 'screen updates'],
	icon: 'user-check',
	kind: 'outline',
};
const SEND = {
	label: 'Send it back',
	sub: ['the new link', 'to the group'],
	icon: 'share-2',
	kind: 'outline',
};
const RANK = {
	label: 'Ranked',
	sub: ['most votes first, ties', 'keep your order'],
	icon: 'trophy',
	kind: 'chalk',
};

export const desktop = {
	height: 470,
	draw(f) {
		const xs = [40, 250, 460];
		const W = 160;
		const H = 104;
		const box = (x, y, spec) =>
			f.box({ x, y, w: W, h: H, size: 16, subSize: 13, stack: true, ...spec });
		box(xs[0], 16, BARS);
		f.arrow([
			[xs[0] + W + 2, 68],
			[xs[1] - 2, 68],
		]);
		box(xs[1], 16, PICK);
		f.arrow([
			[xs[1] + W + 2, 68],
			[xs[2] - 2, 68],
		]);
		box(xs[2], 16, LINK);
		f.arrow([
			[580, 122],
			[580, 198],
		]);
		box(xs[2], 200, VOTE);
		f.arrow([
			[xs[2] - 2, 252],
			[xs[1] + W + 2, 252],
		]);
		box(xs[1], 200, SEND);
		f.arrow([
			[330, 198],
			[330, 160],
			[500, 160],
			[500, 122],
		]);
		f.note(338, 152, 'next friend');
		f.arrow([
			[540, 306],
			[540, 348],
		]);
		box(xs[2], 350, RANK);
		f.note(40, 380, 'Two friends vote on the same old link?');
		f.note(40, 402, 'A phone that opens both keeps the');
		f.note(40, 424, 'higher count for each bar.');
		f.crayonArrow([200, 362], [270, 308], -20);
	},
};

export const phone = {
	height: 800,
	draw(f) {
		const X = 50;
		const W = 290;
		const H = 84;
		const rows = [BARS, PICK, LINK, VOTE, SEND, RANK];
		const ys = rows.map((_, i) => 16 + i * 116);
		rows.forEach((row, i) => {
			f.box({ x: X, y: ys[i], w: W, h: H, size: 16, subSize: 13, ...row });
			if (i < rows.length - 1 && i !== 4)
				f.arrow([
					[X + W / 2, ys[i] + H + 2],
					[X + W / 2, ys[i + 1] - 2],
				]);
		});
		f.arrow([
			[X - 2, ys[4] + H / 2],
			[18, ys[4] + H / 2],
			[18, ys[2] + H / 2],
			[X - 2, ys[2] + H / 2],
		]);
		f.arrow([
			[X + W - 40, ys[3] + H + 2],
			[X + W - 40, ys[3] + H + 14],
			[X + W + 12, ys[3] + H + 14],
			[X + W + 12, ys[5] + H / 2],
			[X + W + 2, ys[5] + H / 2],
		]);
		f.note(X, 724, 'Two friends vote on the same old link?');
		f.note(X, 746, 'A phone that opens both keeps');
		f.note(X, 768, 'the higher count for each bar.');
	},
};
