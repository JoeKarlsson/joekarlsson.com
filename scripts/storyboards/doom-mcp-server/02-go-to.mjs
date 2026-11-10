// go_to step by step: one name from Claude becomes waypoints, and each waypoint becomes tics.

const PINK = '#ff4fd8';
const MUTED = '#a3a3a3';

export const board = {
	title: 'Walk go_to one step at a time',
	section: 'What happens when Claude calls go_to',
	form: 'Step-through diagram',
	claim:
		'The existing go_to diagram, played one step at a time: a name goes down, play.py turns it into five waypoints, the engine walks them tic by tic, and “arrived” comes back up.',
	trigger:
		'Next and Back buttons under the figure (arrow keys work once it has focus). Nothing moves until the reader presses Next.',
	library:
		'Anime.js timeline, loaded only on this post: it can seek to any step for Back, and staggers the waypoint draw-in.',
	still:
		'Today’s go_to diagram, unchanged. On phones and with reduced motion the buttons still work, but each step snaps instead of moving.',
	test: 'The marine walking waypoint 2 to 3 in 12fps hops while the active layer turns pink. Does stop-motion movement still read as walking?',
};

// Waypoints on the mini map: back out of the lobby, the hall, under the door, at the door, inside
const WAYPOINTS = [
	[440, 240],
	[440, 214],
	[536, 214],
	[536, 194],
	[536, 156],
];
const START = [440, 276];

function stack(f, active) {
	const kind = (layer) => (layer === active ? 'pink' : 'outline');
	f.box({
		x: 20,
		y: 20,
		w: 290,
		h: 80,
		kind: kind(1),
		label: 'Claude',
		logo: 'claude',
		sub: 'go_to("Salesforce")',
		subFont: 'mono',
	});
	f.arrow(
		[
			[165, 104],
			[165, 136],
		],
		{ heads: 'both' },
	);
	f.box({
		x: 20,
		y: 140,
		w: 290,
		h: 80,
		kind: kind(2),
		label: 'play.py',
		logo: 'python',
		sub: 'plans the route',
	});
	f.arrow(
		[
			[165, 224],
			[165, 256],
		],
		{ heads: 'both' },
	);
	f.box({
		x: 20,
		y: 260,
		w: 290,
		h: 80,
		kind: kind(3),
		label: 'psdoom-ng',
		icon: 'gamepad-2',
		sub: 'steers, every tic',
	});
}

function map(f, { waypoints = 0, marineAt, doorOpen }) {
	f.group({ x: 340, y: 40, w: 280, h: 300, label: 'Top-down map' });
	// The lobby's name sits low, so the marine can start above it
	f.box({ x: 360, y: 254, w: 140, h: 80, kind: 'dashed' });
	f.text(372, 318, 'Lobby', { font: 'display', size: 20, anchor: 'start', upper: true });
	f.box({
		x: 466,
		y: 52,
		w: 150,
		h: 120,
		kind: 'chalk',
		label: 'Salesforce',
		logo: 'salesforce',
		stack: true,
	});
	// The door on the room's bottom edge: shut, or swung open
	f.line(
		doorOpen
			? [
					[516, 174],
					[504, 198],
				]
			: [
					[516, 174],
					[556, 174],
				],
		{ color: PINK, width: 6 },
	);
	if (waypoints) {
		const shown = WAYPOINTS.slice(0, waypoints);
		f.line([START, ...shown], { color: MUTED, width: 2 });
		shown.forEach(([x, y], i) => {
			f.dot(x, y, 6, '#ededed');
			// The last one is inside the room: its number goes right of the dot, in ink on the chalk
			const inRoom = i === WAYPOINTS.length - 1;
			f.text(inRoom ? x + 14 : x - 12, y + 1, String(i + 1), {
				size: 15,
				weight: 700,
				anchor: inRoom ? 'start' : 'end',
				color: inRoom ? '#000000' : '#ededed',
			});
		});
	}
	const [mx, my] = marineAt ?? START;
	f.dot(mx, my, 10, PINK);
}

export const frames = [
	{
		at: 'Step 1',
		note: 'Claude names a room. That name is all that crosses: no pixel, no coordinate.',
		draw: (f) => {
			stack(f, 1);
			map(f, {});
		},
	},
	{
		at: 'Step 2',
		note: 'play.py built the level, so it knows where every door is. The name turns into five waypoints, drawn in one after another.',
		draw: (f) => {
			stack(f, 2);
			map(f, { waypoints: 5 });
		},
	},
	{
		at: 'Step 3',
		note: 'Each waypoint is one MOVE command. Every tic the engine turns, walks, and calls it arrived within 16 units.',
		draw: (f) => {
			stack(f, 3);
			map(f, { waypoints: 5, marineAt: WAYPOINTS[2] });
		},
	},
	{
		at: 'Step 4',
		note: 'At the door it turns to face it, presses use, and waits about a second for it to open.',
		draw: (f) => {
			stack(f, 3);
			map(f, { waypoints: 5, marineAt: WAYPOINTS[3], doorOpen: true });
			f.note(556, 236, 'use,');
			f.note(556, 256, '1.2 s');
		},
	},
	{
		at: 'Step 5',
		note: '“Arrived” goes back up both layers, and Claude makes its next call.',
		draw: (f) => {
			stack(f, 1);
			map(f, { waypoints: 5, marineAt: WAYPOINTS[4], doorOpen: true });
			f.note(178, 124, 'arrived', { color: PINK, weight: 700 });
			f.note(178, 244, 'arrived', { color: PINK, weight: 700 });
		},
	},
];

export const phone = {
	note: 'The phone layout of today’s diagram. Next and Back still work here; each step snaps to its state.',
	height: 470,
	draw(f) {
		f.box({
			x: 16,
			y: 16,
			w: 328,
			h: 90,
			label: 'Claude',
			logo: 'claude',
			sub: 'go_to("Salesforce")',
			subFont: 'mono',
		});
		f.arrow(
			[
				[180, 110],
				[180, 150],
			],
			{ heads: 'both' },
		);
		f.note(194, 134, 'a name, nothing else');
		f.box({
			x: 16,
			y: 154,
			w: 328,
			h: 90,
			label: 'play.py',
			logo: 'python',
			sub: 'plans five waypoints',
		});
		f.arrow(
			[
				[180, 248],
				[180, 288],
			],
			{ heads: 'both' },
		);
		f.note(194, 272, 'MOVE x y', { font: 'mono' });
		f.box({
			x: 16,
			y: 292,
			w: 328,
			h: 90,
			kind: 'pink',
			label: 'psdoom-ng',
			icon: 'gamepad-2',
			sub: 'steers, 35 times a second',
		});
		f.text(16, 420, 'Back', { anchor: 'start', size: 16, weight: 700 });
		f.text(180, 420, 'Step 3 of 5', { size: 16, color: MUTED });
		f.text(344, 420, 'Next', { anchor: 'end', size: 16, weight: 700 });
	},
};
