import { column, snake } from './_steps.mjs';

export const alt =
	'The workflow I want. All I do: Shazam names the song, and I search for it in my music app and tap Add to Library, maybe picking a playlist. Everything else happens on my home server: the request goes into a queue, the server gets the album or a single, whichever is best, extracts the one track, tags it, adds it to my library and the playlist, and pings me when it’s ready. No tool does this yet.';

const YOU = [
	{ label: 'Shazam names it', kind: 'chalk', logo: 'shazam' },
	{ label: 'tap Add to Library', icon: 'smartphone', sub: 'pick a playlist', subSize: 13 },
];
const SERVER_1 = [
	{ label: 'queue', kind: 'pink', icon: 'inbox' },
	{ label: ['get album', 'or single'], kind: 'pink', icon: 'hard-drive-download' },
	{ label: ['extract', 'the track'], kind: 'pink', icon: 'split' },
];
const SERVER_2 = [
	{ label: 'tag it', kind: 'pink', icon: 'tags' },
	{ label: ['library +', 'playlist'], kind: 'pink', icon: 'list-checks' },
	{ label: ['ping me:', 'ready'], kind: 'pink', icon: 'bell' },
];

export const desktop = {
	height: 524,
	draw(f) {
		f.heading(16, 36, 'The dream');
		f.group({ x: 8, y: 94, w: 624, h: 126, label: 'All I do' });
		f.group({ x: 8, y: 264, w: 624, h: 242, label: 'My home server does the rest' });
		snake(f, {
			x: 20,
			w: 600,
			gap: 28,
			h: 86,
			rows: [
				{ y: 116, dir: 1, steps: YOU },
				{ y: 282, dir: -1, steps: SERVER_1 },
				{ y: 402, dir: 1, steps: SERVER_2 },
			],
		});
	},
};

export const phone = {
	height: 776,
	draw(f) {
		f.heading(16, 36, 'The dream', { size: 24 });
		f.group({ x: 20, y: 90, w: 320, h: 160, label: 'All I do' });
		f.group({ x: 20, y: 294, w: 320, h: 456, label: 'My home server' });
		const y = [106, 178, 312, 382, 452, 522, 592, 662];
		column(f, { x: 40, w: 280, h: 56, gap: 18, y, steps: [...YOU, ...SERVER_1, ...SERVER_2] });
	},
};
