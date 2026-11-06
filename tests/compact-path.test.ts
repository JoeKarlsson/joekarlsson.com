import { describe, expect, it } from 'vitest';
import { compactPath } from '../src/utils/compact-path';
import * as scribbles from '../src/data/scribbles';

/** Every absolute endpoint/control point a compacted path draws through */
function absolutePoints(path: string): number[] {
	const points: number[] = [];
	let x = 0;
	let y = 0;
	const perSegment: Record<string, number> = { m: 2, l: 2, q: 4, c: 6 };
	for (const [, letter, args] of path.matchAll(/([A-Za-z])([^A-Za-z]*)/g)) {
		const numbers = (args.match(/-?\d+/g) ?? []).map(Number);
		const relative = letter === letter.toLowerCase();
		const size = perSegment[letter.toLowerCase()];
		for (let start = 0; start < numbers.length; start += size) {
			const segment = numbers
				.slice(start, start + size)
				.map((n, i) => (relative ? n + (i % 2 === 0 ? x : y) : n));
			points.push(...segment);
			x = segment[size - 2];
			y = segment[size - 1];
		}
	}
	return points;
}

const roundedNumbers = (path: string) =>
	(path.match(/-?\d*\.?\d+/g) ?? []).map((n) => Math.round(Number(n)) + 0); // + 0 turns -0 into 0

describe('compactPath', () => {
	it('rounds, goes relative and drops repeated letters', () => {
		expect(compactPath('M34.1,95.1 Q39.7,102.8 42.2,106.7 Q44.7,110.5 46.9,114.2 L40,100')).toBe(
			'M34 95q6 8 8 12 3 4 5 7l-7-14',
		);
	});

	it('keeps a letter on every move', () => {
		expect(compactPath('M10,10 L20,20 M30,30 L40,40')).toBe('M10 10l10 10m10 10l10 10');
	});

	it('draws through exactly the rounded points of every scribble', () => {
		const paths = Object.values(scribbles)
			.flatMap((value) => (Array.isArray(value) ? value : [value]))
			.flatMap((value) => (typeof value === 'string' ? [value] : Object.values(value ?? {})))
			.flatMap((value) =>
				typeof value === 'object' && value !== null ? Object.values(value) : [value],
			)
			.filter((value): value is string => typeof value === 'string' && value.startsWith('M'));
		expect(paths.length).toBeGreaterThan(20);
		let before = 0;
		let after = 0;
		for (const path of paths) {
			const compact = compactPath(path);
			expect(absolutePoints(compact)).toEqual(roundedNumbers(path));
			before += path.length;
			after += compact.length;
		}
		expect(after).toBeLessThan(before * 0.6);
	});

	it('refuses commands it does not handle', () => {
		expect(() => compactPath('M0,0 A5,5 0 0 1 10,10')).toThrow(/unsupported command A/);
	});
});
