#!/usr/bin/env node
/**
 * Convert animated WebP under public/images to MP4.
 *
 * Animated WebP is as wasteful as animated GIF - the five on this site averaged
 * 3 bytes per pixel, where h264 lands nearer 0.05. They also hid from every
 * check for a long time: the size warning saw a .webp and assumed a still, and
 * the GIF converter only ever looked for *.gif.
 *
 * ffmpeg cannot help with the decode - its webp decoder reads the first frame
 * and then fails with "image data not found" on the animation chunks. So frames
 * come out through sharp, which composites them correctly (WebP frames can be
 * partial deltas), and go into ffmpeg as a concat list carrying each frame's own
 * delay. Variable timing survives that round trip exactly.
 *
 * Rendering is handled by src/plugins/rehype-gif-video.mjs, the same path GIFs
 * take: an <img> pointing at the .webp becomes a <video> once a sibling .mp4
 * exists, so markdown needs no edits.
 *
 * Usage:
 *   node scripts/convert-animated-webp-to-video.mjs --dry-run
 *   node scripts/convert-animated-webp-to-video.mjs --min 256
 *   node scripts/convert-animated-webp-to-video.mjs --keep-webp
 *   node scripts/convert-animated-webp-to-video.mjs path/to/one.webp
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import sharp from 'sharp';

const IMAGE_DIR = 'public/images';

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const KEEP_WEBP = args.includes('--keep-webp');
const MIN_KB = Number(valueOf('--min') ?? 256);

function valueOf(flag) {
	const i = args.indexOf(flag);
	return i === -1 ? undefined : args[i + 1];
}

function positionals() {
	const withValues = new Set(['--min']);
	const out = [];
	for (let i = 0; i < args.length; i++) {
		if (withValues.has(args[i])) {
			i++;
			continue;
		}
		if (args[i].startsWith('--')) continue;
		out.push(args[i]);
	}
	return out;
}

function walk(dir) {
	return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const full = path.join(dir, entry.name);
		return entry.isDirectory() ? walk(full) : [full];
	});
}

/**
 * Animated WebP carries an ANIM chunk right after the VP8X header. Reading the
 * bytes keeps this in step with validate-images.sh, which has to make the same
 * call in bash with no sharp available.
 */
function isAnimatedWebp(file) {
	let fd;
	try {
		fd = fs.openSync(file, 'r');
		const buf = Buffer.alloc(64);
		const read = fs.readSync(fd, buf, 0, 64, 0);
		return buf.subarray(0, read).includes('ANIM');
	} catch {
		return false;
	} finally {
		if (fd !== undefined) fs.closeSync(fd);
	}
}

function kb(bytes) {
	return Math.round(bytes / 1024);
}

