#!/usr/bin/env node
/**
 * Batch convert JPG/PNG images to WebP and update all references.
 * - Converts images in public/images/ to WebP using sharp
 * - Updates all markdown/MDX blog post references
 * - Updates component/page references
 * - Skips GIFs (animated) and SVGs (vector)
 * - Removes original files after successful conversion
 */

import sharp from 'sharp';
import { readdir, readFile, writeFile, unlink, stat } from 'fs/promises';
import { join, extname, relative } from 'path';

const PUBLIC_DIR = new URL('../public', import.meta.url).pathname;
const SRC_DIR = new URL('../src', import.meta.url).pathname;
const IMAGES_DIR = join(PUBLIC_DIR, 'images');

const CONVERTIBLE_EXTS = new Set(['.jpg', '.jpeg', '.png']);
const QUALITY = 80;

let totalOriginalSize = 0;
let totalNewSize = 0;
let convertedCount = 0;
let skippedCount = 0;
const renamedFiles = new Map(); // old path → new path (relative to public/)

async function walkDir(dir) {
	const entries = await readdir(dir, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		const fullPath = join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...(await walkDir(fullPath)));
		} else {
			files.push(fullPath);
		}
	}
	return files;
}

async function convertImage(filePath) {
	const ext = extname(filePath).toLowerCase();
	if (!CONVERTIBLE_EXTS.has(ext)) return;

	const webpPath = filePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
	const relOld = '/' + relative(PUBLIC_DIR, filePath);
	const relNew = '/' + relative(PUBLIC_DIR, webpPath);

	try {
		const originalStats = await stat(filePath);
		totalOriginalSize += originalStats.size;

		await sharp(filePath).webp({ quality: QUALITY }).toFile(webpPath);

		const newStats = await stat(webpPath);
		totalNewSize += newStats.size;

		renamedFiles.set(relOld, relNew);
		convertedCount++;

		const savings = ((1 - newStats.size / originalStats.size) * 100).toFixed(1);
		console.log(`  ${relOld} → .webp (${savings}% smaller)`);

		// Remove original
		await unlink(filePath);
	} catch (err) {
		console.error(`  SKIP ${relOld}: ${err.message}`);
		skippedCount++;
	}
}

async function updateReferences() {
	// Find all files that might reference images
	const patterns = [
		join(SRC_DIR, 'content', 'blog'),
		join(SRC_DIR, 'pages'),
		join(SRC_DIR, 'components'),
		join(SRC_DIR, 'layouts'),
	];

	const allFiles = [];
	for (const dir of patterns) {
		try {
			allFiles.push(...(await walkDir(dir)));
		} catch {
			/* dir might not exist */
		}
	}

	// Also check consts.ts
	allFiles.push(join(SRC_DIR, 'consts.ts'));

	let updatedFiles = 0;

	for (const filePath of allFiles) {
		const ext = extname(filePath).toLowerCase();
		if (!['.md', '.mdx', '.astro', '.ts', '.tsx', '.js'].includes(ext)) continue;

		let content = await readFile(filePath, 'utf-8');
		let changed = false;

		for (const [oldRef, newRef] of renamedFiles) {
			if (content.includes(oldRef)) {
				content = content.replaceAll(oldRef, newRef);
				changed = true;
			}
		}

		if (changed) {
			await writeFile(filePath, content, 'utf-8');
			updatedFiles++;
			console.log(`  Updated: ${relative(SRC_DIR, filePath)}`);
		}
	}

	return updatedFiles;
}

async function main() {
	console.log('=== Image Optimization: JPG/PNG → WebP ===\n');

	console.log('Converting images...');
	const allImages = await walkDir(IMAGES_DIR);
	const convertible = allImages.filter((f) => CONVERTIBLE_EXTS.has(extname(f).toLowerCase()));
	console.log(`Found ${convertible.length} images to convert\n`);

	for (const img of convertible) {
		await convertImage(img);
	}

	console.log(`\n--- Conversion Summary ---`);
	console.log(`Converted: ${convertedCount}`);
	console.log(`Skipped: ${skippedCount}`);
	console.log(`Original size: ${(totalOriginalSize / 1024 / 1024).toFixed(1)} MB`);
	console.log(`New size: ${(totalNewSize / 1024 / 1024).toFixed(1)} MB`);
	console.log(`Savings: ${((1 - totalNewSize / totalOriginalSize) * 100).toFixed(1)}%\n`);

	console.log('Updating references in source files...');
	const updatedFiles = await updateReferences();
	console.log(`\nUpdated ${updatedFiles} source files.`);
	console.log('\nDone!');
}

main().catch(console.error);
