// Seven looks for the site's animations, all on the same beat: a guest landing the plane
// to get the motion lights back on. Each frame loops between two drawings.

import { greatRoom, FLOOR, STAND } from '../best-home-assistant-automations/_rooms.mjs';
import { pinkPhoto, tracedPhoto } from './_photo.mjs';

export const kit = 'sketch';

const PINK = '#ff4fd8';
const CHALK = '#ece6da';
const INK = '#000000';

export const board = {
	pick: true,
	title: 'Seven looks, one beat',
	claim:
		'The same moment in seven visual languages, each looping between two drawings so you can see how it moves. All of them keep the site’s pink, black and chalk, torn paper and boil. Pick one or two to take further, or mix: a post could use one look throughout.',
};

const photo = await pinkPhoto();
const traces = [await tracedPhoto(10), await tracedPhoto(18)];

// 1. Crayon stick figures
const crayon = (pose) => (f) => {
	greatRoom(f, { seeing: true });
	f.figure(430, STAND, pose, { paddles: true });
	f.chip(24, 24, 'Landing the plane');
};

// 2. Shadow puppets in a pool of pink light
const shadow = (pose) => (f) => {
	f.torn(
		Array.from({ length: 28 }, (_, i) => {
			const a = (i / 28) * Math.PI * 2;
			return [320 + Math.cos(a) * 190, 178 + Math.sin(a) * 158];
		}),
		PINK,
	);
	// The couch and lamp as black cut-outs against the light
	f.torn(
		[
			[150, 220],
			[176, 220],
			[176, 284],
			[262, 284],
			[262, 262],
			[282, 262],
			[282, 318],
			[150, 318],
		],
		INK,
	);
	f.torn(
		[
			[452, 120],
			[482, 120],
			[492, 150],
			[470, 150],
			[470, 312],
			[488, 318],
			[446, 318],
			[464, 312],
			[464, 150],
			[442, 150],
		],
		INK,
	);
	f.figure(352, STAND, pose, { silhouette: true, color: INK, paddles: CHALK });
	f.text(320, 344, 'LANDING THE PLANE', {
		font: 'display',
		size: 18,
		anchor: 'middle',
		color: CHALK,
	});
};

// 3. Photo collage: the airman cut out of a public-domain photo, with crayon added
const collage = (tilt, burst) => (f) => {
	f.floor(FLOOR);
	f.lamp(560, FLOOR, 1);
	f.sensor(470, 50, { seeing: true });
	f.image(photo, 196, 14, 206, 312, { tilt });
	f.mark(burst, 150, 16, 70, { color: CHALK, strokeWidth: 6 });
	f.mark(burst, 392, 12, 70, { color: CHALK, strokeWidth: 6, rotate: 40 });
	f.chip(24, 290, 'Landing the plane', { color: 'chalk', tilt: 3 });
};

// 4. Traced footage: the same photo as chalk lines, re-traced each drawing
const traced = (i) => (f) => {
	f.image(traces[i], 202, 0, 236, 360);
	f.chip(24, 24, 'Landing the plane');
};

// 5. Kinetic type: the words are the actors
const words = (on) => (f) => {
	f.chip(36, 36, 'Sit still', { color: 'chalk', size: 34, tilt: -3 });
	f.text(36, 160, on ? 'LIGHTS: ON' : 'LIGHTS: OFF', {
		font: 'display',
		size: 76,
		color: on ? PINK : '#555555',
	});
	f.chip(on ? 380 : 360, on ? 236 : 250, 'Wave!', { size: 54, tilt: on ? 9 : -11 });
	f.mark(on ? 'burst' : 'burstDense', on ? 540 : 300, on ? 200 : 214, 80, {
		color: CHALK,
		strokeWidth: 6,
	});
};

