import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { jkMark } from '../src/utils/watermark.mjs';

const svgs = (dir: string): string[] =>
	readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
		entry.isDirectory()
			? svgs(join(dir, entry.name))
			: entry.name.endsWith('.svg')
				? [join(dir, entry.name)]
				: [],
	);

describe('JK watermark', () => {
	it('draws the mark at 40% with no ids, so two diagrams on a page cannot collide', () => {
		const mark = jkMark(10, 20, 38.4);
		expect(mark).toMatch(
			/^<g class="jk-mark" opacity="0.4" aria-hidden="true" transform="translate\(10 20\) scale\(0.331\)">/,
		);
		expect(mark).not.toMatch(/\bid=/);
	});

	// A new diagram needs `node scripts/watermark-diagrams.mjs <file>` (DECISIONS 2026-11-24)
	it('is in every diagram SVG, once', () => {
		const missing = svgs('public/images').filter(
			(file) => readFileSync(file, 'utf8').match(/class="jk-mark"/g)?.length !== 1,
		);
		expect(missing).toEqual([]);
	});
});
