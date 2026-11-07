import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { filteredAreaRatio, MAX_FILTERED_AREA_PER_FIGURE } from './svg-filter-area';

import { createFigure } from '../scripts/diagrams/draw.mjs';

describe('diagram kit line check', () => {
	it('passes an arrow that runs between two boxes', () => {
		const f = createFigure({ id: 'clean', width: 400, height: 300 });
		f.box({ x: 20, y: 20, w: 200, h: 60, label: 'Claude Code' });
		f.box({ x: 20, y: 200, w: 200, h: 60, label: 'Doom' });
		f.arrow([
			[120, 82],
			[120, 198],
		]);
		f.toString('clean');
		expect(f.issues).toEqual([]);
	});

	it('flags arrows over text, through a box or buried in one, and callouts over notes', () => {
		const f = createFigure({ id: 'messy', width: 400, height: 300 });
		f.box({ x: 20, y: 20, w: 200, h: 60, label: 'Claude Code' });
		f.box({ x: 20, y: 200, w: 200, h: 60, label: 'Doom' });
		f.arrow([
			[10, 50],
			[300, 50],
		]);
		f.arrow([
			[300, 120],
			[120, 230],
		]);
		f.text(150, 140, 'a note');
		f.crayonArrow([300, 140], [100, 140], 0);
		f.toString('messy');
		expect(f.issues).toEqual(
			expect.arrayContaining([
				'An arrow runs over "CLAUDE CODE"',
				'An arrow runs through the "Claude Code" box',
				'An arrow ends buried inside the "Doom" box',
				'A callout arrow runs over "a note"',
			]),
		);
	});
});

describe('npm run diagrams', () => {
	it('fails when an arrow runs over text, not just when the kit is called directly', async () => {
		const { mkdirSync, rmSync, writeFileSync } = await import('node:fs');
		const { spawnSync } = await import('node:child_process');
		const path = await import('node:path');
		const slug = `test-collision-${process.pid}`;
		const dir = path.resolve('scripts/diagrams', slug);
		mkdirSync(dir, { recursive: true });
		const draw = `{ height: 200, draw(f) { f.text(100, 100, 'label'); f.arrow([[20, 100], [200, 100]]); } }`;
		writeFileSync(
			path.join(dir, 'bad.mjs'),
			`export const alt = 'x';\nexport const desktop = ${draw};\nexport const phone = ${draw};\n`,
		);
		try {
			const result = spawnSync(
				'node',
				['scripts/diagrams/render.mjs', slug, '--preview', path.join(dir, 'p.html')],
				{
					encoding: 'utf8',
				},
			);
			expect(result.status).toBe(1);
			expect(result.stderr).toContain('An arrow runs over "label"');
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	});
});

describe('diagram filters stay small enough for iPhone Safari', () => {
	it('every drawn figure filters at most a few figures worth of area', () => {
		const figures = readdirSync('public/images/blog', { recursive: true, encoding: 'utf8' })
			.filter((file) => file.endsWith('.svg'))
			.map((file) => join('public/images/blog', file))
			.filter((file) => readFileSync(file, 'utf8').includes('-crayon-'));
		expect(figures.length).toBeGreaterThan(100);
		const tooMuch = figures
			.map((file) => [file, filteredAreaRatio(readFileSync(file, 'utf8'))] as const)
			.filter(([, ratio]) => ratio > MAX_FILTERED_AREA_PER_FIGURE)
			.map(([file, ratio]) => `${file}: ${ratio.toFixed(1)}x its own area`);
		expect(tooMuch).toEqual([]);
	});

	it('the kit sizes each stroke filter to that stroke, not the figure', () => {
		const f = createFigure({ id: 'one-arrow', width: 600, height: 900 });
		f.arrow([
			[100, 100],
			[100, 160],
		]);
		const svg = f.toString('one arrow');
		expect(filteredAreaRatio(svg)).toBeLessThan(0.05);
	});
});
