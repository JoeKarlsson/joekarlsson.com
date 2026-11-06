export const alt =
	'UUID range bucketing: the full UUID range, from 00000000-0000-0000-0000-000000000000 to ffffffff-ffff-ffff-ffff-ffffffffffff, goes into UUIDRanges(numOfBuckets), which splits it into even buckets 1 through n, each inserted on its own.';

const BUCKETS = ['Bucket 1', 'Bucket 2', 'Bucket 3', 'Bucket 4', 'Bucket n'];

export const desktop = {
	height: 360,
	draw(f) {
		f.code({
			x: 16,
			y: 120,
			w: 250,
			lines: [
				'00000000-0000-0000-',
				'0000-000000000000',
				'  to',
				'ffffffff-ffff-ffff-',
				'ffff-ffffffffffff',
			],
			size: 13,
			highlight: [2],
		});
		f.text(16, 100, 'The whole UUID range', { size: 14, anchor: 'start', weight: 700 });
		f.arrow([
			[268, 180],
			[300, 180],
		]);
		f.box({
			x: 302,
			y: 140,
			w: 150,
			h: 80,
			kind: 'pink',
			label: ['UUIDRanges', '(numOfBuckets)'],
			font: 'mono',
			size: 13,
		});
		const ys = [16, 84, 152, 220, 288];
		ys.forEach((y, i) => {
			f.arrow([
				[454, 180],
				[474, 180],
				[474, y + 26],
				[494, y + 26],
			]);
			f.box({
				x: 496,
				y,
				w: 128,
				h: 52,
				kind: i === 4 ? 'dashed' : 'chalk',
				label: BUCKETS[i],
				size: 14,
			});
		});
	},
};

export const phone = {
	height: 560,
	draw(f) {
		f.text(16, 18, 'The whole UUID range', { size: 14, anchor: 'start', weight: 700 });
		f.code({
			x: 16,
			y: 34,
			w: 328,
			lines: [
				'00000000-0000-0000-0000-000000000000',
				'  to',
				'ffffffff-ffff-ffff-ffff-ffffffffffff',
			],
			size: 13,
			highlight: [1],
		});
		f.arrow([
			[180, 136],
			[180, 164],
		]);
		f.box({
			x: 70,
			y: 166,
			w: 220,
			h: 70,
			kind: 'pink',
			label: ['UUIDRanges', '(numOfBuckets)'],
			font: 'mono',
			size: 14,
		});
		BUCKETS.forEach((b, i) => {
			const y = 274 + i * 56;
			f.arrow([
				[60, 238],
				[60, y + 22],
				[92, y + 22],
			]);
			f.box({ x: 94, y, w: 200, h: 44, kind: i === 4 ? 'dashed' : 'chalk', label: b, size: 14 });
		});
	},
};
