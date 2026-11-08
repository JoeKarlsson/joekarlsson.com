// Adult Swim Bumper's project page How it's made figure (src/data/projects.ts):
// from bumpers.yaml to a bumper before a movie, from JoeKarlsson/adult-swim-bumper
export const alt =
	'How a bumper gets made. Each bumper is a few lines in bumpers.yaml: two to four text cards, a background clip and a music track. bumper render runs ffmpeg and writes a ten-second MP4 with the cards fading through one at a time and [yourserver] as the last card. NeXroll, a self-hosted pre-roll manager, shuffles the MP4s, and Plex plays one before every movie on Joeflix. TV episodes start cold, because Plex only plays pre-rolls before movies.';

const STEPS = [
	{
		label: 'bumpers.yaml',
		sub: '2-4 cards, clip, music',
		icon: 'file-code',
		kind: 'chalk',
		font: 'mono',
	},
	{
		label: 'bumper render',
		sub: 'ffmpeg, one MP4 each',
		logo: 'ffmpeg',
		kind: 'pink',
		font: 'mono',
	},
	{ label: 'A 10-second MP4', sub: 'last card: [yourserver]', icon: 'film', kind: 'outline' },
	{ label: 'NeXroll', sub: 'shuffles them', icon: 'refresh-cw', kind: 'chalk' },
	{ label: 'Joeflix', sub: 'Plex, before movies', logo: 'plex', kind: 'chalk' },
];

export const desktop = {
	height: 330,
	draw(f) {
		const B = { w: 190, h: 100, size: 16, subSize: 13, stack: true };
		f.box({ x: 15, y: 20, ...B, ...STEPS[0] });
		f.box({ x: 225, y: 20, ...B, ...STEPS[1] });
		f.box({ x: 435, y: 20, ...B, ...STEPS[2] });
		f.arrow([
			[207, 70],
			[223, 70],
		]);
		f.arrow([
			[417, 70],
			[433, 70],
		]);
		f.box({ x: 435, y: 170, ...B, ...STEPS[3] });
		f.box({ x: 225, y: 170, ...B, w: 190, ...STEPS[4] });
		f.arrow([
			[530, 122],
			[530, 168],
		]);
		f.arrow([
			[433, 220],
			[417, 220],
		]);
		f.note(15, 200, 'TV episodes start cold:');
		f.note(15, 222, 'Plex only plays pre-rolls');
		f.note(15, 244, 'before movies.');
	},
};

export const phone = {
	height: 680,
	draw(f) {
		STEPS.forEach((s, i) => {
			f.box({ x: 30, y: 16 + i * 124, w: 300, h: 92, size: 16, subSize: 13, stack: true, ...s });
			if (i < STEPS.length - 1)
				f.arrow([
					[180, 110 + i * 124],
					[180, 138 + i * 124],
				]);
		});
		f.note(30, 636, 'TV episodes start cold: Plex only');
		f.note(30, 658, 'plays pre-rolls before movies.');
	},
};
