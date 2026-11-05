// Makes a card-size copy of every project clip (src/data/projects.ts `video`),
// named by cardClip() in src/utils/halftone.ts. /work autoplays every clip in
// view, and the full-size recordings (up to 1600px wide) put it over the page
// weight budget; a card shows them about 440px wide. Project pages keep the
// originals. Skips copies newer than their source.
//
// Usage: npm run media:cards
import { execFile } from 'node:child_process';
import { copyFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { projects } from '../../src/data/projects.ts';

const run = promisify(execFile);
// Cards show clips about 440px wide; drawn in pink, 640px is plenty
const WIDTH = 640;
// Muted screen recordings and loops: 15 frames a second and a higher CRF don't show
const FPS = 15;
const CRF = 32;

const cardClip = (video) => video.replace(/\.mp4$/, '-card.mp4');

const todo = projects
	.filter((p) => p.video)
	.map((p) => ({ source: join('public', p.video), out: join('public', cardClip(p.video)) }))
	.filter(({ source, out }) => {
		if (!existsSync(source)) throw new Error(`Project clip ${source} is missing`);
		return !existsSync(out) || statSync(out).mtimeMs < statSync(source).mtimeMs;
	});

for (const { source, out } of todo) {
	await run('ffmpeg', [
		'-v',
		'error',
		'-y',
		'-i',
		source,
		'-vf',
		`fps=${FPS},scale='min(${WIDTH},iw)':-2`,
		'-c:v',
		'libx264',
		'-crf',
		String(CRF),
		'-preset',
		'slow',
		'-pix_fmt',
		'yuv420p',
		'-an',
		'-movflags',
		'+faststart',
		out,
	]);
	// An already small source (Doom is 640px) can come out bigger: keep the original
	if (statSync(out).size >= statSync(source).size) copyFileSync(source, out);
}
console.log(`Made ${todo.length} card clip(s).`);
