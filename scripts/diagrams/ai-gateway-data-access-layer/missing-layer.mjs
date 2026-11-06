export const alt =
	'The missing layer: an application talks to an AI gateway, which routes to an LLM provider, and the gateway stops there. When the model needs business data, nothing connects it to Salesforce, Snowflake, SAP, PostgreSQL or Jira.';

const SOURCES = [
	{ label: 'Salesforce', logo: 'salesforce' },
	{ label: 'Snowflake', logo: 'snowflake' },
	{ label: 'SAP', logo: 'sap' },
	{ label: 'PostgreSQL', logo: 'postgresql' },
	{ label: 'Jira', logo: 'jira' },
];

/** A source as its logo and name, left unconnected. */
function source(f, { label, logo }, cx, y) {
	f.logo(logo, cx - f.logoWidth(logo, 28) / 2, y, 28);
	f.text(cx, y + 32, label, { size: 14, weight: 600 });
}

export const desktop = {
	height: 470,
	draw(f) {
		f.box({ x: 16, y: 30, w: 160, h: 64, label: 'Application', icon: 'app-window', size: 15 });
		f.arrow(
			[
				[178, 62],
				[210, 62],
			],
			{ heads: 'both' },
		);
		f.box({
			x: 212,
			y: 17,
			w: 200,
			h: 90,
			kind: 'pink',
			label: 'AI gateway',
			sub: ['routes', 'rate limits'],
			icon: 'route',
		});
		f.arrow(
			[
				[414, 62],
				[446, 62],
			],
			{ heads: 'both' },
		);
		f.box({ x: 448, y: 30, w: 176, h: 64, label: ['LLM', 'provider'], icon: 'cpu', size: 15 });
		f.arrow(
			[
				[536, 96],
				[536, 196],
			],
			{ dashed: true },
		);
		f.note(548, 146, 'needs data');
		f.box({ x: 456, y: 198, w: 160, h: 64, kind: 'dashed', label: '???', icon: 'circle-help' });
		f.group({ x: 16, y: 312, w: 608, h: 120, label: 'Your business data' });
		[76, 198, 320, 442, 564].forEach((cx, i) => source(f, SOURCES[i], cx, 350));
		// The point of the figure, which the gaps alone don't say
		f.text(40, 222, 'The gateway stops at the model.', {
			font: 'serif',
			size: 18,
			anchor: 'start',
		});
		f.note(40, 248, 'Nothing connects it to the data below.');
		f.crayonArrow([330, 210], [452, 230], -14);
	},
};

export const phone = {
	height: 700,
	draw(f) {
		f.box({ x: 90, y: 16, w: 180, h: 58, label: 'Application', icon: 'app-window', size: 15 });
		f.arrow(
			[
				[180, 76],
				[180, 104],
			],
			{ heads: 'both' },
		);
		f.box({
			x: 70,
			y: 106,
			w: 220,
			h: 76,
			kind: 'pink',
			label: 'AI gateway',
			sub: 'routes, rate limits',
			icon: 'route',
		});
		f.arrow(
			[
				[180, 184],
				[180, 212],
			],
			{ heads: 'both' },
		);
		f.box({ x: 90, y: 214, w: 180, h: 64, label: ['LLM', 'provider'], icon: 'cpu', size: 15 });
		f.arrow(
			[
				[180, 280],
				[180, 340],
			],
			{ dashed: true },
		);
		f.note(192, 310, 'needs data');
		f.box({ x: 100, y: 342, w: 160, h: 64, kind: 'dashed', label: '???', icon: 'circle-help' });
		f.text(16, 448, 'The gateway stops at the model.', {
			font: 'serif',
			size: 17,
			anchor: 'start',
		});
		f.note(16, 472, 'Nothing connects it to the data below.', { size: 14 });
		f.group({ x: 8, y: 520, w: 344, h: 164, label: 'Your business data' });
		[66, 180, 294].forEach((cx, i) => source(f, SOURCES[i], cx, 552));
		[123, 237].forEach((cx, i) => source(f, SOURCES[i + 3], cx, 624));
		f.crayonArrow([290, 440], [262, 396], 10);
	},
};
