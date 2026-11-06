export const alt =
	'Before the game: asked what I worked on yesterday, Claude Code reads Salesforce, Zendesk and Stripe through the Connect AI MCP server, then produces rooms, records, permissions and refusals, which the map builder turns into the Doom level.';

const APPS = [
	['salesforce', 'Salesforce'],
	['zendesk', 'Zendesk'],
	['stripe', 'Stripe'],
];

/** Arrows from Connect AI fanning out to each app, then each app as its logo and name. */
function apps(f, from, centers, y) {
	const [fx, fy] = from;
	const split = fy + 16;
	// Two-way: Connect AI asks each app and the records come back
	centers.forEach((cx) =>
		f.arrow(
			[
				[fx, fy],
				[fx, split],
				[cx, split],
				[cx, y - 2],
			],
			{ heads: 'both' },
		),
	);
	APPS.forEach(([logo, name], i) => {
		f.logo(logo, centers[i] - f.logoWidth(logo, 26) / 2, y + 16, 26);
		f.text(centers[i], y + 46, name, { size: 14, weight: 600 });
	});
}

export const desktop = {
	height: 370,
	draw(f) {
		f.heading(20, 32, 'Before the game');
		f.box({
			x: 20,
			y: 70,
			w: 180,
			h: 70,
			kind: 'dashed',
			label: ['“What did I work', 'on yesterday?”'],
			font: 'serif',
			size: 17,
		});
		f.arrow([
			[202, 105],
			[234, 105],
		]);
		f.box({ x: 238, y: 75, w: 176, h: 60, label: 'Claude Code', logo: 'claude' });
		f.arrow(
			[
				[416, 105],
				[450, 105],
			],
			{ heads: 'both' },
		);
		f.note(433, 86, 'MCP', { anchor: 'middle', weight: 700 });
		f.box({
			x: 454,
			y: 62,
			w: 166,
			h: 86,
			kind: 'chalk',
			wordmark: 'connect-ai',
			sub: 'read-only MCP tools',
		});
		apps(f, [537, 150], [400, 490, 580], 196);
		f.arrow([
			[290, 137],
			[290, 262],
			[135, 262],
			[125, 286],
		]);
		f.note(150, 246, 'then produces');
		f.box({
			x: 20,
			y: 288,
			w: 210,
			h: 60,
			label: ['rooms, records,', 'permissions, refusals'],
			size: 15,
		});
		f.arrow([
			[232, 318],
			[260, 318],
		]);
		f.box({ x: 264, y: 293, w: 176, h: 50, label: 'map builder', icon: 'map' });
		f.arrow([
			[442, 318],
			[476, 318],
		]);
		f.box({
			x: 476,
			y: 285,
			w: 144,
			h: 66,
			kind: 'pink',
			label: ['Doom', 'level'],
			icon: 'gamepad-2',
		});
	},
};

export const phone = {
	height: 740,
	draw(f) {
		f.heading(16, 30, 'Before the game');
		f.box({
			x: 36,
			y: 90,
			w: 308,
			h: 52,
			kind: 'dashed',
			label: '“What did I work on yesterday?”',
			font: 'serif',
			size: 17,
		});
		f.arrow([
			[190, 144],
			[190, 170],
		]);
		f.box({ x: 100, y: 172, w: 180, h: 52, label: 'Claude Code', logo: 'claude' });
		f.arrow(
			[
				[190, 226],
				[190, 266],
			],
			{ heads: 'both' },
		);
		f.note(202, 246, 'MCP', { weight: 700 });
		f.box({
			x: 36,
			y: 268,
			w: 308,
			h: 80,
			kind: 'chalk',
			wordmark: 'connect-ai',
			sub: 'read-only MCP tools',
		});
		apps(f, [190, 350], [88, 190, 292], 386);
		f.arrow([
			[98, 198],
			[16, 198],
			[16, 516],
			[34, 516],
		]);
		f.note(36, 466, 'then produces');
		f.box({
			x: 36,
			y: 486,
			w: 308,
			h: 60,
			label: ['rooms, records,', 'permissions, refusals'],
			size: 16,
		});
		f.arrow([
			[190, 548],
			[190, 576],
		]);
		f.box({ x: 100, y: 578, w: 180, h: 48, label: 'map builder', icon: 'map' });
		f.arrow([
			[190, 628],
			[190, 656],
		]);
		f.box({ x: 36, y: 658, w: 308, h: 56, kind: 'pink', label: 'Doom level', icon: 'gamepad-2' });
	},
};
