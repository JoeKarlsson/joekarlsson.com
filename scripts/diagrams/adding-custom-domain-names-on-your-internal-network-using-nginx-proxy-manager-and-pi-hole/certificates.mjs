export const alt =
	'Two ways to get a certificate browsers trust on a local domain. If you own a public domain: Nginx Proxy Manager uses a Cloudflare API token to add a TXT record, Let’s Encrypt checks that record with the DNS-01 challenge and issues a wildcard certificate for *.home.yourdomain.com, which renews itself and is trusted by every browser. With no public domain: mkcert -install creates a local certificate authority in your trust store, mkcert magic.mirror signs a cert and key for that name, and the CA has to be installed by hand on every phone, tablet and laptop. Let’s Encrypt won’t sign magic.mirror because .mirror isn’t a public suffix.';

function ownDomain(f, x, y, w) {
	const bw = w - 40;
	const cx = x + 44;
	f.group({ x, y, w, h: 430, label: 'You own a domain' });
	f.box({
		x: x + 20,
		y: y + 24,
		w: bw,
		h: 60,
		kind: 'pink',
		label: 'Nginx Proxy Manager',
		size: 14,
		logo: 'nginxproxymanager',
	});
	f.arrow([
		[cx, y + 86],
		[cx, y + 128],
	]);
	f.note(cx + 10, y + 111, 'API token adds a TXT record', { size: 14 });
	f.box({
		x: x + 20,
		y: y + 130,
		w: bw,
		h: 60,
		kind: 'chalk',
		label: 'Cloudflare DNS',
		logo: 'cloudflare',
	});
	f.arrow([
		[cx, y + 192],
		[cx, y + 234],
	]);
	f.note(cx + 10, y + 217, 'DNS-01 challenge', { size: 14 });
	f.box({
		x: x + 20,
		y: y + 236,
		w: bw,
		h: 60,
		kind: 'chalk',
		label: 'Let’s Encrypt',
		logo: 'letsencrypt',
	});
	f.arrow([
		[cx, y + 298],
		[cx, y + 340],
	]);
	f.note(cx + 10, y + 323, 'issues', { size: 14 });
	f.box({
		x: x + 20,
		y: y + 342,
		w: bw,
		h: 68,
		kind: 'pink',
		label: '*.home.yourdomain.com',
		font: 'mono',
		size: 14,
		sub: 'trusted everywhere, renews itself',
		subSize: 13,
	});
}

function noDomain(f, x, y, w) {
	const bw = w - 40;
	const cx = x + 44;
	f.group({ x, y, w, h: 430, label: 'No public domain' });
	f.box({
		x: x + 20,
		y: y + 24,
		w: bw,
		h: 60,
		kind: 'outline',
		label: 'mkcert -install',
		font: 'mono',
		size: 15,
		icon: 'terminal',
	});
	f.arrow([
		[cx, y + 86],
		[cx, y + 128],
	]);
	f.note(cx + 10, y + 111, 'creates', { size: 14 });
	f.box({
		x: x + 20,
		y: y + 130,
		w: bw,
		h: 60,
		kind: 'chalk',
		label: 'Local CA',
		sub: 'in your trust store',
		icon: 'shield-check',
	});
	f.arrow([
		[cx, y + 192],
		[cx, y + 234],
	]);
	f.note(cx + 10, y + 217, 'mkcert magic.mirror', { size: 14, font: 'mono' });
	f.box({
		x: x + 20,
		y: y + 236,
		w: bw,
		h: 60,
		kind: 'pink',
		label: 'magic.mirror',
		font: 'mono',
		size: 15,
		sub: 'cert + key',
		subSize: 13,
	});
	f.arrow(
		[
			[cx, y + 298],
			[cx, y + 340],
		],
		{ dashed: true },
	);
	f.note(cx + 10, y + 323, 'and the CA goes on', { size: 14 });
	f.box({
		x: x + 20,
		y: y + 342,
		w: bw,
		h: 68,
		kind: 'dashed',
		label: 'every phone and laptop',
		size: 14,
		sub: 'installed by hand',
		subSize: 13,
		icon: 'smartphone',
	});
}

export const desktop = {
	height: 540,
	draw(f) {
		ownDomain(f, 10, 34, 300);
		noDomain(f, 330, 34, 300);
		f.text(330, 496, 'Let’s Encrypt won’t sign magic.mirror:', {
			font: 'serif',
			size: 15,
			anchor: 'start',
		});
		f.note(330, 518, '.mirror isn’t a public suffix', { size: 14 });
		f.crayonArrow([324, 490], [298, 302], -24);
	},
};

export const phone = {
	height: 1036,
	draw(f) {
		ownDomain(f, 10, 34, 340);
		f.text(10, 500, 'Let’s Encrypt won’t sign magic.mirror:', {
			font: 'serif',
			size: 15,
			anchor: 'start',
		});
		f.note(10, 522, '.mirror isn’t a public suffix', { size: 14 });
		f.crayonArrow([344, 494], [341, 302], 2);
		noDomain(f, 10, 580, 340);
	},
};
