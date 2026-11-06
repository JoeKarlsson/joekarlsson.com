// Shared by this post's three figures: a live stream and stored history go into
// Tinybird, which serves a real-time API to the app that needs both.

/** A source, Tinybird (OLAP storage, then a real-time API over SQL) and the app it feeds. */
export function enrich(f, { stream, history, app, appSub, appIcon, phone }) {
	const tinybird = (x, y, w) => {
		f.group({ x, y, w, h: 186, label: 'Tinybird', logo: 'tinybird' });
		f.box({
			x: x + 16,
			y: y + 18,
			w: w - 32,
			h: 56,
			kind: 'pink',
			label: 'OLAP storage',
			icon: 'database',
			size: 15,
		});
		f.arrow([
			[x + w / 2, y + 76],
			[x + w / 2, y + 108],
		]);
		f.note(x + w / 2 + 12, y + 92, 'SQL', { size: 14, weight: 700 });
		f.box({
			x: x + 16,
			y: y + 110,
			w: w - 32,
			h: 56,
			kind: 'pink',
			label: 'Real-time API',
			icon: 'plug',
			size: 15,
		});
		return {
			olapLeft: x + 16,
			olapMid: y + 46,
			apiRight: x + w - 16,
			apiMid: y + 138,
			apiBottom: y + 166,
			cx: x + w / 2,
		};
	};
	if (phone) {
		f.box({
			x: 12,
			y: 16,
			w: 164,
			h: 100,
			label: stream,
			logo: 'apachekafka',
			size: 14,
			stack: true,
		});
		f.box({
			x: 184,
			y: 16,
			w: 164,
			h: 100,
			label: history,
			icon: 'database',
			size: 14,
			stack: true,
		});
		const t = tinybird(40, 180, 280);
		f.arrow([
			[94, 118],
			[94, 140],
			[140, 140],
			[140, 196],
		]);
		f.arrow([
			[266, 118],
			[266, 140],
			[220, 140],
			[220, 196],
		]);
		f.arrow([
			[t.cx, t.apiBottom + 2],
			[t.cx, 398],
		]);
		f.box({ x: 80, y: 400, w: 200, h: 64, label: app, sub: appSub, icon: appIcon, size: 15 });
		return;
	}
	f.box({ x: 16, y: 40, w: 176, h: 64, label: stream, logo: 'apachekafka', size: 14 });
	f.box({ x: 16, y: 150, w: 176, h: 64, label: history, icon: 'database', size: 14 });
	const t = tinybird(220, 40, 236);
	f.arrow([
		[194, 72],
		[204, 72],
		[204, t.olapMid - 8],
		[t.olapLeft - 2, t.olapMid - 8],
	]);
	f.arrow([
		[194, 182],
		[212, 182],
		[212, t.olapMid + 8],
		[t.olapLeft - 2, t.olapMid + 8],
	]);
	f.arrow([
		[t.apiRight + 2, t.apiMid],
		[470, t.apiMid],
	]);
	f.box({
		x: 472,
		y: t.apiMid - 46,
		w: 152,
		h: 92,
		label: app,
		sub: appSub,
		icon: appIcon,
		size: 14,
		stack: true,
	});
}
