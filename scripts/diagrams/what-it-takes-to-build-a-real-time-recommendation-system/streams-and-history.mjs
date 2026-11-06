export const alt =
	'A real-time recommender combines two inputs: streaming user activity events from Kafka, and historic data from a data warehouse like Snowflake or BigQuery. It uses both to send a recommendation back to the user within their session.';

export const desktop = {
	height: 300,
	draw(f) {
		f.box({
			x: 16,
			y: 30,
			w: 190,
			h: 70,
			label: 'Activity events',
			sub: 'streaming now',
			logo: 'apachekafka',
			size: 15,
			subSize: 13,
		});
		f.group({ x: 16, y: 150, w: 190, h: 120, label: 'History' });
		f.box({
			x: 28,
			y: 168,
			w: 166,
			h: 40,
			kind: 'ink',
			label: 'Snowflake',
			logo: 'snowflake',
			size: 13,
		});
		f.box({
			x: 28,
			y: 216,
			w: 166,
			h: 40,
			kind: 'ink',
			label: 'BigQuery',
			logo: 'googlebigquery',
			size: 13,
		});
		f.arrow([
			[208, 65],
			[250, 65],
			[250, 140],
			[292, 140],
		]);
		f.arrow([
			[208, 210],
			[250, 210],
			[250, 156],
			[292, 156],
		]);
		f.box({
			x: 294,
			y: 106,
			w: 180,
			h: 84,
			kind: 'pink',
			label: ['Real-time', 'recommender'],
			icon: 'sparkles',
			size: 15,
		});
		f.arrow([
			[476, 148],
			[514, 148],
		]);
		f.box({ x: 516, y: 116, w: 108, h: 64, label: 'User', icon: 'user', size: 15 });
		f.note(570, 200, 'in session', { anchor: 'middle', size: 13 });
	},
};

export const phone = {
	height: 460,
	draw(f) {
		f.box({
			x: 16,
			y: 16,
			w: 160,
			h: 112,
			label: ['Activity', 'events'],
			sub: 'streaming',
			logo: 'apachekafka',
			size: 14,
			subSize: 13,
			stack: true,
		});
		f.group({ x: 184, y: 36, w: 168, h: 112, label: 'History' });
		f.box({
			x: 194,
			y: 52,
			w: 148,
			h: 40,
			kind: 'ink',
			label: 'Snowflake',
			logo: 'snowflake',
			size: 13,
		});
		f.box({
			x: 194,
			y: 98,
			w: 148,
			h: 40,
			kind: 'ink',
			label: 'BigQuery',
			logo: 'googlebigquery',
			size: 13,
		});
		f.arrow([
			[96, 130],
			[96, 180],
			[150, 180],
			[150, 206],
		]);
		f.arrow([
			[268, 150],
			[268, 180],
			[210, 180],
			[210, 206],
		]);
		f.box({
			x: 70,
			y: 208,
			w: 220,
			h: 80,
			kind: 'pink',
			label: ['Real-time', 'recommender'],
			icon: 'sparkles',
			size: 15,
		});
		f.arrow([
			[180, 290],
			[180, 336],
		]);
		f.note(194, 313, 'in session', { size: 13 });
		f.box({ x: 110, y: 338, w: 140, h: 60, label: 'User', icon: 'user', size: 15 });
	},
};
