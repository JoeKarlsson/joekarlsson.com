export const alt =
	'An example Cloud Center of Excellence structure, from AWS Prescriptive Guidance. At the top, a Cloud Business Office led by an executive sponsor, with an alliance lead, a sales lead, a marketing lead and a PMO. Under it, practice owners each lead a domain with a product lead, a tech lead and team members.';

const OFFICE = ['Alliance lead', 'Sales lead', 'Marketing lead', 'PMO'];

/** One practice: its owner, then a product lead, a tech lead and two members. */
function practice(f, { x, y, w, chip }) {
	f.group({ x, y, w, h: 150, label: 'Practice owner' });
	const cw = (w - 36) / 2;
	['Product lead', 'Tech lead', 'Member', 'Member'].forEach((role, i) =>
		f.box({
			x: x + 12 + (i % 2) * (cw + 12),
			y: y + 18 + Math.floor(i / 2) * 62,
			w: cw,
			h: 52,
			kind: i < 2 ? 'chalk' : 'ink',
			label: role,
			size: chip,
		}),
	);
}

export const desktop = {
	height: 420,
	draw(f) {
		f.group({ x: 16, y: 34, w: 608, h: 160, label: 'Cloud Business Office' });
		f.box({
			x: 220,
			y: 52,
			w: 200,
			h: 54,
			kind: 'pink',
			label: 'Executive sponsor',
			icon: 'user-check',
			size: 14,
		});
		OFFICE.forEach((role, i) =>
			f.box({ x: 28 + i * 148, y: 124, w: 136, h: 52, label: role, size: 13 }),
		);
		f.arrow([
			[166, 196],
			[166, 238],
		]);
		f.arrow([
			[474, 196],
			[474, 238],
		]);
		practice(f, { x: 16, y: 254, w: 296, chip: 13 });
		practice(f, { x: 328, y: 254, w: 296, chip: 13 });
	},
};

export const phone = {
	height: 700,
	draw(f) {
		f.group({ x: 8, y: 34, w: 344, h: 200, label: 'Cloud Business Office' });
		f.box({
			x: 70,
			y: 52,
			w: 220,
			h: 52,
			kind: 'pink',
			label: 'Executive sponsor',
			icon: 'user-check',
			size: 14,
		});
		OFFICE.forEach((role, i) =>
			f.box({
				x: 20 + (i % 2) * 164,
				y: 116 + Math.floor(i / 2) * 56,
				w: 156,
				h: 48,
				label: role,
				size: 13,
			}),
		);
		f.arrow([
			[180, 236],
			[180, 270],
		]);
		practice(f, { x: 8, y: 288, w: 344, chip: 13 });
		f.arrow(
			[
				[180, 440],
				[180, 474],
			],
			{ heads: 'none', dashed: true },
		);
		practice(f, { x: 8, y: 492, w: 344, chip: 13 });
		f.note(180, 670, 'One practice owner per domain', { anchor: 'middle', size: 14 });
	},
};
