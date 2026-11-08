// Rose Hobart's project page How it's made figure (src/data/projects.ts): what the
// viewer's projection booth does to the film, from src/theater/effects.ts, stage.ts,
// renderer.ts, tracks.ts and soundtrack.ts in JoeKarlsson/rose-hobart
export const alt =
	"How the Rose Hobart booth works. You run the projector. On the picture side there are six presets, from As circulated and Cornell 1936 to Pink filter, Nitrate decay, Broken projector and Digital decay; six theatrical gels, including Cornell blue and pink, with a density slider; an Age dial that runs from fresh print to nitrate rot; and a Glitch dial that runs from clean to datamoshed. All of them feed one WebGL2 shader that repaints every frame of the film. Speed sets the video's playback rate, 16 frames a second as circulated or 24 at sound speed, and the pitch moves with it. Music swaps the film's 1957 records for eight 78s from 1919 to 1924, My Bloody Valentine's Soon, or silence, and a record only plays while the film runs. Without WebGL2 the film still plays as circulated, with speed and music.";

const YOU = { label: 'You run the booth', icon: 'user', kind: 'outline' };
const PICTURE = [
	{ label: 'Presets', sub: ['Cornell 1936,', 'Nitrate decay'] },
	{ label: 'Gels', sub: ['Cornell blue,', 'pink and more'] },
	{ label: 'Age', sub: ['fresh print to', 'nitrate rot'] },
	{ label: 'Glitch', sub: ['clean to', 'datamoshed'] },
];
const SPEED = { label: 'Speed', sub: ['16 fps silent,', '24 fps sound'], kind: 'chalk' };
const MUSIC = {
	label: 'Music',
	sub: ['1957 records,', 'eight 78s,', 'one 1990 song', 'or silence'],
	kind: 'chalk',
};
const SHADER = {
	label: 'WebGL2 shader',
	sub: 'repaints every frame',
	kind: 'pink',
	icon: 'layers',
};
const RATE = {
	label: 'Playback rate',
	sub: ['pitch moves', 'with it'],
	kind: 'outline',
	icon: 'clock',
};
const RECORD = {
	label: 'Record player',
	sub: ['plays while', 'the film runs'],
	kind: 'outline',
	icon: 'speaker',
};
const SCREEN = { label: 'Rose Hobart, 1936', icon: 'film', kind: 'chalk' };

export const desktop = {
	height: 566,
	draw(f) {
		f.box({ x: 200, y: 16, w: 240, h: 54, size: 17, ...YOU });
		for (const cx of [164, 390, 548])
			f.arrow([
				[320, 72],
				[320, 90],
				[cx, 90],
				[cx, 124],
			]);
		f.group({ x: 16, y: 126, w: 296, h: 176, label: 'Picture' });
		PICTURE.forEach((p, i) =>
			f.box({
				x: 28 + (i % 2) * 140,
				y: 140 + Math.floor(i / 2) * 78,
				w: 132,
				h: 70,
				kind: 'chalk',
				size: 16,
				subSize: 13,
				...p,
			}),
		);
		f.box({ x: 320, y: 126, w: 140, h: 176, size: 16, subSize: 13, ...SPEED });
		f.box({ x: 472, y: 126, w: 152, h: 176, size: 16, subSize: 13, ...MUSIC });
		const engines = [
			[16, 296, SHADER, 164],
			[320, 140, RATE, 390],
			[472, 152, RECORD, 548],
		];
		for (const [x, w, spec, cx] of engines) {
			f.arrow([
				[cx, 304],
				[cx, 338],
			]);
			f.box({ x, y: 340, w, h: 112, size: 15, subSize: 13, stack: true, ...spec });
		}
		f.box({ x: 120, y: 492, w: 360, h: 54, size: 17, ...SCREEN });
		f.arrow([
			[164, 454],
			[164, 490],
		]);
		f.arrow([
			[390, 454],
			[390, 490],
		]);
		f.arrow([
			[548, 454],
			[548, 519],
			[482, 519],
		]);
	},
};

export const phone = {
	height: 840,
	draw(f) {
		f.box({ x: 30, y: 16, w: 300, h: 54, size: 16, ...YOU });
		f.arrow([
			[180, 72],
			[180, 104],
		]);
		f.group({ x: 12, y: 106, w: 336, h: 184, label: 'Picture' });
		PICTURE.forEach((p, i) =>
			f.box({
				x: 24 + (i % 2) * 160,
				y: 120 + Math.floor(i / 2) * 82,
				w: 152,
				h: 74,
				kind: 'chalk',
				size: 15,
				subSize: 13,
				...p,
			}),
		);
		f.arrow([
			[180, 292],
			[180, 318],
		]);
		f.box({ x: 30, y: 320, w: 300, h: 64, size: 15, subSize: 13, ...SHADER });
		// Speed and music hang off the right edge, clear of the picture controls
		f.arrow([
			[332, 43],
			[352, 43],
			[352, 436],
			[262, 436],
			[262, 454],
		]);
		f.arrow([
			[352, 436],
			[99, 436],
			[99, 454],
		]);
		f.box({ x: 24, y: 456, w: 150, h: 124, size: 15, subSize: 13, ...SPEED });
		f.box({ x: 186, y: 456, w: 152, h: 124, size: 15, subSize: 13, ...MUSIC });
		for (const cx of [99, 262])
			f.arrow([
				[cx, 582],
				[cx, 610],
			]);
		f.box({ x: 24, y: 612, w: 150, h: 110, size: 14, subSize: 13, stack: true, ...RATE });
		f.box({ x: 186, y: 612, w: 152, h: 110, size: 14, subSize: 13, stack: true, ...RECORD });
		f.arrow([
			[180, 386],
			[180, 404],
			[6, 404],
			[6, 795],
			[28, 795],
		]);
		for (const cx of [99, 262])
			f.arrow([
				[cx, 724],
				[cx, 766],
			]);
		f.box({ x: 30, y: 768, w: 300, h: 54, size: 16, ...SCREEN });
	},
};
