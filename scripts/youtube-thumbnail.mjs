#!/usr/bin/env node
/**
 * Draws a YouTube thumbnail (1280x720 PNG) for a talk upload: a hand-picked frame of Joe fills the whole
 * card, graded black-to-pink like the rest of the site; a dark fade on the title side holds the event as a
 * tilted pink label, the title in Anton with the site's crayon underline, and one chalk mark from
 * src/data/scribbles.ts in the top corner. Joe picked this look on 2026-11-09 (.claude/skills/youtube-upload).
 *
 * Reads the `thumbnail` block of a <video>.youtube.json package:
 *   { "kicker": "Byteconf JavaScript · 2019", "title": "IoT + JS: A Gentle Intro",
 *     "frame": "<still image path, relative to the package>", "box": [x, y, w, h],
 *     "side": "left" | "right", "mark": "spiral", "size": 118 }
 * box is the crop of the frame, each 0-1 of its width or height, cropped to 16:9. Put Joe's face in the
 * third away from `side` (the title's side, default left). Writes <video>.youtube.png beside the package.
 * Needs the network for Google Fonts.
 *
 * Usage: npm run youtube:thumbnail -- <package.youtube.json>...
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { chromium } from 'playwright';
import { CHALK, MARKS } from '../src/data/scribbles.ts';

const WIDTH = 1280;
const HEIGHT = 720;
const PINK = [255, 0x4f, 0xd8];
// Darkens the mid-tones so a face still stands out from a bright room once it's all pink
const MIDTONE_GAMMA = 1.45;

/** Crops the frame to `box` at 16:9, fills the card with it, and grades it black-to-pink */
export async function pinkPhoto(file, [x, y, w, h]) {
	const { width, height } = await sharp(file).metadata();
	const region = {
		left: Math.round(x * width),
		top: Math.round(y * height),
		width: Math.round(w * width),
		height: Math.round(h * height),
	};
	const { data } = await sharp(file)
		.extract(region)
		.resize(WIDTH, HEIGHT, { fit: 'cover', kernel: 'lanczos3' })
		.greyscale()
		.normalise()
		.raw()
		.toBuffer({ resolveWithObject: true });
	const out = Buffer.alloc(data.length * 3);
	for (let i = 0; i < data.length; i++) {
		const v = (data[i] / 255) ** MIDTONE_GAMMA;
		out[i * 3] = PINK[0] * v;
		out[i * 3 + 1] = PINK[1] * v;
		out[i * 3 + 2] = PINK[2] * v;
	}
	return sharp(out, { raw: { width: WIDTH, height: HEIGHT, channels: 3 } })
		.png()
		.toBuffer();
}

function markSvg(name, color, className, style = '') {
	const shape = MARKS[name];
	if (!shape) throw new Error(`No mark named ${name} in src/data/scribbles.ts`);
	const fit = shape.stretch ? 'none' : 'xMidYMid meet';
	return `<svg class="${className}" viewBox="${shape.viewBox}" preserveAspectRatio="${fit}" style="${style}"><path d="${shape.path}" stroke="#000" stroke-width="16" opacity=".55"/><path d="${shape.path}" stroke="${color}" stroke-width="9"/></svg>`;
}

function cardHtml({ kicker, title, side = 'left', mark = 'burst', size = 118 }, photoPng) {
	const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
	const pink = `rgb(${PINK})`;
	const other = side === 'left' ? 'right' : 'left';
	return `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Hanken+Grotesk:wght@700&display=block">
<style>
* { box-sizing: border-box; margin: 0; }
body { width: ${WIDTH}px; height: ${HEIGHT}px; background: #000; overflow: hidden; color: #ededed; position: relative; }
.photo { position: absolute; inset: 0; width: 100%; height: 100%; }
.fade { position: absolute; inset: 0; background: linear-gradient(to ${other}, rgba(0,0,0,.94) 0%, rgba(0,0,0,.82) 34%, rgba(0,0,0,0) 62%); }
.text { position: absolute; ${side}: 60px; width: 640px; top: 50%; transform: translateY(-50%); }
.kick { display: inline-block; font: 700 30px/1 'Hanken Grotesk'; letter-spacing: .12em; text-transform: uppercase; color: #000; background: ${pink}; padding: 9px 14px 8px; margin-bottom: 16px; transform: rotate(-1.5deg); }
.t { font: 400 ${size}px/.9 Anton; text-transform: uppercase; text-wrap: balance; text-shadow: 0 4px 0 #000; }
svg { overflow: visible; }
svg path { fill: none; stroke-linecap: round; stroke-linejoin: round; filter: url(#crayon); }
.under { display: block; width: 92%; height: 44px; margin-top: 14px; }
.corner { position: absolute; ${other}: 75px; top: 45px; width: 150px; height: 150px; }
</style></head><body>
<svg width="0" height="0" style="position:absolute"><filter id="crayon" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3"/></filter></svg>
<img class="photo" src="data:image/png;base64,${photoPng.toString('base64')}" alt=""><div class="fade"></div>
${markSvg(mark, CHALK, 'corner')}
<div class="text"><div class="kick">${escape(kicker)}</div><div class="t">${escape(title)}</div>${markSvg('underline', pink, 'under')}</div>
</body></html>`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
	const packages = process.argv.slice(2);
	if (!packages.length)
		throw new Error('Usage: npm run youtube:thumbnail -- <package.youtube.json>...');
	const browser = await chromium.launch();
	const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });
	for (const file of packages) {
		const { thumbnail } = JSON.parse(fs.readFileSync(file, 'utf8'));
		if (!thumbnail?.frame || !thumbnail?.box)
			throw new Error(`${file}: thumbnail needs frame and box`);
		const photo = await pinkPhoto(path.resolve(path.dirname(file), thumbnail.frame), thumbnail.box);
		await page.setContent(cardHtml(thumbnail, photo), { waitUntil: 'networkidle' });
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
