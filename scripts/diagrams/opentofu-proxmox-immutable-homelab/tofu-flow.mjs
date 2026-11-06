export const alt =
	'The OpenTofu setup: a Git repo holds a reusable Debian 12 LXC baseline module and one directory per service (provision.sh.tpl, main.tf, variables and outputs). OpenTofu reads and writes its state in MinIO (CT 202 at 192.168.0.202:9000, bucket opentofu-state, a versioned, self-hosted S3 backend) and applies to the Proxmox API, which creates each LXC and runs provision.sh.tpl through pct exec. That gives 62 containers, each running Prometheus node-exporter on port 9100, Promtail shipping logs to Loki, and the service itself. Ansible handles the operational layer across them: config deploys, health-check rollouts and bulk operations.';

const REPO = [
	'opentofu/',
	'  modules/proxmox-lxc/',
	'  services/{name}/',
	'    provision.sh.tpl',
	'    main.tf',
	'    variables.tf, outputs.tf',
];

/** Each container's contents: three chips, one per thing it runs. */
function containers(f, { x, y, w, chipW, phone }) {
	const h = phone ? 196 : 112;
	f.group({ x, y, w, h, label: '62 containers, each with' });
	const chips = [
		{ label: ['node-', 'exporter'], sub: ':9100', logo: 'prometheus' },
		{ label: 'Promtail', sub: 'logs to Loki', logo: 'loki' },
		{ label: ['The', 'service'], icon: 'package' },
	];
	chips.forEach((c, i) => {
		const cx = phone ? x + 12 + (i % 2) * (chipW + 8) : x + 12 + i * (chipW + 8);
		const cy = phone ? y + 18 + Math.floor(i / 2) * 88 : y + 18;
		f.box({ x: cx, y: cy, w: chipW, h: 78, kind: 'ink', size: 14, subSize: 13, ...c });
	});
	return y + h;
}

export const desktop = {
	height: 640,
	draw(f) {
		f.code({ x: 16, y: 16, w: 300, lines: REPO, size: 14 });
		f.note(332, 40, 'a reusable Debian 12', { size: 13 });
		f.note(332, 58, 'LXC baseline module, and', { size: 13 });
		f.note(332, 76, 'one directory per service', { size: 13 });
		f.arrow([
			[166, 172],
			[166, 206],
		]);
		f.box({ x: 76, y: 208, w: 180, h: 56, kind: 'pink', label: 'OpenTofu', logo: 'opentofu' });
		f.arrow(
			[
				[258, 236],
				[370, 236],
			],
			{ heads: 'both' },
		);
		f.note(314, 220, 'state', { anchor: 'middle', size: 13, weight: 700 });
		f.box({
			x: 372,
			y: 196,
			w: 252,
			h: 80,
			kind: 'chalk',
			label: 'MinIO, CT 202',
			sub: ['S3 backend, versioned', 'bucket: opentofu-state'],
			logo: 'minio',
			size: 15,
			subSize: 13,
		});
		f.arrow([
			[166, 266],
			[166, 312],
		]);
		f.note(180, 288, 'applies to', { size: 13 });
		f.box({
			x: 16,
			y: 314,
			w: 300,
			h: 80,
			label: 'Proxmox API',
			sub: ['creates each LXC, runs', 'provision.sh.tpl via pct exec'],
			logo: 'proxmox',
			size: 15,
			subSize: 13,
		});
		f.arrow([
			[290, 396],
			[290, 442],
		]);
		f.box({
			x: 372,
			y: 314,
			w: 252,
			h: 80,
			label: 'Ansible',
			sub: ['config deploys, health', 'checks, bulk operations'],
			logo: 'ansible',
			size: 15,
			subSize: 13,
		});
		f.arrow([
			[498, 396],
			[498, 442],
		]);
		containers(f, { x: 16, y: 444, w: 608, chipW: 188 });
	},
};

export const phone = {
	height: 900,
	draw(f) {
		f.code({ x: 16, y: 16, w: 328, lines: REPO, size: 13 });
		f.arrow([
			[180, 166],
			[180, 196],
		]);
		f.box({ x: 90, y: 198, w: 180, h: 56, kind: 'pink', label: 'OpenTofu', logo: 'opentofu' });
		f.arrow(
			[
				[180, 256],
				[180, 290],
			],
			{ heads: 'both' },
		);
		f.note(194, 273, 'state', { size: 13, weight: 700 });
		f.box({
			x: 16,
			y: 292,
			w: 328,
			h: 80,
			kind: 'chalk',
			label: 'MinIO, CT 202',
			sub: ['S3 backend, versioned', 'bucket: opentofu-state'],
			logo: 'minio',
			size: 15,
			subSize: 13,
		});
		f.arrow([
			[60, 256],
			[60, 274],
			[6, 274],
			[6, 420],
			[14, 420],
		]);
		f.note(70, 262, 'applies to', { size: 13 });
		f.box({
			x: 16,
			y: 392,
			w: 328,
			h: 80,
			label: 'Proxmox API',
			sub: ['creates each LXC, runs', 'provision.sh.tpl via pct exec'],
			logo: 'proxmox',
			size: 15,
			subSize: 13,
		});
		f.arrow([
			[300, 474],
			[300, 508],
		]);
		const bottom = containers(f, { x: 8, y: 510, w: 344, chipW: 156, phone: true });
		f.box({
			x: 16,
			y: bottom + 40,
			w: 328,
			h: 80,
			label: 'Ansible',
			sub: ['config deploys, health', 'checks, bulk operations'],
			logo: 'ansible',
			size: 15,
			subSize: 13,
		});
		f.arrow([
			[180, bottom + 38],
			[180, bottom + 4],
		]);
	},
};
