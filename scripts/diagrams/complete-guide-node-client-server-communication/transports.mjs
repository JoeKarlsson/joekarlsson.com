export const alt =
	'Three browser transports compared. XHR polling: the client sends GET /poll, the server answers once, and the client has to ask again for every update. Server-sent events: the client sends GET /sse once, and the server keeps streaming events back over that one connection, one way only. WebSocket: the client sends GET /ws once to open the connection, and then client and server send messages both ways whenever they like.';

/** One transport: client and server lanes with time running down, and the messages between them. */
function lane(f, { x, y, w, h, title, messages, note }) {
	f.group({ x, y, w, h, label: title });
	const cx = x + 34;
	const sx = x + w - 34;
	const iconY = y + 30;
	f.logo('laptop', cx - 12, iconY, 24);
	f.logo('server', sx - 12, iconY, 24);
	f.note(cx, iconY + 24, 'client', { anchor: 'middle', size: 13 });
	f.note(sx, iconY + 24, 'server', { anchor: 'middle', size: 13 });
	const laneTop = iconY + 56;
	const laneBottom = y + h - 40;
	f.line(
		[
			[cx, laneTop],
			[cx, laneBottom],
		],
		{ color: '#a3a3a3', width: 1.5 },
	);
	f.line(
		[
			[sx, laneTop],
			[sx, laneBottom],
		],
		{ color: '#a3a3a3', width: 1.5 },
	);
	const step = (laneBottom - laneTop - 8) / messages.length;
	messages.forEach((m, i) => {
		const y0 = laneTop + 6 + i * step;
		const y1 = y0 + step * 0.55;
		const up = m.dir === 'up';
		f.arrow([
			[up ? cx + 4 : sx - 4, y0],
			[up ? sx - 6 : cx + 6, y1],
		]);
		if (m.label)
			f.text(up ? cx + 8 : sx - 8, y0 - 10, m.label, {
				font: 'mono',
				size: 13,
				anchor: up ? 'start' : 'end',
				color: '#ff4fd8',
			});
	});
	f.note(x + w / 2, y + h - 18, note, { anchor: 'middle', size: 13 });
}

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
