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
// tests/halftone.test.ts fails any card over 450KB. A busy clip (moving foliage) runs
// over at CRF 32, so it steps up the CRF until it fits; drawn in pink, it doesn't show
const MAX_CARD_BYTES = 450 * 1024;
const MAX_CRF = 44;

const cardClip = (video) => video.replace(/\.mp4$/, '-card.mp4');

const todo = projects
	.filter((p) => p.video)
	.map((p) => ({ source: join('public', p.video), out: join('public', cardClip(p.video)) }))
	.filter(({ source, out }) => {
		if (!existsSync(source)) throw new Error(`Project clip ${source} is missing`);
		return !existsSync(out) || statSync(out).mtimeMs < statSync(source).mtimeMs;
	});

const encodeCard = (source, out, crf) =>
	run('ffmpeg', [
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
		String(crf),
		'-preset',
		'slow',
		'-pix_fmt',
		'yuv420p',
		'-an',
		'-movflags',
		'+faststart',
		out,
	]);

for (const { source, out } of todo) {
	let crf = CRF;
	await encodeCard(source, out, crf);
	while (statSync(out).size > MAX_CARD_BYTES && crf < MAX_CRF) {
		crf += 2;
		await encodeCard(source, out, crf);
	}
	if (statSync(out).size > MAX_CARD_BYTES) {
		throw new Error(`${out} is still over ${MAX_CARD_BYTES / 1024}KB at CRF ${MAX_CRF}: shorten the clip`);
	}
	// An already small source (Doom is 640px) can come out bigger: keep the original
	if (statSync(out).size >= statSync(source).size) copyFileSync(source, out);
}
console.log(`Made ${todo.length} card clip(s).`);
