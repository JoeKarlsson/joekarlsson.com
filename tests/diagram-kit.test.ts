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

describe('kit charts build in', () => {
	const bars = [
		{ label: 'A', value: 3 },
		{ label: 'B', value: 9, highlight: true },
	];
	const series = [
		{
			name: 'S',
			points: [
				[0, 1],
				[1, 4],
			],
		},
	];
	const draw = (width: number) => {
		const f = createFigure({ id: `build-${width}`, width, height: 300 });
		f.barChart({ x: 0, y: 0, w: 300, h: 140, bars, max: 9 });
		f.lineChart({ x: 0, y: 150, w: 300, h: 140, series, xMin: 0, xMax: 1, yMax: 5 });
		return f.toString('chart');
	};

	it('on desktop, bars grow from nothing and lines wipe in, with a finished still beside them', () => {
		const svg = draw(640);
		const live = svg.slice(svg.indexOf('class="anim-live"'), svg.indexOf('class="anim-still"'));
		expect(live.match(/type="scale"/g)).toHaveLength(2);
		expect(live).toContain('transform="scale(1 0)"');
		expect(svg).toMatch(/<clipPath id="build-640-wipe-1"><rect[^>]* width="0"/);
		expect(svg.match(/class="anim-still" display="none"/g)).toHaveLength(2);
	});

	it('on a phone, the chart is the finished still alone', () => {
		const svg = draw(360);
		expect(svg).not.toContain('anim-live');
		expect(svg).not.toContain('<animate');
	});
});

describe('animated go_to walk', () => {
	// The loop restarts with a hard cut, so its last drawing must already be the empty map:
	// everything faded out and the door shut again (a seam the motion review caught once)
	it.each(['go-to-walk.svg', 'go-to-walk.phone.svg'])(
		'%s ends its loop on the empty map',
		(file) => {
			const svg = readFileSync(join('public/images/blog/doom-mcp-server', file), 'utf8');
			const values = (re: RegExp) => svg.match(re)?.[1].split(';') ?? [];
			const fade = values(
				/<g class="anim-live"><g opacity="[^"]*"><animate attributeName="opacity"[^>]*values="([^"]*)"/,
			);
			const door = values(/<animate attributeName="y2"[^>]*values="([^"]*)"/);
			expect(fade.at(-1)).toBe('0');
			expect(door.length).toBeGreaterThan(2);
			expect(door.at(-1)).toBe(door[0]);
		},
	);
});

describe('animated Hackers and Painters sketches', () => {
	// Each loop restarts with a hard cut, so every animated value must end where it started:
	// the paper empty, the pencil back at rest and right side up
	it.each(['any-becomes-a-type.svg', 'pencil-not-a-pen.svg', 'scaffolding-then-details.svg'])(
		'%s ends its loop on its first frame',
		(file) => {
			const svg = readFileSync(
				join('public/images/blog/hackers-and-painters-ai-agents', file),
				'utf8',
			);
			const lists = [...svg.matchAll(/values="([^"]*)"/g)].map((m) => m[1].split(';'));
			expect(lists.length).toBeGreaterThan(5);
			for (const values of lists) expect(values.at(-1)).toBe(values[0]);
		},
	);

	// Phones get the finished drawing, never the motion, like the post's other figures
	it.each([
		'any-becomes-a-type.phone.svg',
		'pencil-not-a-pen.phone.svg',
		'scaffolding-then-details.phone.svg',
	])('%s is a still', (file) => {
		const svg = readFileSync(
			join('public/images/blog/hackers-and-painters-ai-agents', file),
			'utf8',
		);
		expect(svg).not.toMatch(/<animate|anim-live/);
	});
});
