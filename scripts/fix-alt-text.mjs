#!/usr/bin/env node
/**
 * Fix empty alt text in blog markdown files.
 *
 * Strategy (in priority order):
 * 1. If image has a caption (![](/path)*Caption text*), use the caption
 * 2. If no caption, humanize the filename into a description
 * 3. Write changes back to the markdown files
 *
 * Run with --dry-run to preview changes without writing.
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join, basename, extname } from 'path';

const BLOG_DIR = new URL('../src/content/blog', import.meta.url).pathname;
const DRY_RUN = process.argv.includes('--dry-run');

function humanizeFilename(filepath) {
	let name = basename(filepath, extname(filepath));

	// Remove common prefixes like hex hashes, dimensions, etc.
	name = name
		.replace(/^[a-f0-9]{8,}-/i, '') // hex hash prefix
		.replace(/-\d+x\d+(-\d+)?$/, '') // dimension suffix like -1024x573
		.replace(/^\d+_/, '') // numeric prefix
		.replace(/^img[-_]/, '') // img- prefix
		.replace(/^image[-_]?\d*$/, 'illustration') // bare "image-1" etc.
		.replace(/^screenshot[-_]?\d*/, 'screenshot')
		.replace(/[-_]+/g, ' ') // dashes/underscores to spaces
		.replace(/\b(og|bp|jk)\b/gi, '') // remove common prefixes
		.replace(/\s+/g, ' ') // collapse spaces
		.trim();

	if (!name || name.length < 3) return null;

	// Capitalize first letter
	return name.charAt(0).toUpperCase() + name.slice(1);
}

async function processFile(filePath) {
	const content = await readFile(filePath, 'utf-8');
	let newContent = content;
	let changes = 0;
	const filename = basename(filePath);

	// Pattern: ![](path)*Caption text* or ![](path) *Caption text*
	// Replace with ![Caption text](path)*Caption text*
	newContent = newContent.replace(/!\[\]\(([^)]+)\)\s*\*([^*]+)\*/g, (match, path, caption) => {
		const cleanCaption = caption.trim();
		changes++;
		return `![${cleanCaption}](${path})*${caption}*`;
	});

	// Pattern: ![](path) with no caption - use humanized filename
	newContent = newContent.replace(/!\[\]\(([^)]+)\)/g, (match, path) => {
		// Skip external URLs (harder to humanize)
		if (path.startsWith('http')) {
			const urlName = basename(new URL(path).pathname, extname(new URL(path).pathname))
				.replace(/[-_]+/g, ' ')
				.replace(/^\d+\*/, '')
				.trim();
			if (urlName && urlName.length > 2) {
				changes++;
				const alt = urlName.charAt(0).toUpperCase() + urlName.slice(1);
				return `![${alt}](${path})`;
			}
			return match;
		}

		const alt = humanizeFilename(path);
		if (alt) {
			changes++;
			return `![${alt}](${path})`;
		}
		return match;
	});

	if (changes > 0) {
		if (!DRY_RUN) {
			await writeFile(filePath, newContent, 'utf-8');
		}
		console.log(`  ${filename}: ${changes} alt texts ${DRY_RUN ? 'would be ' : ''}fixed`);
	}

	return changes;
}

async function main() {
	console.log(`=== Alt Text Fixer ${DRY_RUN ? '(DRY RUN)' : ''} ===\n`);

	const files = await readdir(BLOG_DIR);
	const mdFiles = files.filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));

	let totalChanges = 0;
	let filesChanged = 0;

	for (const file of mdFiles.sort()) {
		const changes = await processFile(join(BLOG_DIR, file));
		if (changes > 0) {
			totalChanges += changes;
			filesChanged++;
		}
	}

	console.log(`\n--- Summary ---`);
	console.log(`Files modified: ${filesChanged}`);
	console.log(`Alt texts ${DRY_RUN ? 'to fix' : 'fixed'}: ${totalChanges}`);

	if (DRY_RUN) {
		console.log(`\nRun without --dry-run to apply changes.`);
	}
}

main().catch(console.error);
