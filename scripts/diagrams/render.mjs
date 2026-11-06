#!/usr/bin/env node
// Renders a post's diagrams from scripts/diagrams/<slug>/*.mjs.
//
//   npm run diagrams -- <slug>                     writes public/images/blog/<slug>/<name>.svg + .phone.svg
//   npm run diagrams -- <slug> --preview <file>    writes a review page with every figure at both sizes
//
// A figure file exports `alt` (the post's alt text), and `desktop` and `phone`,
// each { height, draw(f) }. Fails when any text overflows its box or the canvas.

import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { createFigure, DESKTOP_WIDTH, PHONE_WIDTH } from './draw.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');

const [slug, flag, previewPath] = process.argv.slice(2);
if (!slug || (flag && (flag !== '--preview' || !previewPath))) {
	console.error('Usage: npm run diagrams -- <slug> [--preview <file.html>]');
	process.exit(2);
}

const figureDir = path.join(here, slug);
const names = readdirSync(figureDir)
	.filter((file) => file.endsWith('.mjs'))
	.map((file) => file.replace(/\.mjs$/, ''))
	.sort();

const LAYOUTS = [
	['desktop', DESKTOP_WIDTH, ''],
	['phone', PHONE_WIDTH, '.phone'],
];

let problems = 0;
const rendered = [];
for (const name of names) {
	const figure = await import(pathToFileURL(path.join(figureDir, `${name}.mjs`)).href);
	for (const key of ['alt', 'desktop', 'phone']) {
		if (!figure[key]) throw new Error(`${slug}/${name}.mjs exports no ${key}`);
	}
	const svgs = {};
	for (const [layout, width, suffix] of LAYOUTS) {
		const f = createFigure({
			id: `${slug}-${name}-${layout}`,
			width,
			height: figure[layout].height,
		});
		figure[layout].draw(f);
		for (const issue of f.issues) {
			console.error(`${slug}/${name} ${layout}: ${issue}`);
			problems++;
		}
		svgs[layout] = f.toString(figure.alt);
		if (!flag) {
			const out = path.join(root, 'public/images/blog', slug, `${name}${suffix}.svg`);
			mkdirSync(path.dirname(out), { recursive: true });
			writeFileSync(out, svgs[layout]);
		}
	}
	rendered.push({ name, alt: figure.alt, ...svgs });
}

if (flag) {
	writeFileSync(previewPath, previewPage(slug, rendered));
	console.log(`Preview: ${previewPath}`);
} else {
	console.log(`Rendered ${rendered.length} figures to public/images/blog/${slug}/`);
}
if (problems) {
	console.error(`${problems} layout problem(s): move or resize the parts named above.`);
	process.exit(1);
}

function previewPage(title, figures) {
	const sections = figures
		.map(
			(fig) => `<section><h2>${fig.name}</h2><p class="alt">${fig.alt}</p><div class="views">
<figure class="wide">${fig.desktop}<figcaption>Desktop and iPad, 640px post column</figcaption></figure>
<figure class="phone">${fig.phone}<figcaption>Phone, 343px</figcaption></figure></div></section>`,
		)
		.join('\n');
	return `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} diagrams</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Fraunces:opsz,wght@9..144,400..700&family=Hanken+Grotesk:wght@400;600;700&family=JetBrains+Mono&display=swap">
<style>
:root { color-scheme: dark; }
body { margin: 0; background: #000; color: #ededed; font: 18px/1.6 Fraunces, Georgia, serif; }
main { max-width: 1080px; margin: 0 auto; padding: 48px max(16px, env(safe-area-inset-left, 0px)) 96px; }
h1, h2 { font-family: Anton, Impact, sans-serif; font-weight: 400; text-transform: uppercase; line-height: 1; margin: 0; }
h1 { font-size: clamp(2.5rem, 2rem + 3vw, 4rem); }
h2 { font-size: 2rem; margin-top: 80px; }
.alt { max-width: 40em; color: #a3a3a3; font: 15px/1.5 'Hanken Grotesk', sans-serif; }
.views { display: flex; flex-wrap: wrap; gap: 32px; align-items: flex-start; }
figure { margin: 0; display: grid; gap: 8px; min-width: 0; }
.wide { flex: 1 1 520px; max-width: 640px; } .phone { flex: 0 1 343px; }
svg { display: block; width: 100%; height: auto; }
figcaption { font: 14px 'Hanken Grotesk', sans-serif; color: #a3a3a3; }
/* The same boil as the site (motion.css), so a preview moves like the post will */
@keyframes boil { 0% { filter: url(#boil-1); } 33.333% { filter: url(#boil-2); } 66.666% { filter: url(#boil-3); } }
@media (prefers-reduced-motion: no-preference) {
	figure :is(.d-flow, .d-callout, .d-paper) { animation: boil 0.5s steps(1, end) infinite; }
}
</style>
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${[1, 2, 3]
		.map(
			(seed) =>
				`<filter id="boil-${seed}" x="-25%" y="-25%" width="150%" height="150%"><feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="1" seed="${seed * 11}" result="w"/><feDisplacementMap in="SourceGraphic" in2="w" scale="5"/></filter>`,
		)
		.join('')}</defs></svg>
<main><h1>${title}</h1>
${sections}
</main>`;
}
