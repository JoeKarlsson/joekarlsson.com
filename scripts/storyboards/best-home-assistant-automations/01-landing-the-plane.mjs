// Motion lights that turned off on people sitting still, and the 40% warning that fixed it.

import { book, greatRoom, STAND } from './_rooms.mjs';

export const kit = 'sketch';

export const board = {
	title: 'Landing the plane',
	section: 'Motion lighting where a switch always wins',
	form: 'Stop-motion scene',
	look: 'crayon',
	claim:
		'My first motion lights turned off on people sitting still, so everyone learned to wave their arms like they were landing a plane. Now the lights drop to 40% for 45 seconds first, and any movement brings them back.',
	trigger: 'A Play button on the frame. Plays once, ends on frame 5, then Replay.',
	library:
		'None. Every frame is its own drawing, swapped on steps() at 8fps with two or three in-between drawings per move, and the paper boil on top.',
	still:
		'Then and now, stacked: the guest landing the plane, and the guest turning a page in the 40% light.',
	test: 'The wave: the arms flapping between two drawings at 8fps, with the boil. Does it read as frantic waving or as jitter?',
};

const sitter = (f, [x, y], pose = 'sit') => {
	const { head, hands } = f.figure(x, y, pose);
	book(f, hands[1]);
	return head;
};

export const frames = [
	{
		at: '0.0s',
		note: 'My first motion lights. A guest settles in on the couch with a book.',
		draw: (f) => {
			sitter(f, greatRoom(f));
		},
	},
	{
		at: '1.5s',
		note: 'They sit still too long, and the lights go off on them.',
		draw: (f) => {
			const [hx, hy] = sitter(f, greatRoom(f, { level: 0 }));
			f.text(hx + 26, hy - 30, '?', { size: 40, font: 'display', color: '#ff4fd8' });
			f.chip(24, 24, 'Off');
		},
	},
	{
		at: '2.0s',
		note: 'So everyone learned to wave their arms like they were landing a plane. The arms flap between two drawings.',
		draw: (f) => {
			greatRoom(f, { seeing: true });
			f.figure(430, STAND, 'wave1', { paddles: true });
			f.chip(24, 24, 'Landing the plane');
		},
	},
	{
		at: '3.5s',
		note: 'The fix: before a room turns off on its own, the lights drop to 40% for 45 seconds as a warning.',
		draw: (f) => {
			sitter(f, greatRoom(f, { level: 0.4 }));
			f.chip(24, 24, '40% for 45 s');
		},
	},
	{
		at: '4.5s',
		note: 'Turning a page is enough. Any movement brings the lights back.',
		draw: (f) => {
			sitter(f, greatRoom(f, { seeing: true }), 'sitTurn');
			f.chip(24, 24, 'Back on');
		},
	},
];

export const phone = {
	note: 'Then and now in two panels, so a phone gets the whole story without playing anything.',
	height: 600,
	draw(f) {
		const panel = (top, label, level, draw) => {
			f.chip(16, top, label, { size: 18 });
			const floor = top + 270;
			f.stroke(
				[
					[12, floor],
					[348, floor],
				],
				{ width: 4 },
			);
			f.lamp(290, floor, level);
			draw(floor);
		};
		panel(12, 'Then: landing the plane', 1, (floor) => {
			f.sensor(40, 80, { seeing: true });
			f.figure(150, floor - 62, 'wave1', { paddles: true });
		});
		panel(312, 'Now: 40% for 45 s', 0.4, (floor) => {
			const { seat } = f.couch(30, floor - 30, 150);
			sitter(f, seat, 'sitTurn');
		});
	},
};
