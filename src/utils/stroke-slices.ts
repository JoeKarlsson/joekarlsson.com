// Where each stroke of a multi-stroke scribble draws within the mark's one pen run, by
// length, so the pen moves at one speed: a long coil takes most of the run and a tally
// stroke a sliver (.redraw-strokes in motion.css reads --at and --share).

/** A stroke's length, along its points and control points: close enough to share time by. */
function strokeLength(d: string): number {
	const numbers = (d.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
	let length = 0;
	for (let i = 2; i + 1 < numbers.length; i += 2)
		length += Math.hypot(numbers[i] - numbers[i - 2], numbers[i + 1] - numbers[i - 1]);
	return length;
}

/** Each stroke's start and share of the run, as fractions; a dot still gets a sliver. */
export function strokeSlices(strokes: string[]): { at: number; share: number }[] {
	const lengths = strokes.map((d) => Math.max(strokeLength(d), 1));
	const total = lengths.reduce((sum, l) => sum + l, 0);
	let done = 0;
	return lengths.map((l) => {
		const slice = {
			at: Math.round((done / total) * 1e4) / 1e4,
			share: Math.round((l / total) * 1e4) / 1e4 || 1e-4,
		};
		done += l;
		return slice;
	});
}
