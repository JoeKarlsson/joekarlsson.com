// Shared set dressing for the Home Assistant post's scenes.

export const FLOOR = 318;
// A standing figure's hip, so its feet land on the floor
export const STAND = FLOOR - 62;
// Where a couch's seat sits, and the hip of someone sitting on it
export const SEAT = FLOOR - 30;

/** The Great Room from the first board: couch, floor lamp and a motion sensor on the wall. */
export function greatRoom(
	f,
	{ level = 1, seeing = false, couchX = 60, lampX = 300, sensorX = 500 } = {},
) {
	f.floor(FLOOR);
	const { seat } = f.couch(couchX, SEAT, 170);
	f.lamp(lampX, FLOOR, level);
	f.sensor(sensorX, 56, { seeing });
	return seat;
}

/** A book held in someone's hands. */
export function book(f, [x, y]) {
	f.stroke(
		[
			[x - 14, y - 10],
			[x + 12, y - 16],
			[x + 14, y + 4],
			[x - 12, y + 10],
		],
		{ close: true, width: 4 },
	);
}

/** The "is someone here?" read-out: a crayon line from empty to occupied with the 50% mark. */
export function meter(f, x, y, value, w = 240) {
	f.text(x, y - 22, 'Someone here?', { size: 16, weight: 700 });
	f.stroke(
		[
			[x, y],
			[x + w, y],
		],
		{ width: 4 },
	);
	f.stroke(
		[
			[x + w / 2, y - 10],
			[x + w / 2, y + 10],
		],
		{ width: 3 },
	);
	f.text(x + w / 2, y + 24, '50%', { size: 14, anchor: 'middle' });
	f.text(x, y + 24, 'empty', { size: 14 });
	f.text(x + w, y + 24, 'occupied', { size: 14, anchor: 'end' });
	f.torn(
		Array.from({ length: 10 }, (_, i) => {
			const a = (i / 10) * Math.PI * 2;
			return [x + value * w + Math.cos(a) * 9, y + Math.sin(a) * 9];
		}),
		'#ff4fd8',
	);
}
