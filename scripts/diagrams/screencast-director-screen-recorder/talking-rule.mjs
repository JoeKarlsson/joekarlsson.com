export const alt =
	'How Screencast Director drafts the edit. When you stop recording, whisper.cpp transcribes your voice on your Mac, and the app lines that transcript up with a log of when you clicked and typed, never what you typed. Then the talking rule decides every stretch: talking plays in real time, typing without talking fast-forwards, and nothing happening gets cut. The draft edit is a timeline of real-time clips, sped-up clips and cuts, with zooms where you clicked and captions from what you said. On one demo, a 3:36 recording came out at 2:56.';

const RULES = [
	['talking', 'real time', 'pink'],
	['typing, not talking', 'fast-forward', 'pink'],
	['nothing happening', 'cut', 'dashed'],
];

export const desktop = {
	height: 630,
	draw(f) {
		f.box({
			x: 16,
			y: 40,
			w: 170,
			h: 70,
			label: 'Recording',
			sub: 'screen + mic',
			icon: 'monitor',
		});
		f.arrow([
			[188, 75],
			[210, 75],
		]);
		f.box({
			x: 212,
			y: 40,
			w: 190,
			h: 70,
			kind: 'chalk',
			label: 'whisper.cpp',
			font: 'mono',
			size: 16,
			sub: 'on your Mac',
			subSize: 14,
			icon: 'audio-lines',
		});
		f.box({
			x: 418,
			y: 40,
			w: 206,
			h: 70,
			label: 'Input log',
			sub: 'when, never what',
			subSize: 14,
			icon: 'activity',
		});
		f.group({ x: 16, y: 178, w: 608, h: 206, label: 'The talking rule' });
		f.arrow([
			[307, 112],
			[307, 174],
		]);
		f.note(319, 140, 'what you said, when');
		f.arrow([
			[521, 112],
			[521, 174],
		]);
		f.note(533, 140, 'clicks, keys');
		RULES.forEach(([when, then, kind], i) => {
			const y = 198 + i * 60;
			f.box({ x: 36, y, w: 270, h: 46, label: when, size: 15 });
			f.arrow([
				[308, y + 23],
				[352, y + 23],
			]);
			f.box({ x: 354, y, w: 250, h: 46, kind, label: then, size: 15 });
		});
		f.arrow([
			[320, 386],
			[320, 438],
		]);
		f.group({ x: 16, y: 442, w: 608, h: 168, label: 'The draft edit' });
		const clips = [
			[36, 150, 'pink', 'real time'],
			[194, 90, 'pink', '3x'],
			[292, 76, 'dashed', 'cut'],
			[376, 228, 'pink', 'real time'],
		];
		clips.forEach(([x, w, kind, label]) => f.box({ x, y: 462, w, h: 44, kind, label, size: 14 }));
		f.box({
			x: 36,
			y: 528,
			w: 270,
			h: 60,
			kind: 'chalk',
			label: 'Zooms',
			sub: 'where you clicked',
			size: 15,
			icon: 'scan-eye',
		});
		f.box({
			x: 334,
			y: 528,
			w: 270,
			h: 60,
			kind: 'chalk',
			label: 'Captions',
			sub: 'from what you said',
			size: 15,
			icon: 'message-square',
		});
		f.note(404, 402, 'One demo: 3:36 recorded,', { anchor: 'start' });
		f.note(404, 422, '2:56 in the draft');
		f.crayonArrow([398, 418], [342, 458], 14);
	},
};

export const phone = {
	height: 740,
	draw(f) {
		f.box({
			x: 16,
			y: 26,
			w: 328,
			h: 56,
			label: 'Recording',
			sub: 'screen + mic',
			icon: 'monitor',
		});
		f.arrow([
			[96, 84],
			[96, 108],
		]);
		f.box({
			x: 16,
			y: 110,
			w: 160,
			h: 86,
			kind: 'chalk',
			label: 'whisper.cpp',
			font: 'mono',
			size: 15,
			sub: 'on your Mac',
			subSize: 13,
			icon: 'audio-lines',
			stack: true,
		});
		f.box({
			x: 184,
			y: 110,
			w: 160,
			h: 86,
			label: 'Input log',
			sub: 'when, never what',
			subSize: 13,
			size: 15,
			icon: 'activity',
			stack: true,
		});
		f.group({ x: 8, y: 254, w: 344, h: 196, label: 'The talking rule' });
		f.arrow([
			[160, 198],
			[160, 250],
		]);
		f.arrow([
			[264, 198],
			[264, 250],
		]);
		RULES.forEach(([when, then, kind], i) => {
			const y = 274 + i * 58;
			f.box({ x: 20, y, w: 176, h: 44, label: when, size: 13 });
			f.arrow([
				[198, y + 22],
				[216, y + 22],
			]);
			f.box({ x: 218, y, w: 126, h: 44, kind, label: then, size: 13 });
		});
		f.arrow([
			[180, 452],
			[180, 494],
		]);
		f.group({ x: 8, y: 498, w: 344, h: 196, label: 'The draft edit' });
		const clips = [
			[22, 96, 'pink', 'real time'],
			[124, 54, 'pink', '3x'],
			[182, 64, 'dashed', 'cut'],
			[250, 96, 'pink', 'real time'],
		];
		clips.forEach(([x, w, kind, label]) => f.box({ x, y: 516, w, h: 40, kind, label, size: 14 }));
		f.box({
			x: 22,
			y: 570,
			w: 316,
			h: 52,
			kind: 'chalk',
			label: 'Zooms',
			sub: 'where you clicked',
			size: 14,
			icon: 'scan-eye',
		});
		f.box({
			x: 22,
			y: 632,
			w: 316,
			h: 52,
			kind: 'chalk',
			label: 'Captions',
			sub: 'from what you said',
			size: 14,
			icon: 'message-square',
		});
		f.note(180, 720, 'One demo: 3:36 recorded, 2:56 in the draft', { anchor: 'middle', size: 14 });
	},
};
