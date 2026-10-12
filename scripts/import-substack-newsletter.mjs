#!/usr/bin/env node
/**
 * Imports Joe's Substack newsletter archive (TL;DR in Tech) into
 * src/content/newsletter/. One-off migration (2026-10-12) when the newsletter
 * moved from Substack to self-hosted listmonk; kept so a re-run is reproducible.
 *
 * Input is an unzipped Substack export (Settings > Exports): posts.csv plus
 * posts/<id>.<slug>.html. For each published post whose title is not already a
 * blog post (8 of the essays were crossposted to the blog long ago) this writes
 * src/content/newsletter/<slug>.md and downloads its images to
 * public/images/newsletter/<slug>/ as WebP (GIFs stay GIFs).
 *
 * Substack-only markup is dropped (subscribe widgets, share/subscribe buttons,
 * image expand buttons); tweets become a quote with a link, YouTube embeds a link.
 * Images without alt text get an empty alt and are listed at the end so they can
 * be described by hand.
 *
 * Usage:
 *   node scripts/import-substack-newsletter.mjs <export-dir> [--dry-run] [--force]
 *
 * --force overwrites issues that already exist, discarding hand edits.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import TurndownService from 'turndown';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT_DIR = path.join(ROOT, 'src/content/newsletter');
const BLOG_DIR = path.join(ROOT, 'src/content/blog');
const IMG_DIR = path.join(ROOT, 'public/images/newsletter');
const UA =
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
// Same defaults as convert-images-to-webp.mjs
const QUALITY = 82;
const MAX_WIDTH = 1920;
// Not newsletter content: a launch placeholder.
const SKIP_TITLES = new Set(['coming soon']);

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const force = args.includes('--force');
const exportDir = args.find((a) => !a.startsWith('--'));
if (!exportDir) {
	console.error(
		'Usage: node scripts/import-substack-newsletter.mjs <export-dir> [--dry-run] [--force]',
	);
	process.exit(1);
}

// Minimal RFC 4180 CSV parser (titles contain commas and quotes)
function parseCsv(text) {
	const rows = [];
	let row = [];
	let field = '';
	let quoted = false;
	for (let i = 0; i < text.length; i++) {
		const c = text[i];
		if (quoted) {
			if (c === '"' && text[i + 1] === '"') {
				field += '"';
				i++;
			} else if (c === '"') quoted = false;
			else field += c;
		} else if (c === '"') quoted = true;
		else if (c === ',') {
			row.push(field);
			field = '';
		} else if (c === '\n' || c === '\r') {
			if (c === '\r' && text[i + 1] === '\n') i++;
			row.push(field);
			rows.push(row);
			row = [];
			field = '';
		} else field += c;
	}
	if (field || row.length) rows.push([...row, field]);
	const [header, ...body] = rows.filter((r) => r.some((f) => f !== ''));
	return body.map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ''])));
}

const clean = (s) =>
	s
		// STYLE_GUIDE: no em dashes
		.replace(/\s*[—–]\s*/g, ' - ')
		.replace(/[‘’]/g, "'")
		.replace(/[“”]/g, '"')
		.replace(/ /g, ' ')
		.trim();
const normTitle = (s) =>
	clean(s)
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, ' ')
		.trim();
const yamlStr = (s) => JSON.stringify(s);

function attrs(node) {
	try {
		return JSON.parse(node.getAttribute('data-attrs') || '{}');
	} catch {
		return {};
	}
}

function hasClass(node, cls) {
	return node.nodeType === 1 && (node.getAttribute('class') || '').split(/\s+/).includes(cls);
}