function decodes(mp4) {
	try {
		execFileSync(
			'ffprobe',
			['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp4],
			{
				stdio: ['ignore', 'ignore', 'ignore'],
			},
		);
		return true;
	} catch {
		return false;
	}
}

try {
	execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' });
} catch {
	console.error('ERROR: ffmpeg is required but not installed (brew install ffmpeg)');
	process.exit(1);
}

const EXPLICIT = positionals();
for (const f of EXPLICIT) {
	if (!fs.existsSync(f)) {
		console.error(`ERROR: no such file: ${f}`);
		process.exit(1);
	}
}

const candidates = (EXPLICIT.length > 0 ? EXPLICIT : walk(IMAGE_DIR))
	.filter((f) => /\.webp$/i.test(f))
	.filter(isAnimatedWebp)
	.sort();

let converted = 0;
let skipped = 0;
let failed = 0;
let bytesBefore = 0;
let bytesAfter = 0;

console.log(`=== Animated WebP to MP4 (threshold: ${MIN_KB}KB) ===`);
console.log('');

for (const file of candidates) {
	const size = fs.statSync(file).size;
	if (kb(size) < MIN_KB) continue;

	const mp4 = `${file.replace(/\.webp$/i, '')}.mp4`;

	if (fs.existsSync(mp4) && !decodes(mp4)) {
		console.log(`BAD   ${mp4} does not decode - re-encoding from ${file}`);
		fs.unlinkSync(mp4);
	}

	if (fs.existsSync(mp4)) {
		// The mp4 is what gets served, so the webp beside it is dead weight.
		if (!KEEP_WEBP) {
			if (DRY_RUN) {
				console.log(`WOULD DROP  ${file} (${kb(size)}KB, mp4 already exists)`);
			} else {
				fs.unlinkSync(file);
				console.log(`DROP  ${file} (${kb(size)}KB redundant, mp4 exists)`);
				bytesBefore += size;
			}
		} else {
			console.log(`SKIP  ${file} (mp4 already exists)`);
		}
		skipped++;
		continue;
	}

	if (DRY_RUN) {
		console.log(`WOULD CONVERT  ${file} (${kb(size)}KB)`);
		converted++;
		continue;
	}

	const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'awebp2mp4-'));
	try {
		const meta = await sharp(file, { animated: true }).metadata();
		const pages = meta.pages ?? 1;
		const pageHeight = meta.pageHeight ?? meta.height;
		const width = meta.width;

		if (pages < 2) throw new Error('not actually animated');

		// Materialise the composited strip once, then slice frames out of it.
		// Extracting straight off the animated pipeline fails ("bad extract
		// area"), and per-page reads can hand back partial frames.
		const strip = await sharp(file, { animated: true }).png().toBuffer();

		const lines = [];
		let totalMs = 0;
		for (let i = 0; i < pages; i++) {
			const framePath = path.join(tmp, `f${String(i).padStart(5, '0')}.png`);
			const buf = await sharp(strip)
				.extract({ left: 0, top: i * pageHeight, width, height: pageHeight })
				.png()
				.toBuffer();
			fs.writeFileSync(framePath, buf);

			// Browsers clamp near-zero delays to 100ms; match that so playback
			// speed does not change.
			const raw = meta.delay?.[i] ?? 100;
			const delay = raw < 20 ? 100 : raw;
			totalMs += delay;
			lines.push(`file '${framePath}'`, `duration ${(delay / 1000).toFixed(3)}`);
		}
		// concat needs the final entry repeated for its duration to be honoured,
		// but that repeat also decodes as a real extra frame. -t below trims it
		// back off, which costs the last frame ~60ms of display and buys exact
		// frame parity with the source - the invariant worth being able to check.
		lines.push(`file '${path.join(tmp, `f${String(pages - 1).padStart(5, '0')}.png`)}'`);

		const listPath = path.join(tmp, 'list.txt');
		fs.writeFileSync(listPath, `${lines.join('\n')}\n`);

		execFileSync(
			'ffmpeg',
			[
				'-nostdin',
				'-loglevel',
				'error',
				'-y',
				'-f',
				'concat',
				'-safe',
				'0',
				'-i',
				listPath,
				'-movflags',
				'faststart',
				'-pix_fmt',
				'yuv420p',
				'-vf',
				'scale=trunc(iw/2)*2:trunc(ih/2)*2',
				'-c:v',
				'libx264',
				'-crf',
				'23',
				'-preset',
				'slow',
				'-fps_mode',
				'vfr',
				'-t',
				(totalMs / 1000).toFixed(3),
				'-an',
				mp4,
			],
			{ stdio: ['ignore', 'ignore', 'pipe'] },
		);

		if (!decodes(mp4)) throw new Error('output does not decode');

		const after = fs.statSync(mp4).size;
		const pct = Math.round(((size - after) / size) * 100);
		console.log(`OK    ${file}  ${kb(size)}KB -> ${kb(after)}KB  (-${pct}%)`);

		bytesBefore += size;
		bytesAfter += after;
		converted++;

		if (!KEEP_WEBP) fs.unlinkSync(file);
	} catch (err) {
		console.log(`FAIL  ${file} (${err.message})`);
		if (fs.existsSync(mp4)) fs.unlinkSync(mp4);
		failed++;
	} finally {
		fs.rmSync(tmp, { recursive: true, force: true });
	}
}

console.log('');
console.log('=== Summary ===');
console.log(`Converted: ${converted}`);
console.log(`Skipped:   ${skipped}`);
console.log(`Failed:    ${failed}`);
if (bytesBefore > 0) {
	const saved = bytesBefore - bytesAfter;
	console.log(`WebP bytes removed: ${kb(bytesBefore)}KB`);
	console.log(`MP4 bytes added:    ${kb(bytesAfter)}KB`);
	console.log(`Net saving:         ${kb(saved)}KB (${Math.round((saved / bytesBefore) * 100)}%)`);
}

// Same trap as the GIF script: rehype-gif-video probes the filesystem, which
// Astro does not track as a dependency of the markdown it caches.
if (!DRY_RUN && converted + skipped > 0) {
	fs.rmSync('node_modules/.astro', { recursive: true, force: true });
	console.log('');
	console.log('Cleared node_modules/.astro so the next build re-renders affected posts.');
}

process.exit(failed > 0 ? 1 : 0);
