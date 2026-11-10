// Room presence: a cat is one burst of motion, a person keeps showing they're there.

import { book, FLOOR, greatRoom, meter, STAND } from './_rooms.mjs';

export const kit = 'sketch';

export const board = {
	title: 'Cat or person?',
	section: 'Telling a person from a cat',
	form: 'Stop-motion scene',
	look: 'crayon',
	claim:
		'A cat crossing the room is one burst of motion, so the room still reads as probably empty and the lights go off after 5 minutes. A person moves again, uses the dimmer and sits down, so the room reads as occupied and the lights wait 2 hours.',
	trigger: 'A Play button on the frame. Plays once, then Replay.',
	library:
		'None. Drawings on steps() at 8fps. The pink dot on the “someone here?” line hops between positions instead of sliding.',
	still:
		'Cat and person stacked: one burst and off in 5 minutes, against sitting still and held for 2 hours.',
	test: 'The cat’s trot: two leg drawings and a bobbing head at 8fps. Does it read as a cat walking?',
};

const room = (f, { level = 0, seeing = false, odds }) => {
	const seat = greatRoom(f, { level, seeing, couchX: 40, lampX: 290, sensorX: 200 });
	meter(f, 370, 64, odds, 240);
	return seat;
};

export const frames = [
	{
		at: '0.0s',
		note: 'An empty Great Room, lights off. The cat wanders in.',
		draw: (f) => {
			room(f, { odds: 0.2 });
			f.cat(400, FLOOR, { step: 0 });
		},
	},
	{
		at: '1.0s',
		note: 'One burst of motion turns the lights on. That’s all a cat ever does, so the room still reads as probably empty.',
		draw: (f) => {
			room(f, { level: 1, seeing: true, odds: 0.35 });
			f.cat(480, FLOOR, { step: 1 });
		},
	},
	{
		at: '2.0s',
		note: 'The cat leaves. With nobody probably there, the lights go off after 5 minutes.',
		draw: (f) => {
			room(f, { odds: 0.2 });
			f.chip(24, 20, 'Off after 5 min');
		},
	},
	{
		at: '3.0s',
		note: 'A person walks in, and moves again more than 45 seconds after the lights came on. A cat doesn’t.',
		draw: (f) => {
			room(f, { level: 1, seeing: true, odds: 0.6 });
			f.figure(470, STAND, 'walk2', { facing: -1 });
		},
	},
	{
		at: '4.0s',
		note: 'They sit down with a book and stop moving. The room still reads as occupied, so the lights wait 2 hours.',
		draw: (f) => {
			const seat = room(f, { level: 1, odds: 0.9 });
			const { hands } = f.figure(...seat, 'sit');
			book(f, hands[1]);
			f.chip(24, 20, 'Held for 2 hours');
		},
	},
];

export const phone = {
	note: 'The two cases stacked, so a phone gets the comparison without playing anything.',
	height: 580,
	draw(f) {
		const panel = (top, label, draw) => {
			f.chip(16, top, label, { size: 18 });
			const floor = top + 250;
			f.stroke(
				[
					[12, floor],
					[348, floor],
				],
				{ width: 4 },
			);
			draw(floor);
		};
		panel(12, 'Cat: one burst, off in 5 min', (floor) => {
			f.lamp(80, floor, 0);
			f.cat(220, floor, { step: 1 });
		});
		panel(300, 'Person: held for 2 hours', (floor) => {
			f.lamp(290, floor, 1);
			const { seat } = f.couch(30, floor - 30, 150);
			const { hands } = f.figure(...seat, 'sit');
			book(f, hands[1]);
		});
	},
};
