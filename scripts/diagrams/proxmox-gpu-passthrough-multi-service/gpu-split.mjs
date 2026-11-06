export const alt =
	'Which services run on which GPU. prxbox1 has a Quadro RTX 4000 with 8GB and runs Frigate for 4 cameras, Whisper for voice and a Tdarr worker. prxbox2 has an RTX A4000 with 16GB and runs Ollama and llama.cpp, Plex, Immich video and the Tdarr server plus a worker. Both connect to the 10G switch and the NAS.';

const HOSTS = [
	{
		name: 'prxbox1',
		gpu: ['Quadro RTX 4000', '8GB'],
		apps: [
			{ label: 'Frigate, 4 cameras', icon: 'cctv' },
			{ label: 'Whisper, voice', logo: 'openai' },
			{ label: 'Tdarr worker', icon: 'film' },
		],
	},
	{
		name: 'prxbox2',
		gpu: ['RTX A4000', '16GB'],
		apps: [
			{ label: 'Ollama, llama.cpp', logo: 'ollama' },
			{ label: 'Plex', logo: 'plex' },
			{ label: 'Immich video', icon: 'film' },
			{ label: 'Tdarr server + worker', icon: 'film' },
		],
	},
];

/** One host: its name, its GPU, and the services that share it. */
function host(f, h, { x, y, w }) {
	const gh = 136 + h.apps.length * 48;
	f.group({ x, y, w, h: gh, label: h.name });
	f.box({
		x: x + 12,
		y: y + 18,
		w: w - 24,
		h: 70,
		kind: 'pink',
		label: h.gpu[0],
		sub: h.gpu[1],
		subSize: 14,
		logo: 'nvidia',
		size: 15,
	});
	f.arrow(
		[
			[x + w / 2, y + 90],
			[x + w / 2, y + 112],
		],
		{ heads: 'both' },
	);
	h.apps.forEach((a, i) =>
		f.box({ x: x + 12, y: y + 114 + i * 48, w: w - 24, h: 40, kind: 'ink', size: 14, ...a }),
	);
	return y + gh;
}

export const desktop = {
	height: 480,
	draw(f) {
		const b1 = host(f, HOSTS[0], { x: 16, y: 36, w: 296 });
		const b2 = host(f, HOSTS[1], { x: 328, y: 36, w: 296 });
		f.arrow(
			[
				[164, b1 + 2],
				[164, 400],
				[236, 400],
			],
			{ heads: 'both' },
		);
		f.arrow(
			[
				[476, b2 + 2],
				[476, 400],
				[404, 400],
			],
			{ heads: 'both' },
		);
		f.box({
			x: 238,
			y: 352,
			w: 164,
			h: 96,
			kind: 'chalk',
			label: '10G switch',
			sub: 'and the NAS',
			subSize: 13,
			icon: 'network',
			size: 15,
			stack: true,
		});
	},
};

export const phone = {
	height: 810,
	draw(f) {
		const b1 = host(f, HOSTS[0], { x: 8, y: 36, w: 344 });
		f.arrow(
			[
				[180, b1 + 2],
				[180, b1 + 32],
			],
			{ heads: 'both' },
		);
		f.box({
			x: 90,
			y: b1 + 34,
			w: 180,
			h: 56,
			kind: 'chalk',
			label: '10G switch',
			sub: 'and the NAS',
			subSize: 13,
			icon: 'network',
			size: 15,
		});
		f.arrow(
			[
				[180, b1 + 92],
				[180, b1 + 140],
			],
			{ heads: 'both' },
		);
		host(f, HOSTS[1], { x: 8, y: b1 + 164, w: 344 });
	},
};
