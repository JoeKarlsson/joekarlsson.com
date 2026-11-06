import { enrich } from './_enrich.mjs';

export const alt =
	'E-commerce personalization: a live stream of shopping events from Kafka and product dimensions from the data warehouse both go into Tinybird, which stores them for OLAP queries and, over SQL, serves a real-time API for personalization.';

const SPEC = {
	stream: ['Shopping', 'events'],
	history: ['Product', 'dimensions'],
	app: 'Personalization',
	appSub: 'in real time',
	appIcon: 'shopping-cart',
};

export const desktop = {
	height: 250,
	draw(f) {
		enrich(f, SPEC);
	},
};

export const phone = {
	height: 480,
	draw(f) {
		enrich(f, { ...SPEC, phone: true });
	},
};
