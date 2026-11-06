import { enrich } from './_enrich.mjs';

export const alt =
	'Fraud detection: a live stream of transactions from Kafka and historical transactions from the data warehouse both go into Tinybird, which stores them for OLAP queries and, over SQL, serves a real-time API to the fraud detection application.';

const SPEC = {
	stream: ['Real-time', 'transactions'],
	history: ['Historical', 'transactions'],
	app: ['Fraud', 'detection'],
	appIcon: 'shield-alert',
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
