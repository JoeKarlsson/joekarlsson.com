#!/usr/bin/env node
/**
 * Draws a YouTube thumbnail (1280x720 PNG) for a talk upload in the site's taped look: a hand-picked
 * frame of Joe, graded black-to-pink, taped onto black at a tilt, with the event as a pink kicker and
 * the title in Anton beside it. Joe picked this look on 2026-11-09 (see .claude/skills/youtube-upload).
 *
 * Reads the `thumbnail` block of a <video>.youtube.json package:
 *   { "kicker": "Byteconf JavaScript · 2019", "title": "IoT + JS: A Gentle Intro", "size": 160,
 *     "frame": "<still image path, relative to the package>", "box": [x, y, w, h] }
 * box is the crop of the frame, each 0-1 of its width or height; it is cropped to a square.
 * Writes <video>.youtube.png beside the package. Needs the network for Google Fonts.
 *
 * Usage: node scripts/youtube-thumbnail.mjs <package.youtube.json>...
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { chromium } from 'playwright';

const WIDTH = 1280;
const HEIGHT = 720;
const PRINT = 900; // the square print's pixels, before the browser scales it down
const PINK = [255, 0x4f, 0xd8];
const SQUIGGLE = 'M10 40 C 80 10, 140 70, 210 35 S 340 10, 410 40 S 540 70, 590 30';

/** Crops the frame to `box`, squares it, and grades it black-to-pink like the rest of the site */
export async function pinkPrint(file, [x, y, w, h]) {
	const { width, height } = await sharp(file).metadata();
	const region = {
		left: Math.round(x * width),
		top: Math.round(y * height),
		width: Math.round(w * width),
		height: Math.round(h * height),
	};
	const { data } = await sharp(file)
		.extract(region)
		.resize(PRINT, PRINT, { fit: 'cover' })
		.greyscale()
		.normalise()
		.raw()
		.toBuffer({ resolveWithObject: true });
	const out = Buffer.alloc(data.length * 3);
	for (let i = 0; i < data.length; i++) {
		const v = data[i] / 255;
		out[i * 3] = PINK[0] * v;
		out[i * 3 + 1] = PINK[1] * v;
		out[i * 3 + 2] = PINK[2] * v;
	}
	return sharp(out, { raw: { width: PRINT, height: PRINT, channels: 3 } })
		.png()
		.toBuffer();
}

function cardHtml({ kicker, title, size = 150 }, printPng) {
	const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
	return `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Hanken+Grotesk:wght@700&display=block">
<style>
* { box-sizing: border-box; margin: 0; }
body { width: ${WIDTH}px; height: ${HEIGHT}px; background: #000; overflow: hidden; color: #ededed; position: relative; }
.print { position: absolute; left: 70px; top: 110px; width: 500px; height: 500px; background: #fff; padding: 14px; transform: rotate(-4deg); }
.print img { width: 100%; height: 100%; object-fit: cover; display: block; }
.tape { position: absolute; width: 150px; height: 44px; background: rgba(236,230,218,.85); transform: rotate(-32deg); }
.t1 { left: -45px; top: -6px; } .t2 { right: -45px; bottom: -6px; }
.side { position: absolute; left: 640px; right: 50px; top: 50%; transform: translateY(-50%); }
.kick { font: 700 30px/1.1 'Hanken Grotesk'; letter-spacing: .12em; text-transform: uppercase; color: rgb(${PINK}); margin-bottom: 22px; }
.t { font: 400 ${Math.round(size * 0.8)}px/.92 Anton; text-transform: uppercase; text-wrap: balance; }
svg { width: 420px; height: 70px; margin-top: 18px; overflow: visible; }
svg path { fill: none; stroke: rgb(${PINK}); stroke-width: 9; stroke-linecap: round; filter: url(#crayon); }
</style></head><body>
<svg width="0" height="0" style="position:absolute"><filter id="crayon" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3"/></filter></svg>
<div class="print"><img src="data:image/png;base64,${printPng.toString('base64')}" alt=""><span class="tape t1"></span><span class="tape t2"></span></div>
<div class="side"><div class="kick">${escape(kicker)}</div><div class="t">${escape(title)}</div><svg viewBox="0 0 600 80"><path d="${SQUIGGLE}"/></svg></div>
</body></html>`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
	const packages = process.argv.slice(2);
	if (!packages.length)
		throw new Error('Usage: node scripts/youtube-thumbnail.mjs <package.youtube.json>...');
	const browser = await chromium.launch();
	const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });
	for (const file of packages) {
		const { thumbnail } = JSON.parse(fs.readFileSync(file, 'utf8'));
		if (!thumbnail?.frame || !thumbnail?.box)
			throw new Error(`${file}: thumbnail needs frame and box`);
		const print = await pinkPrint(path.resolve(path.dirname(file), thumbnail.frame), thumbnail.box);
		await page.setContent(cardHtml(thumbnail, print), { waitUntil: 'networkidle' });
		const fontsOk = await page.evaluate(async () => {
			await document.fonts.ready;
			return document.fonts.check('40px Anton');
		});
		if (!fontsOk) throw new Error('Anton did not load (needs the network for Google Fonts)');
		const out = file.replace(/\.json$/, '.png');
		await page.screenshot({ path: out });
		console.log(out);
	}
	await browser.close();
}
