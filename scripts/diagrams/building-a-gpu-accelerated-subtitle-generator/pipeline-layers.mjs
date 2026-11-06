export const alt =
	'The subtitle generator in four layers. A cron job or a manual trigger starts the scheduler (subtitle-scheduler.sh), which starts and stops workers, cleans stale locks and manages the worker lifecycle. Parallel workers (parallel-worker.sh) claim folders with mkdir, wait for a free GPU and track progress. The Whisper engine (generate-subtitles.py) runs faster-whisper on CUDA, filters hallucinations and writes SRT files.';

const LAYERS = [
	{ name: 'Cron or manual trigger', icon: 'clock', points: [] },
	{
		name: 'Scheduler',
		file: 'subtitle-scheduler.sh',
		icon: 'calendar-clock',
		points: ['starts and stops workers', 'cleans stale locks', 'manages the worker lifecycle'],
	},
	{
		name: 'Parallel workers',
		file: 'parallel-worker.sh',
		icon: 'cpu',
		points: ['claims a folder with mkdir', 'waits for a free GPU', 'tracks progress'],
	},
	{
		name: 'Whisper engine',
		file: 'generate-subtitles.py',
		logo: 'openai',
		kind: 'pink',
		points: ['faster-whisper on CUDA', 'filters hallucinations', 'writes SRT files'],
	},
];

/** The layers stacked top to bottom, each calling the one below. */
function stack(f, { x, w, phone }) {
	let y = 16;
	LAYERS.forEach((layer, i) => {
		const pointsTop = phone && layer.file ? 62 : 46;
		const h = layer.points.length ? pointsTop + layer.points.length * 20 + 6 : 56;
		const kind = layer.kind ?? 'outline';
		const ink = kind === 'pink' ? '#000000' : '#ededed';
		f.box({ x, y, w, h, kind });
		const markW = f.logo(layer.logo ?? layer.icon, x + 16, y + 26, 22, kind);
		f.text(x + 28 + markW, y + 26, layer.name, {
			font: 'display',
			size: 20,
			anchor: 'start',
			upper: true,
			color: ink,
		});
		if (layer.file) {
			if (phone)
				f.text(x + 16, y + 50, layer.file, { font: 'mono', size: 13, anchor: 'start', color: ink });
			else
				f.text(x + w - 16, y + 26, layer.file, {
					font: 'mono',
					size: 14,
					anchor: 'end',
					color: ink,
				});
		}
		layer.points.forEach((point, j) =>
			f.text(x + 16, y + pointsTop + 10 + j * 20, point, {
				size: 14,
				anchor: 'start',
				color: kind === 'pink' ? '#000000' : '#a3a3a3',
			}),
		);
		y += h;
		if (i < LAYERS.length - 1) {
			f.arrow([
				[x + w / 2, y + 2],
				[x + w / 2, y + 30],
			]);
			y += 32;
		}
	});
}

export const desktop = {
	height: 520,
	draw(f) {
		stack(f, { x: 16, w: 608 });
	},
};

export const phone = {
	height: 580,
	draw(f) {
		stack(f, { x: 12, w: 336, phone: true });
	},
};
