export const alt =
	'How a custom local domain resolves. The browser asks Pi-hole where magic.mirror is, and Pi-hole’s local DNS record answers with Nginx Proxy Manager’s IP. The browser sends its request for magic.mirror to Nginx Proxy Manager, whose proxy host forwards it to the IP of the server running Magic Mirror, and the page comes back the same way.';

const browser = (f, x, y, w) =>
	f.box({
		x,
		y,
		w,
		h: 64,
		kind: 'outline',
		label: 'Browser',
		sub: 'magic.mirror',
		subFont: 'mono',
		icon: 'laptop',
	});
const pihole = (f, x, y, w) =>
	f.box({
		x,
		y,
		w,
		h: 64,
		kind: 'pink',
		label: 'Pi-hole',
		sub: 'local DNS record',
		logo: 'pihole',
	});
const npm = (f, x, y, w) =>
	f.box({
		x,
		y,
		w,
		h: 64,
		kind: 'pink',
		label: 'Nginx Proxy Manager',
		size: 15,
		sub: 'proxy host',
		logo: 'nginxproxymanager',
	});
const service = (f, x, y, w) =>
	f.box({
		x,
		y,
		w,
		h: 64,
		kind: 'chalk',
		label: 'Magic Mirror',
		sub: 'the service’s own IP',
		icon: 'monitor',
	});

export const desktop = {
	height: 420,
	draw(f) {
		browser(f, 20, 40, 180);
		pihole(f, 390, 40, 230);
		f.arrow(
			[
				[202, 72],
				[388, 72],
			],
			{ heads: 'both' },
		);
		f.note(295, 60, 'where is magic.mirror?', { anchor: 'middle', size: 14 });
		f.note(295, 96, 'back: NPM’s IP', { anchor: 'middle', size: 14 });
		npm(f, 390, 190, 230);
		f.arrow(
			[
				[110, 106],
				[110, 222],
				[388, 222],
			],
			{ heads: 'both' },
		);
		f.note(126, 210, 'the request for magic.mirror', { size: 14 });
		service(f, 390, 330, 230);
		f.arrow(
			[
				[505, 256],
				[505, 328],
			],
			{ heads: 'both' },
		);
		f.note(493, 296, 'Forward Hostname / IP', { size: 14, anchor: 'end' });
	},
};

export const phone = {
	height: 560,
	draw(f) {
		pihole(f, 30, 30, 300);
		f.arrow(
			[
				[180, 96],
				[180, 168],
			],
			{ heads: 'both' },
		);
		f.note(192, 122, 'where is magic.mirror?', { size: 14 });
		f.note(192, 144, 'back: NPM’s IP', { size: 14 });
		browser(f, 30, 170, 300);
		f.arrow(
			[
				[180, 236],
				[180, 308],
			],
			{ heads: 'both' },
		);
		f.note(192, 272, 'request for magic.mirror', { size: 14 });
		npm(f, 30, 310, 300);
		f.arrow(
			[
				[180, 376],
				[180, 448],
			],
			{ heads: 'both' },
		);
		f.note(192, 412, 'Forward Hostname / IP', { size: 14 });
		service(f, 30, 450, 300);
	},
};
