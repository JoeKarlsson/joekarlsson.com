import { enrich } from './_enrich.mjs';

export const alt =
	'Log analytics: live log events from Kafka and historical logs from the data warehouse both go into Tinybird, which stores them for OLAP queries and, over SQL, serves a real-time API for anomaly detection.';

const SPEC = {
	stream: ['Real-time', 'log events'],
	history: ['Historical', 'logs'],
	app: ['Anomaly', 'detection'],
	appIcon: 'radar',
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
