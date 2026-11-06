export const alt =
	'A real-time recommendation system: users post activity to an API and get recommendations back from it. The API sends activity to an event streaming platform, which feeds the recommendation system. Real-time inference serves recommendations back to the API, while the recommendation system also writes to a data warehouse used for model training, and the trained model feeds real-time inference.';

export const desktop = {
	height: 360,
	draw(f) {
		f.box({ x: 16, y: 100, w: 120, h: 60, label: 'Users', icon: 'users', size: 15 });
		f.arrow(
			[
				[138, 130],
				[196, 130],
			],
			{ heads: 'both' },
		);
		f.note(167, 112, 'activity', { anchor: 'middle', size: 12 });
		f.note(167, 150, 'recs', { anchor: 'middle', size: 12 });
		f.box({ x: 198, y: 100, w: 110, h: 60, label: 'API', icon: 'plug', size: 15 });
		f.arrow([
			[253, 98],
			[253, 52],
			[356, 52],
		]);
		f.box({
			x: 358,
			y: 20,
			w: 266,
			h: 64,
			label: ['Event streaming', 'platform'],
			logo: 'apachekafka',
			size: 14,
		});
		f.arrow([
			[490, 86],
			[490, 116],
		]);
		f.box({
			x: 400,
			y: 118,
			w: 224,
			h: 60,
			kind: 'pink',
			label: ['Recommendation', 'system'],
			icon: 'sparkles',
			size: 14,
		});
		f.arrow([
			[398, 160],
			[370, 160],
			[370, 224],
			[336, 224],
		]);
		f.box({
			x: 150,
			y: 196,
			w: 184,
			h: 60,
			kind: 'chalk',
			label: ['Real-time', 'inference'],
			icon: 'cpu',
			size: 14,
		});
		f.arrow([
			[230, 194],
			[230, 162],
		]);
		f.arrow(
			[
				[560, 180],
				[560, 214],
			],
			{ dashed: true },
		);
		f.box({
			x: 470,
			y: 216,
			w: 154,
			h: 54,
			label: ['Data', 'warehouse'],
			icon: 'warehouse',
			size: 13,
		});
		f.arrow(
			[
				[547, 272],
				[547, 296],
			],
			{ dashed: true, heads: 'both' },
		);
		f.box({
			x: 470,
			y: 298,
			w: 154,
			h: 54,
			label: ['Model', 'training'],
			icon: 'settings',
			size: 13,
		});
		f.arrow([
			[468, 325],
			[242, 325],
			[242, 258],
		]);
		f.note(330, 312, 'trained model', { anchor: 'middle', size: 12 });
	},
};

export const phone = {
	height: 640,
	draw(f) {
		f.box({ x: 16, y: 16, w: 140, h: 56, label: 'Users', icon: 'users', size: 15 });
		f.arrow(
			[
				[158, 44],
				[202, 44],
			],
			{ heads: 'both' },
		);
		f.box({ x: 204, y: 16, w: 140, h: 56, label: 'API', icon: 'plug', size: 15 });
		f.note(180, 92, 'activity in, recommendations out', { anchor: 'middle', size: 13 });
		f.arrow([
			[300, 74],
			[300, 126],
		]);
		f.box({
			x: 120,
			y: 128,
			w: 228,
			h: 64,
			label: ['Event streaming', 'platform'],
			logo: 'apachekafka',
			size: 14,
		});
		f.arrow([
			[234, 194],
			[234, 222],
		]);
		f.box({
			x: 120,
			y: 224,
			w: 228,
			h: 64,
			kind: 'pink',
			label: ['Recommendation', 'system'],
			icon: 'sparkles',
			size: 14,
		});
		f.arrow([
			[118, 256],
			[80, 256],
			[80, 330],
		]);
		f.box({
			x: 16,
			y: 332,
			w: 160,
			h: 64,
			kind: 'chalk',
			label: ['Real-time', 'inference'],
			icon: 'cpu',
			size: 14,
		});
		f.arrow([
			[30, 330],
			[30, 74],
		]);
		f.arrow(
			[
				[290, 290],
				[290, 434],
			],
			{ dashed: true },
		);
		f.box({
			x: 200,
			y: 436,
			w: 148,
			h: 64,
			label: ['Data', 'warehouse'],
			icon: 'warehouse',
			size: 13,
		});
		f.arrow(
			[
				[274, 502],
				[274, 534],
			],
			{ dashed: true, heads: 'both' },
		);
		f.box({
			x: 200,
			y: 536,
			w: 148,
			h: 64,
			label: ['Model', 'training'],
			icon: 'settings',
			size: 13,
		});
		f.arrow([
			[198, 568],
			[96, 568],
			[96, 398],
		]);
		f.note(108, 588, 'trained model', { size: 13 });
	},
};
