export const alt =
	'Deposit, withdrawal and transfer events each go to their own Kafka topic. A Kafka consumer reads all three topics and feeds event sourcing in Tinybird, which snapshots the events into each customer’s final balance.';

const EVENTS = [
	{ name: 'Deposit', icon: 'arrow-down-to-line', topic: 'deposit' },
	{ name: 'Withdrawal', icon: 'arrow-up-from-line', topic: 'withdrawal' },
	{ name: 'Transfer', icon: 'arrow-left-right', topic: 'transfer' },
];

export const desktop = {
	height: 380,
	draw(f) {
		const rowY = [30, 104, 178];
		EVENTS.forEach((e, i) => {
			const y = rowY[i];
			f.box({ x: 16, y, w: 160, h: 56, label: e.name, icon: e.icon, size: 15 });
			f.arrow([
				[178, y + 28],
				[210, y + 28],
			]);
			f.box({
				x: 212,
				y,
				w: 184,
				h: 56,
				kind: 'chalk',
				label: 'Kafka topic',
				sub: e.topic,
				size: 15,
				logo: 'apachekafka',
			});
			f.arrow([
				[398, y + 28],
				[420, y + 28],
				[420, 131],
				[442, 131],
			]);
		});
		f.box({
			x: 444,
			y: 98,
			w: 176,
			h: 66,
			kind: 'chalk',
			label: ['Kafka', 'consumer'],
			size: 15,
			logo: 'apachekafka',
		});
		f.arrow([
			[532, 166],
			[532, 270],
		]);
		f.box({
			x: 392,
			y: 272,
			w: 228,
			h: 80,
			kind: 'pink',
			label: 'Event sourcing',
			sub: ['snapshots in Tinybird'],
			subSize: 14,
			size: 15,
			icon: 'history',
		});
		f.arrow([
			[390, 312],
			[346, 312],
		]);
		f.box({ x: 120, y: 284, w: 224, h: 56, label: 'Final balance', icon: 'wallet', size: 15 });
	},
};

export const phone = {
	height: 590,
	draw(f) {
		f.group({ x: 8, y: 34, w: 344, h: 236, label: 'Account events' });
		const rowY = [52, 124, 196];
		EVENTS.forEach((e, i) => {
			const y = rowY[i];
			f.box({ x: 18, y, w: 150, h: 58, label: e.name, icon: e.icon, size: 14 });
			f.arrow([
				[170, y + 29],
				[184, y + 29],
			]);
			f.box({
				x: 186,
				y,
				w: 158,
				h: 58,
				kind: 'chalk',
				label: 'Kafka topic',
				sub: e.topic,
				size: 14,
				logo: 'apachekafka',
			});
		});
		f.arrow([
			[180, 272],
			[180, 304],
		]);
		f.box({
			x: 70,
			y: 306,
			w: 220,
			h: 64,
			kind: 'chalk',
			label: ['Kafka', 'consumer'],
			size: 15,
			logo: 'apachekafka',
		});
		f.arrow([
			[180, 372],
			[180, 404],
		]);
		f.box({
			x: 40,
			y: 406,
			w: 280,
			h: 80,
			kind: 'pink',
			label: 'Event sourcing',
			sub: ['snapshots in Tinybird'],
			subSize: 14,
			size: 15,
			icon: 'history',
		});
		f.arrow([
			[180, 488],
			[180, 516],
		]);
		f.box({ x: 60, y: 518, w: 240, h: 56, label: 'Final balance', icon: 'wallet', size: 15 });
	},
};
