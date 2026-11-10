#!/usr/bin/env node
// Draws a post's animation storyboards as one review page.
//
//   npm run storyboard -- <slug> <out.html>
//
// Each board is scripts/storyboards/<slug>/<name>.mjs (files starting with _ are
// shared helpers). A board exports:
//   board   { title, section, form, claim, trigger, library, still, test }
//   frames  [{ at, note, height?, draw(f), drawB? }]   keyframes, drawn at 640 wide; a frame
//           with drawB loops between its two drawings, to show how a look moves
//   phone   { note, height, draw(f) }          the still phones and reduced motion get, at 360
//   kit     'sketch' for scenes (scripts/storyboards/sketch.mjs: stick figures, props,
//           Joe's scribbles), drawn in board.look or a frame's own look; leave it out for
//           a step-through diagram, drawn with the diagram kit (scripts/diagrams/draw.mjs)
// A board with `pick: true` is a look sheet: one frame drawn several ways for Joe to
// choose from, so it needs only a title, a claim and frames.

import { readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { createFigure, DESKTOP_WIDTH, PHONE_WIDTH } from '../diagrams/draw.mjs';
import { createSketch } from './sketch.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const [slug, outPath] = process.argv.slice(2);
if (!slug || !outPath) {
	console.error('Usage: npm run storyboard -- <slug> <out.html>');
	process.exit(2);
}

const boardDir = path.join(here, slug);
const names = readdirSync(boardDir)
	.filter((file) => file.endsWith('.mjs') && !file.startsWith('_'))
	.map((file) => file.replace(/\.mjs$/, ''))
	.sort();

const BOARD_FIELDS = ['title', 'section', 'form', 'claim', 'trigger', 'library', 'still', 'test'];
const FRAME_HEIGHT = 360;

let problems = 0;
function draw(id, width, height, drawFrame, label, look) {
	const f = look ? createSketch({ id, width, height, look }) : createFigure({ id, width, height });
	drawFrame(f);
	const svg = f.toString(label);
	for (const issue of f.issues) {
		console.error(`${id}: ${issue}`);
		problems++;
	}
	return svg;
}

const boards = [];
for (const name of names) {
	const mod = await import(pathToFileURL(path.join(boardDir, `${name}.mjs`)).href);
	const pick = mod.board?.pick;
	for (const key of pick ? ['board', 'frames'] : ['board', 'frames', 'phone'])
		if (!mod[key]) throw new Error(`${slug}/${name}.mjs exports no ${key}`);
	for (const key of pick ? ['title', 'claim'] : BOARD_FIELDS)
		if (!mod.board[key]) throw new Error(`${slug}/${name}.mjs board has no ${key}`);
	const lookOf = (frame) =>
		mod.kit === 'sketch' ? (frame.look ?? mod.board.look ?? 'crayon') : null;
	const frames = mod.frames.map((frame, i) => ({
		...frame,
		svgB:
			frame.drawB &&
			draw(
				`sb-${slug}-${name}-${i + 1}b`,
				DESKTOP_WIDTH,
				frame.height ?? FRAME_HEIGHT,
				frame.drawB,
				frame.note,
				lookOf(frame),
			),
		svg: draw(
			`sb-${slug}-${name}-${i + 1}`,
			DESKTOP_WIDTH,
			frame.height ?? FRAME_HEIGHT,
			frame.draw,
			frame.note,
			lookOf(frame),
		),
	}));
	const phone = mod.phone && {
		...mod.phone,
		svg: draw(
			`sb-${slug}-${name}-phone`,
			PHONE_WIDTH,
			mod.phone.height,
			mod.phone.draw,
			mod.phone.note,
			lookOf(mod.phone),
		),
	};
	boards.push({ name, ...mod.board, frames, phone });
}

if (problems) {
	console.error(`${problems} layout problem(s): move or resize the parts named above.`);
	process.exit(1);
}
writeFileSync(outPath, page(slug, boards));
console.log(`Storyboard: ${outPath}`);

function escapeHtml(s) {
	return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function page(title, list) {
	const sections = list
		.map((b) => {
			const frames = b.frames
				.map(
					(fr, j) =>
						`<figure><div class="at">${j + 1} · ${escapeHtml(fr.at)}</div>${fr.svgB ? `<div class="flip">${fr.svg}${fr.svgB}</div>` : fr.svg}<figcaption>${escapeHtml(fr.note)}</figcaption></figure>`,
				)
				.join('\n');
			if (b.pick)
				return `<section id="${b.name}">
<p class="kicker">Pick a look</p>
<h2>${escapeHtml(b.title)}</h2>
<p class="claim">${escapeHtml(b.claim)}</p>
<div class="strip">${frames}</div></section>`;
			return `<section id="${b.name}">
<p class="kicker">Board ${list.filter((x) => !x.pick).indexOf(b) + 1} · ${escapeHtml(b.form)} · under “${escapeHtml(b.section)}”</p>
<h2>${escapeHtml(b.title)}</h2>
<p class="claim">${escapeHtml(b.claim)}</p>
<div class="strip">${frames}</div>
<div class="spec">
<figure class="phone"><div class="at">Phone, reduced motion, paused</div>${b.phone.svg}<figcaption>${escapeHtml(b.phone.note)}</figcaption></figure>
<dl>
<dt>Starts when</dt><dd>${escapeHtml(b.trigger)}</dd>
<dt>Built with</dt><dd>${escapeHtml(b.library)}</dd>
<dt>Still</dt><dd>${escapeHtml(b.still)}</dd>
<dt>One-second test</dt><dd>${escapeHtml(b.test)}</dd>
</dl></div></section>`;
		})
		.join('\n');
	return `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)} storyboards</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Fraunces:opsz,wght@9..144,400..700&family=Hanken+Grotesk:wght@400;600;700&family=JetBrains+Mono&display=swap">
<style>
:root { color-scheme: dark; }
body { margin: 0; background: #000; color: #ededed; font: 18px/1.6 Fraunces, Georgia, serif; }
main { max-width: 1280px; margin: 0 auto; padding: 48px 16px 96px; }
h1, h2 { font-family: Anton, Impact, sans-serif; font-weight: 400; text-transform: uppercase; line-height: 1; margin: 0; }
h1 { font-size: clamp(2.5rem, 2rem + 3vw, 4rem); }
h2 { font-size: 2.25rem; margin: 6px 0 8px; }
section { margin-top: 88px; }
.intro, .claim { max-width: 40em; }
.claim { margin: 0 0 24px; }
.kicker, .at, figcaption, dl { font: 15px/1.5 'Hanken Grotesk', sans-serif; }
.kicker { margin: 0; color: #ff4fd8; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; }
.at { color: #ff4fd8; font-weight: 700; }
.strip { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 520px), 1fr)); gap: 28px 24px; }
figure { margin: 0; display: grid; gap: 6px; align-content: start; min-width: 0; }
figcaption { color: #a3a3a3; }
svg { display: block; width: 100%; height: auto; }
.spec { display: flex; flex-wrap: wrap; gap: 32px; margin-top: 36px; padding-top: 24px; border-top: 2px dashed #2a2a2a; }
.phone { flex: 0 1 300px; }
dl { flex: 1 1 380px; margin: 0; display: grid; grid-template-columns: max-content 1fr; gap: 10px 20px; align-content: start; }
dt { color: #a3a3a3; font-weight: 700; } dd { margin: 0; }
/* A frame with two drawings swaps between them on a stepped loop, like stop-motion */
.flip { display: grid; } .flip > svg { grid-area: 1 / 1; }
.flip > svg + svg { visibility: hidden; }
@media (prefers-reduced-motion: no-preference) {
	figure :is(.d-flow, .d-callout, .d-paper) { filter: url(#boil); }
	.flip > svg + svg { animation: flip 0.5s steps(1, end) infinite; }
}
@keyframes flip { 50% { visibility: visible; } }
</style>
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><filter id="boil" x="-25%" y="-25%" width="150%" height="150%"><feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="1" seed="11" result="w"><animate attributeName="seed" values="11;22;33" dur="0.5s" calcMode="discrete" repeatCount="indefinite"/></feTurbulence><feDisplacementMap in="SourceGraphic" in2="w" scale="5"/></filter></defs></svg>
<main><h1>${escapeHtml(title)} storyboards</h1>
<p class="intro">Each board is one moment in the post, drawn as keyframes. Reply by number: approve it, change a frame, or cut it. Approved boards get a one-second test of their hardest effect before the full build.</p>
${sections}
</main>`;
}
