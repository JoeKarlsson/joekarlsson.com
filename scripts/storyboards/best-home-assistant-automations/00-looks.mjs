// One frame, three ways: which look should the post's scenes be drawn in?

import { greatRoom, STAND } from './_rooms.mjs';

export const kit = 'sketch';

export const board = {
	pick: true,
	title: 'Landing the plane, three ways',
	claim:
		'The same frame from board 1 in three looks, all from the site’s own kit: crayon, torn paper, tape and pink on black. Pick one for every scene in the post, or mix them by board.',
};

function landingThePlane(f) {
	greatRoom(f, { seeing: true });
	f.figure(430, STAND, 'wave1', { paddles: true });
	f.chip(24, 24, 'Landing the plane');
}

export const frames = [
	{
		at: 'A · Crayon',
		look: 'crayon',
		note: 'Stick figures in chalk crayon, the same stroke as my sketchbook scribbles, with pink crayon hatching for light.',
		draw: landingThePlane,
	},
	{
		at: 'B · Cut-paper puppets',
		look: 'puppet',
		note: 'Chalk paper strips pinned at the joints, props cut from torn scraps. It moves like cut-out animation.',
		draw: landingThePlane,
	},
	{
		at: 'C · Sketchbook page',
		look: 'sketchbook',
		note: 'Black crayon on a chalk page taped onto the black, like the taped prints in post heroes.',
		draw: landingThePlane,
	},
];
