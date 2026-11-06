export const alt =
	'A sales rep asks an AI assistant "What’s the status on Acme?" The assistant reads the intent and makes an MCP tool call to CData Connect AI, the data gateway, which translates the intent and queries Salesforce with scoped credentials. Records come back to the gateway, structured data goes back to the assistant, and the assistant answers the rep. The rep’s access level is enforced, every access is logged, and the agent never sees raw schema.';

export const desktop = {
	height: 520,
	draw(f) {
		f.box({ x: 16, y: 30, w: 190, h: 64, label: 'Sales rep', icon: 'user' });
		f.text(111, 116, '“What’s the status on Acme?”', { font: 'serif', size: 15 });
		f.arrow(
			[
				[111, 134],
				[111, 172],
			],
			{ heads: 'both' },
		);
		f.note(124, 153, 'the question, then the answer', { size: 14 });
		f.box({
			x: 16,
			y: 174,
			w: 190,
			h: 82,
			label: 'AI assistant',
			sub: ['reads intent,', 'calls a tool'],
			icon: 'bot',
		});
		f.arrow(
			[
				[208, 215],
				[266, 215],
			],
			{ heads: 'both' },
		);
		f.note(237, 196, 'MCP', { anchor: 'middle', weight: 700 });
		f.box({
			x: 268,
			y: 160,
			w: 190,
			h: 110,
			kind: 'chalk',
			wordmark: 'connect-ai',
			sub: ['translates intent', 'scoped credentials', 'audit log'],
		});
		f.arrow(
			[
				[460, 215],
				[494, 215],
			],
			{ heads: 'both' },
		);
		f.note(477, 196, 'query', { anchor: 'middle' });
		f.box({
			x: 496,
			y: 172,
			w: 128,
			h: 86,
			label: 'Salesforce',
			logo: 'salesforce',
			size: 14,
			stack: true,
		});
		// What the boxes can't show: what the gateway enforces on every request
		f.text(268, 360, 'The rep’s access level is enforced', {
			font: 'serif',
			size: 17,
			anchor: 'start',
		});
		f.text(268, 384, 'and every access is logged.', { font: 'serif', size: 17, anchor: 'start' });
		f.note(268, 410, 'The agent never sees raw schema.');
		f.crayonArrow([360, 340], [362, 276], 16);
	},
};

export const phone = {
	height: 760,
	draw(f) {
		f.box({ x: 80, y: 16, w: 200, h: 60, label: 'Sales rep', icon: 'user' });
		f.text(180, 98, '“What’s the status on Acme?”', { font: 'serif', size: 15 });
		f.arrow(
			[
				[180, 116],
				[180, 158],
			],
			{ heads: 'both' },
		);
		f.note(192, 136, 'question, then answer', { size: 14 });
		f.box({
			x: 60,
			y: 160,
			w: 240,
			h: 80,
			label: 'AI assistant',
			sub: ['reads intent,', 'calls a tool'],
			icon: 'bot',
		});
		f.arrow(
			[
				[180, 242],
				[180, 286],
			],
			{ heads: 'both' },
		);
		f.note(192, 264, 'MCP', { weight: 700, size: 14 });
		f.box({
			x: 60,
			y: 288,
			w: 240,
			h: 110,
			kind: 'chalk',
			wordmark: 'connect-ai',
			sub: ['translates intent', 'scoped credentials', 'audit log'],
		});
		f.arrow(
			[
				[180, 400],
				[180, 444],
			],
			{ heads: 'both' },
		);
		f.note(192, 422, 'query', { size: 14 });
		f.box({ x: 80, y: 446, w: 200, h: 58, label: 'Salesforce', logo: 'salesforce' });
		f.text(16, 580, 'The rep’s access level is enforced', {
			font: 'serif',
			size: 17,
			anchor: 'start',
		});
		f.text(16, 604, 'and every access is logged.', { font: 'serif', size: 17, anchor: 'start' });
		f.note(16, 630, 'The agent never sees raw schema.', { size: 14 });
		f.crayonArrow([40, 562], [56, 360], -30);
	},
};