// 6. Pixel sprites on the PixelPane grid
function sprite(armsUp) {
	const W = 64;
	const H = 36;
	const grid = Array.from({ length: H }, () => Array(W).fill('.'));
	const set = (x, y, c) => {
		if (x >= 0 && x < W && y >= 0 && y < H) grid[y][x] = c;
	};
	const line = (x0, y0, x1, y1, c) => {
		const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
		for (let i = 0; i <= steps; i++)
			set(Math.round(x0 + ((x1 - x0) * i) / steps), Math.round(y0 + ((y1 - y0) * i) / steps), c);
	};
	const box = (x0, y0, x1, y1, c) => {
		for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, c);
	};
	line(0, 32, 63, 32, 'c');
	// Couch, lamp and its light, the sensor and what it sees
	box(5, 22, 7, 31, 'c');
	box(8, 27, 20, 29, 'c');
	box(19, 25, 20, 29, 'c');
	line(30, 14, 30, 31, 'c');
	box(27, 11, 33, 13, 'p');
	for (let i = 0; i < 6; i++) line(30, 15, 24 + i * 2.4, 24, 'p');
	box(56, 4, 58, 5, 'c');
	line(54, 8, 60, 8, 'p');
	line(53, 10, 61, 10, 'p');
	// The guest: head, body, legs, and arms with wands
	box(49, 15, 51, 17, 'c');
	line(50, 18, 50, 25, 'c');
	line(50, 25, 48, 31, 'c');
	line(50, 25, 52, 31, 'c');
	if (armsUp) {
		line(50, 19, 46, 15, 'c');
		line(50, 19, 54, 15, 'c');
		line(46, 14, 44, 11, 'p');
		line(54, 14, 56, 11, 'p');
	} else {
		line(50, 19, 45, 19, 'c');
		line(50, 19, 55, 19, 'c');
		line(44, 19, 41, 19, 'p');
		line(56, 19, 59, 19, 'p');
	}
	return grid.map((row) => row.join(''));
}
const pixelArt = (armsUp) => (f) => f.pixels(sprite(armsUp), 0, 0, 10, { c: CHALK, p: PINK });

// 7. Joe's sketchbook cast: his traced devil doodle as the guest
const cast = (tilt) => (f) => {
	greatRoom(f, { seeing: true, couchX: 30, lampX: 250, sensorX: 580 });
	f.mark('devil', 340, 70, 150, { color: CHALK, rotate: tilt, strokeWidth: 9 });
	f.mark('burst', tilt > 0 ? 330 : 470, 60, 60, { strokeWidth: 7 });
	f.chip(24, 24, 'Landing the plane');
};

export const frames = [
	{
		at: 'Crayon stick figures',
		note: 'What you’ve seen so far. Cheap to draw any scene in, but every scene ends up looking like the last one.',
		draw: crayon('wave1'),
		drawB: crayon('wave2'),
	},
	{
		at: 'Shadow puppets',
		note: 'Black cut-outs in a pool of pink light, like Lotte Reiniger’s silhouette films. The light is the stage, which suits a post about lights. Faces and small props are hard.',
		draw: shadow('wave1'),
		drawB: shadow('wave2'),
	},
	{
		at: 'Photo collage',
		note: 'A public-domain photo cut out and graded pink like the thumbnails, with crayon added, jerking between poses like Terry Gilliam’s Monty Python cut-outs. Needs a usable photo per scene.',
		draw: collage(-3, 'burst'),
		drawB: collage(3, 'burstDense'),
	},
	{
		at: 'Traced footage',
		note: 'The same photo traced into chalk lines, re-traced each drawing so the line boils, like rotoscoping. Real gestures, if there’s footage or a photo sequence to trace.',
		draw: traced(0),
		drawB: traced(1),
	},
	{
		at: 'Kinetic type',
		note: 'The words are the actors, in Anton on torn scraps. The loudest and cheapest option, with no characters at all.',
		draw: words(false),
		drawB: words(true),
	},
	{
		at: 'Pixel sprites',
		note: 'The PixelPane grid: pink and chalk pixels on black. Ties to your pixel-art projects, but reads as a game more than as your paper look.',
		draw: pixelArt(true),
		drawB: pixelArt(false),
	},
	{
		at: 'Your sketchbook cast',
		note: 'Your own traced doodles (the devil, the face) as the characters, rocking between poses. The most personal option; new scenes need you to draw new characters and poses.',
		draw: cast(-6),
		drawB: cast(6),
	},
];
