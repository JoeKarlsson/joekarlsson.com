#!/usr/bin/env node
// Renders a small handmade animation (Ralph Ammer's kind: the thing the post explains, drawn
// simply and shown working) into a post's clip.
//
//   node scripts/handmade/render.mjs <page.html> --post public/images/blog/<slug>/<name>
//       <name>.mp4 at 1280 wide, plus the page's still as <name>.webp and <name>-poster.webp.
//       The post references <name>.webp; src/plugins/rehype-gif-video.mjs plays the .mp4 in its
//       place, and reduced motion and the pause button get the still.
//
// The page draws the animation in one <svg data-handmade> 640 CSS px wide, with the site's
// #boil filter, and sets window.__render(seconds), __loop (its length in seconds), __fps (its
// drawing rate) and __still (the moment shown when motion is off). Opened with #frames, it must
// not start its own loop. Example: scripts/handmade/doom-mcp-server/go-to-walk.html.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

import { chromium } from 'playwright';
import sharp from 'sharp';

const { values, positionals } = parseArgs({
	allowPositionals: true,
	options: { post: { type: 'string' } },
});
const pagePath = positionals[0] && path.resolve(positionals[0]);
if (!pagePath || !values.post) {
	console.error(
		'Usage: node scripts/handmade/render.mjs <page.html> --post public/images/blog/<slug>/<name>',
	);
	process.exit(2);
}

const browser = await chromium.launch();
const frameDir = fs.mkdtempSync(path.join(os.tmpdir(), 'handmade-frames-'));
try {
	const tab = await browser.newPage({
		viewport: { width: 640, height: 640 },
		deviceScaleFactor: 2,
	});
	const errors = [];
	tab.on('pageerror', (error) => errors.push(String(error)));
	await tab.goto(`${pathToFileURL(pagePath).href}#frames`);
	await tab.evaluate(() => document.fonts.ready);
	// fonts.ready also resolves when the web fonts never arrived (offline), so check each family the
	// drawing's text uses really loaded; a fallback font would ship silently otherwise
	const missingFonts = await tab.evaluate(() => {
		const families = [...document.querySelectorAll('svg[data-handmade] text')].map((text) =>
			getComputedStyle(text).fontFamily.split(',')[0].replace(/['"]/g, '').trim(),
		);
		const loaded = [...document.fonts]
			.filter((f) => f.status === 'loaded')
			.map((f) => f.family.replace(/['"]/g, ''));
		return [...new Set(families)].filter((family) => !loaded.includes(family));
	});
	if (missingFonts.length) throw new Error(`Fonts did not load: ${missingFonts.join(', ')}`);
	// The boil re-seeds itself on a clock. Take the clock away and seed it from the moment
	// drawn, so the clip wobbles at the site's rate (a new seed every 1/6 s) however slowly
	// the frames are captured.
	await tab.evaluate(() => document.querySelector('#boil animate')?.remove());
	const { loop, fps, still } = await tab.evaluate(() => ({
		loop: window.__loop,
		fps: window.__fps,
		still: window.__still,
	}));
	if (errors.length || !(loop > 0 && fps > 0 && still >= 0))
		throw new Error(
			`The page must set __render, __loop, __fps and __still without errors: ${errors.join('; ')}`,
		);
	const drawing = tab.locator('svg[data-handmade]');
	const grab = async (seconds) => {
		await tab.evaluate((t) => {
			window.__render(t);
			const seed = 11 + (Math.floor(t * 6) % 3) * 11;
			document.querySelector('#boil feTurbulence')?.setAttribute('seed', String(seed));
		}, seconds);
		return drawing.screenshot();
	};

	const frames = Math.ceil(loop * fps - 1e-9);
	for (let f = 0; f < frames; f++)
		fs.writeFileSync(
			path.join(frameDir, `f${String(f).padStart(5, '0')}.png`),
			await grab(f / fps),
		);

	fs.mkdirSync(path.dirname(values.post), { recursive: true });
	execFileSync('ffmpeg', [
		...['-y', '-loglevel', 'error', '-framerate', String(fps)],
		...['-i', path.join(frameDir, 'f%05d.png'), '-vf', 'scale=1280:-2', '-r', '24'],
		...['-c:v', 'libx264', '-crf', '24', '-pix_fmt', 'yuv420p', '-movflags', '+faststart'],
		`${values.post}.mp4`,
	]);
	console.log(`clip -> ${values.post}.mp4 (${frames} drawings at ${fps}fps, ${loop.toFixed(1)} s)`);
	const stillImage = await sharp(await grab(still))
		.resize(1280)
		.webp({ quality: 82 })
		.toBuffer();
	for (const suffix of ['', '-poster'])
		fs.writeFileSync(`${values.post}${suffix}.webp`, stillImage);
	console.log(`still -> ${values.post}.webp and ${values.post}-poster.webp`);
} finally {
	await browser.close();
	fs.rmSync(frameDir, { recursive: true, force: true });
}
