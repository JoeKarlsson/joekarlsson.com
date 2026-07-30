#!/usr/bin/env node
/**
 * Convert PNG/JPG under public/images to WebP and repoint every reference.
 *
 * Three cases per file:
 *   - a .webp sibling already exists -> the original is stale, just drop it
 *   - otherwise -> encode to .webp, verify it decodes, then drop the original
 *   - anything that fails to encode is left completely alone
 *
 * References are rewritten across src/ afterwards, so blog frontmatter and
 * markdown bodies keep pointing at real files.
 *
 * Usage:
 *   node scripts/convert-images-to-webp.mjs --dry-run
 *   node scripts/convert-images-to-webp.mjs
 *   node scripts/convert-images-to-webp.mjs --quality 85 --max-width 1600
 *   node scripts/convert-images-to-webp.mjs public/images/blog/foo/bar.png
 *
 * Given explicit paths it converts only those, which is how the pre-commit
 * hook (scripts/convert-staged-images.sh) drives it. Every src/ file whose
 * references get repointed is echoed as a "REWROTE <path>" line so the hook
 * knows exactly what to stage.
 */

import fs from 'node:fs';
import path from 'node:path';

import sharp from 'sharp';

const IMAGE_DIR = 'public/images';
const SRC_DIRS = ['src'];

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const QUALITY = Number(valueOf('--quality') ?? 82);
// Nothing in the layout renders wider than ~700px, so 1920 still covers 2x
// retina with room to spare. Only a handful of images exceed it.
const MAX_WIDTH = Number(valueOf('--max-width') ?? 1920);

function valueOf(flag) {
	const i = args.indexOf(flag);
	return i === -1 ? undefined : args[i + 1];
}

/** Bare paths, skipping flags and the values that belong to them. */
function positionals() {
	const withValues = new Set(['--quality', '--max-width']);
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

function mb(bytes) {
	return `${(bytes / 1048576).toFixed(1)}MB`;
}

const EXPLICIT = positionals();

// A missing explicit path is a caller bug worth failing on; a whole-tree scan
// just finds whatever is there.
for (const f of EXPLICIT) {
	if (!fs.existsSync(f)) {
		console.error(`ERROR: no such file: ${f}`);
		process.exit(1);
	}
}

const originals = (EXPLICIT.length > 0 ? EXPLICIT : walk(IMAGE_DIR)).filter((f) =>
	/\.(png|jpe?g)$/i.test(f),
);

let converted = 0;
let staleDropped = 0;
let failed = 0;
let bytesBefore = 0;
let bytesAfter = 0;

/** original path (site-absolute) -> replacement path */
const rewrites = new Map();

for (const file of originals) {
	const webp = `${file.replace(/\.(png|jpe?g)$/i, '')}.webp`;
	const sizeBefore = fs.statSync(file).size;
	const sitePath = file.replace(/^public/, '');
	const siteWebp = webp.replace(/^public/, '');

	if (fs.existsSync(webp)) {
		// A previous pass already produced this; the original is dead weight.
		if (!DRY_RUN) fs.unlinkSync(file);
		console.log(`STALE  ${sitePath} (${Math.round(sizeBefore / 1024)}KB, .webp already present)`);
		rewrites.set(sitePath, siteWebp);
		staleDropped++;
		bytesBefore += sizeBefore;
		continue;
	}

	if (DRY_RUN) {
		console.log(`WOULD  ${sitePath} (${Math.round(sizeBefore / 1024)}KB)`);
		converted++;
		continue;
	}

	try {
		const meta = await sharp(file).metadata();
		const pipeline = sharp(file);
		if (meta.width && meta.width > MAX_WIDTH) {
			pipeline.resize(MAX_WIDTH, null, { withoutEnlargement: true });
		}
		await pipeline.webp({ quality: QUALITY }).toFile(webp);

		// Confirm the output is a real image before removing the source.
		const check = await sharp(webp).metadata();
		if (!check.width) throw new Error('encoded file has no dimensions');

		const sizeAfter = fs.statSync(webp).size;
		fs.unlinkSync(file);

		const pct = Math.round(((sizeBefore - sizeAfter) / sizeBefore) * 100);
		console.log(
			`OK     ${sitePath}  ${Math.round(sizeBefore / 1024)}KB -> ${Math.round(sizeAfter / 1024)}KB (-${pct}%)`,
		);

		rewrites.set(sitePath, siteWebp);
		converted++;
		bytesBefore += sizeBefore;
		bytesAfter += sizeAfter;
	} catch (err) {
		console.log(`FAIL   ${sitePath}: ${err.message}`);
		if (fs.existsSync(webp)) fs.unlinkSync(webp);
		failed++;
	}
}

// Repoint references. Longest paths first so no path is a prefix of another.
let filesTouched = 0;
let refsRewritten = 0;

if (!DRY_RUN && rewrites.size > 0) {
	const keys = [...rewrites.keys()].sort((a, b) => b.length - a.length);
	const sourceFiles = SRC_DIRS.flatMap((d) => walk(d)).filter((f) =>
		/\.(md|mdx|astro|ts|tsx|js|mjs|json)$/i.test(f),
	);

	for (const file of sourceFiles) {
		const before = fs.readFileSync(file, 'utf8');
		let after = before;
		for (const from of keys) {
			if (after.includes(from)) {
				after = after.split(from).join(rewrites.get(from));
				refsRewritten++;
			}
		}
		if (after !== before) {
			fs.writeFileSync(file, after);
			console.log(`REWROTE ${file}`);
			filesTouched++;
		}
	}
}

console.log('');
console.log('=== Summary ===');
console.log(`Converted:        ${converted}`);
console.log(`Stale dropped:    ${staleDropped}`);
console.log(`Failed:           ${failed}`);
console.log(`Source files updated: ${filesTouched} (${refsRewritten} path rewrites)`);
if (bytesBefore > 0) {
	console.log(
		`Before: ${mb(bytesBefore)}  After: ${mb(bytesAfter)}  Saved: ${mb(bytesBefore - bytesAfter)}`,
	);
}

process.exit(failed > 0 ? 1 : 0);
