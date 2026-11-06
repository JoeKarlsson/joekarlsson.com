export const alt =
	'The Cloud Center of Excellence maturity pyramid, from the base up: 1 ad hoc (undocumented, unmanaged, individual effort), 2 reactive (siloed teams, inconsistent practices), 3 defined (governance, policy and repeatable processes), 4 integrated (security, FinOps and DevOps are aligned), and at the top 5 optimized CCOE (cross-functional, automated, productive).';

/** Top level first. */
const LEVELS = [
	{ label: '5. Optimized CCOE', sub: ['cross-functional,', 'automated, productive'], kind: 'pink' },
	{ label: '4. Integrated', sub: ['security, FinOps and', 'DevOps aligned'] },
	{ label: '3. Defined', sub: ['governance, policy,', 'repeatable processes'] },
	{ label: '2. Reactive', sub: ['siloed teams,', 'inconsistent practices'] },
	{ label: '1. Ad hoc', sub: ['undocumented, unmanaged,', 'individual effort'] },
];

function pyramid(f, { cx, top, base, step, h, gap }) {
	LEVELS.forEach((level, i) => {
		const w = base - (LEVELS.length - 1 - i) * step;
		f.box({
			x: cx - w / 2,
			y: top + i * (h + gap),
			w,
			h,
			kind: level.kind ?? 'chalk',
			size: 16,
			subSize: 13,
			...level,
		});
	});
}

export const desktop = {
	height: 440,
	draw(f) {
		pyramid(f, { cx: 320, top: 16, base: 600, step: 80, h: 76, gap: 8 });
	},
};

export const phone = {
	height: 440,
	draw(f) {
		pyramid(f, { cx: 180, top: 16, base: 344, step: 32, h: 76, gap: 8 });
	},
};
