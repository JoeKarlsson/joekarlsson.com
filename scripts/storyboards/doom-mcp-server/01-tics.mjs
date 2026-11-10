// Why Claude gets verbs, not keys: the game moves 35 times a second while a model thinks for seconds.

const PINK = '#ff4fd8';

export const board = {
	title: 'Press W, three seconds late',
	section: 'How Claude plays Doom through the Doom MCP server',
	form: 'Stop-motion race',
	claim:
		'A tool like "press W" can’t work: Doom runs 35 tics a second, so by the time Claude finishes thinking, the imp has already reached the marine. Verbs fix it, because code steers every tic.',
	trigger:
		'A Play button on the figure, labelled “Try a press-W tool”. Plays once, ends on the last frame, then Replay.',
	library:
		'None. CSS steps() moves the imp in stop-motion hops; a few lines of TypeScript run the tic counter.',
	still: 'Frame 4 (the dead marine at tic 105) with the verbs line under it, as a normal diagram.',
	test: 'The imp hopping at 8fps beside a counter ticking a real 35 a second. Does the gap read in one second, or does the fast counter just look like a glitch?',
};

function scene(f, { tic, thought, code, impX, dead, verbs }) {
	f.box({ x: 20, y: 20, w: 250, h: 56, label: 'Claude', logo: 'claude' });
	if (code) f.code({ x: 20, y: 96, w: 250, lines: [code], highlight: verbs ? [0] : [] });
	else f.box({ x: 20, y: 96, w: 250, h: 48, kind: 'dashed', label: thought });
	f.box({ x: 450, y: 20, w: 170, h: 64, label: `Tic ${tic}`, sub: '35 a second' });
	f.group({ x: 20, y: 210, w: 600, h: 130, label: 'The hall' });
	f.box({ x: 40, y: 250, w: 140, h: 56, kind: 'chalk', label: 'Marine', icon: 'crosshair' });
	f.box({ x: impX, y: 250, w: 110, h: 56, kind: 'pink', label: 'Imp' });
	if (dead) crossOut(f, ...dead);
}

function crossOut(f, x, y, w, h) {
	f.line(
		[
			[x - 6, y - 6],
			[x + w + 6, y + h + 6],
		],
		{ color: PINK, width: 5 },
	);
	f.line(
		[
			[x + w + 6, y - 6],
			[x - 6, y + h + 6],
		],
		{ color: PINK, width: 5 },
	);
}

export const frames = [
	{
		at: '0.0s',
		note: 'Claude gets a press-W tool and starts thinking. The imp is at the far end of the hall.',
		draw: (f) => scene(f, { tic: 0, thought: 'Thinking…', impX: 490 }),
	},
	{
		at: '0.5s',
		note: 'Half a second in: 18 tics have gone by. The imp hops closer, one stop-motion step per frame.',
		draw: (f) => scene(f, { tic: 18, thought: 'Still thinking…', impX: 380 }),
	},
	{
		at: '2.0s',
		note: 'Tic 70. The imp is on the marine. Claude has a plan.',
		draw: (f) => scene(f, { tic: 70, thought: 'I’ll press W', impX: 196 }),
	},
	{
		at: '3.0s',
		note: 'The press arrives at tic 105. The marine died a second ago.',
		draw: (f) => {
			scene(f, { tic: 105, code: 'press_key("W")', impX: 196, dead: [40, 250, 140, 56] });
			f.note(290, 120, 'arrives at tic 105');
		},
	},
	{
		at: '4.0s',
		note: 'Replay with a verb: Claude names the target once, and code aims and fires every tic.',
		draw: (f) => {
			scene(f, {
				tic: 140,
				code: 'attack {"pid": 499785}',
				impX: 330,
				verbs: true,
				dead: [330, 250, 110, 56],
			});
			f.arrow([
				[180, 278],
				[330, 278],
			]);
			f.note(190, 326, 'code aims every tic');
		},
	},
];

export const phone = {
	note: 'Frame 4 stacked for a phone, with the fix spelled out under it.',
	height: 520,
	draw(f) {
		f.box({ x: 16, y: 16, w: 328, h: 52, label: 'Claude', logo: 'claude' });
		f.code({ x: 16, y: 84, w: 328, lines: ['press_key("W")'] });
		f.note(16, 154, 'arrives at tic 105');
		f.box({ x: 16, y: 176, w: 328, h: 60, label: 'Tic 105', sub: '35 a second' });
		f.group({ x: 16, y: 280, w: 328, h: 110, label: 'The hall' });
		f.box({ x: 32, y: 308, w: 140, h: 56, kind: 'chalk', label: 'Marine', icon: 'crosshair' });
		crossOut(f, 32, 308, 140, 56);
		f.box({ x: 190, y: 308, w: 110, h: 56, kind: 'pink', label: 'Imp' });
		f.text(16, 430, 'So Claude gets verbs instead:', { anchor: 'start', size: 16 });
		f.code({ x: 16, y: 446, w: 328, lines: ['attack {"pid": 499785}'], highlight: [0] });
	},
};
