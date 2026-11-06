export const alt =
	'A sales rep and a regional manager ask an AI agent the same question. The agent makes an MCP tool call to the CData Connect AI gateway, which queries Salesforce with each employee’s own credentials. Salesforce sharing rules decide what comes back: the rep gets their own deals, and the manager gets the whole team’s.';

export const desktop = {
	height: 610,
	draw(f) {
		f.box({
			x: 40,
			y: 24,
			w: 250,
			h: 72,
			label: 'Sales rep',
			sub: 'gets their own deals',
			icon: 'user',
		});
		f.box({
			x: 350,
			y: 24,
			w: 250,
			h: 72,
			label: 'Regional manager',
			sub: 'gets the whole team’s',
			icon: 'user',
		});
		f.arrow(
			[
				[165, 98],
				[165, 150],
				[250, 150],
				[250, 188],
			],
			{ heads: 'both' },
		);
		f.arrow(
			[
				[475, 98],
				[475, 150],
				[390, 150],
				[390, 188],
			],
			{ heads: 'both' },
		);
		f.note(320, 170, 'same question', { anchor: 'middle' });
		f.box({ x: 210, y: 190, w: 220, h: 56, label: 'AI agent', icon: 'bot' });
		f.arrow(
			[
				[320, 248],
				[320, 302],
			],
			{ heads: 'both' },
		);
		f.note(336, 275, 'MCP tool call', { weight: 700 });
		f.box({
			x: 210,
			y: 304,
			w: 220,
			h: 80,
			kind: 'chalk',
			wordmark: 'connect-ai',
			sub: 'MCP gateway',
		});
		f.arrow(
			[
				[320, 386],
				[320, 440],
			],
			{ heads: 'both' },
		);
		f.note(336, 413, 'each employee’s own credentials');
		f.box({ x: 210, y: 442, w: 220, h: 60, label: 'Salesforce', logo: 'salesforce' });
		// The point of the figure: the source's own rules do the scoping
		f.text(20, 552, 'Salesforce decides what comes back:', {
			font: 'serif',
			size: 17,
			anchor: 'start',
		});
		f.note(20, 578, 'its sharing rules return only what each person may see.');
		f.crayonArrow([150, 534], [206, 482], -14);
	},
};

export const phone = {
	height: 640,
	draw(f) {
		f.box({
			x: 16,
			y: 20,
			w: 160,
			h: 106,
			label: ['Sales', 'rep'],
			sub: 'their own deals',
			size: 14,
			icon: 'user',
			stack: true,
		});
		f.box({
			x: 184,
			y: 20,
			w: 160,
			h: 106,
			label: ['Regional', 'manager'],
			sub: 'the whole team’s',
			size: 14,
			icon: 'user',
			stack: true,
		});
		f.arrow(
			[
				[96, 128],
				[96, 160],
				[150, 160],
				[150, 186],
			],
			{ heads: 'both' },
		);
		f.arrow(
			[
				[264, 128],
				[264, 160],
				[210, 160],
				[210, 186],
			],
			{ heads: 'both' },
		);
		f.note(180, 144, 'same question', { anchor: 'middle', size: 14 });
		f.box({ x: 80, y: 188, w: 200, h: 54, label: 'AI agent', icon: 'bot' });
		f.arrow(
			[
				[180, 244],
				[180, 296],
			],
			{ heads: 'both' },
		);
		f.note(194, 270, 'MCP tool call', { size: 14, weight: 700 });
		f.box({
			x: 80,
			y: 298,
			w: 200,
			h: 80,
			kind: 'chalk',
			wordmark: 'connect-ai',
			sub: 'MCP gateway',
		});
		f.arrow(
			[
				[180, 380],
				[180, 436],
			],
			{ heads: 'both' },
		);
		f.note(194, 398, 'each employee’s', { size: 14 });
		f.note(194, 416, 'own credentials', { size: 14 });
		f.box({ x: 80, y: 438, w: 200, h: 58, label: 'Salesforce', logo: 'salesforce' });
		f.text(16, 548, 'Salesforce decides what', { font: 'serif', size: 17, anchor: 'start' });
		f.text(16, 570, 'comes back:', { font: 'serif', size: 17, anchor: 'start' });
		f.note(16, 596, 'its sharing rules return only');
		f.note(16, 616, 'what each person may see.');
		f.crayonArrow([40, 530], [76, 474], -12);
	},
};
