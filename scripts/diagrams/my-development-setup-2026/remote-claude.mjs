export const alt =
	'Working from a phone: Termius on an iPhone connects with mosh over Tailscale to claude-dev, a Debian LXC on Proxmox. On login it cleans up stale sessions, runs git pull and starts Claude Code, which reaches Plex, Home Assistant, the Proxmox nodes and the NAS over SSH.';

const TARGETS = [
	{ label: 'Plex', logo: 'plex' },
	{ label: ['Home', 'Assistant'], logo: 'homeassistant' },
	{ label: ['Proxmox', 'nodes'], logo: 'proxmox' },
	{ label: 'NAS', logo: 'synology' },
];

export const desktop = {
	height: 470,
	draw(f) {
		f.box({
			x: 16,
			y: 20,
			w: 220,
			h: 64,
			label: 'iPhone',
			sub: 'Termius',
			logo: 'termius',
			size: 16,
			subSize: 13,
		});
		f.arrow([
			[126, 86],
			[126, 140],
		]);
		f.note(140, 104, 'mosh over', { size: 13 });
		f.note(140, 120, 'Tailscale', { size: 13, weight: 700 });
		f.box({
			x: 16,
			y: 142,
			w: 220,
			h: 64,
			label: 'claude-dev',
			sub: 'Debian LXC on Proxmox',
			logo: 'debian',
			size: 16,
			subSize: 13,
		});
		f.arrow([
			[126, 208],
			[126, 290],
		]);
		f.note(140, 226, 'on login:', { size: 13, weight: 700 });
		f.note(140, 244, 'clean up stale sessions,', { size: 13 });
		f.note(140, 262, 'git pull, claude', { size: 13 });
		f.box({
			x: 16,
			y: 292,
			w: 220,
			h: 64,
			kind: 'pink',
			label: 'Claude Code',
			logo: 'claude',
			size: 16,
		});
		const ys = [70, 166, 262, 358];
		ys.forEach((y) =>
			f.arrow([
				[238, 324],
				[400, 324],
				[400, y + 28],
				[430, y + 28],
			]),
		);
		f.note(256, 306, 'SSH', { size: 13, weight: 700 });
		TARGETS.forEach((t, i) => f.box({ x: 432, y: ys[i], w: 192, h: 56, size: 15, ...t }));
	},
};

export const phone = {
	height: 640,
	draw(f) {
		f.box({
			x: 70,
			y: 16,
			w: 220,
			h: 60,
			label: 'iPhone',
			sub: 'Termius',
			logo: 'termius',
			size: 16,
			subSize: 13,
		});
		f.arrow([
			[120, 78],
			[120, 132],
		]);
		f.note(134, 98, 'mosh over Tailscale', { size: 13 });
		f.box({
			x: 70,
			y: 134,
			w: 220,
			h: 60,
			label: 'claude-dev',
			sub: 'Debian LXC on Proxmox',
			logo: 'debian',
			size: 16,
			subSize: 13,
		});
		f.arrow([
			[120, 196],
			[120, 280],
		]);
		f.note(134, 216, 'on login: clean up', { size: 13 });
		f.note(134, 234, 'stale sessions,', { size: 13 });
		f.note(134, 252, 'git pull, claude', { size: 13 });
		f.box({
			x: 70,
			y: 282,
			w: 220,
			h: 58,
			kind: 'pink',
			label: 'Claude Code',
			logo: 'claude',
			size: 16,
		});
		const spots = [
			[20, 404],
			[184, 404],
			[20, 504],
			[184, 504],
		];
		// One arrow into the container: every target is reached the same way
		f.arrow([
			[180, 342],
			[180, 384],
		]);
		f.note(192, 362, 'SSH', { size: 13, weight: 700 });
		f.group({ x: 8, y: 386, w: 344, h: 222, label: 'Over SSH' });
		TARGETS.forEach((t, i) =>
			f.box({ x: spots[i][0], y: spots[i][1], w: 156, h: 90, size: 14, stack: true, ...t }),
		);
	},
};
