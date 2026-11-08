// App-All-O-Gizer's project page How it's made figure (src/data/projects.ts): what one
// click does, from server.js, routes/send.js and messages.js in
// STUPIDSHITNOONEINHAWAIINEEDSHACKATHON/app-all-o-gizer
export const alt =
	"How App-All-O-Gizer sends an apology. You type someone's email address and click Send Email. The Express server picks one of 13 apologies at random and sends it through Gmail with Nodemailer, straight to their inbox. The schedule that was supposed to send one every month, week or day, with node-cron, was never built, so every click sends one apology right away.";

const YOU = {
	label: 'Their email',
	sub: ['type it, click', 'Send Email'],
	icon: 'user',
	kind: 'outline',
};
const SERVER = { label: 'Express', sub: '/send?to=their address', icon: 'server', kind: 'pink' };
const PICK = {
	label: 'Pick an apology',
	sub: ['1 of 13, at random:', '"Sorry about the murder"'],
	icon: 'messages-square',
	kind: 'pink',
};
const GMAIL = { label: 'Gmail', sub: 'sent with Nodemailer', logo: 'gmail', kind: 'chalk' };
const INBOX = { label: 'Their inbox', sub: 'right away', icon: 'inbox', kind: 'chalk' };
const SCHEDULE = {
	label: 'The schedule',
	sub: ['monthly, weekly, daily', 'with node-cron'],
	icon: 'calendar-clock',
	kind: 'dashed',
};

export const desktop = {
	height: 388,
	draw(f) {
		f.box({ x: 20, y: 16, w: 260, h: 76, size: 17, subSize: 14, ...YOU });
		f.arrow([
			[282, 54],
			[358, 54],
		]);
		f.box({ x: 360, y: 16, w: 260, h: 76, size: 17, subSize: 14, ...SERVER });
		f.arrow([
			[490, 94],
			[490, 148],
		]);
		f.box({ x: 20, y: 150, w: 260, h: 80, size: 17, subSize: 14, ...SCHEDULE });
		f.arrow(
			[
				[282, 190],
				[358, 190],
			],
			{ dashed: true },
		);
		f.box({ x: 360, y: 150, w: 260, h: 80, size: 17, subSize: 14, ...PICK });
		f.arrow([
			[490, 232],
			[490, 290],
		]);
		f.box({ x: 360, y: 292, w: 260, h: 76, size: 17, subSize: 14, ...GMAIL });
		f.arrow([
			[358, 330],
			[282, 330],
		]);
		f.box({ x: 20, y: 292, w: 260, h: 76, size: 17, subSize: 14, ...INBOX });
		f.note(24, 252, 'never built:');
		f.note(24, 272, 'I ran out of day');
		f.crayonArrow([140, 262], [200, 236], -20);
	},
};

export const phone = {
	height: 750,
	draw(f) {
		const X = 40;
		const W = 300;
		const rows = [YOU, SERVER, PICK, GMAIL, INBOX];
		const ys = [16, 126, 236, 356, 466];
		rows.forEach((row, i) => {
			f.box({ x: X, y: ys[i], w: W, h: i === 2 ? 90 : 80, size: 16, subSize: 13, ...row });
			if (i < rows.length - 1) {
				const from = ys[i] + (i === 2 ? 90 : 80) + 2;
				f.arrow([
					[X + W / 2, from],
					[X + W / 2, ys[i + 1] - 2],
				]);
			}
		});
		f.box({ x: X, y: 616, w: W, h: 80, size: 16, subSize: 13, ...SCHEDULE });
		f.arrow(
			[
				[X - 2, 656],
				[16, 656],
				[16, 281],
				[X - 2, 281],
			],
			{ dashed: true },
		);
		f.note(X, 724, 'never built: I ran out of day');
	},
};
