// The GPU-Accelerated Subtitle Generator's card (src/data/projects.ts): Whisper's playhead runs
// along a film's audio and each line of speech it passes lands in the SRT file as a cue.
//   node scripts/diagrams/_projects/gpu-subtitle-generator.mjs <output dir>
//   node scripts/boiling-thumbnail.mjs <output dir> public/images/projects/gpu-subtitle-generator --step 1400
import { COLORS, createFigure } from '../draw.mjs';
import { CARD, finish, outDirFromArgs, writeFrames } from './write-frames.mjs';

// Night of the Living Dead (1968), in the public domain: a film the generator could subtitle
const CUES = [
	{ at: '00:03:41,200 --> 00:03:43,600', line: "They're coming to get you, Barbara." },
	{ at: '00:03:44,900 --> 00:03:46,300', line: "Stop it. You're ignorant." },
	{ at: '00:03:47,800 --> 00:03:50,100', line: "They're coming for you, Barbara!" },
];
// The audio: three bursts of speech, one per cue, with quiet between
const WAVE = { x: 30, y: 110, w: 580, bars: 72, height: 44 };
const SPEECH = [
	[3, 22],
	[27, 42],
	[48, 69],
];
// The card is graded black-to-pink (scripts/boiling-thumbnail.mjs): chalk is the brightest
const NOW = COLORS.chalk;
const BEFORE = COLORS.muted;

let seed = 1968;
const random = () => {
	seed = (seed * 1664525 + 1013904223) >>> 0;
	return seed / 4294967296;
};
const amplitudes = [...Array(WAVE.bars).keys()].map((i) =>
	SPEECH.some(([a, b]) => i >= a && i <= b) ? 0.35 + random() * 0.65 : 0.04 + random() * 0.06,
);

function drawFrame(heard) {
	const f = createFigure({ id: 'project-subtitles', ...CARD });
	f.text(30, 40, 'Transcribing', {
		font: 'display',
		size: 30,
		anchor: 'start',
		upper: true,
		color: NOW,
	});
	const logoX = 610 - f.logoWidth('nvidia', 34);
	f.logo('nvidia', logoX, 40, 34);
	f.note(logoX - 12, 40, 'faster-whisper on CUDA', { anchor: 'end', size: 17 });
	const playheadBar = heard ? SPEECH[heard - 1][1] + 2 : 0;
	const step = WAVE.w / WAVE.bars;
	amplitudes.forEach((amp, i) => {
		const x = WAVE.x + i * step + step / 2;
		const half = amp * WAVE.height;
		f.line(
			[
				[x, WAVE.y - half],
				[x, WAVE.y + half],
			],
			{ color: i < playheadBar ? NOW : '#4a4a4a', width: 4 },
		);
	});
	if (heard) {
		const x = WAVE.x + playheadBar * step;
		f.line(
			[
				[x, WAVE.y - 56],
				[x, WAVE.y + 56],
			],
			{ color: NOW, width: 2 },
		);
	}
	f.group({ x: 20, y: 196, w: 600, h: 150, label: 'night-of-the-living-dead.en.srt' });
	// The newest two cues, the newest lit
	const shown = CUES.slice(0, heard).map((cue, i) => ({ ...cue, n: i + 1 }));
	shown.slice(-2).forEach((cue, j, list) => {
		const y = 222 + j * 66;
		const color = j === list.length - 1 ? NOW : BEFORE;
		f.text(36, y, `${cue.n}  ${cue.at}`, { font: 'mono', size: 15, anchor: 'start', color });
		f.text(36, y + 26, cue.line, { size: 22, anchor: 'start', weight: 700, color });
	});
	return finish(
		f,
		`Whisper on an NVIDIA GPU transcribing a film's audio into an SRT subtitle file, ${heard} of 3 lines written`,
	);
}

const frames = [];
for (let heard = 0; heard <= CUES.length; heard++) frames.push(drawFrame(heard));
writeFrames(outDirFromArgs('scripts/diagrams/_projects/gpu-subtitle-generator.mjs'), frames);
