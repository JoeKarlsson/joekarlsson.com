#!/usr/bin/env node
/**
 * Download external CDN images, convert to WebP, update markdown references.
 * - Downloads from Medium, TheNewStack, Tinybird Ghost, WordPress, etc.
 * - Converts to WebP (skips GIFs to preserve animation)
 * - Places in the blog post's image directory
 * - Updates markdown references to local paths
 */

import sharp from 'sharp';
import { readdir, readFile, writeFile, mkdir, stat } from 'fs/promises';
import { join, basename, extname } from 'path';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

const BLOG_DIR = new URL('../src/content/blog', import.meta.url).pathname;
const PUBLIC_DIR = new URL('../public', import.meta.url).pathname;

// Extract a clean filename from a URL
function urlToFilename(url, index) {
	try {
		const parsed = new URL(url);
		let name = basename(parsed.pathname);
		// Remove query params from name
		name = name.split('?')[0];
		// Clean up Medium-style names (1*hash.ext)
		name = name.replace(/^1\*/, '');
		// Truncate very long names
		if (name.length > 60) {
			const ext = extname(name);
			name = name.substring(0, 50) + ext;
		}
		// Replace problematic chars
		name = name.replace(/[^a-zA-Z0-9._-]/g, '-');
		return name || `external-image-${index}`;
	} catch {
		return `external-image-${index}`;
	}
}

async function downloadFile(url, destPath) {
	// Clean URL (remove trailing stuff after extensions for malformed URLs)
	let cleanUrl = url;

	const response = await fetch(cleanUrl, {
		headers: {
			'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
		},
		redirect: 'follow',
	});

	if (!response.ok) {
		throw new Error(`HTTP ${response.status} for ${cleanUrl}`);
	}

	const buffer = Buffer.from(await response.arrayBuffer());
	const { writeFile: wf } = await import('fs/promises');
	await wf(destPath, buffer);
	return buffer;
}

async function processFile(filePath) {
	let content = await readFile(filePath, 'utf-8');
	const slug = basename(filePath, extname(filePath));
	const imgDir = join(PUBLIC_DIR, 'images', 'blog', slug);

	// Find all external image URLs in markdown image syntax
	const imgRegex = /!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g;
	const matches = [...content.matchAll(imgRegex)];

	if (matches.length === 0) return 0;

	// Also find linked images [![alt](url)](url)
	const linkedImgRegex = /\[!\[([^\]]*)\]\((https?:\/\/[^)]+)\)\]\((https?:\/\/[^)]+)\)/g;
	const linkedMatches = [...content.matchAll(linkedImgRegex)];

	await mkdir(imgDir, { recursive: true });

	let changes = 0;
	let imgIndex = 0;

	// Process linked images first (they contain the image URL)
	for (const match of linkedMatches) {
		const [fullMatch, alt, imgUrl, linkUrl] = match;
		imgIndex++;

		// Skip blob: URLs
		if (imgUrl.startsWith('blob:')) continue;
		// Skip non-image links
		if (!imgUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i)) continue;

		const origFilename = urlToFilename(imgUrl, imgIndex);
		const origExt = extname(origFilename).toLowerCase();
		const isGif = origExt === '.gif';
		const destFilename = isGif ? origFilename : origFilename.replace(/\.[^.]+$/, '.webp');
		const destPath = join(imgDir, destFilename);
		const localPath = `/images/blog/${slug}/${destFilename}`;

		try {
			// Check if already downloaded
			try {
				await stat(destPath);
				console.log(`  SKIP (exists): ${destFilename}`);
			} catch {
				console.log(`  Downloading: ${imgUrl.substring(0, 80)}...`);
				const buffer = await downloadFile(imgUrl, join(imgDir, origFilename));

				if (!isGif) {
					await sharp(join(imgDir, origFilename)).webp({ quality: 80 }).toFile(destPath);
					// Remove original if different name
					if (origFilename !== destFilename) {
						const { unlink } = await import('fs/promises');
						await unlink(join(imgDir, origFilename));
					}
				}
			}

			// Replace the linked image: [![alt](external)](link) → ![alt](local)
			// Drop the outer link since it usually just links to the same image
			const newMarkdown = `![${alt}](${localPath})`;
			content = content.replace(fullMatch, newMarkdown);
			changes++;
		} catch (err) {
			console.error(`  FAIL: ${imgUrl.substring(0, 60)} — ${err.message}`);
		}
	}

	// Process standalone images
	for (const match of matches) {
		const [fullMatch, alt, imgUrl] = match;
		imgIndex++;

		// Skip if this was already handled as a linked image
		if (!content.includes(fullMatch)) continue;
		// Skip blob: URLs
		if (imgUrl.startsWith('blob:')) {
			console.log(`  SKIP (blob URL): ${imgUrl.substring(0, 60)}`);
			continue;
		}
		// Skip non-image URLs that slipped through
		if (!imgUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i)) continue;

		const origFilename = urlToFilename(imgUrl, imgIndex);
		const origExt = extname(origFilename).toLowerCase();
		const isGif = origExt === '.gif';
		const destFilename = isGif ? origFilename : origFilename.replace(/\.[^.]+$/, '.webp');
		const destPath = join(imgDir, destFilename);
		const localPath = `/images/blog/${slug}/${destFilename}`;

		try {
			try {
				await stat(destPath);
				console.log(`  SKIP (exists): ${destFilename}`);
			} catch {
				console.log(`  Downloading: ${imgUrl.substring(0, 80)}...`);
				const tmpPath = join(imgDir, origFilename);
				await downloadFile(imgUrl, tmpPath);

				if (!isGif) {
					await sharp(tmpPath).webp({ quality: 80 }).toFile(destPath);
					if (origFilename !== destFilename) {
						const { unlink } = await import('fs/promises');
						await unlink(tmpPath);
					}
				}
			}

			content = content.replace(fullMatch, `![${alt}](${localPath})`);
			changes++;
		} catch (err) {
			console.error(`  FAIL: ${imgUrl.substring(0, 60)} — ${err.message}`);
		}
	}

	if (changes > 0) {
		await writeFile(filePath, content, 'utf-8');
		console.log(`  ✓ ${basename(filePath)}: ${changes} images localized\n`);
	}

	return changes;
}

async function main() {
	console.log('=== Localizing External Images ===\n');

	const files = await readdir(BLOG_DIR);
	const mdFiles = files.filter((f) => f.endsWith('.md') || f.endsWith('.mdx')).sort();

	let totalChanges = 0;
	for (const file of mdFiles) {
		const changes = await processFile(join(BLOG_DIR, file));
		totalChanges += changes;
	}

	console.log(`\n--- Summary ---`);
	console.log(`Total images localized: ${totalChanges}`);
}

main().catch(console.error);
