export const alt =
	'Sequential versus parallel goroutines. Sequentially, one chain of four tasks finishes before the next chain starts. With goroutines, both chains run side by side from the start. Each goroutine needs about 2KB of stack versus megabytes for an OS thread, so thousands can run at once.';

/** Two chains of four tasks; sequential draws the hand-off from the end of one to the start of the other. */
function chains(f, { x, y, w, label, sequential, cell }) {
	f.group({ x, y, w, h: 4 * (cell + 22) + 56, label });
	const cols = [x + w / 2 - cell - 20, x + w / 2 + 20];
	cols.forEach((cx, c) => {
		for (let i = 0; i < 4; i++) {
			const cy = y + 26 + (3 - i) * (cell + 22);
			f.box({
				x: cx,
				y: cy,
				w: cell,
				h: cell,
				kind: c === 0 ? 'pink' : 'chalk',
				label: `${i + 1}`,
				font: 'mono',
				size: 15,
			});
			if (i < 3)
				f.arrow([
					[cx + cell / 2, cy - 2],
					[cx + cell / 2, cy - 20],
				]);
		}
	});
	const startY = y + 26 + 3 * (cell + 22) + cell + 18;
	if (sequential) {
		const top = y + 26 + cell / 2;
		f.arrow([
			[cols[0] + cell + 2, top],
			[cols[0] + cell + 12, top],
			[cols[1] - 12, y + 26 + 3 * (cell + 22) + cell / 2],
			[cols[1] - 2, y + 26 + 3 * (cell + 22) + cell / 2],
		]);
		f.note(cols[0], startY, 'start', { size: 13 });
	} else {
		f.note(cols[0], startY, 'both start', { size: 13 });
	}
}

export const desktop = {
	height: 400,
	draw(f) {
		chains(f, { x: 16, y: 36, w: 296, label: 'Sequential', sequential: true, cell: 44 });
		chains(f, { x: 328, y: 36, w: 296, label: 'Parallel goroutines', cell: 44 });
		f.note(16, 384, 'Each goroutine: about 2KB of stack, versus megabytes for an OS thread.', {
			size: 13,
		});
	},
};

export const phone = {
	height: 710,
	draw(f) {
		chains(f, { x: 8, y: 36, w: 344, label: 'Sequential', sequential: true, cell: 40 });
		chains(f, { x: 8, y: 372, w: 344, label: 'Parallel goroutines', cell: 40 });
		f.note(8, 694, 'A goroutine: ~2KB of stack vs. MBs per OS thread.', { size: 13 });
	},
};
