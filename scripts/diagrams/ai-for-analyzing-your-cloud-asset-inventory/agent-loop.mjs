export const alt =
	'The agent loop: a user asks a question, and the LLM call takes an action through the CloudQuery MCP server, which queries the synced cloud asset inventory and returns feedback. The LLM keeps looping through action and feedback until it has the answer, then stops.';

export const desktop = {
	height: 300,
	draw(f) {
		f.box({ x: 16, y: 90, w: 120, h: 64, label: 'User', icon: 'user', size: 15 });
		f.arrow([
			[138, 122],
			[196, 122],
		]);
		f.note(167, 106, 'asks', { anchor: 'middle', size: 13 });
		f.box({
			x: 198,
			y: 80,
			w: 170,
			h: 84,
			kind: 'pink',
			label: ['LLM', 'call'],
			icon: 'bot',
			size: 16,
		});
		f.arrow([
			[300, 78],
			[300, 40],
			[520, 40],
			[520, 76],
		]);
		f.note(410, 26, 'action', { anchor: 'middle', size: 13, weight: 700 });
		f.box({
			x: 420,
			y: 78,
			w: 204,
			h: 88,
			kind: 'chalk',
			wordmark: 'cloudquery',
			sub: 'MCP server',
		});
		f.arrow([
			[520, 168],
			[520, 204],
			[300, 204],
			[300, 166],
		]);
		f.note(410, 220, 'feedback', { anchor: 'middle', size: 13, weight: 700 });
		f.arrow([
			[230, 166],
			[230, 230],
		]);
		f.note(216, 198, 'answered', { anchor: 'end', size: 13 });
		f.box({ x: 170, y: 232, w: 120, h: 50, label: 'Stop', icon: 'octagon-x', size: 15 });
	},
};

export const phone = {
	height: 520,
	draw(f) {
		f.box({ x: 110, y: 16, w: 140, h: 56, label: 'User', icon: 'user', size: 15 });
		f.arrow([
			[180, 74],
			[180, 110],
		]);
		f.note(194, 92, 'asks', { size: 13 });
		f.box({
			x: 90,
			y: 112,
			w: 180,
			h: 70,
			kind: 'pink',
			label: ['LLM', 'call'],
			icon: 'bot',
			size: 16,
		});
		f.arrow([
			[230, 184],
			[230, 268],
		]);
		f.note(242, 222, 'action', { size: 13, weight: 700 });
		f.box({
			x: 60,
			y: 270,
			w: 240,
			h: 84,
			kind: 'chalk',
			wordmark: 'cloudquery',
			sub: 'MCP server',
		});
		f.arrow([
			[130, 268],
			[130, 184],
		]);
		f.note(118, 222, 'feedback', { anchor: 'end', size: 13, weight: 700 });
		f.arrow([
			[92, 147],
			[30, 147],
			[30, 440],
			[118, 440],
		]);
		f.note(42, 400, 'answered', { size: 13 });
		f.box({ x: 120, y: 414, w: 120, h: 52, label: 'Stop', icon: 'octagon-x', size: 15 });
	},
};