function toMarkdown(html, images) {
	const td = new TurndownService({
		headingStyle: 'atx',
		codeBlockStyle: 'fenced',
		bulletListMarker: '-',
		emDelimiter: '_',
	});
	td.remove(['button', 'svg', 'form', 'input', 'script', 'style', 'source']);
	td.remove(
		(node) =>
			hasClass(node, 'subscription-widget-wrap-editor') ||
			hasClass(node, 'image-link-expand') ||
			(node.nodeName === 'A' && hasClass(node, 'button')),
	);
	td.addRule('tweet', {
		filter: (node) => hasClass(node, 'twitter-embed'),
		replacement: (_c, node) => {
			const a = attrs(node);
			if (!a.url) return '';
			const text = clean((a.full_text || '').replace(/\s*https:\/\/t\.co\/\S+/g, ''));
			return `\n\n> ${text || 'Tweet'}\n>\n> [${a.name ? clean(a.name) : 'Tweet'} on Twitter](${a.url})\n\n`;
		},
	});
	td.addRule('youtube', {
		filter: (node) => hasClass(node, 'youtube-wrap'),
		replacement: (_c, node) => {
			const id = attrs(node).videoId;
			return id ? `\n\n[Watch on YouTube](https://www.youtube.com/watch?v=${id})\n\n` : '';
		},
	});
	td.addRule('figure', {
		filter: 'figure',
		replacement: (_c, node) => {
			const img = node.querySelector('img');
			if (!img) return '';
			const src = img.getAttribute('src');
			if (!src) return '';
			const caption = clean(node.querySelector('figcaption')?.textContent || '');
			let alt = clean(img.getAttribute('alt') || '');
			// Filenames and placeholders are not alt text
			if (/^(image|\.\/.*|.*\.(png|jpe?g|gif|webp))$/i.test(alt)) alt = '';
			if (!alt && caption) alt = caption;
			const local = images.add(src, alt);
			const md = `![${alt.replace(/[[\]]/g, '')}](${local})`;
			return `\n\n${md}${caption ? `\n\n_${caption}_` : ''}\n\n`;
		},
	});
	// Turndown pads markers ("1.  x") and indents by 4; markdownlint wants "1. x"
	td.addRule('listItem', {
		filter: 'li',
		replacement: (content, node) => {
			const parent = node.parentNode;
			const marker =
				parent.nodeName === 'OL'
					? `${Number(parent.getAttribute('start') ?? 1) + [...parent.childNodes].filter((n) => n.nodeName === 'LI').indexOf(node)}.`
					: '-';
			const indent = ' '.repeat(marker.length + 1);
			const body = content.replace(/^\n+/, '').replace(/\n+$/, '').replace(/\n/g, `\n${indent}`);
			return `${marker} ${body}${node.nextSibling ? '\n' : ''}`;
		},
	});
	td.addRule('pre', {
		filter: 'pre',
		replacement: (_c, node) => {
			const code = node.querySelector('code') ?? node;
			const lang = (code.getAttribute('class') ?? '').match(/language-([\w-]+)/)?.[1] ?? '';
			return `\n\n\`\`\`${lang}\n${code.textContent.replace(/\n$/, '')}\n\`\`\`\n\n`;
		},
	});
	// Substack's "By: <author>" lines are <h5>; keep them as plain emphasis
	td.addRule('byline', {
		filter: 'h5',
		replacement: (content) => `\n\n_${content.trim()}_\n\n`,
	});
	let md = td.turndown(html);

	// Shift headings so the shallowest one is h2 (the page title is the h1)
	const levels = [...md.matchAll(/^(#{1,6}) /gm)].map((m) => m[1].length);
	const shift = levels.length ? Math.min(...levels) - 2 : 0;
	if (shift !== 0) {
		md = md.replace(/^(#{1,6}) /gm, (_m, h) => '#'.repeat(Math.max(2, h.length - shift)) + ' ');
	}
	return (
		clean(md)
			// Substack link tracking
			.replace(/(\]\(https?:\/\/[^)\s]*?)\?utm_[^)\s]*/g, '$1')
			.replace(/\n{3,}/g, '\n\n') + '\n'
	);
}

function imageName(src, used) {
	const raw = decodeURIComponent(path.basename(new URL(src).pathname));
	const ext = (raw.match(/\.([a-z0-9]+)$/i)?.[1] ?? '').toLowerCase();
	const base =
		raw
			.replace(/\.[a-z0-9]+$/i, '')
			.toLowerCase()
			.replace(/^[0-9a-f-]{20,}_?/, '')
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '')
			.slice(0, 50)
			// Substack names uploads after their size ("1024x640")
			.replace(/^\d+x\d+$/, '') || 'image';
	let name = base;
	for (let n = 2; used.has(name); n++) name = `${base}-${n}`;
	used.add(name);
	return { name, gif: ext === 'gif' };
}

// Substack wraps originals in its image CDN; the S3 original is the last URL segment
function originalUrl(src) {
	const m = src.match(/https?%3A%2F%2F.+$/);
	return m ? decodeURIComponent(m[0]) : src;
}

async function download(src, dest, gif) {
	const res = await fetch(src, { headers: { 'User-Agent': UA } });
	if (!res.ok) throw new Error(`${res.status} fetching ${src}`);
	const buf = Buffer.from(await res.arrayBuffer());
	if (gif) {
		fs.writeFileSync(dest, buf);
		return;
	}
	await sharp(buf)
		.resize({ width: MAX_WIDTH, withoutEnlargement: true })
		.webp({ quality: QUALITY })
		.toFile(dest);
}

const posts = parseCsv(fs.readFileSync(path.join(exportDir, 'posts.csv'), 'utf8'));
const htmlFiles = fs.readdirSync(path.join(exportDir, 'posts')).filter((f) => f.endsWith('.html'));
const blogTitles = new Set(
	fs
		.readdirSync(BLOG_DIR)
		.map(
			(f) => fs.readFileSync(path.join(BLOG_DIR, f), 'utf8').match(/^title:\s*(.+)$/m)?.[1] ?? '',
		)
		.map((t) => normTitle(t.replace(/^["']|["']$/g, ''))),
);

const missingAlt = [];
const failed = [];
let written = 0;
let skipped = 0;
fs.mkdirSync(OUT_DIR, { recursive: true });

for (const post of posts.sort((a, b) => a.post_date.localeCompare(b.post_date))) {
	const title = clean(post.title);
	if (post.is_published !== 'true' || SKIP_TITLES.has(title.toLowerCase())) continue;
	if (blogTitles.has(normTitle(title))) {
		console.log(`skip (already on the blog): ${title}`);
		skipped++;
		continue;
	}
	const file = htmlFiles.find((f) => f.startsWith(`${post.post_id}.`));
	if (!file) {
		failed.push(`${title}: no HTML file`);
		continue;
	}
	const slug = file.replace(/^\d+\./, '').replace(/\.html$/, '');
	const outFile = path.join(OUT_DIR, `${slug}.md`);
	if (fs.existsSync(outFile) && !force) {
		console.log(`exists, skipping: ${slug}`);
		continue;
	}

	const used = new Set();
	const pending = [];
	const images = {
		add(src, alt) {
			const { name, gif } = imageName(originalUrl(src), used);
			const fileName = `${name}.${gif ? 'gif' : 'webp'}`;
			pending.push({ src: originalUrl(src), dest: path.join(IMG_DIR, slug, fileName), gif });
			if (!alt) missingAlt.push(`${slug}: ${fileName}`);
			return `/images/newsletter/${slug}/${fileName}`;
		},
	};
	const body = toMarkdown(fs.readFileSync(path.join(exportDir, 'posts', file), 'utf8'), images);
	const issue = title.match(/issue\s*#?\s*(\d+)\b/i)?.[1];
	const front = [
		'---',
		`title: ${yamlStr(title)}`,
		`date: ${post.post_date.slice(0, 10)}`,
		`slug: ${yamlStr(slug)}`,
		post.subtitle ? `description: ${yamlStr(clean(post.subtitle))}` : null,
		issue ? `issue: ${issue}` : null,
		`substackUrl: ${yamlStr(`https://joekarlsson.substack.com/p/${slug}`)}`,
		'---',
		'',
	]
		.filter((l) => l !== null)
		.join('\n');

	if (dryRun) {
		console.log(`would write ${slug} (${pending.length} images)`);
		written++;
		continue;
	}
	for (const img of pending) {
		fs.mkdirSync(path.dirname(img.dest), { recursive: true });
		try {
			await download(img.src, img.dest, img.gif);
		} catch (e) {
			failed.push(`${slug}: ${e.message}`);
		}
	}
	fs.writeFileSync(outFile, front + '\n' + body);
	written++;
}

console.log(
	`\n${dryRun ? 'would write' : 'wrote'} ${written}, skipped ${skipped} already on the blog`,
);
if (missingAlt.length)
	console.log(`\nimages needing alt text (${missingAlt.length}):\n  ${missingAlt.join('\n  ')}`);
if (failed.length) {
	console.log(`\nfailures (${failed.length}):\n  ${failed.join('\n  ')}`);
	process.exitCode = 1;
}
