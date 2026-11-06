export const alt =
	'MCP governance, credential-scoped versus passthrough identity. With the LiteLLM MCP proxy, the AI agent knows the user, but the LiteLLM gateway injects service-account credentials, so the user’s identity is dropped: the MCP server and the data source see only the service account and can’t enforce the user’s access rules. With CData Connect AI, the user’s SSO identity is resolved and a trust-level ceiling is enforced on every tool call (low: read, medium: create and update, high: delete), so the identity is preserved and the data source enforces the user’s RBAC, row-level security and field permissions.';

const SIDES = [
	{
		label: 'LiteLLM proxy',
		gateway: {
			label: ['LiteLLM', 'gateway'],
			sub: ['injects service-', 'account credentials'],
			logo: 'litellm',
		},
		link: ['user identity', 'dropped'],
		server: ['sees the service', 'account only'],
		source: ['can’t enforce', 'the user’s access'],
	},
	{
		label: 'Connect AI',
		gateway: {
			kind: 'chalk',
			wordmark: 'connect-ai',
			sub: ['resolves SSO identity,', 'caps trust per call'],
		},
		link: ['user identity', 'preserved'],
		server: ['read, write or delete,', 'by trust level'],
		source: ['enforces RBAC, RLS', 'and field permissions'],
	},
];

/** One side: the agent, the gateway, what crosses to the MCP server, and the data source. */
function side(f, s, x, w, y) {
	f.group({ x, y, w, h: 480, label: s.label });
	const inner = x + 12;
	const iw = w - 24;
	const cx = x + w / 2;
	f.box({
		x: inner,
		y: y + 18,
		w: iw,
		h: 64,
		label: 'AI agent',
		sub: 'knows the user',
		icon: 'bot',
		size: 15,
	});
	f.arrow([
		[cx, y + 84],
		[cx, y + 112],
	]);
	f.box({ x: inner, y: y + 114, w: iw, h: 96, size: 15, ...s.gateway });
	f.arrow([
		[cx, y + 212],
		[cx, y + 272],
	]);
	s.link.forEach((line, i) => f.note(cx + 10, y + 233 + i * 18, line, { size: 14, weight: 700 }));
	f.box({
		x: inner,
		y: y + 274,
		w: iw,
		h: 80,
		label: 'MCP server',
		sub: s.server,
		logo: 'modelcontextprotocol',
		size: 15,
	});
	f.arrow([
		[cx, y + 356],
		[cx, y + 382],
	]);
	f.box({
		x: inner,
		y: y + 384,
		w: iw,
		h: 80,
		label: 'Data source',
		sub: s.source,
		icon: 'database',
		size: 15,
	});
}

export const desktop = {
	height: 530,
	draw(f) {
		side(f, SIDES[0], 16, 296, 34);
		side(f, SIDES[1], 328, 296, 34);
	},
};

export const phone = {
	height: 1060,
	draw(f) {
		side(f, SIDES[0], 8, 344, 34);
		side(f, SIDES[1], 8, 344, 564);
	},
};
