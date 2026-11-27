export const alt =
	'Motion lighting where a switch always wins. A Hue dimmer is drawn, then the kitchen lights it controls are coloured in pink, then the words: the switch always wins. Motion waits 3 minutes after someone turns the lights off.';

export const desktop = {
	height: 300,
	draw(f) {
		f.box({
			x: 40,
			y: 40,
			w: 190,
			h: 80,
			label: 'Hue dimmer',
			sub: 'paired to the bridge',
			draw: 0.2,
		});
		f.box({ x: 40, y: 180, w: 190, h: 80, label: 'Motion sensor', sub: 'waits 3 min', draw: 0.5 });
		f.box({ x: 400, y: 110, w: 200, h: 80, label: 'Kitchen lights', draw: 0.8, colourIn: 2 });
		f.arrow(
			[
				[230, 80],
				[400, 135],
			],
			{ draw: 1.3 },
		);
		f.arrow(
			[
				[230, 220],
				[400, 168],
			],
			{ dashed: true, draw: 1.3 },
		);
		f.handwrite(262, 26, 'the switch always wins', {
			size: 20,
			arrow: [[258, 32], [236, 58], 12],
		});
	},
};

export const phone = {
	height: 380,
	draw(f) {
		f.box({ x: 20, y: 20, w: 150, h: 80, label: 'Hue dimmer', sub: 'via the bridge', draw: 0.2 });
		f.box({ x: 190, y: 20, w: 150, h: 80, label: 'Motion', sub: 'waits 3 min', draw: 0.5 });
		f.box({ x: 80, y: 200, w: 200, h: 80, label: 'Kitchen lights', draw: 0.8, colourIn: 2 });
		f.arrow(
			[
				[95, 100],
				[150, 200],
			],
			{ draw: 1.3 },
		);
		f.arrow(
			[
				[265, 100],
				[210, 200],
			],
			{ dashed: true, draw: 1.3 },
		);
		f.handwrite(180, 340, 'the switch always wins', { size: 20, anchor: 'middle' });
	},
};
