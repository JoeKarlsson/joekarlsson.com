export const alt =
	"Where this newsletter goes next. It left Substack, where TL;DR in Tech lived, in October 2026, bringing 141 subscribers as a CSV. Today it runs on listmonk in Joe's homelab sending through Brevo's free plan: $0 extra a month, 300 emails a day for the whole account, shared with critical alerts and a Plex newsletter. Once the list nears 300, the undecided next step is either Brevo Starter, $9 a month for 5,000 emails with no daily limit and no change in listmonk, or Amazon SES, $0.10 per 1,000 emails, about 3 cents an issue at 300, which needs a new SMTP login, new DKIM records and a way out of the SES sandbox.";

function draw(f, W, phone) {
	const x = 16;
	const w = W - 32;
	const cx = W / 2;
	const sub = 13;
	let y = 16;
	const sh = phone ? 80 : 64;
	f.box({
		x,
		y,
		w,
		h: sh,
		kind: 'dashed',
		label: 'Substack',
		sub: phone
			? ['where TL;DR in Tech lived;', 'left October 2026']
			: 'where TL;DR in Tech lived; left October 2026',
		subSize: sub,
		logo: 'substack',
		size: 16,
	});
	y += sh;
	f.arrow([
		[cx, y + 2],
		[cx, y + 40],
	]);
	f.note(cx + 12, y + 21, '141 subscribers, as a CSV', { size: 13 });
	y += 42;
	f.box({
		x,
		y,
		w,
		h: phone ? 112 : 84,
		kind: 'pink',
		label: phone ? ['listmonk', '+ Brevo free'] : 'listmonk + Brevo free',
		sub: phone
			? [
					'today: $0 extra a month,',
					'300 emails a day, shared with',
					'alerts and a Plex newsletter',
				]
			: [
					'today: $0 extra a month, 300 emails a day for the',
					'whole account, shared with alerts and a Plex newsletter',
				],
		subSize: sub,
		logo: 'listmonk',
		size: 16,
	});
	y += phone ? 112 : 84;
	f.arrow([
		[cx, y + 2],
		[cx, y + 30],
	]);
	f.note(cx + 12, y + 16, 'once the list nears 300', { size: 13 });
	y += 32;
	f.text(cx, y + 14, 'Undecided', { font: 'display', size: 20, upper: true, color: '#ff4fd8' });
	y += 30;
	const half = (w - 12) / 2;
	f.arrow(
		[
			[cx, y],
			[cx, y + 12],
			[x + half / 2, y + 12],
			[x + half / 2, y + 26],
		],
		{ dashed: true },
	);
	f.arrow(
		[
			[cx, y + 12],
			[x + 12 + half * 1.5, y + 12],
			[x + 12 + half * 1.5, y + 26],
		],
		{ dashed: true },
	);
	y += 28;
	const oh = phone ? 168 : 112;
	f.box({
		x,
		y,
		w: half,
		h: oh,
		kind: 'chalk',
		label: 'Brevo Starter',
		sub: phone
			? ['$9 a month', 'for 5,000 emails,', 'no daily limit.', 'Nothing changes', 'in listmonk.']
			: ['$9 a month for 5,000 emails,', 'no daily limit. Nothing', 'changes in listmonk.'],
		subSize: sub,
		logo: 'brevo',
		size: 15,
		stack: phone,
	});
	f.box({
		x: x + 12 + half,
		y,
		w: half,
		h: oh,
		kind: 'chalk',
		label: 'Amazon SES',
		sub: phone
			? [
					'$0.10 per 1,000,',
					'about 3 cents',
					'an issue. New SMTP',
					'login, DKIM, and',
					'a sandbox to exit.',
				]
			: [
					'$0.10 per 1,000 emails, about',
					'3 cents an issue. New SMTP',
					'login, DKIM, and a sandbox.',
				],
		subSize: sub,
		logo: 'amazonwebservices',
		size: 15,
		stack: phone,
	});
}

export const desktop = {
	height: 446,
	draw(f) {
		draw(f, 640, false);
	},
};

export const phone = {
	height: 546,
	draw(f) {
		draw(f, 360, true);
	},
};
