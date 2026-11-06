export const alt =
	"How this newsletter is delivered. The signup form on joekarlsson.com talks over HTTPS to a Cloudflare Tunnel with CrowdSec, which opens no ports at home and makes only the subscriber pages public. Inside the homelab on Proxmox, Nginx Proxy Manager answers the admin side with a 404 from the internet, and listmonk and Postgres run in one LXC container built by OpenTofu and backed up to Proxmox Backup Server. The 141 subscribers came in from a Substack CSV export, and the admin UI works only from the home network. listmonk sends over SMTP through Brevo's free plan, 300 emails a day shared with critical alerts and a Plex newsletter, to your inbox, where a reply comes straight to Joe.";

/** The whole delivery path, top to bottom, at any width. */
function draw(f, W, phone) {
	const x = 16;
	const w = W - 32;
	const cx = W / 2;
	const sub = phone ? 13 : 14;
	let y = 16;
	f.box({
		x,
		y,
		w,
		h: 66,
		label: 'joekarlsson.com',
		sub: 'the signup form, and every issue',
		subSize: sub,
		logo: 'astro',
		size: 16,
	});
	y += 66;
	f.arrow(
		[
			[cx, y + 2],
			[cx, y + 34],
		],
		{ heads: 'both' },
	);
	f.note(cx + 12, y + 18, 'HTTPS', { size: 13, weight: 700 });
	y += 36;
	f.box({
		x,
		y,
		w,
		h: phone ? 96 : 78,
		label: 'Cloudflare Tunnel',
		sub: phone
			? ['with CrowdSec. No open ports', 'at home; only the subscriber', 'pages are public']
			: ['with CrowdSec. No open ports at home;', 'only the subscriber pages are public'],
		subSize: sub,
		logo: 'cloudflare',
		size: 16,
	});
	f.logo('crowdsec', x + w - 40, y + (phone ? 48 : 39), 26);
	y += phone ? 96 : 78;
	f.arrow(
		[
			[cx, y + 2],
			[cx, y + 40],
		],
		{ heads: 'both' },
	);
	y += 42 + 22;
	const gy = y;
	const gh = phone ? 346 : 262;
	f.group({ x: x - 8, y: gy, w: w + 16, h: gh, label: 'My homelab, on Proxmox' });
	y += 18;
	f.box({
		x: x + 8,
		y,
		w: w - 16,
		h: phone ? 80 : 64,
		label: 'Nginx Proxy Manager',
		sub: phone
			? ['404 for the admin side', 'from the internet']
			: '404 for the admin side from the internet',
		subSize: sub,
		logo: 'nginxproxymanager',
		size: 16,
	});
	y += phone ? 80 : 64;
	f.arrow(
		[
			[cx, y + 2],
			[cx, y + 26],
		],
		{ heads: 'both' },
	);
	y += 28;
	const lh = phone ? 96 : 76;
	f.box({
		x: x + 8,
		y,
		w: w - 16,
		h: lh,
		kind: 'pink',
		label: 'listmonk + Postgres',
		sub: phone
			? ['one LXC, built by OpenTofu,', 'backed up to Proxmox', 'Backup Server']
			: ['one LXC container, built by OpenTofu,', 'backed up to Proxmox Backup Server'],
		subSize: sub,
		logo: 'listmonk',
		size: 16,
	});
	f.logo('postgresql', x + w - 44, y + lh / 2, 24, 'pink');
	const ly = y + lh;
	y = ly + 26;
	const half = (w - 24) / 2;
	const sideH = phone ? 108 : 58;
	f.box({
		x: x + 8,
		y,
		w: half,
		h: sideH,
		kind: 'dashed',
		label: 'Substack export',
		sub: phone ? ['CSV in, 141', 'subscribers'] : 'CSV in, 141 subscribers',
		subSize: 13,
		logo: 'substack',
		size: 14,
		stack: phone,
	});
	f.box({
		x: x + 16 + half,
		y,
		w: half,
		h: sideH,
		kind: 'dashed',
		label: 'Admin UI',
		sub: phone ? ['home network', 'only'] : 'home network only',
		subSize: 13,
		icon: 'lock',
		size: 14,
		stack: phone,
	});
	f.arrow([
		[x + 8 + half / 2, y - 2],
		[x + 8 + half / 2, ly + 2],
	]);
	f.arrow(
		[
			[x + 16 + half * 1.5, y - 2],
			[x + 16 + half * 1.5, ly + 2],
		],
		{ heads: 'both' },
	);
	y = gy + gh;
	f.arrow([
		[cx, y + 2],
		[cx, y + 40],
	]);
	f.note(cx + 12, y + 21, 'SMTP', { size: 13, weight: 700 });
	y += 42;
	f.box({
		x,
		y,
		w,
		h: phone ? 96 : 78,
		kind: 'chalk',
		label: 'Brevo',
		sub: phone
			? ['free plan: 300 emails a day,', 'shared with critical alerts', 'and a Plex newsletter']
			: [
					'free plan: 300 emails a day, shared with my',
					"homelab's critical alerts and a Plex newsletter",
				],
		subSize: sub,
		logo: 'brevo',
		size: 16,
	});
	y += phone ? 96 : 78;
	f.arrow([
		[cx, y + 2],
		[cx, y + 30],
	]);
	y += 32;
	f.box({
		x,
		y,
		w,
		h: 64,
		label: 'Your inbox',
		sub: 'hit reply and it comes straight to me',
		subSize: sub,
		icon: 'inbox',
		size: 16,
	});
}

export const desktop = {
	height: 790,
	draw(f) {
		draw(f, 640, false);
	},
};

export const phone = {
	height: 946,
	draw(f) {
		draw(f, 360, true);
	},
};
