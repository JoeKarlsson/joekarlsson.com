export const alt =
	'Two layers. Model routing: an application talks to an AI gateway, which routes to OpenAI, Anthropic and open-source models. Enterprise data access: an AI agent talks to CData Connect AI, the data gateway, which handles auth, schema and audit across hundreds of connectors to Salesforce, SAP HANA, Snowflake and PostgreSQL.';

const PROVIDERS = [
	{ label: 'OpenAI', logo: 'openai' },
	{ label: 'Anthropic', logo: 'anthropic' },
	{ label: ['Open-source', 'models'], icon: 'git-fork' },
];
const SOURCES = [
	{ label: 'Salesforce', logo: 'salesforce' },
	{ label: 'SAP HANA', logo: 'sap' },
	{ label: 'Snowflake', logo: 'snowflake' },
	{ label: 'PostgreSQL', logo: 'postgresql' },
];

/** A caller, a gateway and what it fans out to, inside a named container. */
function layer(f, { y, label, caller, gateway, targets, phone }) {
	if (phone) {
		const h = 150 + 92 + 50 + 90 + 24;
		f.group({ x: 8, y, w: 344, h, label });
		f.box({ x: 90, y: y + 18, w: 180, h: 58, size: 14, ...caller });
		f.arrow(
			[
				[180, y + 78],
				[180, y + 104],
			],
			{ heads: 'both' },
		);
		f.box({ x: 40, y: y + 106, w: 280, h: 120, ...gateway });
		const step = 328 / targets.length;
		const xs = targets.map((_, i) => 16 + step * (i + 0.5));
		xs.forEach((cx) =>
			f.arrow(
				[
					[180, y + 228],
					[180, y + 250],
					[cx, y + 250],
					[cx, y + 276],
				],
				{ heads: 'both' },
			),
		);
		// Too narrow for boxes on a phone: each target as its logo or icon and name
		targets.forEach((t, i) => {
			const mark = t.logo ?? t.icon;
			f.logo(mark, xs[i] - f.logoWidth(mark, 28) / 2, y + 298, 28);
			[t.label]
				.flat()
				.forEach((line, j) => f.text(xs[i], y + 332 + j * 18, line, { size: 14, weight: 600 }));
		});
		return;
	}
	const rowH = 58;
	const gap = 10;
	const h = targets.length * rowH + (targets.length - 1) * gap;
	f.group({ x: 16, y, w: 608, h: h + 40, label });
	const top = y + 20;
	const mid = top + h / 2;
	f.box({ x: 30, y: mid - 32, w: 150, h: 64, size: 14, ...caller });
	f.arrow(
		[
			[182, mid],
			[206, mid],
		],
		{ heads: 'both' },
	);
	f.box({ x: 208, y: top, w: 210, h, ...gateway });
	targets.forEach((t, i) => {
		const rowY = top + i * (rowH + gap);
		f.arrow(
			[
				[420, mid],
				[438, mid],
				[438, rowY + rowH / 2],
				[458, rowY + rowH / 2],
			],
			{ heads: 'both' },
		);
		f.box({ x: 460, y: rowY, w: 150, h: rowH, size: 14, ...t });
	});
}

const ROUTING = {
	label: 'Model routing',
	caller: { label: 'Application', icon: 'app-window' },
	gateway: {
		kind: 'pink',
		label: 'AI gateway',
		sub: ['routes', 'rate limits', 'caching', 'observability'],
		icon: 'route',
	},
	targets: PROVIDERS,
};
const DATA = {
	label: 'Enterprise data access',
	caller: { label: 'AI agent', icon: 'bot' },
	gateway: {
		kind: 'chalk',
		wordmark: 'connect-ai',
		sub: ['data gateway', 'auth, schema, audit', 'hundreds of connectors'],
	},
	targets: SOURCES,
};

export const desktop = {
	height: 620,
	draw(f) {
		layer(f, { y: 34, ...ROUTING });
		layer(f, { y: 300, ...DATA });
	},
};

export const phone = {
	height: 900,
	draw(f) {
		layer(f, { y: 34, phone: true, ...ROUTING });
		layer(f, { y: 472, phone: true, ...DATA });
	},
};
