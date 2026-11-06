// Shrinks an absolute SVG path (M, L, Q, C, as in src/data/scribbles.ts) for the
// page: whole-number coordinates, relative commands and no repeated command
// letters. Scribble paths were most of the homepage HTML; a unit is under a pixel
// at every size they're drawn, so rounding doesn't show. Offsets come from the
// rounded points, so rounding never drifts along a long stroke.
const ARGS_PER_POINT_COMMAND = { M: 1, L: 1, Q: 2, C: 3 } as const;
type Command = keyof typeof ARGS_PER_POINT_COMMAND;

function joinNumbers(numbers: number[]): string {
	// A minus sign separates numbers on its own
	return numbers.reduce((out, n, i) => out + (i === 0 || n < 0 ? '' : ' ') + String(n), '');
}

export function compactPath(path: string): string {
	let out = '';
	let previousCommand = '';
	let x = 0;
	let y = 0;
	for (const [, letter, args] of path.matchAll(/([A-Za-z])([^A-Za-z]*)/g)) {
		if (!(letter in ARGS_PER_POINT_COMMAND)) {
			throw new Error(`compactPath: unsupported command ${letter} in ${path.slice(0, 40)}`);
		}
		const command = letter as Command;
		const numbers = (args.match(/-?\d*\.?\d+(?:e-?\d+)?/gi) ?? []).map((n) =>
			Math.round(Number(n)),
		);
		const perSegment = ARGS_PER_POINT_COMMAND[command] * 2;
		if (numbers.length === 0 || numbers.length % perSegment !== 0) {
			throw new Error(
				`compactPath: ${command} has ${numbers.length} numbers in ${path.slice(0, 40)}`,
			);
		}
		for (let start = 0; start < numbers.length; start += perSegment) {
			const segment = numbers.slice(start, start + perSegment);
			const relative = segment.map((n, i) => n - (i % 2 === 0 ? x : y));
			// The path's first move stays absolute (a leading m is absolute anyway)
			const isFirstMove = out === '';
			const name = isFirstMove ? 'M' : command.toLowerCase();
			const values = isFirstMove ? segment : relative;
			// A repeated command can drop its letter, except a move: numbers after an
			// m are read as lines
			const needsLetter = name !== previousCommand || command === 'M';
			const text = joinNumbers(values);
			out += needsLetter ? name + text : (values[0] < 0 ? '' : ' ') + text;
			previousCommand = name;
			x = segment[segment.length - 2];
			y = segment[segment.length - 1];
		}
	}
	return out;
}
