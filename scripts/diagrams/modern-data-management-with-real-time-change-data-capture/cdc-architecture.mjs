export const alt =
	'Change data capture: users act through a backend API, which writes to the database. The database records every change in its transaction log, a CDC tool watches that log, and it writes each change as an event to a message queue like Kafka.';

export const desktop = {
	height: 260,
	draw(f) {
		f.box({ x: 16, y: 40, w: 116, h: 92, label: 'Users', icon: 'users', size: 15, stack: true });
		f.arrow([
			[134, 86],
			[166, 86],
		]);
		f.note(150, 28, 'actions', { anchor: 'middle', size: 12 });
		f.box({ x: 168, y: 54, w: 140, h: 64, label: ['Backend', 'API'], icon: 'plug', size: 14 });
		f.arrow([
			[310, 86],
			[346, 86],
		]);
		f.note(328, 70, 'write', { anchor: 'middle', size: 12 });
		f.box({
			x: 348,
			y: 40,
			w: 140,
			h: 92,
			label: 'Database',
			sub: 'transaction log',
			icon: 'database',
			size: 15,
			subSize: 13,
			stack: true,
		});
		f.arrow([
			[490, 86],
			[510, 86],
		]);
		f.note(499, 28, 'log', { anchor: 'middle', size: 12 });
		f.box({
			x: 512,
			y: 54,
			w: 112,
			h: 64,
			kind: 'pink',
			label: ['CDC', 'tool'],
			icon: 'eye',
			size: 15,
		});
		f.arrow([
			[568, 120],
			[568, 176],
		]);
		f.note(556, 148, 'writes events', { anchor: 'end', size: 13 });
		f.box({
			x: 440,
			y: 178,
			w: 184,
			h: 60,
			kind: 'chalk',
			label: ['Message', 'queue'],
			logo: 'apachekafka',
			size: 14,
		});
	},
};

export const phone = {
	height: 600,
	draw(f) {
		f.box({ x: 90, y: 16, w: 180, h: 56, label: 'Users', icon: 'users', size: 15 });
		f.arrow([
			[180, 74],
			[180, 108],
		]);
		f.note(194, 91, 'actions', { size: 13 });
		f.box({ x: 90, y: 110, w: 180, h: 56, label: 'Backend API', icon: 'plug', size: 14 });
		f.arrow([
			[180, 168],
			[180, 202],
		]);
		f.note(194, 185, 'write', { size: 13 });
		f.box({
			x: 70,
			y: 204,
			w: 220,
			h: 70,
			label: 'Database',
			sub: 'transaction log',
			icon: 'database',
			size: 15,
			subSize: 13,
		});
		f.arrow([
			[180, 276],
			[180, 386],
		]);
		f.note(194, 330, 'reads the log', { size: 13 });
		f.box({ x: 90, y: 388, w: 180, h: 64, kind: 'pink', label: 'CDC tool', icon: 'eye', size: 15 });
		f.arrow([
			[180, 454],
			[180, 498],
		]);
		f.note(194, 476, 'writes events', { size: 13 });
		f.box({
			x: 70,
			y: 500,
			w: 220,
			h: 64,
			kind: 'chalk',
			label: 'Message queue',
			logo: 'apachekafka',
			size: 14,
		});
	},
};
