#!/usr/bin/env node
/**
 * Copy a research paper into the site as /papers/<slug>/ (DECISIONS.md, 2026-11-22).
 *
 *   node scripts/sync-paper.mjs ~/Documents/dev/joe/punc/paper sentence-length-punctuation
 *
 * The paper's own folder is the source of truth: draft.md, metadata.yaml, references.bib, the
 * CSL style, paper.lua, its figures and the built paper.pdf. Pandoc renders the body with the
 * same filter, bibliography and style as the PDF, so the page and the PDF cite identically;
 * paper-site.lua then points figures at WebP copies and numbers the captions. The body is
 * written as one block of HTML (no blank lines, so Markdown passes it through untouched), and
 * rehype-paper-citations.mjs turns its citations into margin notes at build time.
 *
 * Rerun after every change to the draft. Fields the site owns (displayTitle, seoTitle,
 * description, published, blogPost) are kept from the existing page.
 */
import { execFileSync } from 'node:child_process';
import {
	copyFileSync,
	existsSync,
	mkdirSync,
	readFileSync,
	statSync,
	writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { parse, stringify } from 'yaml';

const [paperDir, slug] = process.argv.slice(2);
if (!paperDir || !slug) {
	console.error('usage: node scripts/sync-paper.mjs <paper-dir> <slug>');
	process.exit(1);
}
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.resolve(paperDir);
const meta = parse(readFileSync(path.join(src, 'metadata.yaml'), 'utf8'));
const target = path.join(root, 'src/content/papers', `${slug}.md`);
const assets = path.join(root, 'public/papers', slug);
mkdirSync(path.dirname(target), { recursive: true });
mkdirSync(assets, { recursive: true });

const pandoc = (...args) =>
	execFileSync(
		'pandoc',
		[
			'draft.md',
			'--from=markdown+autolink_bare_uris',
			'--metadata-file=metadata.yaml',
			`--metadata=site-slug:${slug}`,
			'--lua-filter=paper.lua',
			`--lua-filter=${path.join(root, 'scripts/paper-site.lua')}`,
			'--citeproc',
			'--wrap=none',
			...args,
		],
		{ cwd: src, encoding: 'utf8' },
	);

// Markdown would end an HTML block at a blank line and read 4-space indents as code
const body = pandoc('--to=html5', '--number-sections', '--math-method=mathml')
	.split('\n')
	.filter((line) => line.trim())
	.map((line) => line.trimStart())
	.join('\n');
// paper.lua moves the abstract, plus a keywords line, into the metadata; the page sets keywords itself
const templateFile = path.join(assets, '.abstract-template.html');
writeFileSync(templateFile, '$abstract$');
const abstract = pandoc('--to=html5', `--template=${templateFile}`)
	.replace(/<p><strong>Keywords:<\/strong>.*?<\/p>/s, '')
	.trim();
execFileSync('rm', [templateFile]);

const plain = (html) =>
	html
		.replace(/<[^>]+>/g, '')
		.replace(/&amp;/g, '&')
		.replace(/\s+/g, ' ')
		.trim();
const references = [
	...body.matchAll(/<div id="ref-[^"]+" class="csl-entry"[^>]*>(.*?)<\/div>/gs),
].map((m) => plain(m[1]));
if (!references.length)
	throw new Error('no references rendered: is citeproc finding references.bib?');

// Figures as WebP (the site's image rule), the PDF under the paper's own URL
for (const [, name] of body.matchAll(/src="\/papers\/[^/]+\/([^"]+)\.webp"/g)) {
	const png = path.join(src, `${name}.png`);
	if (!existsSync(png)) throw new Error(`${name}.png is missing from ${src}`);
	await sharp(png)
		.webp({ quality: 90 })
		.toFile(path.join(assets, `${name}.webp`));
}
const pdf = path.join(assets, `${slug}.pdf`);
copyFileSync(path.join(src, 'paper.pdf'), pdf);

const kept = existsSync(target)
	? parse(readFileSync(target, 'utf8').split(/^---$/m)[1])
	: { published: new Date().toISOString().slice(0, 10) };
const firstSentences = plain(abstract).match(/^(.{60,300}?[.?!])\s/)?.[1] ?? plain(abstract);
const frontmatter = {
	title: meta.title,
	displayTitle: kept.displayTitle ?? meta.title,
	...(kept.seoTitle && { seoTitle: kept.seoTitle }),
	description: kept.description ?? firstSentences,
	authors: meta.author.map(({ name, affiliation, orcid }) => ({
		name,
		...(affiliation && { affiliation }),
		...(orcid && { orcid }),
	})),
	published: kept.published,
	revised: new Date(`${meta.date} UTC`).toISOString().slice(0, 10),
	version: meta.version,
	keywords: meta.keywords,
	...(meta.doi && { doi: meta.doi }),
	...(meta.repository && { repository: meta.repository }),
	...(kept.blogPost && { blogPost: kept.blogPost }),
	pdf: `/papers/${slug}/${slug}.pdf`,
	pdfBytes: statSync(pdf).size,
	abstract,
	references,
};
writeFileSync(target, `---\n${stringify(frontmatter, { lineWidth: 0 })}---\n\n${body}\n`);
// In the repo's own style, so the pre-commit hook has nothing to change
execFileSync('npx', ['prettier', '--write', target], { cwd: root, stdio: 'ignore' });
console.log(`wrote ${path.relative(root, target)} and ${path.relative(root, assets)}/`);
