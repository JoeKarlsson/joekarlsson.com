// Shared by this post's three figures: the same sources on the left and the same
// applications on the right, with something different in the middle.

export const SOURCES = [
	{ label: ['Event', 'streams'], logo: 'apachekafka' },
	{ label: 'APIs', icon: 'plug' },
	{ label: 'Databases', icon: 'database' },
];

/** Three sources down the left (desktop) or across the top (phone). Returns their edge points. */
export function sources(f, { phone }) {
	if (phone) {
		const xs = [64, 180, 296];
		SOURCES.forEach((s, i) =>
			f.box({ x: xs[i] - 54, y: 16, w: 108, h: 90, size: 14, stack: true, ...s }),
		);
		return xs.map((x) => [x, 108]);
	}
	const ys = [40, 130, 220];
	SOURCES.forEach((s, i) => f.box({ x: 16, y: ys[i], w: 140, h: 64, size: 14, ...s }));
	return ys.map((y) => [158, y + 32]);
}

/** Three applications down the right (desktop) or across the bottom (phone). */
export function apps(f, { phone, y = 0 }) {
	if (phone) {
		const xs = [64, 180, 296];
		xs.forEach((x) =>
			f.box({
				x: x - 54,
				y,
				w: 108,
				h: 84,
				label: 'App',
				icon: 'app-window',
				size: 14,
				stack: true,
			}),
		);
		return xs.map((x) => [x, y - 2]);
	}
	const ys = [40, 130, 220];
	ys.forEach((yy) =>
		f.box({ x: 510, y: yy, w: 114, h: 64, label: 'App', icon: 'app-window', size: 15 }),
	);
	return ys.map((yy) => [508, yy + 32]);
}
