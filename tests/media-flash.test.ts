import { describe, it, expect } from 'vitest';
import { spawnSync } from 'child_process';
import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const dir = mkdtempSync(join(tmpdir(), 'flash-'));

/** A 64px gray clip whose brightness follows `lum` (an ffmpeg geq expression in N, the frame). */
function clip(name: string, fps: number, seconds: number, lum: string): string {
	const out = join(dir, name);
	const made = spawnSync('ffmpeg', [
		'-v',
		'error',
		'-y',
		'-f',
		'lavfi',
		'-i',
		`color=c=black:s=64x64:r=${fps}:d=${seconds},geq=lum='${lum}':cb=128:cr=128`,
		'-pix_fmt',
		'yuv420p',
		out,
	]);
	if (made.status !== 0) throw new Error(made.stderr.toString());
	return out;
}

const flashCheck = (path: string) =>
	spawnSync('python3', ['scripts/media/flash-check.py', path], { encoding: 'utf8' });

describe('flash check (WCAG 2.3.1 general flash)', () => {
	it('fails a black-white strobe at 8fps (4 flashes a second)', () => {
		const result = flashCheck(clip('strobe.mp4', 8, 2, 'if(mod(N,2),255,0)'));
		expect(result.status).toBe(1);
		expect(result.stdout).toMatch(/whole frame: 4 flashes in one second/);
	});

	it('passes a slow blink and a steady clip', () => {
		expect(flashCheck(clip('blink.mp4', 6, 3, 'if(lt(mod(N,4),2),255,0)')).status).toBe(0);
		expect(flashCheck(clip('steady.mp4', 8, 2, '128')).status).toBe(0);
	});
});
