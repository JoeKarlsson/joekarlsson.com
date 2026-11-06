export const alt =
	'MCP 2026-07-28 goes from one monolithic spec to a core plus extensions. Before, tool calls, discovery, sessions, UI and tasks were bundled into one spec. After, a small, stable, stateless protocol core keeps tool calls and discovery with no server-pinned session, and opt-in extensions plug into it: MCP Apps for sandboxed UI, Tasks for call-now, fetch-later work, and future extensions. Each extension is versioned on its own.';

const EXTENSIONS = [
	{ label: 'MCP Apps', sub: ['sandboxed', 'UI', 'opt-in, v1'], kind: 'chalk', icon: 'app-window' },
	{ label: 'Tasks', sub: ['call now,', 'fetch later', 'opt-in, v1'], kind: 'chalk', icon: 'clock' },
	{ label: ['Future', 'extensions'], kind: 'dashed', icon: 'boxes' },
];

export const desktop = {
	height: 470,
	draw(f) {
		f.group({ x: 16, y: 40, w: 176, h: 300, label: 'Before' });
		f.box({
			x: 28,
			y: 60,
			w: 152,
			h: 260,
			label: ['One', 'spec'],
			sub: ['tool calls', 'discovery', 'sessions', 'UI', 'tasks', 'all bundled'],
			logo: 'modelcontextprotocol',
			stack: true,
		});
		f.arrow([
			[194, 190],
			[226, 190],
		]);
		f.note(210, 172, 'splits', { anchor: 'middle', size: 14 });
		f.group({ x: 228, y: 40, w: 396, h: 412, label: 'After: core + extensions' });
		f.box({
			x: 240,
			y: 60,
			w: 180,
			h: 260,
			kind: 'pink',
			label: ['Stateless', 'core'],
			sub: ['tool calls', 'discovery', 'no server-pinned', 'session', 'small, stable', 'surface'],
			logo: 'modelcontextprotocol',
			stack: true,
		});
		// Extensions plug into the core: these lines are attachments, not flows
		const ys = [60, 186, 312];
		ys.forEach((y, i) =>
			f.arrow(
				[
					[422, 190],
					[432, 190],
					[432, y + 50],
					[442, y + 50],
				],
				{ heads: 'none', dashed: i === 2 },
			),
		);
		EXTENSIONS.forEach((e, i) => f.box({ x: 444, y: ys[i], w: 168, h: 112, size: 16, ...e }));
		f.note(240, 360, 'Each extension is', { size: 15 });
		f.note(240, 382, 'optional and versioned', { size: 15 });
		f.note(240, 404, 'on its own.', { size: 15 });
	},
};

export const phone = {
	height: 760,
	draw(f) {
		f.group({ x: 8, y: 40, w: 344, h: 150, label: 'Before' });
		f.box({
			x: 20,
			y: 60,
			w: 320,
			h: 114,
			label: 'One spec',
			sub: ['tool calls, discovery,', 'sessions, UI and tasks,', 'all bundled'],
			logo: 'modelcontextprotocol',
		});
		f.arrow([
			[180, 192],
			[180, 236],
		]);
		f.note(194, 214, 'splits', { size: 14 });
		f.group({ x: 8, y: 262, w: 344, h: 480, label: 'After: core + extensions' });
		f.box({
			x: 20,
			y: 282,
			w: 320,
			h: 150,
			kind: 'pink',
			label: 'Stateless core',
			sub: ['tool calls, discovery', 'no server-pinned session', 'small, stable surface'],
			logo: 'modelcontextprotocol',
		});
		const xs = [66, 180, 294];
		xs.forEach((cx, i) =>
			f.arrow(
				[
					[180, 434],
					[180, 452],
					[cx, 452],
					[cx, 470],
				],
				{ heads: 'none', dashed: i === 2 },
			),
		);
		EXTENSIONS.forEach((e, i) =>
			f.box({ x: xs[i] - 54, y: 472, w: 108, h: 176, size: 14, stack: true, subSize: 14, ...e }),
		);
		f.note(20, 690, 'Each extension is optional and', { size: 14 });
		f.note(20, 710, 'versioned on its own.', { size: 14 });
	},
};
