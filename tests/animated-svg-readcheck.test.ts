import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { needs, readcheck, runs } from '../scripts/animated-svg/readcheck.mjs';

describe('reading-time check for animated SVGs', () => {
	it('joins a run across a loop seam and lets a frozen ending stay', () => {
		const on = (pattern: string) => [...pattern].map((c) => new Set(c === '1' ? ['A'] : []));
		expect(runs(on('1100011'), 0.5, true).get('A')).toBe(2);
		expect(runs(on('0001100'), 0.5, true).get('A')).toBe(1);
		expect(runs(on('0000111'), 0.5, false).get('A')).toBe(Infinity);
		expect(needs('THREE WORDS HERE')).toBeCloseTo(14 / 15 + 1.5);
	});

	it('flags a label that blinks by, but not one that holds or a typewriter still typing', async () => {
		const file = join(mkdtempSync(join(tmpdir(), 'readcheck-')), 'fig.svg');
		writeFileSync(
			file,
			`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" width="400" height="200">
				<text x="20" y="50" opacity="0">BLINK<animate attributeName="opacity" calcMode="discrete" values="0;1;0" keyTimes="0;0.4;0.5" dur="6s" repeatCount="indefinite"/></text>
				<text x="20" y="100">HELD THE WHOLE TIME</text>
				<text x="20" y="150"><tspan>typed </tspan><tspan visibility="hidden">late<set attributeName="visibility" to="visible" begin="5.9s"/></tspan></text>
			</svg>`,
		);
		const { results } = await readcheck(file);
		const got = Object.fromEntries(
			results.map((r: { text: string; got: number }) => [r.text, r.got]),
		);
		expect(got.BLINK).toBeCloseTo(0.6, 1);
		expect(got['HELD THE WHOLE TIME']).toBe(Infinity);
		// Counts only from the last letter: 0.1s of a 6s loop
		expect(got['typed late']).toBeLessThan(0.3);
	});
});
