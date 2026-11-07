import { column, productGroup, snake } from './_steps.mjs';

export const alt =
	'Getting one song into a playlist today, every step by hand. Hear a song, remember it, and go home. In Lidarr: search for the artist, browse the discography, add the whole album, wait for the download, and import it. Twelve tracks land on disk. Then in Navidrome: find the one track you wanted and add it to a playlist.';

const OUT = [
	{ label: ['hear a song'], icon: 'audio-lines' },
	{ label: 'remember it', icon: 'brain' },
	{ label: 'go home', icon: 'footprints' },
];
const LIDARR_1 = [
	{ label: ['search the', 'artist'], icon: 'search' },
	{ label: ['browse the', 'discography'], icon: 'folder-tree' },
	{ label: ['add the', 'whole album'], icon: 'package' },
];
const LIDARR_2 = [
	{ label: ['wait for the', 'download'], icon: 'clock' },
	{ label: 'import it', icon: 'hard-drive-download' },
	{ label: ['12 tracks', 'on disk'], kind: 'chalk', icon: 'folder' },
];
const NAVIDROME = [
	{ label: ['find the 1', 'you wanted'], icon: 'eye' },
	{ label: ['add it to', 'a playlist'], icon: 'list-checks' },
];

export const desktop = {
	height: 644,
	draw(f) {
		f.heading(16, 36, 'Today');
		productGroup(f, { x: 8, y: 220, w: 624, h: 242, logo: 'lidarr', label: 'Lidarr' });
		productGroup(f, { x: 216, y: 508, w: 416, h: 120, logo: 'navidrome', label: 'Navidrome' });
		snake(f, {
			x: 20,
			w: 600,
			gap: 28,
			h: 86,
			rows: [
				{ y: 70, dir: 1, steps: OUT },
				{ y: 238, dir: -1, steps: LIDARR_1 },
				{ y: 358, dir: 1, steps: LIDARR_2 },
				{ y: 526, dir: -1, steps: NAVIDROME, slots: 3 },
			],
		});
	},
};

export const phone = {
	height: 930,
	draw(f) {
		f.heading(16, 36, 'Today', { size: 24 });
		productGroup(f, { x: 20, y: 274, w: 320, h: 450, logo: 'lidarr', label: 'Lidarr' });
		productGroup(f, { x: 20, y: 750, w: 320, h: 160, logo: 'navidrome', label: 'Navidrome' });
		const y = [62, 132, 202, 292, 362, 432, 502, 572, 642, 768, 838];
		column(f, {
			x: 40,
			w: 280,
			h: 52,
			gap: 18,
			y,
			steps: [...OUT, ...LIDARR_1, ...LIDARR_2, ...NAVIDROME],
		});
	},
};
