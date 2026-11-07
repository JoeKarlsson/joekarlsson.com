export const alt =
	'How Connect AI × DOOM works. You ask a question. Claude explores your apps through the Connect AI MCP server, with read-only tools only, and picks the three apps that answer it, here Salesforce, Zendesk and Stripe. What it finds becomes the level: each app becomes a room; each record becomes a monster, urgent ones are pink demons, and shooting one reads the record again, live; your permissions become keycards, blue for read only and yellow for read and write; and data Connect AI blocked, like a lookup by Social Security number, sits behind the red door, which has no key and gets refused again every time you try it.';

const APPS = [
	['salesforce', 'Salesforce'],
	['zendesk', 'Zendesk'],
	['stripe', 'Stripe'],
];

const MAP = [
	{ from: 'An app', to: 'A room', icon: 'door-open' },
	{
		from: 'A record',
		to: 'A monster',
		icon: 'crosshair',
		sub: ['urgent ones are pink demons', 'shoot one: read it again, live'],
	},
	{
		from: 'Your permissions',
		to: 'Keycards',
		icon: 'key-round',
		sub: ['blue: read only', 'yellow: read and write'],
	},
	{
		from: 'Blocked data',
		fromSub: 'like an SSN lookup',
		to: 'The red door',
		icon: 'lock',
		sub: ['no key', 'try it: refused again, live'],
	},
];

export const desktop = {
	height: 610,
	draw(f) {
		f.box({ x: 16, y: 30, w: 150, h: 64, label: 'You ask', sub: 'a question', icon: 'user' });
		f.arrow([
			[168, 62],
			[190, 62],
		]);
		f.box({
			x: 192,
			y: 30,
			w: 186,
			h: 64,
			kind: 'chalk',
			label: 'Claude',
			sub: 'picks three apps',
			subSize: 13,
			logo: 'claude',
		});
		f.arrow(
			[
				[378, 62],
				[410, 62],
			],
			{ heads: 'both' },
		);
		f.box({
			x: 412,
			y: 20,
			w: 212,
			h: 84,
			kind: 'chalk',
			wordmark: 'connect-ai',
			sub: ['MCP server', 'read-only tools'],
		});
		APPS.forEach(([logo, label], i) => {
			const x = 222 + i * 136;
			f.arrow(
				[
					[518, 106],
					[518, 118],
					[x + 58, 118],
					[x + 58, 132],
				],
				{ heads: i === 1 ? 'both' : 'end' },
			);
			f.box({ x, y: 134, w: 116, h: 62, kind: 'chalk', label, logo, size: 13, stack: true });
		});
		f.arrow([
			[416, 198],
			[416, 226],
		]);
		f.note(428, 212, 'what it found', { anchor: 'start' });
		f.group({ x: 16, y: 230, w: 608, h: 362, label: 'The level' });
		f.note(36, 254, 'In your apps', { anchor: 'start', size: 14 });
		f.note(296, 254, 'In Doom', { anchor: 'start', size: 14 });
		let y = 272;
		MAP.forEach(({ from, fromSub, to, icon, sub }) => {
			const h = sub ? 70 : 52;
			f.box({
				x: 36,
				y,
				w: 214,
				h,
				kind: 'chalk',
				label: from,
				sub: fromSub,
				size: 15,
				subSize: 14,
			});
			f.arrow([
				[252, y + h / 2],
				[290, y + h / 2],
			]);
			f.box({ x: 292, y, w: 312, h, kind: 'pink', label: to, sub, size: 15, subSize: 14, icon });
			y += h + 12;
		});
	},
};

export const phone = {
	height: 850,
	draw(f) {
		f.box({ x: 60, y: 24, w: 240, h: 56, label: 'You ask', sub: 'a question', icon: 'user' });
		f.arrow([
			[180, 82],
			[180, 106],
		]);
		f.box({
			x: 60,
			y: 108,
			w: 240,
			h: 56,
			kind: 'chalk',
			label: 'Claude',
			sub: 'picks three apps',
			logo: 'claude',
		});
		f.arrow(
			[
				[180, 166],
				[180, 190],
			],
			{ heads: 'both' },
		);
		f.box({
			x: 60,
			y: 192,
			w: 240,
			h: 70,
			kind: 'chalk',
			wordmark: 'connect-ai',
			sub: ['MCP server, read-only tools'],
		});
		APPS.forEach(([logo, label], i) => {
			const x = 14 + i * 114;
			f.arrow(
				[
					[180, 264],
					[180, 278],
					[x + 52, 278],
					[x + 52, 294],
				],
				{ heads: i === 1 ? 'both' : 'end' },
			);
			f.box({ x, y: 296, w: 104, h: 66, kind: 'chalk', label, logo, size: 13, stack: true });
		});
		f.group({ x: 8, y: 410, w: 344, h: 418, label: 'The level' });
		f.arrow([
			[180, 364],
			[180, 406],
		]);
		f.note(192, 386, 'what it found', { anchor: 'start', size: 14 });
		let y = 428;
		MAP.forEach(({ from, fromSub, to, icon, sub }) => {
			f.text(24, y + 10, fromSub ? `${from}, ${fromSub}` : from, {
				size: 14,
				anchor: 'start',
				color: '#a3a3a3',
			});
			const h = sub ? 64 : 44;
			f.box({
				x: 24,
				y: y + 24,
				w: 312,
				h,
				kind: 'pink',
				label: to,
				sub,
				size: 14,
				subSize: 13,
				icon,
			});
			y += h + 40;
		});
	},
};
