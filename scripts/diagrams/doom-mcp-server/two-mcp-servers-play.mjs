export const alt =
	'While you play: Claude Code calls the Doom MCP server tools look, go_to and attack over MCP. The server trades a command file and state.json with Doom, and Doom trades only local files with the bridge, an MCP client. Every 15 seconds the bridge asks the Connect AI MCP server again: it re-runs each room’s query, re-reads kills and re-asks at the red door.';

const TOOLS = ['look', 'go_to', 'attack'];
const TOOL_ICONS = { look: 'eye', go_to: 'footprints', attack: 'crosshair' };

/** The server's own name sits at the top of its box, above the tool chips. */
function serverName(f, x, y) {
	f.text(x, y - 6, 'Doom MCP server', {
		font: 'display',
		size: 24,
		upper: true,
		color: f.onColor('pink'),
	});
	f.text(x, y + 16, 'play.py', { font: 'mono', size: 14, color: f.onColor('pink') });
}

export const desktop = {
	height: 700,
	draw(f) {
		f.heading(20, 32, 'While you play');
		f.box({ x: 180, y: 70, w: 280, h: 56, label: 'Claude Code', logo: 'claude' });
		f.arrow(
			[
				[320, 128],
				[320, 172],
			],
			{ heads: 'both' },
		);
		f.note(334, 150, 'MCP', { weight: 700 });
		f.group({ x: 22, y: 164, w: 596, h: 286, label: 'The game' });
		f.group({ x: 22, y: 494, w: 596, h: 106, label: 'Live data' });
		f.box({ x: 40, y: 176, w: 560, h: 130, kind: 'pink' });
		serverName(f, 320, 206);
		TOOLS.forEach((tool, i) =>
			f.box({
				x: 70 + i * 180,
				y: 240,
				w: 140,
				h: 48,
				kind: 'ink',
				label: tool,
				font: 'mono',
				size: 16,
				icon: TOOL_ICONS[tool],
			}),
		);
		f.arrow(
			[
				[320, 310],
				[320, 370],
			],
			{ heads: 'both' },
		);
		f.note(336, 340, 'command file in, state.json out');
		f.box({
			x: 40,
			y: 374,
			w: 560,
			h: 62,
			kind: 'pink',
			label: 'Doom',
			sub: 'psdoom-ng (C), patched',
		});
		f.arrow(
			[
				[185, 440],
				[185, 506],
			],
			{ heads: 'both' },
		);
		f.note(201, 466, 'local files only');
		f.box({
			x: 40,
			y: 510,
			w: 290,
			h: 70,
			kind: 'chalk',
			label: 'bridge',
			sub: 'an MCP client',
			icon: 'cable',
		});
		f.arrow(
			[
				[334, 545],
				[406, 545],
			],
			{ heads: 'both' },
		);
		f.note(370, 526, 'MCP', { anchor: 'middle', weight: 700 });
		f.box({
			x: 410,
			y: 504,
			w: 190,
			h: 82,
			kind: 'chalk',
			wordmark: 'connect-ai',
			sub: 'MCP server',
		});
		// What travels over that link, and how often: the one thing the boxes can't say
		f.handwrite(40, 646, 'Every 15 s the bridge asks Connect AI again:', { size: 17 });
		f.handwrite(40, 670, 're-runs each room’s query, re-reads kills, re-asks at the red door', {
			size: 17,
			arrow: [[300, 626], [368, 562], 24],
		});
	},
};

export const phone = {
	height: 810,
	draw(f) {
		f.heading(16, 30, 'While you play');
		f.box({ x: 90, y: 90, w: 180, h: 50, label: 'Claude Code', logo: 'claude' });
		f.arrow(
			[
				[180, 142],
				[180, 176],
			],
			{ heads: 'both' },
		);
		f.note(192, 159, 'MCP', { weight: 700 });
		f.group({ x: 6, y: 170, w: 348, h: 276, label: 'The game' });
		f.group({ x: 6, y: 490, w: 348, h: 302, label: 'Live data' });
		f.box({ x: 16, y: 178, w: 328, h: 130, kind: 'pink' });
		serverName(f, 180, 206);
		TOOLS.forEach((tool, i) =>
			f.box({
				x: 28 + i * 104,
				y: 240,
				w: 96,
				h: 60,
				kind: 'ink',
				label: tool,
				font: 'mono',
				size: 15,
				icon: TOOL_ICONS[tool],
				stack: true,
			}),
		);
		f.arrow(
			[
				[180, 312],
				[180, 370],
			],
			{ heads: 'both' },
		);
		f.note(194, 330, 'command file in,');
		f.note(194, 351, 'state.json out');
		f.box({
			x: 16,
			y: 374,
			w: 328,
			h: 62,
			kind: 'pink',
			label: 'Doom',
			sub: 'psdoom-ng (C), patched',
		});
		f.arrow(
			[
				[180, 440],
				[180, 494],
			],
			{ heads: 'both' },
		);
		f.note(194, 462, 'local files only');
		f.box({
			x: 16,
			y: 498,
			w: 328,
			h: 64,
			kind: 'chalk',
			label: 'bridge',
			sub: 'an MCP client',
			icon: 'cable',
		});
		f.arrow(
			[
				[60, 566],
				[60, 700],
			],
			{ heads: 'both' },
		);
		f.note(72, 584, 'MCP', { weight: 700 });
		f.handwrite(130, 606, 'Every 15 s the bridge asks', { size: 16 });
		f.handwrite(130, 630, 'Connect AI again: re-runs', { size: 16 });
		f.handwrite(130, 654, 'each room’s query, re-reads', { size: 16 });
		f.handwrite(130, 678, 'kills, re-asks at the red door', {
			size: 16,
			arrow: [[122, 642], [74, 642], 10],
		});
		f.box({
			x: 16,
			y: 704,
			w: 328,
			h: 80,
			kind: 'chalk',
			wordmark: 'connect-ai',
			sub: 'MCP server',
		});
	},
};
