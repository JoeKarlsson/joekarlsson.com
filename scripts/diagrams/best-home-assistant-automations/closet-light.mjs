export const alt =
	'Closet lights on a door sensor: when the closet door opens, the closet light gets coloured in pink, it is on. It turns itself off after 10 minutes if the door is left open.';

export const desktop = {
	height: 230,
	draw(f) {
		f.box({ x: 40, y: 50, w: 200, h: 80, label: 'Closet door', sub: 'opens' });
		f.arrow([
			[240, 90],
			[390, 90],
		]);
		f.box({
			x: 390,
			y: 50,
			w: 210,
			h: 80,
			label: 'Closet light',
			sub: 'Natural light scene',
			colourIn: 0.6,
		});
		f.handwrite(600, 190, 'off after 10 min, door or no door', {
			size: 18,
			anchor: 'end',
			arrow: [[470, 172], [490, 138], -10],
		});
	},
};

export const phone = {
	height: 330,
	draw(f) {
		f.box({ x: 80, y: 20, w: 200, h: 76, label: 'Closet door', sub: 'opens' });
		f.arrow([
			[180, 96],
			[180, 156],
		]);
		f.box({
			x: 70,
			y: 156,
			w: 220,
			h: 80,
			label: 'Closet light',
			sub: 'Natural light scene',
			colourIn: 0.6,
		});
		f.handwrite(180, 290, 'off after 10 min anyway', { size: 18, anchor: 'middle' });
	},
};
