// Screencast Director's project page How it's made figure (src/data/projects.ts), not used in
// the post: the whole record, draft, adjust-or-ask flow, from macos/Sources in
// JoeKarlsson/screencast-director. talking-rule.mjs is the post's close-up of the draft step.
export const alt =
	'How Screencast Director goes from recording to edit. Press Control-Option-Command-R in any app and it records your screen, mic and camera, plus a log of when you clicked and typed; Control-Option-Command-M marks a retake. When you stop, whisper.cpp transcribes you on your Mac, and the draft edit plays talking in real time, speeds up typing, cuts silence, filler words and retakes, zooms where you clicked and adds captions. The edit is one plan file, and you change it on the timeline by hand or by asking Claude Code, the Anthropic API or any OpenAI-compatible model.';

const RECORD = {
	label: 'Record',
	sub: ['⌃⌥⌘R in any app:', 'screen, mic, camera'],
	icon: 'monitor',
	kind: 'outline',
};
const LOG = {
	label: 'Input log',
	sub: ['when you clicked', 'and typed'],
	icon: 'activity',
	kind: 'outline',
};
const RETAKE = {
	label: 'Retake',
	sub: ['⌃⌥⌘M cuts the', 'line you just said'],
	icon: 'history',
	kind: 'dashed',
};
const WHISPER = {
	label: 'whisper.cpp',
	font: 'mono',
	sub: 'on your Mac',
	icon: 'audio-lines',
	kind: 'chalk',
};
const DRAFT = {
	label: 'Draft edit',
	sub: ['talking: real time, typing: sped up,', 'silence, fillers, retakes: cut'],
	kind: 'pink',
};
const PLAN = {
	label: 'The edit',
	sub: 'one plan file: clips, zooms, captions',
	icon: 'file-json',
	kind: 'pink',
};
const TIMELINE = {
	label: 'Timeline',
	sub: 'fix it by hand',
	icon: 'layout-dashboard',
	kind: 'outline',
};
const ASK = {
	label: 'Ask',
	sub: ['Claude Code, Anthropic API', 'or OpenAI-compatible'],
	logo: 'claude',
	kind: 'chalk',
};

export const desktop = {
	height: 610,
	draw(f) {
		f.group({ x: 16, y: 40, w: 608, h: 158, label: 'While you talk' });
		[RECORD, LOG, RETAKE].forEach((b, i) =>
			f.box({ x: 30 + i * 198, y: 70, w: 186, h: 112, size: 17, subSize: 13, stack: true, ...b }),
		);
		for (const x of [123, 321, 519]) {
			f.arrow([
				[x, 200],
				[x, 244],
			]);
		}
		f.box({ x: 16, y: 246, w: 214, h: 84, size: 17, subSize: 13, ...WHISPER });
		f.arrow([
			[232, 288],
			[264, 288],
		]);
		f.box({ x: 266, y: 246, w: 358, h: 84, size: 18, subSize: 13, ...DRAFT });
		f.note(135, 226, 'when you stop');
		f.arrow([
			[445, 332],
			[445, 378],
		]);
		f.box({ x: 16, y: 380, w: 608, h: 70, size: 18, subSize: 13, ...PLAN });
		for (const x of [166, 474]) {
			f.arrow(
				[
					[x, 452],
					[x, 500],
				],
				{ heads: 'both' },
			);
		}
		f.box({ x: 16, y: 502, w: 300, h: 86, size: 17, subSize: 13, ...TIMELINE });
		f.box({ x: 324, y: 502, w: 300, h: 86, size: 17, subSize: 13, ...ASK });
	},
};

export const phone = {
	height: 1030,
	draw(f) {
		f.group({ x: 12, y: 40, w: 336, h: 316, label: 'While you talk' });
		[RECORD, LOG, RETAKE].forEach((b, i) =>
			f.box({ x: 30, y: 70 + i * 92, w: 300, h: 80, size: 16, subSize: 13, ...b }),
		);
		f.arrow([
			[180, 358],
			[180, 396],
		]);
		f.note(192, 380, 'when you stop');
		f.box({ x: 30, y: 398, w: 300, h: 70, size: 16, subSize: 13, ...WHISPER });
		f.arrow([
			[180, 470],
			[180, 502],
		]);
		f.box({
			x: 12,
			y: 504,
			w: 336,
			h: 100,
			size: 16,
			subSize: 13,
			...DRAFT,
			sub: ['talking: real time,', 'typing: sped up,', 'silence and retakes: cut'],
		});
		f.arrow([
			[180, 606],
			[180, 638],
		]);
		f.box({
			x: 30,
			y: 640,
			w: 300,
			h: 84,
			size: 16,
			subSize: 13,
			...PLAN,
			sub: ['one plan file: clips,', 'zooms, captions'],
		});
		f.arrow(
			[
				[180, 726],
				[180, 764],
			],
			{ heads: 'both' },
		);
		f.box({ x: 30, y: 766, w: 300, h: 70, size: 16, subSize: 13, ...TIMELINE });
		f.arrow(
			[
				[28, 682],
				[18, 682],
				[18, 924],
				[28, 924],
			],
			{ heads: 'both' },
		);
		f.box({ x: 30, y: 882, w: 300, h: 86, size: 16, subSize: 13, ...ASK });
	},
};
