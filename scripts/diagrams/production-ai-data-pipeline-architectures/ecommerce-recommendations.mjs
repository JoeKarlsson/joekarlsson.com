export const alt =
	'E-commerce recommendations: CloudQuery streams fresh data from the Shopify and analytics APIs into a vector database and a feature store, which feed the recommendation engine behind the e-commerce app.';

export const desktop = {
	height: 300,
	draw(f) {
		f.group({ x: 16, y: 36, w: 190, h: 130, label: 'Sources' });
		f.box({
			x: 26,
			y: 54,
			w: 170,
			h: 46,
			kind: 'ink',
			label: 'Shopify APIs',
			logo: 'shopify',
			size: 13,
		});
		f.box({
			x: 26,
			y: 106,
			w: 170,
			h: 46,
			kind: 'ink',
			label: 'Analytics APIs',
			icon: 'chart-line',
			size: 13,
		});
		f.arrow([
			[208, 101],
			[238, 101],
		]);
		f.box({
			x: 240,
			y: 62,
			w: 160,
			h: 80,
			kind: 'chalk',
			wordmark: 'cloudquery',
			sub: 'fresh product data',
		});
		f.arrow([
			[402, 101],
			[432, 101],
		]);
		f.group({ x: 434, y: 36, w: 190, h: 130, label: 'Storage' });
		f.box({
			x: 444,
			y: 54,
			w: 170,
			h: 46,
			kind: 'ink',
			label: 'Vector database',
			icon: 'database',
			size: 13,
		});
		f.box({
			x: 444,
			y: 106,
			w: 170,
			h: 46,
			kind: 'ink',
			label: 'Feature store',
			icon: 'boxes',
			size: 13,
		});
		f.arrow([
			[529, 168],
			[529, 210],
		]);
		f.box({
			x: 404,
			y: 212,
			w: 220,
			h: 64,
			kind: 'pink',
			label: ['Recommendation', 'engine'],
			icon: 'sparkles',
			size: 14,
		});
		f.arrow([
			[402, 244],
			[282, 244],
		]);
		f.box({
			x: 80,
			y: 212,
			w: 200,
			h: 64,
			label: ['E-commerce', 'app'],
			icon: 'shopping-cart',
			size: 14,
		});
	},
};

export const phone = {
	height: 640,
	draw(f) {
		f.group({ x: 8, y: 36, w: 344, h: 80, label: 'Sources' });
		f.box({
			x: 18,
			y: 52,
			w: 158,
			h: 48,
			kind: 'ink',
			label: 'Shopify',
			logo: 'shopify',
			size: 13,
		});
		f.box({
			x: 184,
			y: 52,
			w: 158,
			h: 48,
			kind: 'ink',
			label: 'Analytics',
			icon: 'chart-line',
			size: 13,
		});
		f.arrow([
			[180, 118],
			[180, 146],
		]);
		f.box({
			x: 70,
			y: 148,
			w: 220,
			h: 80,
			kind: 'chalk',
			wordmark: 'cloudquery',
			sub: 'fresh product data',
		});
		f.arrow([
			[180, 230],
			[180, 280],
		]);
		f.group({ x: 8, y: 282, w: 344, h: 80, label: 'Storage' });
		f.box({
			x: 18,
			y: 298,
			w: 158,
			h: 48,
			kind: 'ink',
			label: 'Vector DB',
			icon: 'database',
			size: 13,
		});
		f.box({
			x: 184,
			y: 298,
			w: 158,
			h: 48,
			kind: 'ink',
			label: 'Feature store',
			icon: 'boxes',
			size: 13,
		});
		f.arrow([
			[180, 364],
			[180, 398],
		]);
		f.box({
			x: 60,
			y: 400,
			w: 240,
			h: 64,
			kind: 'pink',
			label: ['Recommendation', 'engine'],
			icon: 'sparkles',
			size: 14,
		});
		f.arrow([
			[180, 466],
			[180, 500],
		]);
		f.box({
			x: 80,
			y: 502,
			w: 200,
			h: 64,
			label: ['E-commerce', 'app'],
			icon: 'shopping-cart',
			size: 14,
		});
	},
};
