export const alt =
	'Every app in my house that talks to a model, OpenCode, Home Assistant, the doorbell camera and others, goes through one LiteLLM gateway, which handles model names, fallbacks and budgets. The gateway sends cloud requests to OpenRouter (DeepSeek, GLM, Qwen) and local requests to small Qwen models on my homelab GPUs.';

const APPS = [
	{ label: 'OpenCode', icon: 'terminal' },
	{ label: ['Home', 'Assistant'], logo: 'homeassistant' },
	{ label: ['Doorbell', '+ others'], icon: 'scan-eye' },
];
const TARGETS = [
	{ label: 'OpenRouter', sub: ['DeepSeek, GLM, Qwen'], icon: 'globe' },
	{ label: ['Homelab', 'GPUs'], sub: ['small local Qwen'], icon: 'cpu', kind: 'chalk' },
];

export const desktop = {
	height: 400,
	draw(f) {
		const ax = [108, 320, 532];
		ax.forEach((cx, i) => f.box({ x: cx - 92, y: 16, w: 184, h: 64, size: 15, ...APPS[i] }));
		ax.forEach((cx) =>
			f.arrow(
				[
					[cx, 82],
					[cx, 104],
					[320, 104],
					[320, 134],
				],
				{ heads: 'both' },
			),
		);
		f.box({
			x: 150,
			y: 136,
			w: 340,
			h: 96,
			kind: 'pink',
			label: 'LiteLLM gateway',
			sub: ['names, fallbacks, budgets'],
			logo: 'litellm',
		});
		const tx = [170, 470];
		tx.forEach((cx) =>
			f.arrow(
				[
					[320, 234],
					[320, 258],
					[cx, 258],
					[cx, 284],
				],
				{ heads: 'both' },
			),
		);
		TARGETS.forEach((t, i) =>
			f.box({ x: tx[i] - 130, y: 286, w: 260, h: 84, size: 15, subSize: 13, ...t }),
		);
	},
};

export const phone = {
	height: 470,
	draw(f) {
		const ax = [66, 180, 294];
		ax.forEach((cx, i) =>
			f.box({ x: cx - 54, y: 16, w: 108, h: 96, size: 14, stack: true, ...APPS[i] }),
		);
		ax.forEach((cx) =>
			f.arrow(
				[
					[cx, 114],
					[cx, 132],
					[180, 132],
					[180, 156],
				],
				{ heads: 'both' },
			),
		);
		f.box({
			x: 20,
			y: 158,
			w: 320,
			h: 84,
			kind: 'pink',
			label: 'LiteLLM gateway',
			sub: ['names, fallbacks, budgets'],
			logo: 'litellm',
		});
		const tx = [94, 266];
		tx.forEach((cx) =>
			f.arrow(
				[
					[180, 244],
					[180, 266],
					[cx, 266],
					[cx, 290],
				],
				{ heads: 'both' },
			),
		);
		TARGETS.forEach((t, i) =>
			f.box({ x: tx[i] - 82, y: 292, w: 164, h: 130, size: 14, subSize: 13, stack: true, ...t }),
		);
	},
};
