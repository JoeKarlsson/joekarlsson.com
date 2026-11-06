export const alt =
	'The doorbell automation: when the doorbell camera sees a person at the front door for 10 to 60 seconds without a ring, Home Assistant sends a snapshot to an AI task (ai_task.generate_data with qwen3-vl:8b on Ollama). If there’s a package or nobody is home, it pushes an alert with the snapshot; otherwise it stays quiet. If the AI errors, it carries on as if there’s a package.';

export const desktop = {
	height: 500,
	draw(f) {
		f.box({
			x: 150,
			y: 16,
			w: 340,
			h: 74,
			label: ['Person at the', 'front door'],
			sub: '10–60 s, no ring',
			icon: 'scan-eye',
			size: 15,
		});
		f.arrow([
			[320, 92],
			[320, 124],
		]);
		f.note(334, 108, 'snapshot', { size: 14, weight: 700 });
		f.box({
			x: 150,
			y: 126,
			w: 340,
			h: 84,
			kind: 'chalk',
			label: 'AI task',
			sub: ['ai_task.generate_data', 'qwen3-vl:8b on Ollama'],
			subFont: 'mono',
			subSize: 14,
			logo: 'ollama',
		});
		f.arrow([
			[320, 212],
			[320, 262],
		]);
		f.note(334, 228, 'AI error? carry on', { size: 14 });
		f.note(334, 246, 'as if there’s a package', { size: 14 });
		f.diamond({ cx: 290, cy: 312, w: 360, h: 96, label: 'Package or nobody home?', size: 14 });
		f.arrow([
			[472, 312],
			[500, 312],
		]);
		f.note(486, 296, 'yes', { anchor: 'middle', size: 14, weight: 700 });
		f.box({
			x: 502,
			y: 278,
			w: 122,
			h: 68,
			kind: 'pink',
			label: ['Push', 'alert'],
			icon: 'bell-ring',
			size: 14,
		});
		f.arrow([
			[290, 362],
			[290, 404],
		]);
		f.note(302, 383, 'no', { size: 14, weight: 700 });
		f.box({ x: 200, y: 406, w: 180, h: 56, label: 'Stay quiet', size: 15 });
	},
};

export const phone = {
	height: 640,
	draw(f) {
		f.box({
			x: 30,
			y: 16,
			w: 300,
			h: 74,
			label: ['Person at the', 'front door'],
			sub: '10–60 s, no ring',
			icon: 'scan-eye',
			size: 15,
		});
		f.arrow([
			[180, 92],
			[180, 124],
		]);
		f.note(194, 108, 'snapshot', { size: 14, weight: 700 });
		f.box({
			x: 16,
			y: 126,
			w: 328,
			h: 84,
			kind: 'chalk',
			label: 'AI task',
			sub: ['ai_task.generate_data', 'qwen3-vl:8b on Ollama'],
			subFont: 'mono',
			subSize: 13,
			logo: 'ollama',
		});
		f.arrow([
			[180, 212],
			[180, 282],
		]);
		f.note(194, 236, 'AI error? carry on as', { size: 14 });
		f.note(194, 254, 'if there’s a package', { size: 14 });
		f.diamond({ cx: 180, cy: 332, w: 340, h: 96, label: 'Package or nobody home?', size: 14 });
		f.arrow(
			[
				[10, 332],
				[10, 470],
				[16, 470],
			],
			{ heads: 'none' },
		);
		f.arrow([
			[18, 470],
			[96, 470],
			[96, 492],
		]);
		f.note(22, 392, 'yes', { size: 14, weight: 700 });
		f.arrow([
			[350, 332],
			[350, 470],
			[264, 470],
			[264, 492],
		]);
		f.note(336, 392, 'no', { anchor: 'end', size: 14, weight: 700 });
		f.box({
			x: 16,
			y: 494,
			w: 160,
			h: 116,
			kind: 'pink',
			label: ['Push', 'alert'],
			sub: 'with the snapshot',
			subSize: 14,
			icon: 'bell-ring',
			stack: true,
		});
		f.box({ x: 184, y: 494, w: 160, h: 116, label: ['Stay', 'quiet'], size: 15, stack: true });
	},
};
