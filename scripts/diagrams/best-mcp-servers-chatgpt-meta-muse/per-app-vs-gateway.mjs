export const alt =
	'Two ways to connect ChatGPT and Meta Muse to Salesforce, Jira, NetSuite and SharePoint. With one MCP server per app, every assistant wires to every server, with separate sign-ins, permissions and logs for each. With one governed CData Connect AI gateway, both assistants connect once, and the gateway handles permissions, the signed-in user’s access and a query log for those apps and hundreds more.';

const CLIENTS = [
	{ label: 'ChatGPT', sub: 'and dots', logo: 'openai' },
	{ label: 'Meta Muse', logo: 'meta' },
];
const APPS = [
	['salesforce', 'Salesforce'],
	['jira', 'Jira'],
	['building-2', 'NetSuite'],
	['file-text', 'SharePoint'],
];

/** An app as its logo or icon with its name under it. */
function app(f, mark, name, cx, y) {
	f.logo(mark, cx - f.logoWidth(mark, 28) / 2, y, 28);
	f.text(cx, y + 32, name, { size: 14, weight: 600 });
}

export const desktop = {
	height: 760,
	draw(f) {
		// One server per app: every assistant wires to every server
		f.group({ x: 16, y: 34, w: 608, h: 300, label: 'One server per app' });
		const clientX = [90, 350];
		CLIENTS.forEach((c, i) => f.box({ x: clientX[i], y: 56, w: 200, h: 60, size: 16, ...c }));
		const serverX = [36, 182, 328, 474];
		clientX.forEach((x) =>
			serverX.forEach((sx) =>
				f.arrow(
					[
						[x + 100, 118],
						[sx + 65, 200],
					],
					{ heads: 'both' },
				),
			),
		);
		APPS.forEach(([mark, name], i) =>
			f.box({
				x: serverX[i],
				y: 202,
				w: 130,
				h: 84,
				label: name,
				sub: 'MCP server',
				size: 14,
				icon: mark,
				stack: true,
			}),
		);
		f.note(320, 312, 'Separate sign-ins, permissions and logs for each', { anchor: 'middle' });

		// One governed gateway
		f.group({ x: 16, y: 384, w: 608, h: 360, label: 'One governed gateway' });
		CLIENTS.forEach((c, i) => f.box({ x: clientX[i], y: 406, w: 200, h: 60, size: 16, ...c }));
		clientX.forEach((x) =>
			f.arrow(
				[
					[x + 100, 468],
					[x + 100, 498],
				],
				{ heads: 'both' },
			),
		);
		f.box({
			x: 120,
			y: 500,
			w: 400,
			h: 110,
			kind: 'chalk',
			wordmark: 'connect-ai',
			sub: ['permissions, the signed-in user’s access', 'and a query log'],
		});
		const centers = [76, 198, 320, 442, 564];
		centers.forEach((cx) =>
			f.arrow(
				[
					[320, 612],
					[320, 630],
					[cx, 630],
					[cx, 650],
				],
				{ heads: 'both' },
			),
		);
		APPS.forEach(([mark, name], i) => app(f, mark, name, centers[i], 670));
		app(f, 'boxes', 'Hundreds more', centers[4], 670);
		f.note(320, 726, 'One connection, one set of rules, one log', { anchor: 'middle' });
	},
};

export const phone = {
	height: 800,
	draw(f) {
		f.group({ x: 8, y: 34, w: 344, h: 300, label: 'One server per app' });
		const clientX = [20, 186];
		CLIENTS.forEach((c, i) => f.box({ x: clientX[i], y: 54, w: 154, h: 62, size: 14, ...c }));
		const appX = [52, 137, 223, 308];
		clientX.forEach((x) =>
			appX.forEach((ax) =>
				f.arrow(
					[
						[x + 77, 118],
						[ax, 210],
					],
					{ heads: 'both' },
				),
			),
		);
		APPS.forEach(([mark, name], i) => app(f, mark, name, appX[i], 232));
		f.note(180, 296, 'Separate sign-ins, permissions', { anchor: 'middle', size: 14 });
		f.note(180, 314, 'and logs for each', { anchor: 'middle', size: 14 });

		f.group({ x: 8, y: 384, w: 344, h: 400, label: 'One governed gateway' });
		CLIENTS.forEach((c, i) => f.box({ x: clientX[i], y: 404, w: 154, h: 62, size: 14, ...c }));
		clientX.forEach((x) =>
			f.arrow(
				[
					[x + 77, 468],
					[x + 77, 498],
				],
				{ heads: 'both' },
			),
		);
		f.box({
			x: 20,
			y: 500,
			w: 320,
			h: 124,
			kind: 'chalk',
			wordmark: 'connect-ai',
			sub: ['permissions', 'the signed-in user’s access', 'a query log'],
		});
		appX.forEach((cx) =>
			f.arrow(
				[
					[180, 626],
					[180, 644],
					[cx, 644],
					[cx, 664],
				],
				{ heads: 'both' },
			),
		);
		APPS.forEach(([mark, name], i) => app(f, mark, name, appX[i], 684));
		f.note(180, 736, '+ hundreds more apps', { anchor: 'middle', size: 14 });
		f.note(180, 762, 'One connection, one set of rules, one log', { anchor: 'middle', size: 14 });
	},
};
