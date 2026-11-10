// Movie lighting: play fades the Great Room out, and a popcorn run doesn't light up the kitchen.

import { FLOOR, SEAT, STAND } from './_rooms.mjs';

export const kit = 'sketch';

export const board = {
	title: 'The popcorn run',
	section: 'Lights that know a movie is playing',
	form: 'Stop-motion scene',
	look: 'crayon',
	claim:
		'Press play and the Great Room fades to almost nothing. Get up for popcorn and the kitchen sensor sees you, but the kitchen stays dark, because a movie is playing. Pause, and a lighter scene comes back so you can find your drink.',
	trigger:
		'A Play button on the frame (the scene’s own play button, which is the joke). Plays once, then Replay.',
	library:
		'None. Drawings swapped on steps() at 8fps; the lamp’s hatching thins out one drawing at a time as it fades.',
	still:
		'The guest in the dark kitchen with the popcorn, the sensor seeing them, the kitchen lamp off and the movie still on.',
	test: 'The walk cycle: four drawings of the stick figure walking through the doorway at 8fps. Does it read as walking or as a figure sliding?',
};

// The Great Room on the left, the kitchen through the doorway on the right
function rooms(f, { great = 0, kitchen = 0, playing = true, seeing = false }) {
	f.floor(FLOOR);
	const { seat } = f.couch(30, SEAT, 150);
	f.lamp(206, FLOOR, great);
	f.tv(250, FLOOR, { playing });
	f.stroke(
		[
			[384, 40],
			[384, FLOOR - 150],
		],
		{ width: 5 },
	);
	f.sensor(520, 56, { seeing });
	f.counter(400, FLOOR, 110);
	f.lamp(600, FLOOR, kitchen);
	return seat;
}

export const frames = [
	{
		at: '0.0s',
		note: 'A guest presses play in Plex. The Great Room lights start fading into the movie scene.',
		draw: (f) => {
			f.figure(...rooms(f, { great: 1, playing: false }), 'sitReach');
			f.chip(24, 20, 'Play');
		},
	},
	{
		at: '3.0s',
		note: 'A few seconds later they’re almost nothing. The kitchen is dark too.',
		draw: (f) => {
			f.figure(...rooms(f, { great: 0.1 }), 'sit');
		},
	},
	{
		at: '4.0s',
		note: 'Popcorn run. The kitchen sensor sees them walk in.',
		draw: (f) => {
			rooms(f, { great: 0.1, seeing: true });
			f.figure(540, STAND, 'walk1');
		},
	},
	{
		at: '4.5s',
		note: 'And the kitchen stays dark, because a movie is playing. Nothing kills a movie like the kitchen lighting up.',
		draw: (f) => {
			rooms(f, { great: 0.1, seeing: true });
			const { hands } = f.figure(540, STAND, 'carry', { facing: -1 });
			f.popcorn(hands[0][0] - 8, hands[0][1]);
			f.chip(24, 20, 'Motion ignored');
		},
	},
	{
		at: '7.0s',
		note: 'Back on the couch, they pause. A lighter movie scene fades in so they can find their drink.',
		draw: (f) => {
			const { hands } = f.figure(...rooms(f, { great: 0.5, playing: false }), 'sitReach');
			f.popcorn(hands[0][0] + 4, hands[0][1] + 4);
			f.chip(24, 20, 'Pause');
		},
	},
];

export const phone = {
	note: 'The kitchen beat on its own: the sensor sees them, the lamp stays off, the movie is still on behind the wall.',
	height: 420,
	draw(f) {
		const floor = 380;
		f.stroke(
			[
				[12, floor],
				[348, floor],
			],
			{ width: 4 },
		);
		f.tv(-50, floor, { playing: true });
		f.stroke(
			[
				[70, 70],
				[70, floor - 150],
			],
			{ width: 5 },
		);
		f.counter(84, floor, 100);
		f.sensor(220, 80, { seeing: true });
		f.lamp(304, floor, 0);
		const { hands } = f.figure(230, floor - 62, 'carry', { facing: -1 });
		f.popcorn(hands[0][0] - 8, hands[0][1]);
		f.chip(16, 12, 'Motion ignored: movie on', { size: 18 });
	},
};
