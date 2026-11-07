import { measure } from '../draw.mjs';

/**
 * Lays steps out as a snake: each row runs the opposite way to the one above, so the
 * arrow between rows drops straight down at the end. rows: [{ y, dir: 1 | -1, steps }].
 * A step is a box spec without x/y/w/h. Returns nothing; draws boxes and arrows.
 */
export function snake(f, { x, w, gap, h, rows }) {
	let prev;
	rows.forEach((row) => {
		const count = row.slots ?? row.steps.length;
		const bw = (w - gap * (count - 1)) / count;
		const slotX = (i) => x + (row.dir === 1 ? i : count - 1 - i) * (bw + gap);
		row.steps.forEach((step, i) => {
			const bx = slotX(i + (row.offset ?? 0));
			const box = { kind: 'outline', size: 14, stack: true, ...step, x: bx, y: row.y, w: bw, h };
			f.box(box);
			if (prev && prev.y === box.y) {
				const [from, to] =
					row.dir === 1 ? [prev.x + prev.w + 2, bx - 2] : [prev.x - 2, bx + bw + 2];
				f.arrow([
					[from, box.y + h / 2],
					[to, box.y + h / 2],
				]);
			} else if (prev) {
				const cx = Math.max(prev.x, bx) + Math.min(prev.w, bw) / 2;
				f.arrow([
					[cx, prev.y + prev.h + 2],
					[cx, box.y - 2],
				]);
			}
			prev = box;
		});
	});
}

/** One step per row, top to bottom: the phone layout. */
export function column(f, { x, w, h, gap, y, steps }) {
	steps.forEach((step, i) => {
		const top = y[i] ?? y[0] + i * (h + gap);
		f.box({
			kind: 'outline',
			size: 14,
			...step,
			label: [step.label].flat().join(' '),
			x,
			y: top,
			w,
			h,
		});
		if (i < steps.length - 1) {
			const next = y[i + 1] ?? top + h + gap;
			f.arrow([
				[x + w / 2, top + h + 2],
				[x + w / 2, next - 2],
			]);
		}
	});
}

/** A container whose name tab is followed by the product's logo. */
export function productGroup(f, { logo, ...spec }) {
	f.group(spec);
	f.logo(logo, spec.x + measure(spec.label, 17, 'display') + 34, spec.y - 10, 20);
}
