import { describe, expect, it } from 'vitest';

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
