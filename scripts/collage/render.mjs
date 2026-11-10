#!/usr/bin/env node
// Renders a collage scene (scene.json, pasteup's schema; see scripts/collage/collage.cjs).
//
//   node scripts/collage/render.mjs <scene.json> --preview out.html   a page that plays it, to open in a browser
//   node scripts/collage/render.mjs <scene.json> --out clip.mp4       the video (Playwright draws each pose, ffmpeg encodes)
//   node scripts/collage/render.mjs <scene.json> --still out.png      the finished frame: the still for phones and reduced motion
//   node scripts/collage/render.mjs <scene.json> --post public/images/blog/<slug>/<name>
//       a post's copy: <name>.svg, animated inline with no video player, and its cut-outs beside it
//       as <name>-<element>.webp (scripts/collage/svg.mjs). The post references <name>.svg.
//
// Element images are paths relative to the scene file. Label fonts load from Google Fonts by
// family name (label.font_family), the same families the site uses.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

import { chromium } from 'playwright';

import { writePostSvg } from './svg.mjs';

const { values, positionals } = parseArgs({
	allowPositionals: true,
	options: {
		out: { type: 'string' },
		still: { type: 'string' },
		preview: { type: 'string' },
		post: { type: 'string' },
	},
});
const scenePath = positionals[0] && path.resolve(positionals[0]);
if (!scenePath || !(values.out || values.still || values.preview || values.post)) {
	console.error(
		'Usage: node scripts/collage/render.mjs <scene.json> [--preview out.html] [--out clip.mp4] [--still out.png] [--post public/images/blog/<slug>/<name>]',
	);
	process.exit(2);
}
const scene = JSON.parse(fs.readFileSync(scenePath, 'utf8'));
const engine = fs.readFileSync(new URL('./collage.cjs', import.meta.url), 'utf8');
const fps = scene.canvas.fps ?? 24;

const family = scene.label?.font_family?.split(',')[0].replace(/['"]/g, '').trim();
const fontLink = family
	? `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}&display=block">`
	: '';
// Plays once, holds the finished frame, then loops; under reduced motion it shows the finished frame only
const page = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${path.basename(path.dirname(scenePath))} collage</title>${fontLink}
<style>html,body{margin:0;height:100%;background:#000;display:grid;place-items:center}canvas{max-width:100vw;max-height:100vh;display:block}</style>
<canvas id="c" width="${scene.canvas.width}" height="${scene.canvas.height}"></canvas>
<script>${engine}</script>
<script>
const scene = ${JSON.stringify(scene).replace(/</g, '\\u003c')};
const ctx = document.getElementById('c').getContext('2d');
window.ready = Collage.load(scene, ${JSON.stringify(pathToFileURL(scenePath).href)}).then((loaded) => {
	window.renderFrame = (f) => { Collage.draw(ctx, loaded, f); return ctx.canvas.toDataURL('image/png'); };
	const frames = Collage.frameCount(scene);
	if (location.hash === '#render') return;
	if (matchMedia('(prefers-reduced-motion: reduce)').matches) return Collage.draw(ctx, loaded, frames - 1);
	let start = performance.now();
	const tick = (now) => {
		const f = Math.floor(((now - start) / 1000) * ${fps});
		if (f >= frames + ${fps * 1.5}) start = now;
		Collage.draw(ctx, loaded, Math.min(f, frames - 1));
		requestAnimationFrame(tick);
	};
	requestAnimationFrame(tick);
});
</script>`;

// The page sits next to the scene so its relative image paths resolve
const pagePath = path.join(path.dirname(scenePath), `.collage-${process.pid}.html`);
fs.writeFileSync(pagePath, page);
try {
	if (values.preview) {
		fs.copyFileSync(pagePath, values.preview);
		console.log(`preview -> ${values.preview}`);
	}
	if (values.out || values.still) await renderWithBrowser();
	if (values.post) {
		// The post's markdown alt text replaces this label when the figure is inlined
		const written = await writePostSvg(
			scene,
			scenePath,
			values.post,
			scene.label?.text ?? path.basename(values.post),
		);
		console.log(`post -> ${written.join(', ')}`);
	}
} finally {
	fs.rmSync(pagePath, { force: true });
}

async function renderWithBrowser() {
	// file:// pages can read file:// images into a canvas only with this flag
	const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
	try {
		const tab = await browser.newPage({ viewport: { width: 400, height: 400 } });
		await tab.goto(`${pathToFileURL(pagePath).href}#render`);
		await tab.evaluate(() => window.ready);
		const frames = Math.round(scene.duration * fps);
		const grab = async (f) =>
			Buffer.from((await tab.evaluate((n) => window.renderFrame(n), f)).split(',')[1], 'base64');
		const last = await grab(frames - 1);
		if (values.still) {
			fs.writeFileSync(values.still, last);
			console.log(`still -> ${values.still}`);
		}
		if (!values.out) return;
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'collage-frames-'));
		const hold = Math.max(1, scene.cadence?.hold_frames ?? 2);
		// One file per pose; ffmpeg reads them at the pose rate and repeats each to fill fps
		for (let f = 0; f < frames; f += hold)
			fs.writeFileSync(path.join(dir, `p${String(f / hold).padStart(5, '0')}.png`), await grab(f));
		const encode = (out, extra) => {
			execFileSync('ffmpeg', [
				...['-y', '-loglevel', 'error', '-framerate', `${fps}/${hold}`],
				...['-i', path.join(dir, 'p%05d.png'), '-r', String(fps), '-frames:v', String(frames)],
				...extra,
				...['-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out],
			]);
			console.log(`clip -> ${out} (${frames} frames at ${fps}fps, a new pose every ${hold})`);
		};
		encode(values.out, ['-crf', '18']);
		fs.rmSync(dir, { recursive: true, force: true });
	} finally {
		await browser.close();
	}
}
