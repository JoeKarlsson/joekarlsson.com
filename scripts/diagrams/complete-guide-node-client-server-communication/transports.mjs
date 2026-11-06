import { lane } from './_lanes.mjs';

export const alt =
	'Three browser transports compared. XHR polling: the client sends GET /poll, the server answers once, and the client has to ask again for every update. Server-sent events: the client sends GET /sse once, and the server keeps streaming events back over that one connection, one way only. WebSocket: the client sends GET /ws once to open the connection, and then client and server send messages both ways whenever they like.';

const TRANSPORTS = [
	{
		title: 'XHR polling',
		note: 'ask again for each update',
		messages: [
			{ dir: 'up', label: 'GET /poll' },
			{ dir: 'down' },
			{ dir: 'up', label: 'GET /poll' },
			{ dir: 'down' },
		],
	},
	{
		title: 'SSE',
		note: 'server streams, one way',
		messages: [
			{ dir: 'up', label: 'GET /sse' },
			{ dir: 'down' },
			{ dir: 'down' },
			{ dir: 'down' },
			{ dir: 'down' },
		],
	},
	{
		title: 'WebSocket',
		note: 'both ways, any time',
		messages: [
			{ dir: 'up', label: 'GET /ws' },
			{ dir: 'down' },
			{ dir: 'up' },
			{ dir: 'down' },
			{ dir: 'up' },
		],
	},
];

export const desktop = {
	height: 450,
	draw(f) {
		TRANSPORTS.forEach((t, i) => lane(f, { x: 16 + i * 208, y: 34, w: 192, h: 400, ...t }));
	},
};

export const phone = {
	height: 1140,
	draw(f) {
		TRANSPORTS.forEach((t, i) => lane(f, { x: 8, y: 34 + i * 372, w: 344, h: 350, ...t }));
	},
};
