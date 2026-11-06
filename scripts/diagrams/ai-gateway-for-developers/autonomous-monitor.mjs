export const alt =
	'A schedule or an event starts a monitoring agent. The agent queries BigQuery through a CData Connect AI workspace scoped to the metrics schema, read-only. Teams start with findings sent as alerts; later they add guarded writes, where a human approves an action before it runs. Connect AI logs every request: what the agent saw and what it did.';

export const desktop = {
	height: 420,
	draw(f) {
		f.box({ x: 16, y: 70, w: 160, h: 60, label: 'Schedule', sub: 'or an event', icon: 'clock' });
		f.arrow([
			[178, 100],
			[206, 100],
		]);
		f.box({ x: 210, y: 70, w: 170, h: 60, label: ['Monitoring', 'agent'], size: 16, icon: 'bot' });
		f.arrow(
			[
				[382, 100],
				[416, 100],
			],
			{ heads: 'both' },
		);
		f.note(399, 82, 'MCP', { anchor: 'middle', weight: 700 });
		f.box({
			x: 420,
			y: 46,
			w: 200,
			h: 108,
			kind: 'chalk',
			wordmark: 'connect-ai',
			sub: ['workspace: metrics.*', 'read-only'],
		});
		f.arrow(
			[
				[520, 156],
				[520, 200],
			],
			{ heads: 'both' },
		);
		f.box({ x: 440, y: 202, w: 160, h: 56, label: 'BigQuery', logo: 'googlebigquery' });
		f.arrow([
			[295, 132],
			[295, 250],
			[110, 250],
			[110, 288],
		]);
		f.note(122, 234, 'first: alerts only');
		f.arrow(
			[
				[295, 250],
				[330, 250],
				[330, 288],
			],
			{ dashed: true },
		);
		f.note(342, 270, 'later');
		f.box({
			x: 20,
			y: 290,
			w: 180,
			h: 80,
			label: 'Finding',
			sub: ['sent as', 'an alert'],
			icon: 'bell',
		});
		f.box({
			x: 230,
			y: 290,
			w: 190,
			h: 112,
			kind: 'dashed',
			label: ['Guarded', 'write'],
			sub: ['a human', 'approves first'],
			icon: 'user-check',
		});
		// What the boxes can't show: the audit trail
		f.text(446, 304, 'Every request is logged:', { font: 'serif', size: 16, anchor: 'start' });
		f.note(446, 328, 'what the agent saw', { size: 14 });
		f.note(446, 348, 'and what it did', { size: 14 });
		f.crayonArrow([436, 296], [418, 150], -14);
	},
};

export const phone = {
	height: 650,
	draw(f) {
		f.box({ x: 110, y: 20, w: 164, h: 56, label: 'Schedule', sub: 'or an event', icon: 'clock' });
		f.arrow([
			[192, 78],
			[192, 104],
		]);
		f.box({ x: 110, y: 106, w: 164, h: 60, label: ['Monitoring', 'agent'], size: 16, icon: 'bot' });
		f.arrow(
			[
				[192, 168],
				[192, 214],
			],
			{ heads: 'both' },
		);
		f.note(204, 191, 'MCP', { weight: 700 });
		f.box({
			x: 40,
			y: 216,
			w: 304,
			h: 104,
			kind: 'chalk',
			wordmark: 'connect-ai',
			sub: ['workspace: metrics.*', 'read-only'],
		});
		f.arrow(
			[
				[110, 322],
				[110, 366],
			],
			{ heads: 'both' },
		);
		f.box({ x: 36, y: 368, w: 156, h: 54, label: 'BigQuery', logo: 'googlebigquery' });
		f.text(204, 372, 'Every request', { font: 'serif', size: 15, anchor: 'start' });
		f.text(204, 392, 'is logged:', { font: 'serif', size: 15, anchor: 'start' });
		f.note(204, 414, 'what the agent saw', { size: 14 });
		f.note(204, 432, 'and what it did', { size: 14 });
		f.crayonArrow([262, 360], [262, 326], 8);
		f.arrow([
			[110, 136],
			[20, 136],
			[20, 470],
			[110, 470],
			[110, 494],
		]);
		f.note(30, 456, 'first: alerts only', { size: 14 });
		f.arrow(
			[
				[110, 470],
				[262, 470],
				[262, 494],
			],
			{ dashed: true },
		);
		f.note(274, 482, 'later', { size: 14 });
		f.box({
			x: 40,
			y: 496,
			w: 140,
			h: 112,
			label: 'Finding',
			sub: ['sent as', 'an alert'],
			icon: 'bell',
			stack: true,
		});
		f.box({
			x: 192,
			y: 496,
			w: 152,
			h: 142,
			kind: 'dashed',
			label: ['Guarded', 'write'],
			sub: ['a human', 'approves first'],
			subSize: 14,
			icon: 'user-check',
			stack: true,
		});
	},
};
