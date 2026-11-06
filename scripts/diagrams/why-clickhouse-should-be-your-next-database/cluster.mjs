export const alt =
	'ClickHouse scaling across a cluster: a load balancer spreads queries over shards 0, 1 through N. Each shard has two replicas, each a ClickHouse server on its own machine and cloud disk, and the replicas in a shard copy data to each other, with data backup underneath.';

const SHARDS = ['Shard 0', 'Shard 1', 'Shard N'];

function shard(f, { x, y, w, name, phone }) {
	f.group({ x, y, w, h: phone ? 250 : 230, label: name });
	const bh = phone ? 96 : 80;
	f.box({
		x: x + 10,
		y: y + 16,
		w: w - 20,
		h: bh,
		kind: 'chalk',
		label: phone ? ['Replica', '0'] : 'Replica 0',
		sub: phone ? undefined : 'server, cloud disk',
		logo: 'clickhouse',
		size: 13,
		subSize: 12,
		stack: true,
	});
	f.arrow(
		[
			[x + w / 2, y + 18 + bh],
			[x + w / 2, y + 36 + bh + (phone ? 0 : 10)],
		],
		{ heads: 'both' },
	);
	f.box({
		x: x + 10,
		y: y + 38 + bh + (phone ? 0 : 10),
		w: w - 20,
		h: bh,
		kind: 'chalk',
		label: phone ? ['Replica', '1'] : 'Replica 1',
		sub: phone ? undefined : 'server, cloud disk',
		logo: 'clickhouse',
		size: 13,
		subSize: 12,
		stack: true,
	});
}

export const desktop = {
	height: 420,
	draw(f) {
		f.box({
			x: 230,
			y: 12,
			w: 180,
			h: 52,
			kind: 'pink',
			label: 'Load balancer',
			icon: 'split',
			size: 14,
		});
		const xs = [16, 228, 440];
		xs.forEach((x) =>
			f.arrow([
				[320, 66],
				[320, 82],
				[x + 92, 82],
				[x + 92, 100],
			]),
		);
		SHARDS.forEach((name, i) => shard(f, { x: xs[i], y: 122, w: 184, name }));
		f.box({
			x: 16,
			y: 368,
			w: 608,
			h: 44,
			kind: 'dashed',
			label: 'Data backup',
			icon: 'hard-drive',
			size: 14,
		});
	},
};

export const phone = {
	height: 406,
	draw(f) {
		f.box({
			x: 90,
			y: 8,
			w: 180,
			h: 48,
			kind: 'pink',
			label: 'Load balancer',
			icon: 'split',
			size: 14,
		});
		const xs = [8, 128, 248];
		xs.forEach((x) =>
			f.arrow([
				[180, 58],
				[180, 70],
				[x + 52, 70],
				[x + 52, 88],
			]),
		);
		SHARDS.forEach((name, i) => shard(f, { x: xs[i], y: 110, w: 104, name, phone: true }));
		f.note(8, 372, 'Replicas in a shard copy each other;', { size: 13 });
		f.note(8, 390, 'all are backed up.', { size: 13 });
	},
};
