import { describe, it, expect } from 'vitest';
import { spawnSync } from 'child_process';
import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const dir = mkdtempSync(join(tmpdir(), 'archival-'));

/** A pillarboxed 4:3 "film": one moving shot per [source, seconds], hard cuts between them. */
function film(name: string, shots: [string, number][]): string {
	const out = join(dir, name);
	const inputs = shots.flatMap(([src, secs]) => [
		'-f',
		'lavfi',
		'-i',
		`${src}=s=480x360:r=24:d=${secs}`,
	]);
	const concat =
		shots.map((_, i) => `[${i}]`).join('') + `concat=n=${shots.length},pad=640:360:80:0`;
	const made = spawnSync('ffmpeg', [
		'-v',
		'error',
		'-y',
		...inputs,
		'-filter_complex',
		concat,
		'-pix_fmt',
		'yuv420p',
		out,
	]);
	if (made.status !== 0) throw new Error(made.stderr.toString());
	return out;
}

const cut = (input: string, out: string) =>
	spawnSync('bash', ['scripts/media/archival-clip.sh', input, join(dir, out)], {
		encoding: 'utf8',
	});

const probe = (file: string, entries: string) =>
	spawnSync('ffprobe', ['-v', 'error', '-show_entries', entries, '-of', 'csv=p=0', file], {
		encoding: 'utf8',
	}).stdout.trim();

describe('archival header clip', () => {
	it('keeps one shot, drops the cut and the pillarbox', () => {
		const result = cut(
			film('two-shots.mp4', [
				['testsrc2', 4],
				['smptebars', 1.5],
			]),
			'two-shots-clip',
		);
		expect(result.status, result.stderr).toBe(0);
		const clip = join(dir, 'two-shots-clip.mp4');
		expect(probe(clip, 'stream=width,height')).toBe('1440,810');
		expect(Number(probe(clip, 'format=duration'))).toBeGreaterThanOrEqual(2.5);
		// No hard cut left anywhere in the loop
		const scenes = spawnSync(
			'ffmpeg',
			['-v', 'info', '-i', clip, '-vf', "select='gt(scene,0.2)',showinfo", '-f', 'null', '-'],
			{ encoding: 'utf8' },
		);
		expect(scenes.stderr).not.toMatch(/pts_time/);
	}, 60_000);

	it('rejects a shot too short to loop', () => {
		const result = cut(
			film('short.mp4', [
				['testsrc2', 1.5],
				['smptebars', 1.5],
				['testsrc', 1.5],
			]),
			'short-clip',
		);
		expect(result.status).toBe(2);
		expect(result.stderr).toMatch(/REJECT/);
	}, 60_000);
});
