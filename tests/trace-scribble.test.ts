import { describe, it, expect } from 'vitest';
import { execFileSync } from 'child_process';
import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import sharp from 'sharp';

// The tracer needs numpy, scipy and scikit-image, which the system python3 may not
// have; point SCRIBBLE_PYTHON at a venv that does. Without them this test shows as skipped.
const PYTHON = process.env.SCRIBBLE_PYTHON ?? 'python3';
let hasDependencies = true;
try {
	execFileSync(PYTHON, ['-c', 'import numpy, scipy, skimage'], { stdio: 'ignore' });
} catch {
	hasDependencies = false;
}

/** Render an SVG drawing as a black-on-pink "photo" and trace it. */
async function trace(drawing: string, ...flags: string[]): Promise<string> {
	const photo = join(mkdtempSync(join(tmpdir(), 'trace-')), 'photo.png');
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400">
		<rect width="600" height="400" fill="#f4c6e4"/>
		<g fill="none" stroke="#111" stroke-width="12" stroke-linecap="round">${drawing}</g></svg>`;
	await sharp(Buffer.from(svg)).png().toFile(photo);
	return execFileSync(
		PYTHON,
		[
			'scripts/media/trace-scribble.py',
			photo,
			'--crop',
			'0',
			'0',
			'600',
			'400',
			'--box',
			'300',
			'200',
			...flags,
		],
		{
			encoding: 'utf8',
		},
	).trim();
}

describe.skipIf(!hasDependencies)('trace-scribble', () => {
	it('follows a line through the loop it crosses as one pen stroke, left to right', async () => {
		// In along the bottom, up and round a loop that crosses itself, out to the right
		const path = await trace('<path d="M40,300 C200,300 360,80 300,60 C240,40 240,300 560,300"/>');
		expect(path.match(/M/g)).toHaveLength(1);
		const [startX] = path.slice(1).split(/[ ,]/).map(Number);
		expect(startX).toBeLessThan(60);
	});

	it('draws each ray of a burst from the center out', async () => {
		const path = await trace(
			'<path d="M330,200 L540,200"/><path d="M270,200 L60,200"/><path d="M300,170 L300,30"/>',
			'--rays',
		);
		const rays = path
			.split('M')
			.filter(Boolean)
			.map((stroke) => stroke.replace(/[QL]/g, ' ').trim().split(/[ ,]+/).map(Number));
		expect(rays).toHaveLength(3);
		const starts = rays.map((r) => [r[0], r[1]]);
		const middle = [0, 1].map((k) => starts.reduce((sum, p) => sum + p[k], 0) / 3);
		for (const r of rays) {
			const [sx, sy, ex, ey] = [r[0], r[1], r.at(-2)!, r.at(-1)!];
			expect(Math.hypot(sx - middle[0], sy - middle[1])).toBeLessThan(
				Math.hypot(ex - middle[0], ey - middle[1]),
			);
		}
	});
});
