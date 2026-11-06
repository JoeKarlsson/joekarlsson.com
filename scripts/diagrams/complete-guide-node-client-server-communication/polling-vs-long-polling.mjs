import { lane } from './_lanes.mjs';

export const alt =
	'Polling versus long polling. With polling, the client sends GET /poll on a fixed interval, so an update that lands on the server waits until the next poll to reach the client. With long polling (Comet), the client sends GET /comet and the server holds the request open until it has an update, answers right away, and the client immediately asks again.';

const MODES = [
	{
		title: 'Polling',
		note: 'updates wait for the next poll',
		messages: [
			{ dir: 'up', label: 'GET /poll' },
			{ dir: 'down' },
			{ dir: 'up', label: 'GET /poll' },
			{ dir: 'down' },
		],
	},
	{
		title: 'Long polling',
		note: 'server answers when it has news',
		messages: [
			{ dir: 'up', label: 'GET /comet' },
			{ dir: 'down' },
			{ dir: 'up', label: 'GET /comet' },
		],
	},
];

export const desktop = {
	height: 450,
	draw(f) {
		MODES.forEach((m, i) => lane(f, { x: 16 + i * 312, y: 34, w: 296, h: 400, ...m }));
	},
};

export const phone = {
	height: 760,
	draw(f) {
		MODES.forEach((m, i) => lane(f, { x: 8, y: 34 + i * 372, w: 344, h: 350, ...m }));
	},
};
