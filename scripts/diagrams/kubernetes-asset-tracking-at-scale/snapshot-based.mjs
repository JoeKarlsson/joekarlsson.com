import { tradeoffs } from './_approach.mjs';

export const alt =
	'The snapshot-based approach: periodic snapshots of cluster configuration go to object storage like S3 or GCS. They make a good historical record for audits, but the data goes stale between snapshots and there’s no real-time querying.';

const GOOD = ['a historical record', 'for audits'];
const BAD = ['stale between snapshots', 'no real-time queries'];

export const desktop = {
	height: 330,
	draw(f) {
		const xs = [16, 136, 256];
		xs.forEach((x, i) =>
			f.box({
				x,
				y: 30,
				w: 104,
				h: 84,
				label: 'Snapshot',
				sub: `#${i + 1}`,
				icon: 'file-text',
				size: 14,
				stack: true,
			}),
		);
		xs.forEach((x) =>
			f.arrow([
				[x + 52, 116],
				[x + 52, 140],
				[180, 140],
				[180, 172],
			]),
		);
		f.box({
			x: 70,
			y: 174,
			w: 220,
			h: 80,
			kind: 'chalk',
			label: 'Storage',
			sub: ['object storage,', 'like S3 or GCS'],
			icon: 'hard-drive',
		});
		tradeoffs(f, { x: 384, y: 40, w: 240, good: GOOD, bad: BAD, size: 14 });
	},
};

export const phone = {
	height: 500,
	draw(f) {
		const xs = [66, 180, 294];
		xs.forEach((cx, i) =>
			f.box({
				x: cx - 54,
				y: 16,
				w: 108,
				h: 84,
				label: 'Snapshot',
				sub: `#${i + 1}`,
				icon: 'file-text',
				size: 14,
				stack: true,
			}),
		);
		xs.forEach((cx) =>
			f.arrow([
				[cx, 102],
				[cx, 120],
				[180, 120],
				[180, 142],
			]),
		);
		f.box({
			x: 60,
			y: 144,
			w: 240,
			h: 80,
			kind: 'chalk',
			label: 'Storage',
			sub: ['object storage,', 'like S3 or GCS'],
			icon: 'hard-drive',
		});
		tradeoffs(f, { x: 8, y: 266, w: 344, good: GOOD, bad: BAD, size: 14 });
	},
};
