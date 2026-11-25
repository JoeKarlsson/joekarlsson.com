import { describe, it, expect } from 'vitest';
import { spawnSync } from 'child_process';
import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const dir = mkdtempSync(join(tmpdir(), 'archival-'));

/** A pillarboxed 4:3 "film": one moving shot per [source, seconds], hard cuts between them.
 * `streams: 2` writes the picture twice, as some FedFlix files carry two video streams. */
function film(name: string, shots: [string, number][], streams = 1, grade = ''): string {
	const out = join(dir, name);
	const inputs = shots.flatMap(([src, secs]) => [
		'-f',
		'lavfi',
		'-i',
		`${src}=s=480x360:r=24:d=${secs}${grade ? `,${grade}` : ''}`,
	]);
	const concat =
		shots.map((_, i) => `[${i}]`).join('') +
		`concat=n=${shots.length},pad=640:360:80:0,split=${streams}` +
		Array.from({ length: streams }, (_, i) => `[v${i}]`).join('');
	const made = spawnSync('ffmpeg', [
		'-v',
		'error',
		'-y',
		...inputs,
		'-filter_complex',
		concat,
		...Array.from({ length: streams }, (_, i) => ['-map', `[v${i}]`]).flat(),
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

	it('reads the frame size from the first of two video streams', () => {
		const result = cut(film('two-streams.mp4', [['testsrc2', 4]], 2), 'two-streams-clip');
		expect(result.status, result.stderr).toBe(0);
		expect(probe(join(dir, 'two-streams-clip.mp4'), 'stream=width,height')).toBe('1440,810');
	}, 60_000);

	it('evens out brightness between a dark clip and a bright one', () => {
		// The clip's average luma over every frame (signalstats YAVG)
		const meanLuma = (file: string) => {
			const out = spawnSync(
				'ffmpeg',
				[
					'-i',
					file,
					'-vf',
					'signalstats,metadata=print:key=lavfi.signalstats.YAVG',
					'-f',
					'null',
					'-',
				],
				{ encoding: 'utf8' },
			).stderr;
			const values = [...out.matchAll(/YAVG=([\d.]+)/g)].map((m) => Number(m[1]));
			return values.reduce((a, b) => a + b, 0) / values.length;
		};
		const dark = film('dark.mp4', [['testsrc2', 4]], 1, 'eq=brightness=-0.25:contrast=0.5');
		const bright = film('bright.mp4', [['testsrc2', 4]], 1, 'eq=brightness=0.25:contrast=0.5');
		expect(Math.abs(meanLuma(dark) - meanLuma(bright))).toBeGreaterThan(80);
		expect(cut(dark, 'dark-clip').status).toBe(0);
		expect(cut(bright, 'bright-clip').status).toBe(0);
		expect(
			Math.abs(meanLuma(join(dir, 'dark-clip.mp4')) - meanLuma(join(dir, 'bright-clip.mp4'))),
		).toBeLessThan(15);
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
