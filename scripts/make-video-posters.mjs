#!/usr/bin/env node
// Gives each clip a foo-poster.webp beside foo.mp4: its first frame, as a WebP.
//
// src/plugins/rehype-gif-video.mjs reads a clip's width and height from its poster,
// so a clip with no poster ships unsized (300x150 until it loads) and shoves the text
// under it as it plays in. The poster is also the still in-view-play.ts shows before
// the clip starts. scripts/convert-staged-images.sh runs this on every clip it makes.
//
// Usage: node scripts/make-video-posters.mjs public/images/.../clip.mp4 [...]
// Skips clips that already have a poster. Needs ffmpeg.
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import sharp from 'sharp';

for (const mp4 of process.argv.slice(2)) {
	const poster = mp4.replace(/\.mp4$/i, '-poster.webp');
	if (poster === mp4) throw new Error(`Not an .mp4: ${mp4}`);
	if (existsSync(poster)) continue;
	const png = execFileSync(
		'ffmpeg',
		[
			'-nostdin',
			'-loglevel',
			'error',
			'-i',
			mp4,
			'-frames:v',
			'1',
			'-f',
			'image2pipe',
			'-c:v',
			'png',
			'-',
		],
		{ maxBuffer: 64 * 1024 * 1024 },
	);
	await sharp(png).webp({ quality: 75 }).toFile(poster);
	console.log(`POSTER ${poster}`);
}
