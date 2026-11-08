// linger's project page How it's made figure (src/data/projects.ts): how scroll
// speed fills in or drains a poem, from poem.html and poems.js in JoeKarlsson/linger
export const alt =
	'How linger decides which words you get. It measures how fast you scroll, smoothed over about 0.15 seconds. Under 60 pixels a second you are still, and every line on screen gathers time. Between 60 and 700 you are reading, and nothing changes. Over 700 you are skimming, and the lines lose time four times faster than they gathered it; over 2,100 the page whispers "slower." Each line starts with its plain words. After 1.2 seconds of stillness the words marked with a caret fill in, and after 3.6 seconds the words marked with a tilde fill in too. In the poem file a line looks like: tilde the call, caret came, tilde at five-forty: no school.';

const SCROLL = {
	label: 'You scroll',
	sub: 'speed, smoothed over 0.15 s',
	icon: 'footprints',
	kind: 'chalk',
};
const SPEEDS = [
	{ label: 'Still', sub: ['under 60 px/s:', 'lines gather time'], kind: 'pink', icon: 'clock' },
	{ label: 'Reading', sub: ['60-700 px/s:', 'nothing changes'], kind: 'outline', icon: 'eye' },
	{
		label: 'Skimming',
		sub: ['over 700 px/s:', 'time drains 4× faster'],
		kind: 'outline',
		icon: 'zap',
	},
];
const STAGES = [
	{ label: '0 s', sub: 'plain words' },
	{ label: '1.2 s', sub: '^ words fill in' },
	{ label: '3.6 s', sub: '~ words fill in' },
];
const LINE = ['"~the call ^came ~at five-forty: no school."'];

export const desktop = {
	height: 540,
	draw(f) {
		f.box({ x: 160, y: 16, w: 320, h: 62, size: 17, subSize: 14, ...SCROLL });
		const cols = [110, 320, 530];
		for (const cx of cols) {
			f.arrow([
				[320, 80],
				[320, 100],
				[cx, 100],
				[cx, 126],
			]);
		}
		SPEEDS.forEach((s, i) =>
			f.box({ x: cols[i] - 92, y: 128, w: 184, h: 104, size: 16, subSize: 13, stack: true, ...s }),
		);
		f.arrow([
			[110, 234],
			[110, 324],
		]);
		f.note(122, 262, 'stay');
		f.arrow([
			[530, 234],
			[530, 300],
			[160, 300],
			[160, 324],
		]);
		f.note(518, 262, 'over 2,100 px/s, it whispers "slower."', { anchor: 'end' });
		f.note(250, 290, 'skim: back to plain words');
		const stageX = [40, 240, 440];
		STAGES.forEach((s, i) => {
			f.box({
				x: stageX[i],
				y: 326,
				w: 160,
				h: 70,
				kind: i ? 'pink' : 'chalk',
				size: 18,
				subSize: 14,
				...s,
			});
			if (i) {
				f.arrow([
					[stageX[i] - 38, 361],
					[stageX[i] - 4, 361],
				]);
			}
		});
		f.text(30, 430, 'In the poem file', {
			size: 14,
			color: '#a3a3a3',
			anchor: 'start',
			weight: 700,
		});
		f.code({ x: 30, y: 444, w: 580, lines: LINE, size: 16 });
	},
};

export const phone = {
	height: 900,
	draw(f) {
		f.box({ x: 30, y: 16, w: 300, h: 62, size: 16, subSize: 13, ...SCROLL });
		f.arrow([
			[180, 80],
			[180, 104],
		]);
		f.group({ x: 12, y: 130, w: 336, h: 290, label: 'Your speed' });
		SPEEDS.forEach((s, i) =>
			f.box({ x: 30, y: 154 + i * 86, w: 300, h: 74, size: 15, subSize: 13, ...s }),
		);
		f.note(30, 444, 'over 2,100 px/s, it whispers "slower."');
		f.arrow([
			[180, 456],
			[180, 488],
		]);
		f.group({ x: 12, y: 512, w: 336, h: 270, label: 'Each line on screen' });
		STAGES.forEach((s, i) =>
			f.box({
				x: 30,
				y: 536 + i * 80,
				w: 300,
				h: 66,
				kind: i ? 'pink' : 'chalk',
				size: 16,
				subSize: 13,
				...s,
			}),
		);
		f.code({
			x: 12,
			y: 800,
			w: 336,
			lines: ['"~the call ^came', ' ~at five-forty: no school."'],
			size: 14,
		});
	},
};
