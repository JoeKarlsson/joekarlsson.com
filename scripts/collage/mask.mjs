// Mask clean-up for collage cut-outs (scripts/collage/cutout.mjs).
/** Clears every opaque pixel outside the largest 4-connected opaque region. */
export function keepLargestPiece(rgba, width, height) {
	const label = new Int32Array(width * height);
	let best = 0;
	let bestSize = 0;
	let next = 0;
	for (let start = 0; start < label.length; start++) {
		if (label[start] || !rgba[start * 4 + 3]) continue;
		const id = ++next;
		const stack = [start];
		label[start] = id;
		let size = 0;
		while (stack.length) {
			const p = stack.pop();
			size++;
			const x = p % width;
			for (const q of [p - width, p + width, x > 0 ? p - 1 : -1, x < width - 1 ? p + 1 : -1])
				if (q >= 0 && q < label.length && !label[q] && rgba[q * 4 + 3]) {
					label[q] = id;
					stack.push(q);
				}
		}
		if (size > bestSize) [best, bestSize] = [id, size];
	}
	for (let p = 0; p < label.length; p++) if (label[p] !== best) rgba[p * 4 + 3] = 0;
}
