export const alt =
	'Reading state from a snapshot: start from the last snapshot, a balance of $100, then replay only the events since it: +$20, -$15, +$5 and -$35. The current balance is $75.';

const EVENTS = [
	{ label: '+$20', kind: 'chalk' },
	{ label: '-$15', kind: 'pink' },
	{ label: '+$5', kind: 'chalk' },
	{ label: '-$35', kind: 'pink' },
];

export const desktop = {
	height: 250,
	draw(f) {
		f.box({
			x: 16,
			y: 60,
			w: 110,
			h: 90,
			label: 'Snapshot',
			sub: '$100',
			subSize: 18,
			icon: 'table',
			size: 14,
			stack: true,
		});
		f.group({ x: 150, y: 60, w: 340, h: 90, label: 'Events since the snapshot' });
		EVENTS.forEach((e, i) =>
			f.box({
				x: 162 + i * 80,
				y: 76,
				w: 70,
				h: 58,
				kind: e.kind,
				label: e.label,
				font: 'mono',
				size: 16,
			}),
		);
		f.box({
			x: 514,
			y: 60,
			w: 110,
			h: 90,
			kind: 'pink',
			label: 'Balance',
			sub: '$75',
			subSize: 18,
			icon: 'wallet',
			size: 14,
			stack: true,
		});
		f.arrow([
			[16, 196],
			[624, 196],
		]);
		f.note(16, 220, 'start', { size: 13 });
		f.note(624, 220, 'now', { anchor: 'end', size: 13 });
		f.note(320, 220, 'replay only what came after the snapshot', { anchor: 'middle', size: 13 });
	},
};

export const phone = {
	height: 560,
	draw(f) {
		f.box({
			x: 90,
			y: 16,
			w: 180,
			h: 64,
			label: 'Snapshot',
			sub: '$100',
			subSize: 17,
			icon: 'table',
			size: 15,
		});
		f.arrow([
			[180, 82],
			[180, 120],
		]);
		f.group({ x: 8, y: 144, w: 344, h: 270, label: 'Events since the snapshot' });
		EVENTS.forEach((e, i) =>
			f.box({
				x: 90,
				y: 162 + i * 62,
				w: 180,
				h: 50,
				kind: e.kind,
				label: e.label,
				font: 'mono',
				size: 17,
			}),
		);
		f.arrow([
			[180, 416],
			[180, 454],
		]);
		f.box({
			x: 90,
			y: 456,
			w: 180,
			h: 64,
			kind: 'pink',
			label: 'Balance',
			sub: '$75',
			subSize: 17,
			icon: 'wallet',
			size: 15,
		});
		f.note(180, 544, 'replay only what came after', { anchor: 'middle', size: 13 });
	},
};
