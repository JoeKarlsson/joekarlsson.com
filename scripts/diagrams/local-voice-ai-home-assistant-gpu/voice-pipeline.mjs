export const alt =
	'The voice pipeline: the wake word is detected over Wyoming, the microphone audio goes to faster-whisper on a GPU (a Wyoming speech-to-text service on its own host) for speech to text, then to llama3.2:3b on Ollama on the GPU server for intent and a response, then to Piper for text to speech, and out of the speaker.';

const STEPS = [
	{ label: 'Wake word', sub: 'detected over Wyoming', icon: 'mic' },
	{ label: 'Microphone', sub: 'audio', icon: 'audio-lines' },
	{ label: 'faster-whisper', sub: ['speech to text,', 'GPU host'], logo: 'openai', kind: 'chalk' },
	{
		label: 'llama3.2:3b',
		sub: ['intent and response,', 'Ollama on the GPU'],
		logo: 'ollama',
		kind: 'pink',
	},
	{ label: 'Piper', sub: 'text to speech', icon: 'audio-lines', kind: 'chalk' },
	{ label: 'Speaker', sub: 'the response', icon: 'speaker' },
];

export const desktop = {
	height: 340,
	draw(f) {
		// Two rows of three, read left to right, then down and left to right again
		const xs = [16, 232, 448];
		STEPS.forEach((s, i) =>
			f.box({
				x: xs[i % 3],
				y: i < 3 ? 30 : 200,
				w: 176,
				h: 116,
				size: 15,
				subSize: 13,
				stack: true,
				...s,
			}),
		);
		[0, 1].forEach((i) =>
			f.arrow([
				[xs[i] + 178, 88],
				[xs[i + 1] - 2, 88],
			]),
		);
		f.arrow([
			[536, 148],
			[536, 172],
			[104, 172],
			[104, 198],
		]);
		[0, 1].forEach((i) =>
			f.arrow([
				[xs[i] + 178, 258],
				[xs[i + 1] - 2, 258],
			]),
		);
	},
};

export const phone = {
	height: 600,
	draw(f) {
		STEPS.forEach((s, i) => {
			f.box({ x: 40, y: 16 + i * 98, w: 280, h: 74, size: 15, subSize: 13, ...s });
			if (i < STEPS.length - 1)
				f.arrow([
					[180, 16 + i * 98 + 76],
					[180, 16 + (i + 1) * 98 - 2],
				]);
		});
	},
};
