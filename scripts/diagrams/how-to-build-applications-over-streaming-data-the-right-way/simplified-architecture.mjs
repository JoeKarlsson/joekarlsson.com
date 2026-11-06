export const alt =
	'A simplified architecture: Kafka feeds Tinybird, a real-time data platform that does the work of the middle systems in one place, and Tinybird serves the frontend.';

export const desktop = {
	height: 170,
	draw(f) {
		f.box({ x: 16, y: 40, w: 160, h: 64, label: 'Kafka', logo: 'apachekafka', size: 15 });
		f.arrow([
			[178, 72],
			[218, 72],
		]);
		f.box({
			x: 220,
			y: 24,
			w: 200,
			h: 96,
			kind: 'pink',
			wordmark: 'tinybird',
			sub: ['real-time', 'data platform'],
		});
		f.arrow([
			[422, 72],
			[462, 72],
		]);
		f.box({ x: 464, y: 40, w: 160, h: 64, label: 'Frontend', icon: 'monitor', size: 15 });
		f.note(320, 148, 'One system in the middle instead of four.', { anchor: 'middle' });
	},
};

export const phone = {
	height: 330,
	draw(f) {
		f.box({ x: 90, y: 16, w: 180, h: 58, label: 'Kafka', logo: 'apachekafka', size: 15 });
		f.arrow([
			[180, 76],
			[180, 104],
		]);
		f.box({
			x: 60,
			y: 106,
			w: 240,
			h: 84,
			kind: 'pink',
			wordmark: 'tinybird',
			sub: 'real-time data platform',
		});
		f.arrow([
			[180, 192],
			[180, 220],
		]);
		f.box({ x: 90, y: 222, w: 180, h: 58, label: 'Frontend', icon: 'monitor', size: 15 });
		f.note(180, 308, 'One system in the middle instead of four.', { anchor: 'middle', size: 14 });
	},
};
