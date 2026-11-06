export const alt =
	'Two auth boundaries in an MCP deployment. Between the AI agent and the MCP server sits agent-to-server identity, which the roadmap covers with DPoP, workload identity federation and token exchange. Between the MCP server and enterprise data sources like Salesforce, SQL Server, an on-premises database and a REST API sits server-to-source credentials (OAuth tokens, service accounts, API keys), which the roadmap doesn’t cover, so it stays per connector.';

const SOURCES = [
	{ label: 'Salesforce', logo: 'salesforce' },
	{ label: 'SQL Server', logo: 'sqlserver' },
	{ label: ['On-prem', 'database'], icon: 'server' },
	{ label: 'REST API', icon: 'plug' },
];

/**
 * A boundary: a dashed line broken around its labels, an icon for whether the roadmap
 * covers it, what it is, and how it's handled today.
 */
function boundary(f, { x, y0, y1, title, status, covered, methods }) {
	const dashes = (from, to) => {
		for (let y = from; y < to; y += 14)
			f.line(
				[
					[x, y],
					[x, Math.min(y + 7, to)],
				],
				{ color: covered ? '#ece6da' : '#a3a3a3', width: 2 },
			);
	};
	const icon = covered ? 'shield-check' : 'lock';
	f.logo(icon, x - 11, y0 + 12, 22);
	f.text(x, y0 + 38, status, { size: 14, weight: 700 });
	title.forEach((line, i) => f.note(x, y0 + 60 + i * 18, line, { size: 14, anchor: 'middle' }));
	const titleEnd = y0 + 60 + title.length * 18;
	const methodsTop = y1 - methods.length * 18 - 8;
	dashes(titleEnd, methodsTop);
	methods.forEach((line, i) =>
		f.note(x, methodsTop + 14 + i * 18, line, { size: 13, anchor: 'middle' }),
	);
}

export const desktop = {
	height: 460,
	draw(f) {
		f.box({ x: 16, y: 178, w: 116, h: 88, label: 'AI agent', icon: 'bot', size: 14, stack: true });
		f.arrow([
			[134, 222],
			[232, 222],
		]);
		boundary(f, {
			x: 183,
			y0: 30,
			y1: 400,
			status: 'covered',
			covered: true,
			title: ['agent-to-', 'server', 'identity'],
			methods: ['DPoP,', 'workload ID', 'federation,', 'token exchange'],
		});
		f.box({
			x: 234,
			y: 178,
			w: 140,
			h: 88,
			label: 'MCP server',
			logo: 'modelcontextprotocol',
			size: 14,
			stack: true,
		});
		f.arrow([
			[376, 222],
			[460, 222],
		]);
		boundary(f, {
			x: 420,
			y0: 30,
			y1: 400,
			status: 'not covered',
			covered: false,
			title: ['server-to-', 'source', 'credentials'],
			methods: ['OAuth tokens,', 'service', 'accounts,', 'API keys'],
		});
		f.group({ x: 462, y: 70, w: 162, h: 310, label: 'Data sources' });
		SOURCES.forEach((s, i) => f.box({ x: 474, y: 88 + i * 72, w: 138, h: 60, size: 13, ...s }));
		f.text(16, 428, 'The roadmap closes the agent-to-server gap.', {
			font: 'serif',
			size: 17,
			anchor: 'start',
		});
		f.note(16, 450, 'Credentials to each data source stay per connector.');
	},
};

export const phone = {
	height: 880,
	draw(f) {
		// Boxes down the left with the arrow at x 60; each boundary runs across, notes to its right
		f.box({ x: 16, y: 16, w: 200, h: 58, label: 'AI agent', icon: 'bot', size: 15 });
		f.arrow([
			[60, 76],
			[60, 254],
		]);
		const across = (y, color) => {
			for (let x = 12; x < 348; x += 14)
				f.line(
					[
						[x, y],
						[Math.min(x + 7, 348), y],
					],
					{ color, width: 2 },
				);
		};
		across(160, '#ece6da');
		f.logo('shield-check', 80, 84, 18);
		f.text(104, 84, 'covered by the roadmap:', { size: 14, weight: 700, anchor: 'start' });
		f.note(80, 110, 'agent-to-server identity', { size: 14 });
		f.note(80, 190, 'DPoP, workload identity', { size: 13 });
		f.note(80, 208, 'federation, token exchange', { size: 13 });
		f.box({
			x: 16,
			y: 256,
			w: 200,
			h: 58,
			label: 'MCP server',
			logo: 'modelcontextprotocol',
			size: 15,
		});
		f.arrow([
			[60, 316],
			[60, 496],
		]);
		across(400, '#a3a3a3');
		f.logo('lock', 80, 344, 18);
		f.text(104, 344, 'not in the roadmap:', { size: 14, weight: 700, anchor: 'start' });
		f.note(80, 370, 'server-to-source credentials', { size: 14 });
		f.note(80, 430, 'OAuth tokens, service', { size: 13 });
		f.note(80, 448, 'accounts, API keys', { size: 13 });
		f.group({ x: 8, y: 520, w: 344, h: 250, label: 'Data sources' });
		[
			[20, 538],
			[184, 538],
			[20, 652],
			[184, 652],
		].forEach(([x, y], i) => f.box({ x, y, w: 156, h: 100, size: 14, stack: true, ...SOURCES[i] }));
		f.text(16, 806, 'The roadmap closes the agent-to-server', {
			font: 'serif',
			size: 17,
			anchor: 'start',
		});
		f.text(16, 828, 'gap. Credentials to each data source', {
			font: 'serif',
			size: 17,
			anchor: 'start',
		});
		f.text(16, 850, 'stay per connector.', { font: 'serif', size: 17, anchor: 'start' });
	},
};
