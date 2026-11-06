export const alt =
	'The homelab media setup: clients on desktop and mobile reach everything through an Nginx reverse proxy. Behind it, the Proxmox server runs Plex, Jellyfin, Sonarr, Radarr, Seerr, qBittorrent, Pi-hole, Minecraft and more, and mounts the Synology NAS over NFS, where /volume1/data holds the movies, TV, music and books.';

const APPS = [
	['Plex', 'plex'],
	['Jellyfin', 'jellyfin'],
	['Sonarr', 'sonarr'],
	['Radarr', 'radarr'],
	['Seerr', 'seerr'],
	['qBittorrent', 'qbittorrent'],
	['Pi-hole', 'pihole'],
	['Minecraft', 'minecraft'],
];

/** Proxmox as a container of app chips, two to a row, with "more" underneath. */
function proxmox(f, { x, y, w, chipW }) {
	const rows = Math.ceil(APPS.length / 2);
	const h = 30 + rows * 50 + 30;
	f.group({ x, y, w, h, label: 'Proxmox server' });
	APPS.forEach(([name, logo], i) =>
		f.box({
			x: x + 12 + (i % 2) * (chipW + 8),
			y: y + 18 + Math.floor(i / 2) * 50,
			w: chipW,
			h: 42,
			kind: 'ink',
			label: name,
			logo,
			size: 14,
		}),
	);
	f.note(x + 14, y + h - 18, '+ more', { size: 14, weight: 700 });
	return { bottom: y + h, right: x + w, mid: y + h / 2 };
}

export const desktop = {
	height: 520,
	draw(f) {
		f.box({
			x: 210,
			y: 16,
			w: 220,
			h: 58,
			label: 'Clients',
			sub: 'desktop, mobile',
			icon: 'smartphone',
			size: 15,
			subSize: 13,
		});
		f.arrow(
			[
				[320, 76],
				[320, 100],
			],
			{ heads: 'both' },
		);
		f.box({
			x: 210,
			y: 102,
			w: 220,
			h: 58,
			label: 'Nginx',
			sub: 'reverse proxy',
			logo: 'nginx',
			kind: 'pink',
			size: 15,
			subSize: 13,
		});
		f.arrow(
			[
				[320, 162],
				[320, 180],
				[190, 180],
				[190, 212],
			],
			{ heads: 'both' },
		);
		f.arrow(
			[
				[320, 180],
				[530, 180],
				[530, 268],
			],
			{ heads: 'both' },
		);
		const p = proxmox(f, { x: 16, y: 214, w: 360, chipW: 162 });
		f.box({
			x: 436,
			y: 270,
			w: 188,
			h: 120,
			kind: 'chalk',
			label: 'Synology NAS',
			sub: ['/volume1/data', 'movies, TV,', 'music, books'],
			logo: 'synology',
			size: 14,
			subSize: 13,
			stack: true,
		});
		f.arrow(
			[
				[p.right + 2, 330],
				[434, 330],
			],
			{ heads: 'both' },
		);
		f.note(405, 312, 'NFS', { anchor: 'middle', size: 13, weight: 700 });
	},
};

export const phone = {
	height: 720,
	draw(f) {
		f.box({
			x: 70,
			y: 16,
			w: 220,
			h: 58,
			label: 'Clients',
			sub: 'desktop, mobile',
			icon: 'smartphone',
			size: 15,
			subSize: 13,
		});
		f.arrow(
			[
				[180, 76],
				[180, 100],
			],
			{ heads: 'both' },
		);
		f.box({
			x: 70,
			y: 102,
			w: 220,
			h: 58,
			label: 'Nginx',
			sub: 'reverse proxy',
			logo: 'nginx',
			kind: 'pink',
			size: 15,
			subSize: 13,
		});
		f.arrow(
			[
				[180, 162],
				[180, 200],
			],
			{ heads: 'both' },
		);
		const p = proxmox(f, { x: 8, y: 202, w: 344, chipW: 156 });
		f.arrow(
			[
				[290, 162],
				[290, 182],
				[354, 182],
				[354, p.bottom + 70],
				[342, p.bottom + 70],
			],
			{ heads: 'both' },
		);
		f.arrow(
			[
				[120, p.bottom + 2],
				[120, p.bottom + 36],
			],
			{ heads: 'both' },
		);
		f.note(132, p.bottom + 19, 'NFS mount', { size: 13, weight: 700 });
		f.box({
			x: 16,
			y: p.bottom + 38,
			w: 324,
			h: 80,
			kind: 'chalk',
			label: 'Synology NAS',
			sub: ['/volume1/data:', 'movies, TV, music, books'],
			logo: 'synology',
			size: 15,
			subSize: 13,
		});
	},
};
