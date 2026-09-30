#!/usr/bin/env node
/**
 * Crossposts Joe's CData blog articles into src/content/blog/.
 *
 * cdata.com sits behind a Cloudflare managed challenge, so curl and WebFetch
 * get a 403 or a paraphrase. Headless system Chrome (channel: 'chrome') passes
 * it; Playwright's bundled headless shell may not be installed, so don't use it.
 *
 * For each post on the author page whose URL isn't already some post's
 * canonicalUrl, this writes src/content/blog/{slug}.md with canonicalUrl and
 * contentNotice set, and downloads every image (hero included) to
 * public/images/blog/{slug}/ as WebP. Frontmatter fields that need judgment
 * (categories, heroAlt, tldr) get defaults for the /import-cdata-posts skill
 * to refine.
 *
 * Usage:
 *   node scripts/import-cdata-posts.mjs [--dry-run] [--author joe-karlsson]
 *   node scripts/import-cdata-posts.mjs [--force] <post-url>...
 *
 * --force overwrites an existing crosspost of the same URL, discarding any hand
 * edits to it. It only works with explicit URLs.
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import TurndownService from 'turndown';
import { tables } from 'turndown-plugin-gfm';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const BLOG_DIR = path.join(ROOT, 'src/content/blog');
const IMG_DIR = path.join(ROOT, 'public/images/blog');
const ORIGIN = 'https://www.cdata.com';
const UA =
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
// Same defaults as convert-images-to-webp.mjs
const QUALITY = 82;
const MAX_WIDTH = 1920;

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const force = args.includes('--force');
const authorIdx = args.indexOf('--author');
const author = authorIdx >= 0 ? args[authorIdx + 1] : 'joe-karlsson';
const explicitUrls = args.filter((a, i) => a.startsWith('http') && args[i - 1] !== '--author');
if (force && !explicitUrls.length) {
	// Existing crossposts carry hand edits (tldr, voice fixes); never clobber them in bulk
	console.error('--force needs explicit post URLs');
	process.exit(2);
}

/** canonicalUrl -> file, for every existing post */
function existingCanonicals() {
	const map = new Map();
	for (const f of fs.readdirSync(BLOG_DIR)) {
		if (!f.endsWith('.md')) continue;
		const m = fs
			.readFileSync(path.join(BLOG_DIR, f), 'utf8')
			.match(/^canonicalUrl:\s*['"]?([^'"\n]+)/m);
		if (m) map.set(normalizeUrl(m[1]), f);
	}
	return map;
}

function normalizeUrl(u) {
	return u
		.trim()
		.replace(/[?#].*$/, '')
		.replace(/\/+$/, '');
}

async function openPage(page, url) {
	await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
	for (let i = 0; i < 30 && (await page.title()).includes('Just a moment'); i++) {
		await page.waitForTimeout(1000);
	}
	if ((await page.title()).includes('Just a moment')) {
		throw new Error(`Stuck on Cloudflare challenge: ${url}`);
	}
}

async function listAuthorPosts(page) {
	await openPage(page, `${ORIGIN}/blog/author/${author}/?pageSize=48`);
	await page.waitForSelector('.blog-cta a', { timeout: 30000 });
	const hrefs = await page.$$eval('.blog-cta a', (as) => as.map((a) => a.href));
	return [...new Set(hrefs.map(normalizeUrl))];
}

async function scrapePost(page, url) {
	await openPage(page, url);
	await page.waitForSelector('#articleContentMain', { timeout: 30000 });
	return page.evaluate(() => {
		const meta = (sel) => document.querySelector(sel)?.getAttribute('content') ?? '';
		const hero = document.querySelector('.article-hero-img img');
		const body = document.querySelector('#articleContentMain').cloneNode(true);
		body
			.querySelectorAll('script, style, noscript, iframe, form, button, colgroup')
			.forEach((n) => n.remove());
		const unwrap = (el) => el.replaceWith(...el.childNodes);
		const squash = (s) => s.replace(/\s+/g, ' ').trim();
		const text = (el) => squash(el?.textContent ?? '');

		// Link titles are just the hostname; click-to-zoom links wrap images
		body.querySelectorAll('[title]').forEach((el) => el.removeAttribute('title'));
		body.querySelectorAll('a:has(> img)').forEach(unwrap);
		body.querySelectorAll('span').forEach(unwrap);

		// Figures: authors paste the real image description as a paragraph under
		// the image (after any italic caption) and leave alt as a stub like
		// "nm problem". Move that paragraph into alt; drop it if it repeats alt.
		body.querySelectorAll('figure').forEach((fig) => {
			const img = fig.querySelector('img');
			const alt = squash(img?.alt ?? '');
			const cap = fig.querySelector('figcaption');
			if (cap && text(cap) !== alt) {
				const em = document.createElement('em');
				em.append(...cap.childNodes);
				const p = document.createElement('p');
				p.append(em);
				fig.after(p);
			}
			cap?.remove();
			const isCaption = (p) =>
				p.firstElementChild?.matches('em, i') &&
				text(p.firstElementChild) === text(p).slice(0, text(p.firstElementChild).length);
			let next = fig.nextElementSibling;
			while (next?.tagName === 'P' && (!text(next) || isCaption(next)))
				next = next.nextElementSibling;
			if (next?.tagName !== 'P' || !img) return;
			if (text(next) === alt) {
				next.remove();
			} else if (
				alt.split(' ').length <= 6 &&
				text(next).length > 40 &&
				!next.querySelector('a, strong, b, code')
			) {
				img.alt = text(next);
				next.remove();
			}
		});
		body.querySelectorAll('p').forEach((p) => {
			if (!text(p) && !p.querySelector('img')) p.remove();
		});

		// Tables: header row lives in <tbody> as <td>s; cells wrap text in <p>
		body.querySelectorAll('table').forEach((table) => {
			table.querySelectorAll('[style]').forEach((el) => el.removeAttribute('style'));
			table.querySelectorAll('td p, th p').forEach((p) => {
				if (p.nextElementSibling) p.after(document.createElement('br'));
				unwrap(p);
			});
			if (!table.querySelector('th')) {
				const first = table.querySelector('tr');
				const thead = document.createElement('thead');
				first.querySelectorAll('td').forEach((td) => {
					const th = document.createElement('th');
					th.append(...td.childNodes);
					td.replaceWith(th);
				});
				thead.append(first);
				table.prepend(thead);
			}
		});

		// Tight lists: <li><p>x</p></li> -> <li>x</li>
		body.querySelectorAll('li > p:only-child').forEach(unwrap);

		// FAQ accordions -> bold question + answer, collected for the faq schema
		const faq = [];
		body.querySelectorAll('details').forEach((d) => {
			const question = text(d.querySelector('summary'));
			d.querySelector('summary')?.remove();
			const answer = text(d);
			if (question && answer) faq.push({ question, answer });
			const q = document.createElement('p');
			q.append(document.createElement('strong'));
			q.firstChild.textContent = question;
			const inner = d.querySelector('[data-type="detailsContent"]') ?? d;
			d.replaceWith(q, ...inner.childNodes);
		});

		return {
			faq,
			title: document.querySelector('h1')?.textContent.trim() ?? meta('meta[property="og:title"]'),
			date: document.querySelector('.blogDate')?.textContent.trim() ?? '',
			updated: document.querySelector('.blogUpdated')?.textContent.trim() ?? '',
			description: meta('meta[name="description"]'),
			heroSrc: hero?.src ?? meta('meta[property="og:image"]'),
			heroAlt: hero?.alt ?? '',
			tags: [...document.querySelectorAll('.articleTags a')].map((a) => a.textContent.trim()),
			html: body.innerHTML,
		};
	});
}

function toMarkdown(html) {
	const td = new TurndownService({
		headingStyle: 'atx',
		codeBlockStyle: 'fenced',
		bulletListMarker: '-',
		emDelimiter: '_',
	});
	td.use(tables);
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
	// CMS wraps code in <pre><code class="language-x"> or bare <pre>
	td.addRule('pre', {
		filter: 'pre',
		replacement: (_c, node) => {
			const code = node.querySelector('code') ?? node;
			const lang = (code.getAttribute('class') ?? '').match(/language-([\w-]+)/)?.[1] ?? '';
			return `\n\n\`\`\`${lang}\n${code.textContent.replace(/\n$/, '')}\n\`\`\`\n\n`;
		},
	});
	let md = td.turndown(html);

	// Shift headings so the shallowest one is h2 (the page title is the h1)
	const levels = [...md.matchAll(/^(#{1,6}) /gm)].map((m) => m[1].length);
	const shift = levels.length ? Math.min(...levels) - 2 : 0;
	if (shift !== 0) {
		md = md.replace(/^(#{1,6}) /gm, (_m, h) => '#'.repeat(Math.max(2, h.length - shift)) + ' ');
	}

	return (
		md
			// STYLE_GUIDE: no em dashes
			.replace(/\s*—\s*/g, ' - ')
			.replace(/[‘’]/g, "'")
			.replace(/[“”]/g, '"')
			.replace(/ /g, ' ')
			// Relative CData links -> absolute
			.replace(/\]\(\/(?!\/)/g, `](${ORIGIN}/`)
			.replace(/\n{3,}/g, '\n\n')
			.trim() + '\n'
	);
}

function imageName(src, used) {
	const base =
		path
			.basename(new URL(src).pathname)
			.replace(/\.[a-z0-9]+$/i, '')
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '') || 'image';
	let name = base;
	for (let n = 2; used.has(name); n++) name = `${base}-${n}`;
	used.add(name);
	return `${name}.webp`;
}

async function downloadWebp(src, dest) {
	const res = await fetch(src, { headers: { 'User-Agent': UA } });
	if (!res.ok) throw new Error(`${res.status} fetching ${src}`);
	let img = sharp(Buffer.from(await res.arrayBuffer()));
	const { width } = await img.metadata();
	if (width && width > MAX_WIDTH) img = img.resize({ width: MAX_WIDTH });
	await img.webp({ quality: QUALITY }).toFile(dest);
}

const tidy = (s) =>
	String(s)
		.replace(/\s*—\s*/g, ' - ')
		.replace(/[\u2018\u2019]/g, "'")
		.replace(/[\u201C\u201D]/g, '"')
		.replace(/\u00A0/g, ' ');
const yaml = (s) => `'${tidy(s).replace(/'/g, "''")}'`;

function toIsoDate(s) {
	const d = new Date(`${s} UTC`);
	return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
}

async function importPost(page, url, existingFile) {
	const post = await scrapePost(page, url);
	// A re-import keeps the local slug, which may differ from CData's
	const slug =
		existingFile?.replace(/\.md$/, '') ?? new URL(url).pathname.split('/').filter(Boolean).pop();
	const mdPath = path.join(BLOG_DIR, `${slug}.md`);
	if (fs.existsSync(mdPath) && !existingFile) {
		throw new Error(`${path.relative(ROOT, mdPath)} exists but has a different canonicalUrl`);
	}
	const imgDir = path.join(IMG_DIR, slug);
	const webPath = (f) => `/images/blog/${slug}/${f}`;
	let md = toMarkdown(post.html);

	// Body images: download, then repoint. Links whose target is the image itself
	// (CMS click-to-zoom) are unwrapped so they don't point at cms.cdata.com.
	const used = new Set(['hero']);
	const images = [...md.matchAll(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)];
	const downloads = [];
	for (const [whole, alt, src] of images) {
		const abs = new URL(src, ORIGIN).href;
		const file = imageName(abs, used);
		downloads.push([abs, path.join(imgDir, file)]);
		md = md.split(whole).join(`![${alt || post.title}](${webPath(file)})`);
	}
	md = md.replace(/\[(!\[[^\]]*\]\([^)]+\))\]\([^)]+\)/g, '$1');
	if (post.heroSrc) downloads.push([post.heroSrc, path.join(imgDir, 'hero.webp')]);

	const date = toIsoDate(post.date);
	const updated = toIsoDate(post.updated);
	const tags = [
		'cdata',
		...post.tags.map((t) =>
			t
				.toLowerCase()
				.replace(/&/g, 'and')
				.replace(/[^a-z0-9]+/g, '-'),
		),
	];
	const frontmatter = [
		'---',
		`title: ${yaml(post.title)}`,
		`date: ${date}`,
		...(updated && updated !== date ? [`updatedDate: ${updated}`] : []),
		`slug: ${yaml(slug)}`,
		`description: ${yaml(post.description)}`,
		`categories: ['Dev Tools']`,
		`tags: [${[...new Set(tags)].map(yaml).join(', ')}]`,
		...(post.heroSrc
			? [`heroImage: ${yaml(webPath('hero.webp'))}`, `heroAlt: ${yaml(post.heroAlt || post.title)}`]
			: []),
		`canonicalUrl: ${yaml(url)}`,
		...(post.faq.length
			? [
					'faq:',
					...post.faq.flatMap((f) => [
						`  - question: ${yaml(f.question)}`,
						`    answer: ${yaml(f.answer)}`,
					]),
				]
			: []),
		`contentNotice: ${yaml(`Originally published on the [CData blog](${url}).`)}`,
		'---',
		'',
	].join('\n');

	if (dryRun) {
		console.log(`would write ${path.relative(ROOT, mdPath)} (${downloads.length} images)`);
		return;
	}
	fs.mkdirSync(imgDir, { recursive: true });
	for (const [src, dest] of downloads) await downloadWebp(src, dest);
	fs.writeFileSync(mdPath, frontmatter + '\n' + md);
	console.log(`wrote ${path.relative(ROOT, mdPath)} (${downloads.length} images)`);
}

const browser = await chromium.launch({
	headless: true,
	channel: 'chrome',
	args: ['--disable-blink-features=AutomationControlled'],
});
try {
	const page = await browser.newPage({ userAgent: UA });
	const have = existingCanonicals();
	const urls = explicitUrls.length ? explicitUrls.map(normalizeUrl) : await listAuthorPosts(page);
	const todo = urls.filter((u) => force || !have.has(u));
	for (const u of urls.filter((u) => !todo.includes(u))) {
		console.log(`skip ${u} (already ${have.get(u)})`);
	}
	if (!todo.length) console.log('Nothing new to import.');
	let failed = 0;
	for (const u of todo) {
		try {
			await importPost(page, u, have.get(u));
		} catch (err) {
			failed++;
			console.error(`FAILED ${u}: ${err.message}`);
		}
	}
	process.exitCode = failed ? 1 : 0;
} finally {
	await browser.close();
}
