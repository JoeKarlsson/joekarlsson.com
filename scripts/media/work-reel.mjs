// Cuts the /work/ hero reel: a REEL_SLICE_SECONDS slice of each selected work's clip, in
// SELECTED_WORKS order, starting at its `reelStart`, plus a poster from the first slice.
// Every clip is 16:9 already, so the reel is too and the hero shows it uncropped.
// Re-run after changing SELECTED_WORKS or a reelStart.
//
// Usage: npm run media:reel
import { execFile } from 'node:child_process';
import { statSync } from 'node:fs';
import { join } from 'node:path';
import { promisify } from 'node:util';
import sharp from 'sharp';
import {
	REEL_SLICE_SECONDS,
	REEL_VIDEO,
	SELECTED_WORKS,
	projects,
} from '../../src/data/projects.ts';

const run = promisify(execFile);
// The hero shows it about 540px wide; drawn in pink, 800 holds up on a retina screen
const WIDTH = 800;
const HEIGHT = 450;
// Muted and drawn in pink, like the card clips (scripts/media/card-clips.mjs): 15fps and a
// high CRF keep it near a card clip's 450KB
const FPS = 15;
const CRF = 34;

const slices = SELECTED_WORKS.map((title) => {
	const project = projects.find((p) => p.title === title);
	if (!project?.video || project.reelStart === undefined) {
		throw new Error(`Selected work "${title}" needs a video and a reelStart for the reel`);
	}
	return { source: join('public', project.video), start: project.reelStart };
});

const inputs = slices.flatMap(({ source, start }) => [
	'-ss',
	String(start),
	'-t',
	String(REEL_SLICE_SECONDS),
	'-i',
	source,
]);
const fit = `scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=increase,crop=${WIDTH}:${HEIGHT},setsar=1,fps=${FPS}`;
const filter =
	slices.map((_, i) => `[${i}:v]${fit}[v${i}]`).join(';') +
	`;${slices.map((_, i) => `[v${i}]`).join('')}concat=n=${slices.length}:v=1[out]`;

const out = join('public', REEL_VIDEO);
await run('ffmpeg', [
	'-v',
	'error',
	'-y',
	...inputs,
	'-filter_complex',
	filter,
	'-map',
	'[out]',
	'-an',
	'-c:v',
	'libx264',
	'-crf',
	String(CRF),
	'-preset',
	'slow',
	'-pix_fmt',
	'yuv420p',
	'-movflags',
	'+faststart',
	out,
]);
const poster = out.replace(/\.mp4$/, '-poster.webp');
// This ffmpeg has no WebP encoder: grab a PNG frame and let sharp write the WebP
const { stdout: frame } = await run(
	'ffmpeg',
	['-v', 'error', '-ss', '1', '-i', out, '-frames:v', '1', '-f', 'image2pipe', '-c:v', 'png', '-'],
	{ encoding: 'buffer', maxBuffer: 32 * 1024 * 1024 },
);
await sharp(frame).webp({ quality: 80 }).toFile(poster);
console.log(
	`${out} ${Math.round(statSync(out).size / 1024)}KB, ${poster} ${Math.round(statSync(poster).size / 1024)}KB`,
);
