#!/usr/bin/env node
/**
 * Cap the pixel dimensions of existing WebP files, in place.
 *
 * convert-images-to-webp.mjs only ever reads PNG/JPG, so anything that arrived
 * already as .webp never had its --max-width or --quality applied. That is how
 * the site ended up serving a 2463x2013 photo into a 300px-wide thumbnail.
 *
 * Paths are required rather than optional. A whole-tree default would be a
 * footgun here: some large images are deliberately large (blog hero art), and
 * only the caller knows which. Filenames never change, so no reference in src/
 * needs repointing.
 *
 * Re-encoding a lossy WebP does cost a generation, which is acceptable when the
 * image is being downscaled hard - resampling hides far more than the second
 * encode adds. It is not a good idea at the same dimensions.
 *
 * Usage:
 *   node scripts/resize-webp.mjs --max-width 1200 --dry-run public/images/foo.webp
 *   node scripts/resize-webp.mjs --max-width 1200 public/images/crop-art/*.webp
 */

import fs from 'node:fs';

import sharp from 'sharp';

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const MAX_WIDTH = Number(valueOf('--max-width') ?? 1920);
const QUALITY = Number(valueOf('--quality') ?? 82);

function valueOf(flag) {
	const i = args.indexOf(flag);
	return i === -1 ? undefined : args[i + 1];
}

function positionals() {
	const withValues = new Set(['--max-width', '--quality']);
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

function kb(bytes) {
	return Math.round(bytes / 1024);
}

const files = positionals();

if (files.length === 0) {
	console.error('ERROR: pass at least one .webp path');
	console.error('  node scripts/resize-webp.mjs --max-width 1200 <paths...>');
	process.exit(1);
}

for (const f of files) {
	if (!fs.existsSync(f)) {
		console.error(`ERROR: no such file: ${f}`);
		process.exit(1);
	}
	if (!/\.webp$/i.test(f)) {
		console.error(`ERROR: not a .webp: ${f}`);
		process.exit(1);
	}
}

let resized = 0;
let skipped = 0;
let failed = 0;
let bytesBefore = 0;
let bytesAfter = 0;

console.log(`=== WebP resize (max width: ${MAX_WIDTH}px, quality: ${QUALITY}) ===`);
console.log('');

for (const file of files) {
	const before = fs.statSync(file).size;

	try {
		const meta = await sharp(file).metadata();

		if (meta.pages && meta.pages > 1) {
			// Animated WebP belongs in an MP4 instead; resizing it here would
			// quietly bless the wrong format.
			console.log(`SKIP  ${file} (animated - use convert-animated-webp-to-video.mjs)`);
			skipped++;
			continue;
		}

		if (!meta.width || meta.width <= MAX_WIDTH) {
			console.log(`SKIP  ${file} (${meta.width}px already within ${MAX_WIDTH}px)`);
			skipped++;
			continue;
		}

		if (DRY_RUN) {
			const height = Math.round((meta.height * MAX_WIDTH) / meta.width);
			console.log(
				`WOULD  ${file}  ${meta.width}x${meta.height} ${kb(before)}KB -> ${MAX_WIDTH}x${height}`,
			);
			resized++;
			continue;
		}

		const tmp = `${file}.tmp-resize`;
		await sharp(file)
			.resize(MAX_WIDTH, null, { withoutEnlargement: true })
			.webp({ quality: QUALITY })
			.toFile(tmp);

		// Confirm the replacement is a real image before overwriting the source.
		const check = await sharp(tmp).metadata();
		if (!check.width) throw new Error('encoded file has no dimensions');

		const after = fs.statSync(tmp).size;
		fs.renameSync(tmp, file);

		const pct = Math.round(((before - after) / before) * 100);
		console.log(
			`OK    ${file}  ${meta.width}x${meta.height} ${kb(before)}KB -> ${check.width}x${check.height} ${kb(after)}KB (-${pct}%)`,
		);

		bytesBefore += before;
		bytesAfter += after;
		resized++;
	} catch (err) {
		console.log(`FAIL  ${file}: ${err.message}`);
		const tmp = `${file}.tmp-resize`;
		if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
		failed++;
	}
}

console.log('');
console.log('=== Summary ===');
console.log(`Resized: ${resized}`);
console.log(`Skipped: ${skipped}`);
console.log(`Failed:  ${failed}`);
if (bytesBefore > 0) {
	const saved = bytesBefore - bytesAfter;
	console.log(
		`Before: ${kb(bytesBefore)}KB  After: ${kb(bytesAfter)}KB  Saved: ${kb(saved)}KB (${Math.round((saved / bytesBefore) * 100)}%)`,
	);
}

// No Astro cache to invalidate, unlike the animation converters: filenames are
// unchanged, so the cached markdown still points at the right path. Only the
// bytes behind that path moved.

process.exit(failed > 0 ? 1 : 0);
