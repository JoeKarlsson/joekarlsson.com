export const alt =
	'What happens when Claude calls go_to. Claude calls go_to("Salesforce"): it decides where to go and who to shoot, and never sees a pixel or a coordinate. It passes a name, nothing else, to play.py, the Doom MCP server, which plans the route (lobby, hall, stop at the door, turn 90 degrees, use, wait 1.2 s, walk in) because we built the level and it knows where every door is. Each waypoint is one MOVE x y command to psdoom-ng, the patched C engine, which steers 35 times a second: every tic it turns toward the next point, walks, and reports arrived within 16 units.';

const INK = '#000000';
const MUTED = '#a3a3a3';

/** One layer: its name, then what it does and its job, in two columns or stacked. */
function layer(
	f,
	{ x, y, w, h, kind, name, tag, logo, job, does, doesFont = 'sans', aside, stacked },
) {
	f.box({ x, y, w, h, kind });
	const on = f.onColor(kind ?? 'outline');
	const label = kind === 'pink' ? INK : MUTED;
	const left = x + 22;
	const nameX = logo ? left + f.logo(logo, left, y + 32, 26, kind ?? 'outline') + 12 : left;
	f.text(nameX, y + 32, name, {
		font: 'display',
		size: 28,
		anchor: 'start',
		upper: true,
		color: on,
	});
	if (tag) f.text(x + w - 22, y + 32, tag, { size: 15, color: label, anchor: 'end', weight: 700 });
	const column = (cx, top, title, list, font, size) => {
		f.text(cx, top, title, { size: 14, color: label, anchor: 'start', weight: 700 });
		list.forEach((line, i) =>
			f.text(cx, top + 26 + i * 23, line, { font, size, color: on, anchor: 'start' }),
		);
		return top + 26 + list.length * 23;
	};
	if (stacked) {
		const after = column(left, y + 70, 'Its job', job, 'sans', 17);
		const end = column(left, after + 14, 'What it does', does, doesFont, 15);
		if (aside) f.text(left, end + 8, aside, { size: 15, color: label, anchor: 'start' });
	} else {
		column(left, y + 72, 'What it does', does, doesFont, 16);
		column(x + w / 2 + 10, y + 72, 'Its job', job, 'sans', 18);
		if (aside) f.text(left, y + h - 24, aside, { size: 15, color: label, anchor: 'start' });
	}
}

export const desktop = {
	height: 710,
	draw(f) {
		layer(f, {
			x: 20,
			y: 50,
			w: 600,
			h: 160,
			name: 'Claude',
			logo: 'claude',
			does: ['go_to("Salesforce")'],
			doesFont: 'mono',
			job: ['decides where to go,', 'and who to shoot'],
			aside: 'never sees a pixel or a coordinate',
		});
		f.arrow(
			[
				[320, 214],
				[320, 280],
			],
			{ heads: 'both' },
		);
		f.note(334, 247, 'a name, nothing else');
		f.note(306, 247, 'back: arrived, or why not', { anchor: 'end' });
		layer(f, {
			x: 20,
			y: 284,
			w: 600,
			h: 170,
			name: 'play.py',
			tag: 'the Doom MCP server',
			logo: 'python',
			does: ['lobby → hall → stop at the door', '→ turn 90° → use → wait 1.2 s', '→ walk in'],
			job: ['plans the route: we built', 'the level, so it knows', 'where every door is'],
		});
		f.arrow(
			[
				[320, 458],
				[320, 524],
			],
			{ heads: 'both' },
		);
		f.note(306, 491, 'back: arrived or blocked', { anchor: 'end' });
		f.note(334, 480, 'MOVE x y', { font: 'mono' });
		f.note(334, 502, 'each waypoint is one MOVE command');
		layer(f, {
			x: 20,
			y: 528,
			w: 600,
			h: 160,
			kind: 'pink',
			name: 'psdoom-ng (C)',
			does: ['every tic: turn toward the next', 'point, walk, report arrived', 'within 16 units'],
			job: ['steers, 35 times a second'],
		});
	},
};

export const phone = {
	height: 870,
	draw(f) {
		layer(f, {
			x: 16,
			y: 52,
			w: 328,
			h: 206,
			stacked: true,
			name: 'Claude',
			logo: 'claude',
			job: ['decides where, and who to shoot'],
			does: ['go_to("Salesforce")'],
			doesFont: 'mono',
			aside: 'never sees a pixel or a coordinate',
		});
		f.arrow(
			[
				[180, 262],
				[180, 318],
			],
			{ heads: 'both' },
		);
		f.note(194, 290, 'a name, nothing else');
		f.note(166, 280, 'back: arrived,', { anchor: 'end', size: 14 });
		f.note(166, 300, 'or why not', { anchor: 'end', size: 14 });
		layer(f, {
			x: 16,
			y: 322,
			w: 328,
			h: 236,
			stacked: true,
			name: 'play.py',
			tag: 'the Doom MCP server',
			logo: 'python',
			job: ['plans the route: we built the', 'level, so it knows every door'],
			does: ['lobby → hall → stop at the door →', 'turn 90° → use → wait 1.2 s → walk in'],
		});
		f.arrow(
			[
				[180, 562],
				[180, 626],
			],
			{ heads: 'both' },
		);
		f.note(166, 584, 'back: arrived', { anchor: 'end', size: 14 });
		f.note(166, 604, 'or blocked', { anchor: 'end', size: 14 });
		f.note(194, 584, 'MOVE x y', { font: 'mono' });
		f.note(194, 606, 'one per waypoint');
		layer(f, {
			x: 16,
			y: 630,
			w: 328,
			h: 222,
			stacked: true,
			kind: 'pink',
			name: 'psdoom-ng (C)',
			job: ['steers, 35 times a second'],
			does: ['every tic: turn toward the next', 'point, walk, report arrived', 'within 16 units'],
		});
	},
};
