// FollowSpot's project page How it's made figure (src/data/projects.ts): the listen loop,
// from public/app.js, public/align.js and the followspot launcher in JoeKarlsson/followspot
export const alt =
	"How FollowSpot follows you. Every quarter second, if your mic isn't quiet, the page sends the last 3.5 seconds of audio, plus the last 30 words of the script as a hint, to a whisper.cpp server on 127.0.0.1, so the audio stays on your machine. The newest 14 words it hears are matched against the script from 12 words behind your place to 60 ahead, the highlight moves to the last matched word, and the page scrolls your line to lens height. Backing up for a retake needs at least 4 matched words, and if you keep talking with no match for 1.5 seconds the highlight drifts ahead slowly until it finds you again.";

const MIC = { label: 'Your mic', sub: 'quiet? sends nothing', icon: 'mic', kind: 'outline' };
const AUDIO = {
	label: 'Last 3.5 s',
	sub: ['every 0.25 s, plus', 'last 30 script words'],
	icon: 'clock',
	kind: 'outline',
};
const WHISPER = {
	label: 'whisper-server',
	font: 'mono',
	sub: 'whisper.cpp, 127.0.0.1',
	icon: 'audio-lines',
	kind: 'chalk',
};
const MATCH = {
	label: 'Match',
	sub: ['newest 14 words heard', 'vs 12 back, 60 ahead'],
	icon: 'search',
	kind: 'pink',
};
const HIGHLIGHT = { label: 'Highlight', sub: 'to the last match', icon: 'crosshair', kind: 'pink' };
const SCROLL = { label: 'Scroll', sub: 'line at lens height', icon: 'eye', kind: 'pink' };
const RULES = [
	{ label: 'Retake', sub: ['backs up only with', '4+ matched words'] },
	{ label: 'Lost', sub: ['no match for 1.5 s:', 'drifts ahead slowly'] },
	{ label: 'Quiet', sub: ['you stop,', 'it stops'] },
];

export const desktop = {
	height: 520,
	draw(f) {
		const cols = [16, 228, 436];
		const w = [180, 170, 188];
		const row = (items, y, h) =>
			items.forEach((b, i) =>
				f.box({
					x: cols[i],
					y,
					w: w[i],
					h,
					size: b === WHISPER ? 15 : 17,
					subSize: 13,
					stack: true,
					...b,
				}),
			);
		row([MIC, AUDIO, WHISPER], 20, 108);
		f.arrow([
			[198, 74],
			[226, 74],
		]);
		f.arrow([
			[400, 74],
			[434, 74],
		]);
		f.arrow([
			[530, 130],
			[530, 200],
		]);
		f.note(542, 170, 'text');
		row([SCROLL, HIGHLIGHT, MATCH], 202, 112);
		f.arrow([
			[434, 258],
			[400, 258],
		]);
		f.arrow([
			[226, 258],
			[198, 258],
		]);
		f.group({ x: 16, y: 352, w: 608, h: 150, label: "When it isn't sure" });
		RULES.forEach((r, i) =>
			f.box({
				x: 32 + i * 198,
				y: 382,
				w: 180,
				h: 96,
				kind: 'dashed',
				size: 17,
				subSize: 13,
				...r,
			}),
		);
	},
};

export const phone = {
	height: 1010,
	draw(f) {
		const boxes = [MIC, AUDIO, WHISPER, MATCH, HIGHLIGHT, SCROLL];
		let y = 16;
		boxes.forEach((b, i) => {
			const h = b === MATCH || b === AUDIO ? 82 : 70;
			f.box({ x: 30, y, w: 300, h, size: 16, subSize: 13, ...b });
			if (i < boxes.length - 1) {
				f.arrow([
					[180, y + h + 2],
					[180, y + h + 34],
				]);
				if (b === WHISPER) f.note(192, y + h + 22, 'text');
			}
			y += h + 36;
		});
		f.group({ x: 12, y: y + 10, w: 336, h: 300, label: "When it isn't sure" });
		RULES.forEach((r, i) =>
			f.box({
				x: 30,
				y: y + 36 + i * 88,
				w: 300,
				h: 70,
				kind: 'dashed',
				size: 16,
				subSize: 13,
				...r,
			}),
		);
	},
};
