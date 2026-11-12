// Tokens per second on each card: the 2018 Quadro keeps up while a model fits in the
// 3.8 GB Frigate and Whisper leave free, then falls off a cliff.
import { COLORS } from '../draw.mjs';

export const alt =
	'Paired bars of tokens per second for each local model on the RTX A4000 (16 GB) and on the Quadro RTX 4000 with the 3.8 GB Frigate and Whisper leave free. llama3.2:3b: 83 on the A4000, 90 on the Quadro. qwen3:4b: 78 vs 22, partly on CPU. qwen3:8b: 55 vs 5.9, mostly on CPU. gemma3:12b (36), qwen3:14b (33) and gpt-oss:20b (64) do not fit on the Quadro at all.';

const MODELS = [
	['llama3.2:3b', 83, 90],
	['qwen3:4b', 78, 22],
	['qwen3:8b', 55, 5.9],
	['gemma3:12b', 36, 0],
	['qwen3:14b', 33, 0],
	['gpt-oss:20b', 64, 0],
];
const format = (v) => (v ? String(v) : "doesn't fit");

function chart(f, { x, y, w, rowH, modelW, labelW, size }) {
	MODELS.forEach(([model, a4000, quadro], i) => {
		const top = y + i * rowH;
		f.text(x, top + (rowH - 10) / 2, model, { size, font: 'mono', anchor: 'start' });
		f.barChart({
			x: x + modelW,
			y: top,
			w: w - modelW,
			h: rowH - 10,
			max: 90,
			format,
			horizontal: true,
			labelW,
			size: size - 1,
			bars: [
				{ label: 'A4000', value: a4000 },
				{ label: 'Quadro', value: quadro, highlight: true },
			],
		});
	});
}

export const desktop = {
	height: 490,
	draw(f) {
		f.heading(16, 24, 'Fast while it fits', { size: 22 });
		f.note(
			16,
			52,
			'Tokens per second. The Quadro gets the 3.8 GB Frigate and Whisper leave free.',
			{
				size: 14,
			},
		);
		chart(f, { x: 16, y: 76, w: 608, rowH: 64, modelW: 120, labelW: 70, size: 15 });
		f.text(16, 474, 'qwen3:4b and qwen3:8b spill onto the CPU on the Quadro.', {
			size: 14,
			anchor: 'start',
			color: COLORS.muted,
		});
	},
};

export const phone = {
	height: 520,
	draw(f) {
		f.heading(16, 24, 'Fast while it fits', { size: 20 });
		f.note(16, 50, 'Tokens per second. The Quadro', { size: 13 });
		f.note(16, 68, 'gets the 3.8 GB left free.', { size: 13 });
		chart(f, { x: 8, y: 90, w: 344, rowH: 70, modelW: 100, labelW: 60, size: 14 });
	},
};
